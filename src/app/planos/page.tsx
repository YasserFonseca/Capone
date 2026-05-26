'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './Planos.module.css';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const PLANS = [
  {
    slug: 'starter',
    tier: 'Tier 01',
    name: 'Starter',
    desc: 'Validação de mercado — primeiros 10 clientes. Preço agressivo para gerar depoimentos e social proof.',
    setup: 297,
    monthly: 97,
    annual: 77,
    annualYearly: 924,
    features: [
      { text: 'FAQ automático + agendamento', supported: true },
      { text: 'WhatsApp no seu próprio número', supported: true },
      { text: 'Dashboard de métricas básico', supported: true },
      { text: 'Suporte via WhatsApp comercial', supported: true },
      { text: 'Limite de 1 profissional cadastrado', supported: true },
      { text: 'Sem pagamento integrado', supported: false },
    ],
    featured: false,
  },
  {
    slug: 'pro',
    tier: 'Tier 02',
    name: 'Pro',
    desc: 'Produto completo. Posicionado abaixo de concorrentes com IA mas acima de sistemas de agenda simples.',
    setup: 449,
    monthly: 149,
    annual: 119,
    annualYearly: 1428,
    features: [
      { text: 'FAQ automático + agendamento', supported: true },
      { text: 'WhatsApp no seu próprio número', supported: true },
      { text: 'Dashboard de métricas completo', supported: true },
      { text: 'Suporte prioritário via WhatsApp', supported: true },
      { text: 'Limite de 1 profissional cadastrado', supported: true },
      { text: 'Pagamento integrado via Mercado Pago OAuth', supported: true },
      { text: 'Confirmação automática de agendamentos', supported: true },
    ],
    featured: true,
  },
  {
    slug: 'elite',
    tier: 'Tier 03',
    name: 'Elite',
    desc: 'Para negócios maiores ou múltiplas unidades. Permite capturar mais valor sem afetar o volume de entrada.',
    setup: 697,
    monthly: 249,
    annual: 199,
    annualYearly: 2388,
    features: [
      { text: 'FAQ automático + agendamento', supported: true },
      { text: 'WhatsApp no seu próprio número', supported: true },
      { text: 'Dashboard de métricas completo', supported: true },
      { text: 'SLA de suporte dedicado 24h', supported: true },
      { text: 'Múltiplos profissionais e salas ilimitadas', supported: true },
      { text: 'Pagamento integrado via Mercado Pago OAuth', supported: true },
      { text: 'Prompts customizados e refinados', supported: true },
      { text: 'Onboarding guiado individual (call)', supported: true },
    ],
    featured: false,
  },
];

export default function PlanosPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSelectPlan = (slug: string) => {
    // Guarda o plano selecionado no sessionStorage para ler na página de serviços
    sessionStorage.setItem('selectedPlan', slug);
    sessionStorage.setItem('selectedBillingCycle', billingCycle);
    // Redireciona para escolher o segmento de negócio
    router.push('/servicos');
  };

  const toggleBilling = () => {
    setBillingCycle(prev => (prev === 'monthly' ? 'annual' : 'monthly'));
  };

  return (
    <>
      <Header />
      <main className="fade-in">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={`${styles.title} gradient-text`}>Escolha o Seu Plano</h1>
            <p className={styles.subtitle}>
              Selecione o plano ideal para a sua empresa e automatize seu atendimento conversacional com agendamento inteligente e checkout premium em poucos minutos.
            </p>
          </div>

          {/* Billing Toggle Switch */}
          <div className={styles.billingToggleWrapper}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.activeToggle : ''}`}
            >
              Mensal
            </button>
            <div className={styles.toggleTrack} onClick={toggleBilling} aria-label="Alterar ciclo de cobrança">
              <div className={`${styles.toggleThumb} ${billingCycle === 'annual' ? styles.thumbAnnual : ''}`} />
            </div>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`${styles.toggleBtn} ${billingCycle === 'annual' ? styles.activeToggle : ''}`}
            >
              Anual <span className={styles.discountBadge}>Economize 20%</span>
            </button>
          </div>

          <div className={styles.grid}>
            {PLANS.map((plan) => {
              const currentPrice = billingCycle === 'monthly' ? plan.monthly : plan.annual;
              const yearlyTotal = plan.annualYearly;

              return (
                <div
                  key={plan.slug}
                  className={`${styles.card} ${plan.featured ? styles.cardFeatured : ''}`}
                >
                  {plan.featured && (
                    <div className={styles.badge}>
                      <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Recomendado
                    </div>
                  )}
                  <span className={styles.tier}>{plan.tier}</span>
                  <h2 className={styles.planName}>{plan.name}</h2>
                  <p className={styles.planDesc}>{plan.desc}</p>

                  <div className={styles.pricingBlock}>
                    <p className={styles.setup}>
                      Setup único: <strong>R$ {plan.setup}</strong>
                    </p>
                    <p className={styles.monthly}>
                      R$ {currentPrice} <span>/mês</span>
                    </p>
                    {billingCycle === 'annual' && (
                      <span className={styles.billingPeriodLabel}>
                        Cobrado anualmente (R$ {yearlyTotal}/ano)
                      </span>
                    )}
                  </div>

                  <div className={styles.divider} />

                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className={`${styles.featureItem} ${
                          !feature.supported ? styles.unsupportedFeature : ''
                        }`}
                      >
                        {feature.supported ? (
                          <Check size={18} className={styles.checkIcon} />
                        ) : (
                          <X size={18} className={styles.unsupportedIcon} />
                        )}
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.slug)}
                    className={`${styles.ctaButton} ${
                      plan.featured ? styles.btnPrimary : styles.btnSecondary
                    }`}
                  >
                    <span>Assinar {plan.name}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <p className={styles.footerNote}>
            O plano <strong>Starter</strong> sem Mercado Pago cria uma experiência ágil de contato inicial, permitindo o upsell natural para o <strong>Pro</strong>. O setup único cobre toda a engenharia de prompts e a integração inicial de dados de maneira self-service e instantânea.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
