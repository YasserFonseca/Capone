'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, DollarSign, Wifi,
  Calendar, MessageSquare, Grid, Settings, LogOut
} from 'lucide-react'
import styles from './AdminSidebar.module.css'
import { supabase } from '@/lib/supabase'

const NAV = [
  { label: 'Visão geral', items: [
    { href: '/admin',           icon: LayoutDashboard, label: 'Dashboard'  },
    { href: '/admin/clientes',  icon: Users,           label: 'Clientes'   },
    { href: '/admin/receita',   icon: DollarSign,      label: 'Receita'    },
  ]},
  { label: 'Operação', items: [
    { href: '/admin/instancias',   icon: Wifi,          label: 'Instâncias'    },
    { href: '/admin/agendamentos', icon: Calendar,      label: 'Agendamentos'  },
    { href: '/admin/conversas',    icon: MessageSquare, label: 'Conversas'     },
  ]},
  { label: 'Sistema', items: [
    { href: '/admin/segmentos', icon: Grid,     label: 'Segmentos' },
    { href: '/admin/config',    icon: Settings, label: 'Config'    },
  ]},
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoDot} />
        <span className={styles.logoText}>CAPONE</span>
        <span className={styles.logoAdmin}>admin</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(group => (
          <div key={group.label}>
            <p className={styles.groupLabel}>{group.label}</p>
            {group.items.map(item => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )
}
