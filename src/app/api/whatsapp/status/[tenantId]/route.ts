// GET /api/whatsapp/status/[tenantId]
// Verifica estado de conexão WhatsApp na Evolution API.
// Retorna { whatsapp, qrCode, mpConnected, tenant }

import { NextRequest, NextResponse } from 'next/server'
import { cookies }            from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin }      from '@/lib/supabase-admin'
import { evConnectionState, evConnect, mapEvState, stripBase64Prefix } from '@/lib/evolution'

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = params

  // Verifica sessão
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verifica que o tenant pertence ao usuário
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, status')
    .eq('id', tenantId)
    .eq('owner_email', session.user.email)
    .single()
  if (!tenant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    // Consulta estado na Evolution API
    const stateRes  = await evConnectionState(tenantId)
    const evState   = stateRes?.instance?.state ?? 'close'
    const whatsapp  = mapEvState(evState)

    // Lê QR code do Supabase (salvo pelo webhook QRCODE_UPDATED)
    const { data: instanceRow } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('qr_code')
      .eq('tenant_id', tenantId)
      .single()
    let qrCode: string | null = instanceRow?.qr_code ?? null

    // Fallback: tenta buscar direto da Evolution API
    if (!qrCode && whatsapp !== 'connected') {
      try {
        const connectRes = await evConnect(tenantId)
        qrCode = stripBase64Prefix(connectRes.base64)
      } catch {
        // Instância pode ainda não existir — ignora
      }
    }

    // Atualiza status no banco
    await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        status:       whatsapp,
        qr_code:      whatsapp !== 'connected' ? qrCode : null,
        connected_at: whatsapp === 'connected' ? new Date().toISOString() : null,
      })
      .eq('tenant_id', tenantId)

    const { data: config } = await supabaseAdmin
      .from('tenant_config')
      .select('mp_access_token')
      .eq('tenant_id', tenantId)
      .single()

    return NextResponse.json({
      tenant:      tenant.status as string,
      whatsapp,
      qrCode,
      mpConnected: !!config?.mp_access_token,
    })
  } catch {
    // Evolution não configurada ou instância inexistente
    return NextResponse.json({
      tenant:      tenant.status as string,
      whatsapp:    'not_provisioned',
      qrCode:      null,
      mpConnected: false,
    })
  }
}
