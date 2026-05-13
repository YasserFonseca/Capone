import Link from 'next/link';
import { Stethoscope, Scissors, Dog, Scale, Brain, ArrowRight } from 'lucide-react';
import styles from './ServicesGrid.module.css';

const servicesDetail = [
  {
    id: 'odontologia',
    title: 'Clínica de Odontologia',
    description: 'Transforme o atendimento do seu consultório. Nossa automação gerencia agendamentos, envia lembretes via WhatsApp para reduzir faltas e integra tudo diretamente em um CRM focado em saúde dental.',
    features: ['Agendamento 24/7', 'Lembretes WhatsApp', 'Prontuário Digital Integrado'],
    icon: <Stethoscope size={56} />
  },
  {
    id: 'barbearia',
    title: 'Barbearia',
    description: 'Deixe o foco na tesoura e deixe a agenda com a gente. Receba marcações automáticas, controle os horários de cada profissional e permita pagamentos rápidos sem atrito para o cliente.',
    features: ['Controle por Profissional', 'Pagamento Descomplicado', 'Avisos de Retorno'],
    icon: <Scissors size={56} />
  },
  {
    id: 'petshop',
    title: 'Pet Shop',
    description: 'Acompanhe banho, tosa e consultas veterinárias em um só lugar. Notifique os donos assim que o serviço terminar e mantenha o histórico completo de vacinas e preferências de cada pet.',
    features: ['Notificações em Tempo Real', 'Histórico do Pet', 'Agenda de Banhos'],
    icon: <Dog size={56} />
  },
  {
    id: 'advocacia',
    title: 'Clínica de Advocacia',
    description: 'Atendimento jurídico preliminar automatizado. Faça a triagem inicial dos casos via bot de forma inteligente, agende reuniões sigilosas e solicite documentos de forma segura e organizada.',
    features: ['Triagem Inteligente', 'Upload Seguro de Docs', 'Gestão de Prazos Internos'],
    icon: <Scale size={56} />
  },
  {
    id: 'psicologia',
    title: 'Clínica de Psicologia',
    description: 'Acolhimento desde o primeiro contato. Automação discreta para agendamentos de sessões, lembretes amigáveis e ambiente focado na privacidade e bem-estar do seu paciente.',
    features: ['Agendamento Discreto', 'Cobrança Automática', 'Foco no Paciente'],
    icon: <Brain size={56} />
  }
];

export default function ServicesGrid() {
  return (
    <div className={styles.container}>
      <div className={`${styles.header} fade-in`}>
        <h1 className={`${styles.title} gradient-text`}>Explore as Soluções</h1>
        <p className={styles.subtitle}>
          Cada área de atuação exige um toque único. Nossa inteligência artificial se adapta ao seu modelo de negócio, entregando uma automação que parece humana, porém é incansável.
        </p>
      </div>

      <div className={styles.list}>
        {servicesDetail.map((service, index) => (
          <div className={`${styles.serviceRow} fade-in`} style={{ animationDelay: `${index * 0.15}s` }} key={service.id}>
            <div className={styles.iconContainer}>
              {service.icon}
            </div>
            <div className={styles.content}>
              <h2 className={styles.serviceTitle}>{service.title}</h2>
              <p className={styles.serviceDesc}>{service.description}</p>
              <div className={styles.features}>
                {service.features.map(f => (
                  <span key={f} className={styles.featureTag}>{f}</span>
                ))}
              </div>
              <Link href={`/servicos/${service.id}`} className={styles.ctaButton}>
                Configurar Solução <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
