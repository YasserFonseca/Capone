import { getAppointments } from '@/lib/admin-queries'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { LiveRefresh }  from '@/components/admin/LiveRefresh'
import { MetricCard }   from '@/components/admin/MetricCard'
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import styles from '../AdminDashboard.module.css'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export const revalidate = 30

export default async function AdminAgendamentosPage() {
  const appointments = await getAppointments(200)

  const today     = new Date().toISOString().split('T')[0]
  const confirmed = appointments.filter(a => a.status === 'confirmed').length
  const pending   = appointments.filter(a => a.status === 'pending').length
  const cancelled = appointments.filter(a => a.status === 'cancelled').length
  const todayCount = appointments.filter(a => a.scheduled_at?.startsWith(today)).length

  const statusMap: Record<string, 'active' | 'pending' | 'suspended'> = {
    confirmed: 'active',
    pending:   'pending',
    cancelled: 'suspended',
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Agendamentos ({appointments.length})</h1>
        <LiveRefresh intervalSec={30} />
      </div>

      <div className={styles.metrics}>
        <MetricCard label="Hoje"          value={todayCount}  icon={<Calendar size={14} />} />
        <MetricCard label="Confirmados"   value={confirmed}   subType="up"      icon={<CheckCircle size={14} />} />
        <MetricCard label="Pendentes"     value={pending}     subType="neutral" icon={<Clock size={14} />} />
        <MetricCard label="Cancelados"    value={cancelled}   subType={cancelled > 0 ? 'down' : 'neutral'} icon={<XCircle size={14} />} />
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.fullCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Todos os agendamentos</h2>
          </div>
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Serviço</th>
                  <th>Data/Hora</th>
                  <th>Status</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>
                      <span className={tableStyles.segPill}>
                        {(a.tenants as { company_name?: string })?.company_name ?? '—'}
                      </span>
                    </td>
                    <td>
                      <div className={tableStyles.companyName}>{a.customer_name ?? '—'}</div>
                    </td>
                    <td className={tableStyles.date}>{a.customer_phone ?? '—'}</td>
                    <td className={tableStyles.date}>{a.service ?? '—'}</td>
                    <td style={{ fontSize: '12px' }}>
                      {a.scheduled_at
                        ? new Date(a.scheduled_at).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td>
                      <StatusBadge status={statusMap[a.status] ?? 'pending'} />
                    </td>
                    <td className={tableStyles.date}>
                      {new Date(a.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <p className={tableStyles.empty}>Nenhum agendamento encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
