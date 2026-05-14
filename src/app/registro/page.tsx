'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { User, Mail, Lock, CreditCard, Loader2 } from 'lucide-react';
import styles from '@/app/styles/Auth.module.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ── CPF / CNPJ ────────────────────────────────────────────────
function maskDocument(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function validateCPF(d: string): boolean {
  if (/^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +d[i] * (10 - i);
  let r = (sum * 10) % 11; if (r >= 10) r = 0;
  if (r !== +d[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += +d[i] * (11 - i);
  r = (sum * 10) % 11; if (r >= 10) r = 0;
  return r === +d[10];
}

function validateCNPJ(d: string): boolean {
  if (/^(\d)\1{13}$/.test(d)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = w1.reduce((s, w, i) => s + +d[i] * w, 0);
  let r = sum % 11;
  if ((r < 2 ? 0 : 11 - r) !== +d[12]) return false;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = w2.reduce((s, w, i) => s + +d[i] * w, 0);
  r = sum % 11;
  return (r < 2 ? 0 : 11 - r) === +d[13];
}

function validateDocument(value: string): { valid: boolean; type: string } {
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return { valid: validateCPF(d), type: 'CPF' };
  if (d.length === 14) return { valid: validateCNPJ(d), type: 'CNPJ' };
  return { valid: false, type: '' };
}

// ── Component ─────────────────────────────────────────────────
export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', document: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    name: '', email: '', document: '', password: '', confirmPassword: '', general: '',
  });
  const [loading, setLoading] = useState(false);

  // ── Password strength
  const calcStrength = (p: string) => {
    let s = 0;
    if (p.length > 0) s++;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const score = calcStrength(formData.password);
  const strengthMap = [
    { color: 'transparent', label: '',         width: '0%' },
    { color: '#ff4d4d',     label: 'Fraca',     width: '20%' },
    { color: '#ff4d4d',     label: 'Fraca',     width: '33%' },
    { color: '#ffd166',     label: 'Razoável',  width: '66%' },
    { color: '#ffd166',     label: 'Razoável',  width: '80%' },
    { color: '#06d6a0',     label: 'Forte',     width: '100%' },
  ];
  const strength = strengthMap[score] ?? strengthMap[0];

  // ── Document field handler (applies mask on every keystroke)
  const handleDocumentChange = (raw: string) => {
    setFormData(prev => ({ ...prev, document: maskDocument(raw) }));
  };

  // ── Validation
  const validate = () => {
    let valid = true;
    const e = { name: '', email: '', document: '', password: '', confirmPassword: '', general: '' };

    if (!formData.name || formData.name.length < 3) {
      e.name = 'Nome deve ter ao menos 3 caracteres.'; valid = false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = 'E-mail inválido.'; valid = false;
    }

    const docRaw = formData.document.replace(/\D/g, '');
    if (!docRaw) {
      e.document = 'CPF ou CNPJ obrigatório.'; valid = false;
    } else {
      const { valid: docValid, type } = validateDocument(formData.document);
      if (!docValid) {
        e.document = type ? `${type} inválido.` : 'CPF ou CNPJ inválido.'; valid = false;
      }
    }

    if (score < 3) {
      e.password = 'Senha muito fraca. Use letras, números e maiúsculas.'; valid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = 'As senhas não coincidem.'; valid = false;
    }

    setErrors(e);
    return valid;
  };

  // ── Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email:    formData.email,
        password: formData.password,
        options:  {
          data: {
            full_name: formData.name,
            cpf_cnpj:  formData.document.replace(/\D/g, ''),
          },
        },
      });
      if (error) throw error;
      router.push('/servicos');
    } catch (err) {
      setErrors(prev => ({ ...prev, general: (err as Error).message ?? 'Erro ao criar conta.' }));
    } finally {
      setLoading(false);
    }
  };

  const docDigits = formData.document.replace(/\D/g, '');
  const docType   = docDigits.length <= 11 ? 'CPF' : 'CNPJ';

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

            {errors.general && (
              <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ff4d4d', fontSize: '0.9rem' }}>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Nome */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome Completo</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={20} />
                  <input
                    type="text"
                    className={`${styles.input} ${errors.name ? styles.error : ''}`}
                    placeholder="João Silva"
                    maxLength={100}
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              {/* E-mail */}
              <div className={styles.formGroup}>
                <label className={styles.label}>E-mail</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    placeholder="voce@empresa.com"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {/* CPF / CNPJ */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {docType}
                  {docDigits.length > 0 && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                      ({docDigits.length <= 11 ? '000.000.000-00' : '00.000.000/0000-00'})
                    </span>
                  )}
                </label>
                <div className={styles.inputWrapper}>
                  <CreditCard className={styles.inputIcon} size={20} />
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`${styles.input} ${errors.document ? styles.error : ''}`}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    value={formData.document}
                    onChange={e => handleDocumentChange(e.target.value)}
                  />
                </div>
                {errors.document && <span className={styles.errorText}>{errors.document}</span>}
              </div>

              {/* Senha */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Crie uma Senha</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type="password"
                    className={`${styles.input} ${errors.password ? styles.error : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                {formData.password.length > 0 && (
                  <>
                    <div className={styles.strengthMeter}>
                      <div className={styles.strengthBar} style={{ width: strength.width, backgroundColor: strength.color }} />
                    </div>
                    <span className={styles.strengthText} style={{ color: strength.color }}>{strength.label}</span>
                  </>
                )}
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              {/* Confirmar senha */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirme a Senha</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type="password"
                    className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Loader2 size={20} /> : 'Criar Minha Conta'}
              </button>
            </form>

            <div className={styles.footer}>
              Já tem conta? <Link href="/login" className={styles.link}>Fazer Login</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
