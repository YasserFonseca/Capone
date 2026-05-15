import styles from '../AdminDashboard.module.css'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export const dynamic = 'force-dynamic'

const check = (val: string | undefined) => val ? '✓ Definida' : '✗ Faltando'
const checkColor = (val: string | undefined): string => val ? '#4ade80' : '#f87171'

export default function AdminConfigPage() {
  const envVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL',      value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: 'NEXT_PUBLIC_BACKEND_URL',        value: process.env.NEXT_PUBLIC_BACKEND_URL },
    { name: 'SUPABASE_URL',                   value: process.env.SUPABASE_URL },
    { name: 'SUPABASE_SERVICE_ROLE_KEY',      value: process.env.SUPABASE_SERVICE_ROLE_KEY },
    { name: 'BACKEND_URL',                    value: process.env.BACKEND_URL },
    { name: 'INTERNAL_API_KEY',               value: process.env.INTERNAL_API_KEY },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Configurações</h1>
      </div>

      <div className={styles.tableWrap} style={{ paddingTop: '20px' }}>
        {/* Admin account */}
        <div className={styles.fullCard} style={{ marginBottom: '14px' }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Conta admin</h2>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '100px' }}>Email</span>
              <span>{process.env.ADMIN_EMAIL ?? 'admin@capone.com.br'}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '100px' }}>Acesso</span>
              <span style={{ color: '#4ade80' }}>is_admin = true (Supabase user_metadata)</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '100px' }}>Projeto</span>
              <span>{(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace('https://', '').split('.')[0] || '—'}</span>
            </div>
          </div>
        </div>

        {/* Env vars */}
        <div className={styles.fullCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Variáveis de ambiente</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Valores ocultos por segurança
            </span>
          </div>
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Variável</th>
                  <th>Status</th>
                  <th>Valor (prefixo)</th>
                </tr>
              </thead>
              <tbody>
                {envVars.map(ev => (
                  <tr key={ev.name}>
                    <td>
                      <code style={{ fontSize: '11px', color: '#c77dff' }}>{ev.name}</code>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: checkColor(ev.value) }}>
                        {check(ev.value)}
                      </span>
                    </td>
                    <td className={tableStyles.date}>
                      {ev.value ? `${ev.value.substring(0, 20)}…` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
