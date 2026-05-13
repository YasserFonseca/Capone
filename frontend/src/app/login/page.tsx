'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import styles from '@/app/styles/Auth.module.css';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { showToast } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    let valid = true;
    let newErrors = { email: '', password: '' };

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail em formato inválido.';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      showToast('Login efetuado com sucesso!');
      router.push('/');
    }
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div className={styles.container}>
          <div className={`${styles.authCard} fade-in`}>
            
            <div className={styles.header}>
              <h1 className={`${styles.title} gradient-text`}>Bem-vindo de volta</h1>
              <p className={styles.subtitle}>Faça login para acessar suas automações.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">E-mail Corporativo</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input 
                    type="email" 
                    id="email" 
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    placeholder="voce@empresa.com"
                    maxLength={100}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="password">Senha de Acesso</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input 
                    type="password" 
                    id="password" 
                    className={`${styles.input} ${errors.password ? styles.error : ''}`}
                    placeholder="••••••••"
                    maxLength={50}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <button type="submit" className={styles.submitBtn}>
                Entrar no Sistema
              </button>

            </form>

            <div className={styles.footer}>
              Ainda não tem uma conta? <Link href="/registro" className={styles.link}>Criar Conta</Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
