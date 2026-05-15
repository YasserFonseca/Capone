import { getAllPayments, getRevenueSummary, getRevenueByMonth } from '@/lib/admin-queries'
import { MetricCard }  from '@/components/admin/MetricCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { LiveRefresh }  from '@/components/admin/LiveRefresh'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import styles from '../AdminDashboard.module.css'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminReceitaPage() {
  const [payments, summary, revenue] = await Promise.all([
    getAllPayments(200),
    getRevenueSummary(),
    getRevenueByMonth(),
  ])

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Receita</h1>
        <LiveRefresh intervalSec={30} />
      </div>

      <div className={styles.metrics}>
        <MetricCard
          label="Total aprovado"
          value={`R$${summary.totalApproved.toLocaleString('pt-BR')}`}
          sub={`${summary.countApproved} pagamentos`}
          subType="up"
          gradient
          icon={<CheckCircle size={14} />}
        />
        <MetricCard
          label="Setup (onboarding)"
          value={`R$${summary.totalSetup.toLocaleString('pt-BR')}`}
          icon={<DollarSign size={14} />}
        />
        <MetricCard
          label="Mensalidades"
          value={`R$${summary.totalMonthly.toLocaleString('pt-BR')}`}
          icon={<TrendingUp size={14} />}
        />
        <MetricCard
          label="Pendente"
          value={`R$${summary.totalPending.toLocaleString('pt-BR')}`}
          subType="down"
          icon={<Clock size={14} />}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Receita mensal recorrente</h2>
          <span className={styles.cardMeta}>últimos 7 meses</span>
        </div>
        <RevenueChart data={revenue} />
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.fullCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Todos os pagamentos ({payments.length})</h2>
          </div>
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Pago em</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className={tableStyles.companyName}>
                        {(p.tenants as { company_name?: string })?.company_name ?? '—'}
                      </div>
                      <div className={tableStyles.companyEmail}>{p.mp_payment_id}</div>
                    </td>
                    <td>
                      <span className={tableStyles.segPill}>
                        {p.type === 'setup' ? 'Setup' : 'Mensalidade'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>R${p.amount.toFixed(2)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className={tableStyles.date}>
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className={tableStyles.date}>
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <p className={tableStyles.empty}>Nenhum pagamento encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
