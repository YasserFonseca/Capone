import { checkAdminAuth } from '@/lib/admin-auth'
import { AdminSidebar }   from '@/components/admin/AdminSidebar'
import styles from './AdminLayout.module.css'

export const metadata = { title: 'Admin — Capone' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAuth()
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
