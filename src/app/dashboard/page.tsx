'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { getTenantStatus, getMpOAuthUrl, refreshQrCode } from '@/lib/api';
import {
  Wifi, WifiOff, CheckCircle, Calendar, CreditCard,
  Loader2, RefreshCw, LogOut, AlertCircle
} from 'lucide-react';
import Image from 'next/image';

interface DashStatus {
  tenant:      string
  whatsapp:    string
  qrCode:      string | null
  mpConnected: boolean
}

export default function DashboardPage() {
  const router = useRouter();
  const [tenantId, setTenantId]   = useState<string | null>(null);
  const [status, setStatus]       = useState<DashStatus | null>(null);
  const [userName, setUserName]   = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const u = session.user
      const isAdmin = u.user_metadata?.is_admin === true || u.app_metadata?.is_admin === true
      if (isAdmin) { router.replace('/admin'); return; }

      setUserName(u.user_metadata?.full_name ?? u.email ?? '');

      // Busca o tenant do usuário
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('owner_email', u.email)
        .eq('status', 'active')
        .single();

      if (!tenant) { setLoading(false); return; }

      setTenantId(tenant.id);

      const s = await getTenantStatus(tenant.id);
      setStatus(s);
      setLoading(false);
    };
    init();
  }, [router]);

  // Verifica se voltou do OAuth do MP
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mp_connected') === 'true' && tenantId) {
      getTenantStatus(tenantId).then(setStatus);
    }
  }, [tenantId]);

  // Item 9: auto-refresh QR while WhatsApp is connecting
  useEffect(() => {
    if (status?.whatsapp !== 'connecting' || !tenantId) return;
    const interval = setInterval(async () => {
      try {
        const { qrCode } = await refreshQrCode(tenantId);
        setStatus(prev => prev ? { ...prev, qrCode } : prev);
      } catch {}
    }, 58_000);
    return () => clearInterval(interval);
  }, [status?.whatsapp, tenantId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRefreshQr = async () => {
    if (!tenantId) return;
    setLoadingQr(true);
    try {
      const { qrCode } = await refreshQrCode(tenantId);
      setStatus(prev => prev ? { ...prev, qrCode } : prev);
    } finally {
      setLoadingQr(false);
    }
  };

  const whatsappColor  = status?.whatsapp === 'connected' ? 'var(--success)' : status?.whatsapp === 'connecting' ? '#ffd166' : '#ff4d4d';
  const whatsappLabel  = status?.whatsapp === 'connected' ? 'Conectado' : status?.whatsapp === 'connecting' ? 'Aguardando QR Code' : 'Desconectado';

  if (loading) {
    return (
      <><Header />
      <main style={{ paddingTop: '80px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} style={{ color: '#9d4edd', animation: 'spin 1s linear infinite' }} />
      </main>
      <Footer /></>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: '100px', minHeight: '80vh', maxWidth: '900px', margin: '0 auto', padding: '100px 1.5rem 3rem' }}>

        {/* Cabeçalho */}
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ color: '#fff', marginBottom: '0.25rem' }}>Olá, {userName.split(' ')[0]} 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Painel de controle da sua automação</p>
          </div>
          <button onClick={handleLogout}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <LogOut size={16} /> Sair
          </button>
        </div>

        {/* Sem tenant ativo */}
        {!tenantId && (
          <div className="fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
            <AlertCircle size={48} style={{ color: '#ffd166', margin: '0 auto 1rem' }} />
            <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Nenhuma automação ativa</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Você ainda não tem nenhuma automação configurada.</p>
            <button onClick={() => router.push('/servicos')}
              style={{ background: 'linear-gradient(90deg,#9d4edd,#c77dff)', color: '#fff', padding: '0.75rem 2rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              Ver Serviços
            </button>
          </div>
        )}

        {/* Cards de status */}
        {status && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

            {/* WhatsApp */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {status.whatsapp === 'connected' ? <Wifi size={22} style={{ color: 'var(--success)' }} /> : <WifiOff size={22} style={{ color: '#ff4d4d' }} />}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>WhatsApp</span>
              </div>
              <p style={{ color: whatsappColor, fontWeight: '700', fontSize: '1.05rem' }}>{whatsappLabel}</p>
            </div>

            {/* Mercado Pago */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <CreditCard size={22} style={{ color: status.mpConnected ? 'var(--success)' : '#ffd166' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mercado Pago</span>
              </div>
              {status.mpConnected
                ? <p style={{ color: 'var(--success)', fontWeight: '700' }}>Conectado ✓</p>
                : tenantId
                  ? <a href={getMpOAuthUrl(tenantId)} style={{ color: '#009ee3', fontWeight: '600', fontSize: '0.9rem' }}>Conectar agora →</a>
                  : null}
            </div>

            {/* Status geral */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <CheckCircle size={22} style={{ color: status.tenant === 'active' ? 'var(--success)' : '#ff4d4d' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Plano</span>
              </div>
              <p style={{ color: status.tenant === 'active' ? 'var(--success)' : '#ff4d4d', fontWeight: '700' }}>
                {status.tenant === 'active' ? 'Ativo' : status.tenant === 'suspended' ? 'Suspenso' : 'Pendente'}
              </p>
            </div>
          </div>
        )}

        {/* QR Code — só aparece se WhatsApp está conectando */}
        {status?.whatsapp === 'connecting' && (
          <div className="fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Conecte seu WhatsApp</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              WhatsApp → Aparelhos conectados → Conectar aparelho → Escaneie o código abaixo
            </p>
            {status.qrCode
              ? <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
                  <Image src={`data:image/png;base64,${status.qrCode}`} alt="QR Code" width={200} height={200} />
                </div>
              : <div style={{ width: '200px', height: '200px', background: 'var(--surface-hover)', borderRadius: '12px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={28} style={{ color: '#9d4edd', animation: 'spin 1s linear infinite' }} />
                </div>
            }
            <button onClick={handleRefreshQr} disabled={loadingQr}
              style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              {loadingQr ? <Loader2 size={14} /> : <RefreshCw size={14} />} Novo QR Code
            </button>
          </div>
        )}

        {/* Atalhos */}
        {status?.tenant === 'active' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button onClick={() => router.push('/servicos')}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', textAlign: 'left', color: '#fff' }}>
              <Calendar size={20} style={{ color: '#9d4edd', marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: '600' }}>Ver Agendamentos</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Em breve</p>
            </button>
          </div>
        )}
      </main>
      <Footer />
      <style jsx global>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
    </>
  );
}
