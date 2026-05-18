// GET /api/whatsapp/qrcode/[tenantId]
// Gera/atualiza o QR Code de uma instância WhatsApp.
// Retorna { qrCode: string }

import { NextRequest, NextResponse } from 'next/server'
import { cookies }            from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin }      from '@/lib/supabase-admin'
import { evConnect, stripBase64Prefix } from '@/lib/evolution'

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = params

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .eq('owner_email', session.user.email)
    .single()
  if (!tenant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const connectRes = await evConnect(tenantId)
    const qrCode     = stripBase64Prefix(connectRes.base64)

    if (!qrCode) {
      return NextResponse.json({ error: 'QR Code não disponível' }, { status: 404 })
    }

    // Salva QR atualizado no banco
    await supabaseAdmin
      .from('whatsapp_instances')
      .update({ qr_code: qrCode })
      .eq('tenant_id', tenantId)

    return NextResponse.json({ qrCode })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao gerar QR Code' },
      { status: 500 }
    )
  }
}
