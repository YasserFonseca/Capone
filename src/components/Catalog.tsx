import Link from 'next/link';
import { Stethoscope, Scissors, Dog, Scale, Brain } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import styles from './Catalog.module.css';
import { ReactNode } from 'react';

// Icon + route mapping by backend segment slug
const SEGMENT_META: Record<string, { icon: ReactNode; routeId: string }> = {
  dentista:   { icon: <Stethoscope size={28} />, routeId: 'odontologia' },
  barbearia:  { icon: <Scissors size={28} />,    routeId: 'barbearia' },
  petshop:    { icon: <Dog size={28} />,          routeId: 'petshop' },
  advocacia:  { icon: <Scale size={28} />,        routeId: 'advocacia' },
  psicologia: { icon: <Brain size={28} />,        routeId: 'psicologia' },
};

const FALLBACK = [
  { slug: 'dentista',   name: 'Clínica de Odontologia', description: 'Gestão inteligente de consultas, confirmações via WhatsApp e redução de faltas para o seu consultório.' },
  { slug: 'barbearia',  name: 'Barbearia',               description: 'Agendamentos automáticos, controle de profissionais e pagamentos rápidos diretamente pelo celular.' },
  { slug: 'petshop',    name: 'Pet Shop',                 description: 'Controle de banho e tosa, histórico de pets e avisos automáticos para os donos buscarem seus animais.' },
  { slug: 'advocacia',  name: 'Clínica de Advocacia',    description: 'Triagem inicial de clientes, agendamento de consultas jurídicas e envio seguro de documentos básicos.' },
  { slug: 'psicologia', name: 'Clínica de Psicólogo',    description: 'Agenda sigilosa, lembretes amigáveis e cobranças discretas integradas ao ambiente de terapia.' },
];

export default async function Catalog() {
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
      // Merge DB names with hardcoded descriptions
      segments = data.map(s => ({
        ...s,
        description: FALLBACK.find(f => f.slug === s.slug)?.description ?? '',
      }));
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
        {segments.map((segment, index) => {
          const meta = SEGMENT_META[segment.slug];
          if (!meta) return null;
          return (
            <div className={`${styles.card} fade-in`} style={{ animationDelay: `${index * 0.1}s` }} key={segment.slug}>
              <div className={styles.iconWrapper}>{meta.icon}</div>
              <h3 className={styles.cardTitle}>{segment.name}</h3>
              <p className={styles.cardDesc}>{segment.description}</p>
              <Link href={`/servicos/${meta.routeId}`} className={styles.cardLink}>
                Saber mais <span>→</span>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
