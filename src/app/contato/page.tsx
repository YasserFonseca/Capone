'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './Contato.module.css';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function ContatoPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    const form = e.target as HTMLFormElement;
    form.reset();
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <div className={styles.container}>
          <div className={`${styles.header} fade-in`}>
            <h1 className={`${styles.title} gradient-text`}>Fale Conosco</h1>
            <p className={styles.subtitle}>Tem dúvidas sobre como a automação pode revolucionar o seu negócio? Nossa equipe de especialistas está à disposição.</p>
          </div>

          <div className={styles.content}>
            <div className={`${styles.infoSection} fade-in`} style={{ animationDelay: '0.1s' }}>
              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Mail size={24} />
                </div>
                <div className={styles.infoText}>
                  <h3>E-mail</h3>
                  <p>{process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@caponeautomacoes.com'}</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Phone size={24} />
                </div>
                <div className={styles.infoText}>
                  <h3>Telefone / WhatsApp</h3>
                  <p>{process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '(11) 98765-4321'}</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <MapPin size={24} />
                </div>
                <div className={styles.infoText}>
                  <h3>Escritório Central</h3>
                  <p>Av. Paulista, 1000 - São Paulo, SP<br />Edifício Tech Tower, Conjunto 42</p>
                </div>
              </div>
            </div>

            <div className={`${styles.formSection} fade-in`} style={{ animationDelay: '0.2s' }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="nome">Seu Nome</label>
                  <input type="text" id="nome" name="nome" className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="email">Seu E-mail</label>
                  <input type="email" id="email" name="email" className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="mensagem">Como podemos ajudar?</label>
                  <textarea id="mensagem" name="mensagem" className={styles.textarea} required></textarea>
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Enviar Mensagem
                </button>
                {sent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginTop: '1rem', fontSize: '0.95rem' }}>
                    <CheckCircle size={18} /> Mensagem enviada! Em breve retornaremos o contato.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
