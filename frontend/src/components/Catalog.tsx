import Link from 'next/link';
import { Stethoscope, Scissors, Dog, Scale, Brain } from 'lucide-react';
import styles from './Catalog.module.css';

const services = [
  {
    id: 'odontologia',
    title: 'Clínica de Odontologia',
    description: 'Gestão inteligente de consultas, confirmações via WhatsApp e redução de faltas para o seu consultório.',
    icon: <Stethoscope size={28} />
  },
  {
    id: 'barbearia',
    title: 'Barbearia',
    description: 'Agendamentos automáticos, controle de profissionais e pagamentos rápidos diretamente pelo celular.',
    icon: <Scissors size={28} />
  },
  {
    id: 'petshop',
    title: 'Pet Shop',
    description: 'Controle de banho e tosa, histórico de pets e avisos automáticos para os donos buscarem seus animais.',
    icon: <Dog size={28} />
  },
  {
    id: 'advocacia',
    title: 'Clínica de Advocacia',
    description: 'Triagem inicial de clientes, agendamento de consultas jurídicas e envio seguro de documentos básicos.',
    icon: <Scale size={28} />
  },
  {
    id: 'psicologia',
    title: 'Clínica de Psicólogo',
    description: 'Agenda sigilosa, lembretes amigáveis e cobranças discretas integradas ao ambiente de terapia.',
    icon: <Brain size={28} />
  }
];

export default function Catalog() {
  return (
    <section className={styles.catalog} id="servicos">
      <div className={styles.header}>
        <h2 className={`${styles.title} gradient-text`}>Nossas Soluções</h2>
        <p className={styles.subtitle}>
          Produtos de software moldados perfeitamente para as necessidades específicas do seu negócio.
        </p>
      </div>

      <div className={styles.grid}>
        {services.map((service, index) => (
          <div className={`${styles.card} fade-in`} style={{ animationDelay: `${index * 0.1}s` }} key={service.id}>
            <div className={styles.iconWrapper}>
              {service.icon}
            </div>
            <h3 className={styles.cardTitle}>{service.title}</h3>
            <p className={styles.cardDesc}>{service.description}</p>
            <Link href={`/servicos/${service.id}`} className={styles.cardLink}>
              Saber mais <span>→</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
