'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { User, LayoutDashboard, UserCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [userName, setUserName]       = useState('');
  const [menuOpen, setMenuOpen]       = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check session on mount and listen for auth changes
  useEffect(() => {
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUserName(session?.user.user_metadata?.full_name?.split(' ')[0] ?? '');
    };
    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserName(session?.user.user_metadata?.full_name?.split(' ')[0] ?? '');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
        <Logo width={32} height={32} className={styles.logoIcon} />
        <span style={{ marginLeft: '10px' }}>CAPONE</span>
      </Link>

      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Início</Link>
        <Link href="/servicos" className={styles.navLink}>Serviços</Link>
        <Link href="/sobre" className={styles.navLink}>Sobre</Link>
        <Link href="/contato" className={styles.navLink}>Contato</Link>
      </nav>

      <div className={styles.actions}>
        {isLoggedIn ? (
          /* ── Logged-in: user menu ── */
          <div className={styles.userMenuWrapper} ref={menuRef}>
            <button
              className={`${styles.cartButton} ${styles.userBtn}`}
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Menu do usuário"
              aria-expanded={menuOpen}
            >
              <User size={22} />
              {userName && <span className={styles.userName}>{userName}</span>}
            </button>

            {menuOpen && (
              <div className={styles.userMenu}>
                <Link
                  href="/dashboard"
                  className={styles.menuItem}
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={16} />
                  Painel de Controle
                </Link>
                <Link
                  href="/perfil"
                  className={styles.menuItem}
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle size={16} />
                  Perfil
                </Link>
                <div className={styles.menuDivider} />
                <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleLogout}>
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Guest: login link ── */
          <Link href="/login" className={styles.cartButton} aria-label="Login">
            <User size={24} />
          </Link>
        )}

        <Link
          href="/servicos"
          className={styles.ctaButton}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Assinar Agora
        </Link>
      </div>
    </header>
  );
}
