import Link from 'next/link';
import Logo from './Logo';
import styles from './Footer.module.css';

function ComingSoon({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.linkDisabled} title="Em breve">
      {children}
    </span>
  );
}

const SEGMENT_LINKS = [
  { name: 'Clínica de Odontologia', route_id: 'odontologia' },
  { name: 'Barbearia',              route_id: 'barbearia'   },
  { name: 'Pet Shop',               route_id: 'petshop'     },
  { name: 'Advocacia',              route_id: 'advocacia'   },
  { name: 'Psicologia',             route_id: 'psicologia'  },
  { name: 'Salão de Beleza',        route_id: 'salao'       },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.brand}>
          <div className={styles.logo}>
            <Logo width={60} height={60} className={styles.logoIcon} /> CAPONE
          </div>
          <p className={styles.description}>
            Transformando o atendimento de negócios através de automações inteligentes e CRMs otimizados.
          </p>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Soluções</h4>
          <nav className={styles.linkList}>
            {SEGMENT_LINKS.map(seg => (
              <Link key={seg.route_id} href={`/servicos/${seg.route_id}`} className={styles.link}>
                {seg.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Empresa</h4>
          <nav className={styles.linkList}>
            <Link href="/sobre"   className={styles.link}>Sobre Nós</Link>
            <Link href="/contato" className={styles.link}>Contato</Link>
            <ComingSoon>Casos de Sucesso</ComingSoon>
            <ComingSoon>Carreiras</ComingSoon>
          </nav>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Suporte</h4>
          <nav className={styles.linkList}>
            <Link href="/contato" className={styles.link}>Central de Ajuda</Link>
            <ComingSoon>FAQ</ComingSoon>
            <ComingSoon>Política de Privacidade</ComingSoon>
            <ComingSoon>Termos de Serviço</ComingSoon>
          </nav>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Capone Automações. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
