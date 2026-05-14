import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '7rem',
          fontWeight: '900',
          background: 'linear-gradient(90deg, #9d4edd, #c77dff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '1rem',
        }}>
          404
        </p>
        <h1 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.75rem' }}>
          Página não encontrada
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          O endereço que você acessou não existe ou foi movido. Verifique o link ou volte para o início.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" style={{
            background: 'linear-gradient(90deg, #9d4edd, #c77dff)',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '1rem',
          }}>
            Voltar ao Início
          </Link>
          <Link href="/servicos" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '1rem',
          }}>
            Ver Serviços
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
