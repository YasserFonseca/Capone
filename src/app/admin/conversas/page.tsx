import { getConversations } from '@/lib/admin-queries'
import { LiveRefresh }      from '@/components/admin/LiveRefresh'
import { MetricCard }       from '@/components/admin/MetricCard'
import { MessageSquare, Users } from 'lucide-react'
import styles from '../AdminDashboard.module.css'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminConversasPage() {
  const conversations = await getConversations(100)

  const today = new Date().toISOString().split('T')[0]
  const todayCount = conversations.filter(c =>
    (c.last_message_at ?? c.created_at)?.startsWith(today)
  ).length

  const uniqueTenants = new Set(conversations.map(c => c.tenant_id)).size

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Conversas ({conversations.length})</h1>
        <LiveRefresh intervalSec={30} />
      </div>

      <div className={styles.metrics}>
        <MetricCard
          label="Total de conversas"
          value={conversations.length}
          icon={<MessageSquare size={14} />}
        />
        <MetricCard
          label="Ativas hoje"
          value={todayCount}
          subType="up"
          icon={<MessageSquare size={14} />}
        />
        <MetricCard
          label="Clientes com conversa"
          value={uniqueTenants}
          icon={<Users size={14} />}
        />
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.fullCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Conversas recentes</h2>
          </div>
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Telefone do usuário</th>
                  <th>Última mensagem</th>
                  <th>Iniciada em</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className={tableStyles.segPill}>
                        {(c.tenants as { company_name?: string })?.company_name ?? '—'}
                      </span>
                    </td>
                    <td>
                      <div className={tableStyles.companyName}>{c.customer_phone}</div>
                    </td>
                    <td className={tableStyles.date}>
                      {c.last_message_at
                        ? new Date(c.last_message_at).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td className={tableStyles.date}>
                      {new Date(c.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {conversations.length === 0 && (
              <p className={tableStyles.empty}>Nenhuma conversa encontrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
