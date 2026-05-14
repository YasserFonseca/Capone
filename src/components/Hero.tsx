import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="inicio">
      <div className={styles.imageContainer}>
        <Image 
          src="/hero_image.png" 
          alt="Tecnologia Capone" 
          width={500} 
          height={500} 
          className={styles.techImage}
          priority
        />
      </div>
      <div className={styles.content}>
        <h1 className={`${styles.title} fade-in`}>
          A revolução das <br />
          <span className="gradient-text">Automações</span>
        </h1>
        <p className={`${styles.subtitle} fade-in`} style={{ animationDelay: '0.2s' }}>
          Atendimento automatizado com CRM integrado, pronto para transformar a sua operação. Sofisticado, rápido e focado em resultados.
        </p>
        <div className={`${styles.ctaGroup} fade-in`} style={{ animationDelay: '0.4s' }}>
          <Link href="/servicos" className={styles.primaryCta}>Ver Serviços</Link>
          <button className={styles.secondaryCta}>Fale Conosco</button>
        </div>
      </div>
    </section>
  );
}
