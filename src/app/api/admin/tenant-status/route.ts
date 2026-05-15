import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { updateTenantStatus } from '@/lib/admin-queries'

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const isAdmin = session.user.user_metadata?.is_admin === true || session.user.app_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { tenantId, status } = await req.json()
    if (!tenantId || !['active', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    await updateTenantStatus(tenantId, status)

    if (status === 'suspended') {
      await fetch(`${process.env.BACKEND_URL}/provisioning/suspend/${tenantId}`, {
        method: 'POST',
        headers: { 'x-internal-key': process.env.INTERNAL_API_KEY ?? '' },
      }).catch(err => console.error('[admin] erro ao suspender whatsapp:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[api/admin/tenant-status]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
