import { getDashboardMetrics, getTenants, getRecentPayments, getRevenueByMonth } from '@/lib/admin-queries'
import { MetricCard }   from '@/components/admin/MetricCard'
import { StatusBadge }  from '@/components/admin/StatusBadge'
import { TenantsTable } from '@/components/admin/TenantsTable'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { LiveRefresh }  from '@/components/admin/LiveRefresh'
import { Users, DollarSign, Wifi, MessageSquare } from 'lucide-react'
import styles from './AdminDashboard.module.css'

export const revalidate = 30

export default async function AdminDashboardPage() {
  const [metrics, tenants, payments, revenue] = await Promise.all([
    getDashboardMetrics(),
    getTenants(10),
    getRecentPayments(5),
    getRevenueByMonth(),
  ])

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Dashboard</h1>
        <LiveRefresh intervalSec={30} />
      </div>

      <div className={styles.metrics}>
        <MetricCard
          label="Clientes ativos"
          value={metrics.totalActive}
          sub={`+${metrics.newThisMonth} esse mês`}
          subType="up"
          icon={<Users size={14} />}
        />
        <MetricCard
          label="Receita recorrente"
          value={`R$${metrics.mrr.toLocaleString('pt-BR')}`}
          sub={`${metrics.totalActive} assinaturas`}
          gradient
          icon={<DollarSign size={14} />}
        />
        <MetricCard
          label="WhatsApp online"
          value={metrics.whatsappOnline}
          sub={`${metrics.whatsappOffline} offline`}
          subType={metrics.whatsappOffline > 0 ? 'down' : 'neutral'}
          icon={<Wifi size={14} />}
        />
        <MetricCard
          label="Mensagens hoje"
          value={metrics.messagesToday.toLocaleString('pt-BR')}
          icon={<MessageSquare size={14} />}
        />
      </div>

      <div className={styles.row2}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Clientes recentes</h2>
            <a href="/admin/clientes" className={styles.cardLink}>ver todos →</a>
          </div>
          <TenantsTable tenants={tenants} />
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pagamentos recentes</h2>
            <a href="/admin/receita" className={styles.cardLink}>ver todos →</a>
          </div>
          <div className={styles.activityList}>
            {payments.map(p => (
              <div key={p.id} className={styles.activityItem}>
                <div className={`${styles.actIcon} ${p.type === 'setup' ? styles.actSetup : styles.actMonthly}`}>
                  <DollarSign size={13} />
                </div>
                <div className={styles.actContent}>
                  <p className={styles.actText}>
                    <strong>{(p.tenants as { company_name?: string })?.company_name ?? '—'}</strong>
                    {' — '}{p.type === 'setup' ? 'Setup' : 'Mensalidade'}
                  </p>
                  <p className={styles.actMeta}>
                    R${p.amount.toFixed(2)} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
            {payments.length === 0 && <p className={styles.empty}>Nenhum pagamento ainda.</p>}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Receita mensal recorrente</h2>
          <span className={styles.cardMeta}>últimos 7 meses</span>
        </div>
        <RevenueChart data={revenue} />
      </div>
    </div>
  )
}
