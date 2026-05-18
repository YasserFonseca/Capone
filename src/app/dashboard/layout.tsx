import { redirect } from 'next/navigation'
import { cookies }  from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin }      from '@/lib/supabase-admin'
import { DashboardSidebar }   from '@/components/dashboard/DashboardSidebar'
import styles from '@/app/styles/Dashboard.module.css'

export const metadata = { title: 'Dashboard — Capone' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()

  // Anon client só para verificar sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const isAdmin = session.user.user_metadata?.is_admin === true || session.user.app_metadata?.is_admin === true
  if (isAdmin) redirect('/admin')

  // Admin client para queries de dados (bypassa RLS, sempre filtrado pelo email da sessão)
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, company_name, status')
    .eq('owner_email', session.user.email)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const userName    = session.user.user_metadata?.full_name ?? session.user.email ?? ''
  const userEmail   = session.user.email ?? ''
  const companyName = tenant?.company_name ?? 'Minha empresa'

  return (
    <div className={styles.shell}>
      <DashboardSidebar
        userName={userName}
        userEmail={userEmail}
        companyName={companyName}
      />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
