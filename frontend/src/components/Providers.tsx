'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import { ToastContainer } from './Toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <ToastContainer />
    </CartProvider>
  );
}
