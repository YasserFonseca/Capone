import { getWhatsappInstances, getDashboardMetrics } from '@/lib/admin-queries'
import { MetricCard }  from '@/components/admin/MetricCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { LiveRefresh }  from '@/components/admin/LiveRefresh'
import { Wifi, WifiOff } from 'lucide-react'
import styles from '../AdminDashboard.module.css'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminInstanciasPage() {
  const [instances, metrics] = await Promise.all([
    getWhatsappInstances(),
    getDashboardMetrics(),
  ])

  const connected    = instances.filter(i => i.status === 'connected').length
  const connecting   = instances.filter(i => i.status === 'connecting').length
  const disconnected = instances.filter(i => i.status === 'disconnected').length

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Instâncias WhatsApp ({instances.length})</h1>
        <LiveRefresh intervalSec={10} />
      </div>

      <div className={styles.metrics}>
        <MetricCard
          label="Conectadas"
          value={connected}
          subType="up"
          sub="online e funcionando"
          icon={<Wifi size={14} />}
        />
        <MetricCard
          label="Conectando"
          value={connecting}
          subType="neutral"
          sub="aguardando QR Code"
          icon={<Wifi size={14} />}
        />
        <MetricCard
          label="Desconectadas"
          value={disconnected}
          subType={disconnected > 0 ? 'down' : 'neutral'}
          sub={disconnected > 0 ? 'requer atenção' : 'tudo ok'}
          icon={<WifiOff size={14} />}
        />
        <MetricCard
          label="Mensagens hoje"
          value={metrics.messagesToday.toLocaleString('pt-BR')}
          icon={<Wifi size={14} />}
        />
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.fullCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Todas as instâncias</h2>
          </div>
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Instance name</th>
                  <th>Status</th>
                  <th>Conectado em</th>
                  <th>Criado em</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {instances.map(inst => (
                  <tr key={inst.id}>
                    <td>
                      <div className={tableStyles.companyName}>
                        {(inst.tenants as { company_name?: string; owner_email?: string })?.company_name ?? '—'}
                      </div>
                      <div className={tableStyles.companyEmail}>
                        {(inst.tenants as { company_name?: string; owner_email?: string })?.owner_email ?? ''}
                      </div>
                    </td>
                    <td>
                      <span className={tableStyles.segPill}>{inst.instance_name}</span>
                    </td>
                    <td><StatusBadge status={inst.status} /></td>
                    <td className={tableStyles.date}>
                      {inst.connected_at
                        ? new Date(inst.connected_at).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td className={tableStyles.date}>
                      {new Date(inst.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      {inst.status !== 'connected' && (
                        <a
                          href={`/onboarding/success?tenantId=${inst.tenant_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className={tableStyles.actionBtn}
                          style={{ textDecoration: 'none', padding: '4px 10px', display: 'inline-block' }}
                        >
                          Ver QR
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {instances.length === 0 && (
              <p className={tableStyles.empty}>Nenhuma instância encontrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
