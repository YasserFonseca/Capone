import { getSegments } from '@/lib/admin-queries'
import { LiveRefresh } from '@/components/admin/LiveRefresh'
import { SegmentToggle } from './SegmentToggle'
import styles from '../AdminDashboard.module.css'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export const revalidate = 60

export default async function AdminSegmentosPage() {
  const segments = await getSegments()
  const active   = segments.filter(s => s.active).length

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Segmentos ({segments.length})</h1>
        <LiveRefresh intervalSec={60} />
      </div>

      <div className={styles.tableWrap} style={{ paddingTop: '20px' }}>
        <div className={styles.fullCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              Catálogo de segmentos — {active} ativos
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Segmentos inativos não aparecem na loja
            </span>
          </div>
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>Ativo</th>
                </tr>
              </thead>
              <tbody>
                {segments.map(seg => (
                  <tr key={seg.id}>
                    <td>
                      <div className={tableStyles.companyName}>{seg.name}</div>
                    </td>
                    <td>
                      <span className={tableStyles.segPill}>{seg.slug}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        color: seg.active ? '#4ade80' : '#f87171',
                        fontWeight: 600,
                      }}>
                        {seg.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className={tableStyles.date}>
                      {new Date(seg.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <SegmentToggle segmentId={seg.id} active={seg.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {segments.length === 0 && (
              <p className={tableStyles.empty}>Nenhum segmento cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
