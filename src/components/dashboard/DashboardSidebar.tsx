'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, MessageSquare,
  Settings, LogOut, Wifi, Menu, X
} from 'lucide-react'
import styles from '@/app/styles/Dashboard.module.css'
import { supabase } from '@/lib/supabase'

const NAV = [
  { label: 'Painel',        href: '/dashboard',               icon: LayoutDashboard },
  { label: 'Agendamentos',  href: '/dashboard/agendamentos',  icon: Calendar        },
  { label: 'Conversas',     href: '/dashboard/conversas',     icon: MessageSquare   },
  { label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings        },
]

interface Props {
  userName:    string
  userEmail:   string
  companyName: string
}

export function DashboardSidebar({ userName, userEmail, companyName }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Fecha sidebar ao navegar
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Botão hamburger — só visível em mobile (< 900px), via CSS */}
      <button
        className={styles.menuBtn}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay escura — só visível quando sidebar está aberta no mobile */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${styles.sidebarMobile} ${isOpen ? styles.sidebarMobileOpen : ''}`}
      >
        <Link href="/" className={styles.sidebarLogo}>
          <span className={styles.sidebarLogoDot} />
          <span className={styles.sidebarLogoText}>CAPONE</span>
        </Link>

        <div style={{
          padding:      '10px 16px',
          borderBottom: '1px solid #3c2459',
          fontSize:     '11px',
          color:        '#a496b8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={12} color="#4ade80" />
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '12px' }}>
              {companyName}
            </span>
          </div>
          <span style={{ marginTop: '2px', display: 'block' }}>Bot ativo</span>
        </div>

        <nav className={styles.sidebarNav}>
          <p className={styles.sidebarSection}>Menu</p>
          {NAV.map(item => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatar}>{initials}</div>
            <div>
              <div className={styles.sidebarUserName}>{userName.split(' ')[0]}</div>
              <div className={styles.sidebarUserEmail}>{userEmail}</div>
            </div>
          </div>
          <button className={`${styles.sidebarItem} ${styles.btnDanger}`} onClick={handleLogout}>
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
