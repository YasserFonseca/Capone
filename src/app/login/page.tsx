'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import styles from '@/app/styles/Auth.module.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({ email: '', password: '', general: '' });
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    let valid = true;
    const e = { email: '', password: '', general: '' };
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = 'E-mail inválido.'; valid = false;
    }
    if (!formData.password) {
      e.password = 'Senha obrigatória.'; valid = false;
    }
    setErrors(e);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email:    formData.email,
        password: formData.password,
      });
      if (error) throw error;
      const u = data.session?.user
      const isAdmin = u?.user_metadata?.is_admin === true || u?.app_metadata?.is_admin === true
      router.push(isAdmin ? '/admin' : '/dashboard');
    } catch {
      setErrors(prev => ({ ...prev, general: 'E-mail ou senha incorretos.' }));
    } finally {
      setLoading(false);
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

            {errors.general && (
              <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ff4d4d', fontSize: '0.9rem' }}>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">E-mail Corporativo</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input type="email" id="email" className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    placeholder="voce@empresa.com" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="password">Senha de Acesso</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input type="password" id="password" className={`${styles.input} ${errors.password ? styles.error : ''}`}
                    placeholder="••••••••" value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar no Sistema'}
              </button>
            </form>

            <div className={styles.footer}>
              Ainda não tem conta? <Link href="/registro" className={styles.link}>Criar Conta</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
