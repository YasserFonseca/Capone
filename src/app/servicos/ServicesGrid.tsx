import Link from 'next/link';
import { Stethoscope, Scissors, Dog, Scale, Brain, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import styles from './ServicesGrid.module.css';
import { ReactNode } from 'react';

// Icons are React components — must stay in code, can't come from DB.
// Unknown slugs get a generic Zap icon so new segments never break the page.
const ICON_MAP: Record<string, ReactNode> = {
  dentista:   <Stethoscope size={56} />,
  barbearia:  <Scissors    size={56} />,
  petshop:    <Dog         size={56} />,
  advocacia:  <Scale       size={56} />,
  psicologia: <Brain       size={56} />,
  salao:      <Sparkles    size={56} />,
}

const FEATURES_MAP: Record<string, string[]> = {
  dentista:   ['Agendamento 24/7', 'Lembretes WhatsApp', 'Prontuário Digital Integrado'],
  barbearia:  ['Controle por Profissional', 'Pagamento Descomplicado', 'Avisos de Retorno'],
  petshop:    ['Notificações em Tempo Real', 'Histórico do Pet', 'Agenda de Banhos'],
  advocacia:  ['Triagem Inteligente', 'Upload Seguro de Docs', 'Gestão de Prazos Internos'],
  psicologia: ['Agendamento Discreto', 'Cobrança Automática', 'Foco no Paciente'],
  salao:      ['Agenda Online 24/7', 'Gestão de Profissionais', 'Lembretes Automáticos'],
}

const FALLBACK = [
  { slug: 'dentista',   name: 'Clínica de Odontologia', description: 'Transforme o atendimento do seu consultório com agendamentos automáticos e lembretes via WhatsApp.', route_id: 'odontologia' },
  { slug: 'barbearia',  name: 'Barbearia',               description: 'Deixe o foco na tesoura e a agenda com a IA. Marcações automáticas e pagamentos sem atrito.',           route_id: 'barbearia'   },
  { slug: 'petshop',    name: 'Pet Shop',                 description: 'Acompanhe banho, tosa e consultas veterinárias. Notifique os donos e mantenha histórico completo.',      route_id: 'petshop'     },
  { slug: 'advocacia',  name: 'Clínica de Advocacia',    description: 'Triagem inicial automatizada, agendamentos sigilosos e solicitação de documentos de forma segura.',      route_id: 'advocacia'   },
  { slug: 'psicologia', name: 'Clínica de Psicologia',   description: 'Acolhimento desde o primeiro contato com agendamentos discretos e lembretes amigáveis.',                route_id: 'psicologia'  },
]

export default async function ServicesGrid() {
  let segments = FALLBACK

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase
      .from('segments')
      .select('slug, name, description, route_id')
      .eq('active', true)

    if (data && data.length > 0) {
      segments = data.map(s => ({
        slug:        s.slug,
        name:        s.name,
        description: s.description ?? FALLBACK.find(f => f.slug === s.slug)?.description ?? '',
        route_id:    s.route_id   ?? s.slug,
      }))
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
          const icon     = ICON_MAP[segment.slug] ?? <Zap size={56} />
          const features = FEATURES_MAP[segment.slug] ?? []
          return (
            <div
              className={`${styles.serviceRow} fade-in`}
              style={{ animationDelay: `${index * 0.15}s` }}
              key={segment.slug}
            >
              <div className={styles.iconContainer}>{icon}</div>
              <div className={styles.content}>
                <h2 className={styles.serviceTitle}>{segment.name}</h2>
                <p className={styles.serviceDesc}>{segment.description}</p>
                {features.length > 0 && (
                  <div className={styles.features}>
                    {features.map(f => (
                      <span key={f} className={styles.featureTag}>{f}</span>
                    ))}
                  </div>
                )}
                <Link href={`/servicos/${segment.route_id}`} className={styles.ctaButton}>
                  Configurar Solução <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
