'use client';

import Link from 'next/link';
import Logo from './Logo';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function Header() {
  const { cartCount, toggleCart } = useCart();

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
        <Link href="/login" className={styles.cartButton} aria-label="Login">
          <User size={24} />
        </Link>
        <button onClick={toggleCart} className={styles.cartButton} aria-label="Carrinho">
          <ShoppingCart size={24} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
        <Link href="/carrinho" className={styles.ctaButton} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          Assinar Agora
        </Link>
      </div>
    </header>
  );
}
