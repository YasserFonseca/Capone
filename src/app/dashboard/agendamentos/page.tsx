import { redirect }           from 'next/navigation'
import { cookies }            from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin }      from '@/lib/supabase-admin'
import { Calendar, Clock }    from 'lucide-react'
import styles from '@/app/styles/Dashboard.module.css'

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled'

const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  pending:   { label: 'Pendente',   className: 'badgeWait' },
  confirmed: { label: 'Confirmado', className: 'badgeOn'   },
  completed: { label: 'Concluído',  className: 'badgeOn'   },
  cancelled: { label: 'Cancelado',  className: 'badgeOff'  },
}

export const revalidate = 30

export default async function AgendamentosPage() {
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

  const { data: appointments } = await supabaseAdmin
    .from('appointments')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('scheduled_at', { ascending: false })
    .limit(100)

  const list     = appointments ?? []
  const upcoming = list.filter(a => new Date(a.scheduled_at) >= new Date() && a.status !== 'cancelled')
  const past     = list.filter(a => new Date(a.scheduled_at) <  new Date() || a.status === 'cancelled')

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.topbarTitle}>Agendamentos</h1>
          <p className={styles.topbarSub}>{list.length} no total</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          {[
            { label: 'Próximos',    value: upcoming.length,                                    icon: <Calendar size={13} /> },
            { label: 'Confirmados', value: list.filter(a => a.status === 'confirmed').length,  icon: <Clock size={13} /> },
            { label: 'Concluídos',  value: list.filter(a => a.status === 'completed').length,  icon: <Clock size={13} /> },
            { label: 'Cancelados',  value: list.filter(a => a.status === 'cancelled').length,  icon: <Clock size={13} /> },
          ].map(m => (
            <div key={m.label} className={styles.metricCard}>
              <div className={styles.metricLabel}>{m.icon} {m.label}</div>
              <div className={styles.metricValue}>{m.value}</div>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Todos os agendamentos</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['Cliente', 'Serviço', 'Data e hora', 'Valor', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#a496b8', fontSize: '11px', borderBottom: '1px solid #3c2459', fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#a496b8' }}>
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                )}
                {list.map(appt => {
                  const s = STATUS_MAP[appt.status as Status] ?? STATUS_MAP.pending
                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid rgba(60,36,89,.35)' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 600 }}>{appt.customer_name ?? '—'}</div>
                        <div style={{ fontSize: '11px', color: '#a496b8' }}>{appt.customer_phone}</div>
                      </td>
                      <td style={{ padding: '10px' }}>{appt.service}</td>
                      <td style={{ padding: '10px', fontSize: '12px', color: '#a496b8' }}>
                        {new Date(appt.scheduled_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>
                        {appt.price ? `R$${Number(appt.price).toFixed(2)}` : '—'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className={`${styles.badge} ${styles[s.className as keyof typeof styles]}`}>
                          <span className={`${styles.dot} ${s.className === 'badgeOn' ? styles.dotOn : s.className === 'badgeWait' ? styles.dotWait : styles.dotOff}`} />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
