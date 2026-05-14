'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { User, Mail, CreditCard, Loader2, Construction } from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [doc, setDoc]         = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const meta = session.user.user_metadata;
      setName(meta?.full_name ?? '');
      setEmail(session.user.email ?? '');
      const raw = meta?.cpf_cnpj ?? '';
      setDoc(raw.length === 11
        ? raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        : raw.length === 14
          ? raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
          : raw);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return (
    <><Header />
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={40} style={{ color: '#9d4edd', animation: 'spin 1s linear infinite' }} />
    </main>
    <Footer />
    <style jsx global>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );

  return (
    <>
      <Header />
      <main style={{ paddingTop: '100px', minHeight: '80vh', maxWidth: '600px', margin: '0 auto', padding: '100px 1.5rem 3rem' }}>

        <div className="fade-in" style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', marginBottom: '0.25rem' }}>Meu Perfil</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Suas informações de cadastro</p>
        </div>

        {/* Dados atuais */}
        <div className="fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Dados Pessoais</h2>

          {[
            { icon: <User size={18} />,       label: 'Nome Completo', value: name  || '—' },
            { icon: <Mail size={18} />,       label: 'E-mail',        value: email || '—' },
            { icon: <CreditCard size={18} />, label: 'CPF / CNPJ',   value: doc   || '—' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.15rem' }}>{label}</p>
                <p style={{ color: '#fff', fontWeight: 500 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Em construção */}
        <div className="fade-in" style={{ background: 'rgba(157,78,221,0.06)', border: '1px dashed var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Construction size={24} style={{ color: '#ffd166', flexShrink: 0 }} />
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>Edição de perfil em breve</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Em breve você poderá alterar nome, senha e dados de faturamento diretamente por aqui.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <style jsx global>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
