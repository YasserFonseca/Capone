import { NextRequest, NextResponse } from 'next/server'
import { cookies }                   from 'next/headers'
import { createServerClient }        from '@supabase/ssr'
import { supabaseAdmin }             from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId')

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId obrigatório' }, { status: 400 })
  }

  // Verifica sessão com anon key + cookies
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verifica que o tenant pertence ao usuário logado
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .eq('owner_email', session.user.email)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

  // apptToday: agendamentos de hoje
  const { count: apptToday } = await supabaseAdmin
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', today)
    .lt('scheduled_at', tomorrow)

  // Busca IDs das conversas deste tenant
  const { data: convRows } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('tenant_id', tenantId)

  const convIds = (convRows ?? []).map(c => c.id)

  // msgToday: mensagens de hoje nas conversas deste tenant
  let msgToday = 0
  if (convIds.length > 0) {
    const { count } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .gte('created_at', today)
    msgToday = count ?? 0
  }

  // whatsappStatus
  const { data: instance } = await supabaseAdmin
    .from('whatsapp_instances')
    .select('status')
    .eq('tenant_id', tenantId)
    .single()

  const whatsappStatus = instance?.status ?? 'disconnected'

  return NextResponse.json({
    apptToday:       apptToday  ?? 0,
    msgToday,
    whatsappStatus,
  })
}
