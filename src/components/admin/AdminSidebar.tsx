'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, DollarSign, Wifi,
  Calendar, MessageSquare, Grid, Settings, LogOut, Menu, X
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
  const pathname    = usePathname()
  const router      = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const close = () => setOpen(false)

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && <div className={styles.overlay} onClick={close} />}

    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
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
                  onClick={close}
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
    </>
  )
}
