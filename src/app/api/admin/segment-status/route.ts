import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { updateSegmentActive } from '@/lib/admin-queries'

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
    if (session.user.user_metadata?.is_admin !== true) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { segmentId, active } = await req.json()
    if (!segmentId || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    await updateSegmentActive(segmentId, active)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[api/admin/segment-status]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
