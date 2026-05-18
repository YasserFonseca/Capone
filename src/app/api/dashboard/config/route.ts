import { NextResponse }        from 'next/server'
import { cookies }             from 'next/headers'
import { createServerClient }  from '@supabase/ssr'
import { supabaseAdmin }       from '@/lib/supabase-admin'

async function getSession() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('owner_email', session.user.email)
    .single()

  if (!tenant) return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })

  const { data: config } = await supabaseAdmin
    .from('tenant_config')
    .select('contact_phone, address, business_hours, services')
    .eq('tenant_id', tenant.id)
    .single()

  return NextResponse.json({ tenantId: tenant.id, config })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('owner_email', session.user.email)
    .single()

  if (!tenant) return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })

  const body = await req.json()

  const { error } = await supabaseAdmin
    .from('tenant_config')
    .update({
      contact_phone:  body.contact_phone,
      address:        body.address,
      business_hours: { geral: body.business_hours },
      services:       body.services,
      updated_at:     new Date().toISOString(),
    })
    .eq('tenant_id', tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
