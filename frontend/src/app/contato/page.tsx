'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './Contato.module.css';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { submitContactForm } from '@/app/actions/contact';

export default function ContatoPage() {
  const { showToast } = useCart();

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
  const [isPending, setIsPending] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', email: '', message: '' };

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres.';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail em formato inválido.';
      valid = false;
    }

    if (!formData.message || formData.message.length < 5) {
      newErrors.message = 'A mensagem deve ter pelo menos 5 caracteres.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsPending(true);
    try {
      const response = await submitContactForm({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      if (response.success) {
        showToast(response.message);
        setFormData({ name: '', email: '', message: '' });
      } else {
        showToast(response.message);
        if (response.errors) {
          setErrors(prev => ({ ...prev, ...response.errors }));
        }
      }
    } catch {
      showToast('Erro ao conectar-se ao servidor de mensagens.');
    } finally {
      setIsPending(false);
    }
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
                  <p>contato@caponeautomacoes.com</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Phone size={24} />
                </div>
                <div className={styles.infoText}>
                  <h3>Telefone / WhatsApp</h3>
                  <p>(11) 98765-4321</p>
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
                  <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    className={`${styles.input} ${errors.name ? styles.error : ''}`}
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <span style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="email">Seu E-mail</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    maxLength={100}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && <span style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="mensagem">Como podemos ajudar?</label>
                  <textarea 
                    id="mensagem" 
                    name="mensagem" 
                    className={`${styles.textarea} ${errors.message ? styles.error : ''}`}
                    maxLength={1000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                  {errors.message && <span style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.message}</span>}
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isPending}>
                  {isPending ? 'Enviando com segurança...' : 'Enviar Mensagem'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

