'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useParams, useRouter as useNextRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCard, QrCode, Copy, CheckCircle, Clock, ShieldCheck, Landmark, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Checkout.module.css';

type PaymentMethod = 'pix' | 'card';

export default function CheckoutPage() {
  const router = useNextRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;

  // Estado Geral
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [companyName, setCompanyName] = useState('Sua Empresa');
  const [planSlug, setPlanSlug] = useState('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTenant, setLoadingTenant] = useState(true);

  // Estados do PIX
  const [copiedPix, setCopiedPix] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos em segundos

  // Estados do Cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);

  // Estado de Processamento de Pagamento
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Detalhes estáticos dos planos para faturamento
  const planDetails: Record<string, { name: string; setup: number; monthly: number; annual: number }> = {
    starter: { name: 'Capone Starter', setup: 297, monthly: 97, annual: 77 },
    pro: { name: 'Capone Pro', setup: 449, monthly: 149, annual: 119 },
    elite: { name: 'Capone Elite', setup: 697, monthly: 249, annual: 199 },
  };

  const plan = planDetails[planSlug] || planDetails.pro;
  const recurringPrice = billingCycle === 'annual' ? plan.annual : plan.monthly;
  const totalNow = plan.setup + recurringPrice;

  // 1. Carrega dados do Banco (Supabase) + Cache
  useEffect(() => {
    if (!tenantId) return;

    const fetchTenant = async () => {
      try {
        // Fallback local do SessionStorage para agilidade imediata
        const cachedPlan = sessionStorage.getItem('selectedPlan');
        const cachedCycle = sessionStorage.getItem('selectedBillingCycle') as 'monthly' | 'annual';
        if (cachedPlan) setPlanSlug(cachedPlan);
        if (cachedCycle) setBillingCycle(cachedCycle);

        const { data, error } = await supabase
          .from('tenants')
          .select('company_name, plan')
          .eq('id', tenantId)
          .single();

        if (data) {
          setCompanyName(data.company_name);
          if (data.plan) setPlanSlug(data.plan.toLowerCase());
        }
      } catch (err) {
        console.error('Erro ao buscar dados do tenant:', err);
      } finally {
        setLoadingTenant(false);
      }
    };

    fetchTenant();
  }, [tenantId]);

  // 2. Cronômetro regressivo regressivo do PIX
  useEffect(() => {
    if (method !== 'pix' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [method, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Máscaras e Validações Inteligentes (JavaScript Puro)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    value = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Adiciona espaço a cada 4 dígitos
    setCardNumber(value.substring(0, 19)); // Limita a 16 dígitos + 3 espaços
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardExpiry(value.substring(0, 5)); // Limita a MM/AA
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardCvv(value.substring(0, 4)); // Limita a 4 dígitos
  };

  // 4. Copiar Código PIX Inteligente
  const pixKey = "00020126580014br.gov.bcb.pix01368640402977042456-capone-onboarding5204000053039865406449.005802BR5917CaponeAutomas6009SaoPaulo62070503***6304ED2F";
  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  // 5. Fluxo de Confirmação & Processamento do Pagamento
  const handleConfirmPayment = async () => {
    // Validação básica do cartão se o método for cartão
    if (method === 'card') {
      if (cardNumber.length < 19 || cardName.trim().length < 3 || cardExpiry.length < 5 || cardCvv.length < 3) {
        alert('Por favor, preencha todos os campos do cartão de crédito corretamente.');
        return;
      }
    }

    setProcessing(true);
    setProcessingStep(0);

    const steps = [
      'Criptografando dados de pagamento (256-bit)...',
      'Transmitindo transação para o adquirente...',
      'Aprovando saldo com o banco emissor...',
      'Gerando recibo financeiro da assinatura...',
      'Disparando e-mail de ativação transacional...',
      'Provisionando automação do WhatsApp...'
    ];

    // Simulação das etapas do processamento moderno
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setProcessingStep(i + 1);
    }

    try {
      // Dispara o e-mail de confirmação transacional no servidor
      await fetch('/api/payments/email-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          email: sessionStorage.getItem('ownerEmail') || 'cliente@capone.com.br',
          companyName,
          planName: plan.name,
          setup: plan.setup,
          monthly: recurringPrice,
          cycle: billingCycle
        })
      });
    } catch (e) {
      console.error('Erro ao registrar confirmação por e-mail:', e);
    }

    setProcessing(false);
    // Avança para a tela de onboarding de sucesso
    router.push('/onboarding/success?mp_connected=true');
  };

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.checkoutWrapper}>
          
          {/* Coluna Esquerda: Formulário de Pagamento */}
          <div className={styles.paymentCol}>
            <div className={styles.paymentCard}>
              <div className={styles.cardHeader}>
                <Landmark size={24} style={{ color: '#FF7A00' }} />
                <div>
                  <h1 className={styles.title}>Método de Pagamento</h1>
                  <p className={styles.subtitle}>Escolha sua forma de pagamento inspirada em fintechs modernas</p>
                </div>
              </div>

              {/* Seletor de Abas Banco Inter Style */}
              <div className={styles.tabSelector}>
                <button 
                  onClick={() => { setMethod('pix'); setIsFlipped(false); }}
                  className={`${styles.tabBtn} ${method === 'pix' ? styles.tabActive : ''}`}
                >
                  <QrCode size={18} />
                  <span>PIX Instantâneo</span>
                </button>
                <button 
                  onClick={() => setMethod('card')}
                  className={`${styles.tabBtn} ${method === 'card' ? styles.tabActive : ''}`}
                >
                  <CreditCard size={18} />
                  <span>Cartão de Crédito</span>
                </button>
                <div 
                  className={styles.tabGlider} 
                  style={{ transform: method === 'pix' ? 'translateX(0)' : 'translateX(100%)' }} 
                />
              </div>

              {/* Conteúdo da Aba PIX */}
              {method === 'pix' && (
                <div className={`${styles.tabContent} fade-in`}>
                  <div className={styles.pixInfoBox}>
                    <div className={styles.qrCodeWrapper}>
                      {/* QR Code estético de alta fidelidade */}
                      <div className={styles.qrPlaceholder}>
                        <div className={styles.qrCorners}></div>
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020126580014br.gov.bcb.pix01368640402977042456-capone-onboarding5204000053039865406449.005802BR5917CaponeAutomas6009SaoPaulo62070503***6304ED2F&color=08080c" 
                          alt="Pix QR Code" 
                          className={styles.qrImage}
                        />
                      </div>
                      
                      <div className={styles.pixClock}>
                        <Clock size={16} />
                        <span>Expira em: <strong className={styles.timerText}>{formatTime(timeLeft)}</strong></span>
                      </div>
                    </div>

                    <div className={styles.pixInstructions}>
                      <h3>Como pagar com PIX:</h3>
                      <ol>
                        <li>Abra o app do seu banco de preferência.</li>
                        <li>Escolha a opção de pagar com <strong>PIX</strong> e aponte a câmera para o QR Code acima.</li>
                        <li>Ou se preferir, copie a chave copia e cola abaixo e cole no campo apropriado do seu banco.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Campo Copia e Cola */}
                  <div className={styles.copyBox}>
                    <div className={styles.copyInputWrapper}>
                      <input 
                        type="text" 
                        readOnly 
                        value={pixKey} 
                        className={styles.copyInput}
                      />
                      <button onClick={handleCopyPix} className={styles.copyBtn}>
                        {copiedPix ? <CheckCircle size={18} style={{ color: 'var(--success)' }} /> : <Copy size={18} />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Conteúdo da Aba Cartão */}
              {method === 'card' && (
                <div className={`${styles.tabContent} fade-in`}>
                  
                  {/* Visor de Cartão Virtual Animado 3D */}
                  <div className={styles.cardWidgetWrapper}>
                    <div className={`${styles.virtualCard} ${isFlipped ? styles.flipped : ''}`}>
                      
                      {/* Frente do Cartão */}
                      <div className={styles.cardFront}>
                        <div className={styles.cardPattern}></div>
                        <div className={styles.cardTopRow}>
                          <span className={styles.cardLogoName}>Capone <span className={styles.neonDot}>.</span></span>
                          <span className={styles.bankName}>INTER BLACK</span>
                        </div>
                        <div className={styles.cardChip}>
                          <div className={styles.chipLines}></div>
                        </div>
                        <div className={styles.cardNumDisplay}>
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className={styles.cardBottomRow}>
                          <div className={styles.holderBlock}>
                            <span className={styles.cardMetaLabel}>TITULAR</span>
                            <span className={styles.cardValueDisplay}>{cardName.toUpperCase() || 'NOME DO TITULAR'}</span>
                          </div>
                          <div className={styles.expiryBlock}>
                            <span className={styles.cardMetaLabel}>VALIDADE</span>
                            <span className={styles.cardValueDisplay}>{cardExpiry || 'MM/AA'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Verso do Cartão */}
                      <div className={styles.cardBack}>
                        <div className={styles.cardMagneticStrip}></div>
                        <div className={styles.cardSignatureBlock}>
                          <span className={styles.cvvLabel}>CVV</span>
                          <div className={styles.cvvDisplay}>{cardCvv || '•••'}</div>
                        </div>
                        <div className={styles.cardBackFooter}>
                          <p>Uso Exclusivo Digital · Capone Automações Ltda</p>
                          <ShieldCheck size={20} style={{ opacity: 0.6 }} />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Form de Entrada do Cartão */}
                  <div className={styles.cardForm}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Número do Cartão</label>
                      <input 
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={styles.formInput}
                        maxLength={19}
                        onFocus={() => setIsFlipped(false)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Nome Impresso no Cartão</label>
                      <input 
                        type="text"
                        placeholder="JOÃO DA SILVA"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} // Apenas letras
                        className={styles.formInput}
                        onFocus={() => setIsFlipped(false)}
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup} style={{ flex: 1 }}>
                        <label className={styles.inputLabel}>Validade</label>
                        <input 
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          className={styles.formInput}
                          maxLength={5}
                          onFocus={() => setIsFlipped(false)}
                        />
                      </div>

                      <div className={styles.inputGroup} style={{ flex: 1 }}>
                        <label className={styles.inputLabel}>CVV</label>
                        <input 
                          type="text"
                          placeholder="123"
                          value={cardCvv}
                          onChange={handleCardCvvChange}
                          className={styles.formInput}
                          maxLength={4}
                          onFocus={() => setIsFlipped(true)}
                          onBlur={() => setIsFlipped(false)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Ação Laranja Banco Inter Style */}
              <button 
                onClick={handleConfirmPayment}
                className={styles.actionBtn}
              >
                <span>Confirmar Pagamento Seguro</span>
                <ArrowRight size={18} />
              </button>

              <div className={styles.secureBadge}>
                <ShieldCheck size={14} />
                <span>Pagamento 100% Criptografado, Auditado e Seguro</span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Resumo do Faturamento Capone */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Resumo da Compra</h2>
              
              <div className={styles.businessBadge}>
                <Sparkles size={14} style={{ color: '#FF7A00' }} />
                <span>Assinante: <strong>{companyName}</strong></span>
              </div>

              <div className={styles.summaryDivider}></div>

              {/* Detalhes do Faturamento */}
              <div className={styles.pricingRows}>
                <div className={styles.pricingRow}>
                  <div className={styles.rowLabel}>
                    <h4>Plano Escolhido</h4>
                    <p>{plan.name} — Faturamento {billingCycle === 'annual' ? 'Anual (20% OFF)' : 'Mensal'}</p>
                  </div>
                  <span className={styles.rowValue}>Ativo</span>
                </div>

                <div className={styles.pricingRow}>
                  <div className={styles.rowLabel}>
                    <h4>Setup da Automação (Taxa Única)</h4>
                    <p>Configuração, prompt engineering e provisionamento</p>
                  </div>
                  <span className={styles.rowValue}>R$ {plan.setup.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className={styles.pricingRow}>
                  <div className={styles.rowLabel}>
                    <h4>Mensalidade Recorrente</h4>
                    <p>Cobrado a cada {billingCycle === 'annual' ? '12 meses' : 'mês'}</p>
                  </div>
                  <span className={styles.rowValue}>R$ {recurringPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className={styles.summaryDivider}></div>

              {/* Totalizador */}
              <div className={styles.totalRow}>
                <span>Valor Total Agora</span>
                <div className={styles.totalBlock}>
                  <span className={styles.totalPrice}>R$ {totalNow.toFixed(2).replace('.', ',')}</span>
                  <span className={styles.setupWarning}>Setup + primeiro período incluso</span>
                </div>
              </div>

              <div className={styles.guaranteeBox}>
                <CheckCircle size={16} />
                <span>Garantia de satisfação de 7 dias ou seu dinheiro de volta.</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Overlay de Processamento de Pagamento */}
      {processing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingBox}>
            <Loader2 size={48} className={styles.spinner} />
            <h2>Processando Pagamento...</h2>
            <p className={styles.processingStepText}>
              {processingStep === 0 && 'Criptografando dados de pagamento (256-bit)...'}
              {processingStep === 1 && 'Transmitindo transação para o adquirente...'}
              {processingStep === 2 && 'Aprovando saldo com o banco emissor...'}
              {processingStep === 3 && 'Gerando recibo financeiro da assinatura...'}
              {processingStep === 4 && 'Disparando e-mail de ativação transacional...'}
              {processingStep === 5 && 'Provisionando automação do WhatsApp...'}
            </p>
            
            {/* Barra de Progresso */}
            <div className={styles.progressBarWrapper}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${(processingStep / 6) * 100}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
