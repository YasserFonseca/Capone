'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';
import styles from '@/app/styles/Auth.module.css';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const { showToast } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Calculate Password Strength
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculateStrength(formData.password);
  
  let strengthColor = 'transparent';
  let strengthLabel = '';
  let strengthWidth = '0%';

  if (strengthScore > 0 && strengthScore <= 2) {
    strengthColor = '#ff4d4d'; // Weak
    strengthLabel = 'Fraca';
    strengthWidth = '33%';
  } else if (strengthScore === 3 || strengthScore === 4) {
    strengthColor = '#ffd166'; // Medium
    strengthLabel = 'Razoável';
    strengthWidth = '66%';
  } else if (strengthScore === 5) {
    strengthColor = '#06d6a0'; // Strong
    strengthLabel = 'Forte';
    strengthWidth = '100%';
  }

  const validate = () => {
    let valid = true;
    let newErrors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres.';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail em formato inválido.';
      valid = false;
    }

    if (strengthScore < 3) {
      newErrors.password = 'A senha está muito fraca.';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      showToast('Conta criada com sucesso! Bem-vindo à Capone.');
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
              <h1 className={`${styles.title} gradient-text`}>Crie sua Conta</h1>
              <p className={styles.subtitle}>O primeiro passo para escalar suas vendas.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">Nome Completo</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={20} />
                  <input 
                    type="text" 
                    id="name" 
                    className={`${styles.input} ${errors.name ? styles.error : ''}`}
                    placeholder="João Silva"
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <span className={styles.charCount}>{formData.name.length}/100</span>
                </div>
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

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
                <label className={styles.label} htmlFor="password">Crie uma Senha</label>
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
                
                {formData.password.length > 0 && (
                  <>
                    <div className={styles.strengthMeter}>
                      <div className={styles.strengthBar} style={{ width: strengthWidth, backgroundColor: strengthColor }}></div>
                    </div>
                    <span className={styles.strengthText} style={{ color: strengthColor }}>{strengthLabel}</span>
                  </>
                )}
                
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="confirmPassword">Confirme a Senha</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                    placeholder="••••••••"
                    maxLength={50}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className={styles.submitBtn}>
                Criar Minha Conta
              </button>

            </form>

            <div className={styles.footer}>
              Já tem uma conta? <Link href="/login" className={styles.link}>Fazer Login</Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
