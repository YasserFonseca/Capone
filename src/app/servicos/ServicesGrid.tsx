import Link from 'next/link';
import { Stethoscope, Scissors, Dog, Scale, Brain, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import styles from './ServicesGrid.module.css';
import { ReactNode } from 'react';

const SEGMENT_META: Record<string, { icon: ReactNode; routeId: string; features: string[] }> = {
  dentista:   { icon: <Stethoscope size={56} />, routeId: 'odontologia', features: ['Agendamento 24/7', 'Lembretes WhatsApp', 'Prontuário Digital Integrado'] },
  barbearia:  { icon: <Scissors size={56} />,    routeId: 'barbearia',   features: ['Controle por Profissional', 'Pagamento Descomplicado', 'Avisos de Retorno'] },
  petshop:    { icon: <Dog size={56} />,          routeId: 'petshop',     features: ['Notificações em Tempo Real', 'Histórico do Pet', 'Agenda de Banhos'] },
  advocacia:  { icon: <Scale size={56} />,        routeId: 'advocacia',   features: ['Triagem Inteligente', 'Upload Seguro de Docs', 'Gestão de Prazos Internos'] },
  psicologia: { icon: <Brain size={56} />,        routeId: 'psicologia',  features: ['Agendamento Discreto', 'Cobrança Automática', 'Foco no Paciente'] },
};

const FALLBACK = [
  { slug: 'dentista',   name: 'Clínica de Odontologia', description: 'Transforme o atendimento do seu consultório. Nossa automação gerencia agendamentos, envia lembretes via WhatsApp para reduzir faltas e integra tudo diretamente em um CRM focado em saúde dental.' },
  { slug: 'barbearia',  name: 'Barbearia',               description: 'Deixe o foco na tesoura e deixe a agenda com a gente. Receba marcações automáticas, controle os horários de cada profissional e permita pagamentos rápidos sem atrito para o cliente.' },
  { slug: 'petshop',    name: 'Pet Shop',                 description: 'Acompanhe banho, tosa e consultas veterinárias em um só lugar. Notifique os donos assim que o serviço terminar e mantenha o histórico completo de vacinas e preferências de cada pet.' },
  { slug: 'advocacia',  name: 'Clínica de Advocacia',    description: 'Atendimento jurídico preliminar automatizado. Faça a triagem inicial dos casos via bot de forma inteligente, agende reuniões sigilosas e solicite documentos de forma segura e organizada.' },
  { slug: 'psicologia', name: 'Clínica de Psicologia',   description: 'Acolhimento desde o primeiro contato. Automação discreta para agendamentos de sessões, lembretes amigáveis e ambiente focado na privacidade e bem-estar do seu paciente.' },
];

export default async function ServicesGrid() {
  let segments = FALLBACK;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase
      .from('segments')
      .select('slug, name')
      .eq('active', true);

    if (data && data.length > 0) {
      segments = data.map(s => ({
        ...s,
        description: FALLBACK.find(f => f.slug === s.slug)?.description ?? '',
      }));
    }
  } catch {}

  return (
    <div className={styles.container}>
      <div className={`${styles.header} fade-in`}>
        <h1 className={`${styles.title} gradient-text`}>Explore as Soluções</h1>
        <p className={styles.subtitle}>
          Cada área de atuação exige um toque único. Nossa inteligência artificial se adapta ao seu modelo de negócio, entregando uma automação que parece humana, porém é incansável.
        </p>
      </div>

      <div className={styles.list}>
        {segments.map((segment, index) => {
          const meta = SEGMENT_META[segment.slug];
          if (!meta) return null;
          return (
            <div className={`${styles.serviceRow} fade-in`} style={{ animationDelay: `${index * 0.15}s` }} key={segment.slug}>
              <div className={styles.iconContainer}>{meta.icon}</div>
              <div className={styles.content}>
                <h2 className={styles.serviceTitle}>{segment.name}</h2>
                <p className={styles.serviceDesc}>{segment.description}</p>
                <div className={styles.features}>
                  {meta.features.map(f => (
                    <span key={f} className={styles.featureTag}>{f}</span>
                  ))}
                </div>
                <Link href={`/servicos/${meta.routeId}`} className={styles.ctaButton}>
                  Configurar Solução <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
