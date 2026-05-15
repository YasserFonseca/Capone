import { getTenants } from '@/lib/admin-queries'
import { TenantsTable } from '@/components/admin/TenantsTable'
import { LiveRefresh }  from '@/components/admin/LiveRefresh'
import styles from '../AdminDashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminClientesPage() {
  const tenants = await getTenants(200)
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Clientes ({tenants.length})</h1>
        <LiveRefresh intervalSec={30} />
      </div>
      <div className={styles.tableWrap}>
        <div className={styles.fullCard}>
          <TenantsTable tenants={tenants} />
        </div>
      </div>
    </div>
  )
}
