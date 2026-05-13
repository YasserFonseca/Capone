'use client';

import { useCart } from '@/context/CartContext';
import { Sparkles } from 'lucide-react';
import styles from './Toast.module.css';

export function ToastContainer() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className={styles.toastContainer}>
      <div className={styles.toast}>
        <Sparkles size={24} className={styles.icon} />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
