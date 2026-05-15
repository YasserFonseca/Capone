// Middleware de proteção do painel admin.
// Verifica user_metadata.is_admin === true antes de renderizar.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function checkAdminAuth() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const isAdmin = session.user.user_metadata?.is_admin === true || session.user.app_metadata?.is_admin === true
  if (!isAdmin) redirect('/')

  return session
}
