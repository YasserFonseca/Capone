// POST /api/whatsapp/provision
// Cria uma instância WhatsApp na Evolution API para um tenant.
// Acesso restrito a admin.
// Body: { tenantId: string }

import { NextRequest, NextResponse } from 'next/server'
import { cookies }            from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin }      from '@/lib/supabase-admin'
import { evCreateInstance, evConnect, stripBase64Prefix } from '@/lib/evolution'

export async function POST(req: NextRequest) {
  // Verifica admin
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.user_metadata?.is_admin === true
               || session.user.app_metadata?.is_admin === true
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { tenantId } = await req.json()
  if (!tenantId) return NextResponse.json({ error: 'tenantId obrigatório' }, { status: 400 })

  // Verifica que o tenant existe
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, company_name')
    .eq('id', tenantId)
    .single()
  if (!tenant) return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const webhookUrl  = `${appUrl}/api/whatsapp/webhook/${tenantId}`

  try {
    // Cria instância na Evolution API
    await evCreateInstance(tenantId, webhookUrl)

    // Obtém QR Code inicial
    let qrCode: string | null = null
    try {
      const connectRes = await evConnect(tenantId)
      qrCode = stripBase64Prefix(connectRes.base64)
    } catch {}

    // Cria ou atualiza registro no banco
    const { data: existing } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('id')
      .eq('tenant_id', tenantId)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('whatsapp_instances')
        .update({ status: 'connecting', qr_code: qrCode, instance_name: tenantId })
        .eq('tenant_id', tenantId)
    } else {
      await supabaseAdmin
        .from('whatsapp_instances')
        .insert({
          tenant_id:     tenantId,
          instance_name: tenantId,
          status:        'connecting',
          qr_code:       qrCode,
        })
    }

    return NextResponse.json({ ok: true, qrCode })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao provisionar instância'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
