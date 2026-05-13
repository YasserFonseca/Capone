'use client';

import { X, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';
import Link from 'next/link';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <>
      <div 
        className={`${styles.overlay} ${isCartOpen ? styles.open : ''}`} 
        onClick={closeCart}
      />
      <div className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}><ShoppingCart /> Carrinho</h2>
          <button className={styles.closeButton} onClick={closeCart} aria-label="Fechar carrinho">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.formData && item.formData.nome_empresa && (
                    <span className={styles.itemSubtitle}>{item.formData.nome_empresa}</span>
                  )}
                  <span className={styles.itemPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <button 
                  className={styles.removeButton} 
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remover item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <Link href="/carrinho" className={styles.checkoutButton} onClick={closeCart}>
              Finalizar Compra <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
