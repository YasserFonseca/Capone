'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import styles from './Cart.module.css';
import { CreditCard, QrCode, Building, CheckCircle, Trash2 } from 'lucide-react';

export default function CarrinhoPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf_cnpj: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    cidade: '',
    estado: ''
  });

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    clearCart();
  };

  const isFormValid = formData.nome_completo && formData.email && formData.cpf_cnpj && formData.cep && formData.endereco && formData.numero && formData.cidade && formData.estado;

  if (isSuccess) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: '120px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className={`${styles.section} fade-in`} style={{ textAlign: 'center', maxWidth: '500px' }}>
            <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className={styles.title}>Pedido Confirmado!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Recebemos os dados do seu negócio. Nossa IA começará a configurar a automação imediatamente. Você receberá um e-mail com os próximos passos.
            </p>
            <a href="/" className={styles.checkoutBtn} style={{ textDecoration: 'none' }}>
              Voltar ao Início
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <div className={styles.container}>
          <div className={`${styles.header} fade-in`}>
            <h1 className={`${styles.title} gradient-text`}>Finalizar Assinatura</h1>
          </div>

          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            <form id="checkout-form" onSubmit={handleSubmit}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Dados Pessoais / Empresa</h3>
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="nome_completo">Nome Completo / Razão Social</label>
                    <input type="text" id="nome_completo" name="nome_completo" className={styles.input} value={formData.nome_completo} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="email">E-mail</label>
                    <input type="email" id="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="cpf_cnpj">CPF / CNPJ</label>
                    <input type="text" id="cpf_cnpj" name="cpf_cnpj" className={styles.input} value={formData.cpf_cnpj} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Endereço de Faturamento</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="cep">CEP</label>
                    <input type="text" id="cep" name="cep" className={styles.input} value={formData.cep} onChange={handleChange} required />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="endereco">Endereço</label>
                    <input type="text" id="endereco" name="endereco" className={styles.input} value={formData.endereco} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="numero">Número</label>
                    <input type="text" id="numero" name="numero" className={styles.input} value={formData.numero} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="complemento">Complemento</label>
                    <input type="text" id="complemento" name="complemento" className={styles.input} value={formData.complemento} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="cidade">Cidade</label>
                    <input type="text" id="cidade" name="cidade" className={styles.input} value={formData.cidade} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="estado">Estado</label>
                    <input type="text" id="estado" name="estado" className={styles.input} value={formData.estado} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Método de Pagamento</h3>
              <div className={styles.paymentMethods}>
                <label className={`${styles.paymentOption} ${paymentMethod === 'pix' ? styles.selected : ''}`}>
                  <input type="radio" name="payment" value="pix" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} style={{ display: 'none' }} />
                  <QrCode className={styles.paymentIcon} />
                  <span>PIX (Aprovação Imediata)</span>
                </label>
                <label className={`${styles.paymentOption} ${paymentMethod === 'credito' ? styles.selected : ''}`}>
                  <input type="radio" name="payment" value="credito" checked={paymentMethod === 'credito'} onChange={() => setPaymentMethod('credito')} style={{ display: 'none' }} />
                  <CreditCard className={styles.paymentIcon} />
                  <span>Cartão de Crédito</span>
                </label>
                <label className={`${styles.paymentOption} ${paymentMethod === 'debito' ? styles.selected : ''}`}>
                  <input type="radio" name="payment" value="debito" checked={paymentMethod === 'debito'} onChange={() => setPaymentMethod('debito')} style={{ display: 'none' }} />
                  <Building className={styles.paymentIcon} />
                  <span>Cartão de Débito</span>
                </label>
              </div>

              {paymentMethod === 'credito' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Número do Cartão</label>
                    <input type="text" className={styles.input} placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Validade (MM/AA)</label>
                      <input type="text" className={styles.input} placeholder="MM/AA" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>CVV</label>
                      <input type="text" className={styles.input} placeholder="123" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Resumo da Assinatura</h3>
              {cart.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Seu carrinho está vazio.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className={styles.summaryItem} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#fff', fontWeight: '500' }}>{item.title}</span>
                      <span style={{ fontSize: '0.8rem' }}>Setup Inicial IA</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span>R$ {item.price.toFixed(2).replace('.', ',')}/mês</span>
                      <button type="button" onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
              
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span className="gradient-text">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <button 
                type="submit" 
                form="checkout-form" 
                className={styles.checkoutBtn} 
                disabled={!isFormValid || cart.length === 0}
              >
                Assinar Agora
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
