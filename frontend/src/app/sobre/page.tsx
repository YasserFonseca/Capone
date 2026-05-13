import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Zap } from 'lucide-react';
import styles from './Sobre.module.css';

export default function SobrePage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '40px', minHeight: '100vh' }}>
        <div className={styles.container}>
          
          <div className={`${styles.logoWrapper} fade-in`}>
            <div className={styles.glow}></div>
            <Logo width={600} height={600} className={styles.logoIcon} />
          </div>

          <h1 className={`${styles.title} fade-in`} style={{ animationDelay: '0.1s' }}>
            Nós somos a <span className="gradient-text">CAPONE</span>. <br />
            <span className={styles.highlight}>Futuro do atendimento!</span>
          </h1>

          <div className={`${styles.content} fade-in`} style={{ animationDelay: '0.2s' }}>
            <p>
              Em um mercado onde a velocidade e a precisão ditam as regras, continuar dependendo de processos manuais para agendar, lembrar ou faturar clientes não é apenas antiquado — <strong>é prejuízo puro</strong>.
            </p>
            <p>
              A <strong>CAPONE</strong> nasceu para resolver a maior dor de quem empreende e atende o público: a falta de tempo. Entregamos um ecossistema completo de <strong>automação e CRM inteligente</strong> que trabalha 24 horas por dia, 7 dias por semana, sem férias e sem cometer erros.
            </p>
            <p>
              Não importa se você é uma clínica odontológica de alto padrão, um pet shop movimentado, ou uma barbearia com agenda lotada. A nossa IA captura o lead, faz o agendamento, envia o lembrete via WhatsApp de forma humanizada e já prepara o terreno para o pagamento. 
            </p>
            <p>
              <strong>O resultado?</strong> Fim das faltas não avisadas, controle absoluto do fluxo de caixa e o retorno do seu tempo para focar no que realmente importa: a excelência do seu serviço.
            </p>
            <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.4rem', textAlign: 'center', marginTop: '1rem' }}>
              Sofisticado. Rápido. Focado em Resultados.
            </p>
          </div>

          <div className={`${styles.ctaSection} fade-in`} style={{ animationDelay: '0.4s' }}>
            <Link href="/servicos" className={styles.ctaButton}>
              <Zap size={24} fill="currentColor" />
              Conheça Nossas Soluções
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
