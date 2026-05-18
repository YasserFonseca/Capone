import { redirect }           from 'next/navigation'
import { cookies }            from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin }      from '@/lib/supabase-admin'
import styles from '@/app/styles/Dashboard.module.css'

export const revalidate = 30

export default async function ConversasPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('owner_email', session.user.email)
    .single()

  if (!tenant) redirect('/dashboard')

  const { data: conversations } = await supabaseAdmin
    .from('conversations')
    .select('id, customer_phone, last_message_at, status')
    .eq('tenant_id', tenant.id)
    .order('last_message_at', { ascending: false })
    .limit(50)

  const list = conversations ?? []

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.topbarTitle}>Conversas</h1>
          <p className={styles.topbarSub}>{list.length} conversas</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Histórico de conversas</h2>
          </div>
          {list.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '13px' }}>
              Nenhuma conversa ainda. Quando clientes enviarem mensagens, aparecerão aqui.
            </p>
          ) : (
            list.map(conv => {
              const initials = conv.customer_phone.slice(-4)
              return (
                <div key={conv.id} className={styles.apptItem}>
                  <div className={styles.apptInfo}>
                    <div className={styles.apptAvatar}>{initials}</div>
                    <div>
                      <div className={styles.apptName}>{conv.customer_phone}</div>
                      <div className={styles.apptService}>
                        {new Date(conv.last_message_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <span className={`${styles.badge} ${conv.status === 'active' ? styles.badgeOn : styles.badgeWait}`}>
                    <span className={`${styles.dot} ${conv.status === 'active' ? styles.dotOn : styles.dotWait}`} />
                    {conv.status === 'active' ? 'Ativa' : 'Encerrada'}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
