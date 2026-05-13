import Link from 'next/link';
import { Diamond } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Diamond className={styles.logoIcon} size={24} color="var(--primary)" /> CAPONE
          </div>
          <p className={styles.description}>
            Transformando o atendimento de negócios através de automações inteligentes e CRMs otimizados.
          </p>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Soluções</h4>
          <nav className={styles.linkList}>
            <Link href="#odontologia" className={styles.link}>Clínica de Odontologia</Link>
            <Link href="#barbearia" className={styles.link}>Barbearia</Link>
            <Link href="#petshop" className={styles.link}>Pet Shop</Link>
            <Link href="#advocacia" className={styles.link}>Advocacia</Link>
            <Link href="#psicologia" className={styles.link}>Psicologia</Link>
          </nav>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Empresa</h4>
          <nav className={styles.linkList}>
            <Link href="#sobre" className={styles.link}>Sobre Nós</Link>
            <Link href="#cases" className={styles.link}>Casos de Sucesso</Link>
            <Link href="#carreiras" className={styles.link}>Carreiras</Link>
            <Link href="#contato" className={styles.link}>Contato</Link>
          </nav>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Suporte</h4>
          <nav className={styles.linkList}>
            <Link href="#faq" className={styles.link}>FAQ</Link>
            <Link href="#ajuda" className={styles.link}>Central de Ajuda</Link>
            <Link href="#api" className={styles.link}>Documentação da API</Link>
          </nav>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Capone Automações. Todos os direitos reservados.</p>
        <div className={styles.legalLinks}>
          <Link href="#privacidade">Política de Privacidade</Link>
          <Link href="#termos">Termos de Serviço</Link>
        </div>
      </div>
    </footer>
  );
}
