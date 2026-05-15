import Link from 'next/link';
import { Stethoscope, Scissors, Dog, Scale, Brain, Sparkles, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import styles from './Catalog.module.css';
import { ReactNode } from 'react';

const ICON_MAP: Record<string, ReactNode> = {
  dentista:   <Stethoscope size={28} />,
  barbearia:  <Scissors    size={28} />,
  petshop:    <Dog         size={28} />,
  advocacia:  <Scale       size={28} />,
  psicologia: <Brain       size={28} />,
  salao:      <Sparkles    size={28} />,
}

const FALLBACK = [
  { slug: 'dentista',   name: 'Clínica de Odontologia', description: 'Gestão inteligente de consultas, confirmações via WhatsApp e redução de faltas para o seu consultório.', route_id: 'odontologia' },
  { slug: 'barbearia',  name: 'Barbearia',               description: 'Agendamentos automáticos, controle de profissionais e pagamentos rápidos diretamente pelo celular.',       route_id: 'barbearia'   },
  { slug: 'petshop',    name: 'Pet Shop',                 description: 'Controle de banho e tosa, histórico de pets e avisos automáticos para os donos buscarem seus animais.',    route_id: 'petshop'     },
  { slug: 'advocacia',  name: 'Clínica de Advocacia',    description: 'Triagem inicial de clientes, agendamento de consultas jurídicas e envio seguro de documentos básicos.',    route_id: 'advocacia'   },
  { slug: 'psicologia', name: 'Clínica de Psicólogo',    description: 'Agenda sigilosa, lembretes amigáveis e cobranças discretas integradas ao ambiente de terapia.',           route_id: 'psicologia'  },
]

export default async function Catalog() {
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
    <section className={styles.catalog} id="servicos">
      <div className={styles.header}>
        <h2 className={`${styles.title} gradient-text`}>Nossas Soluções</h2>
        <p className={styles.subtitle}>
          Produtos de software moldados perfeitamente para as necessidades específicas do seu negócio.
        </p>
      </div>

      <div className={styles.grid}>
        {segments.map((segment, index) => (
          <div
            className={`${styles.card} fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
            key={segment.slug}
          >
            <div className={styles.iconWrapper}>
              {ICON_MAP[segment.slug] ?? <Zap size={28} />}
            </div>
            <h3 className={styles.cardTitle}>{segment.name}</h3>
            <p className={styles.cardDesc}>{segment.description}</p>
            <Link href={`/servicos/${segment.route_id}`} className={styles.cardLink}>
              Saber mais <span>→</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
