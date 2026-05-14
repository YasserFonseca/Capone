import Header from '@/components/Header';
import ServicesGrid from './ServicesGrid';
import Footer from '@/components/Footer';

export default function ServicosPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <ServicesGrid />
      </main>
      <Footer />
    </>
  );
}
