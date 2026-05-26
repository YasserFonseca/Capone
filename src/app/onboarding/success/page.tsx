'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Loader2, Wifi, RefreshCw } from 'lucide-react';
import { getTenantStatus, refreshQrCode, getMpOAuthUrl } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

type Step = 'confirming' | 'qrcode' | 'connected';

const QR_TTL_MS = 58_000; // refresh just before the 60s Evolution API expiry

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const [step, setStep]             = useState<Step>('confirming');
  const [tenantId, setTenantId]     = useState<string | null>(null);
  const [qrCode, setQrCode]         = useState<string | null>(null);
  const [mpConnected, setMpConnected] = useState(false);
  const [loadingQr, setLoadingQr]   = useState(false);
  const [inboxOpen, setInboxOpen]   = useState(false);
  const [emailHtml, setEmailHtml]   = useState<string | null>(null);

  // Busca o e-mail transacional mockado enviado
  useEffect(() => {
    if (!tenantId) return;
    const fetchEmail = async () => {
      try {
        const res = await fetch(`/mock-emails/${tenantId}.html`);
        if (res.ok) {
          const html = await res.text();
          setEmailHtml(html);
        }
      } catch (err) {
        console.error('Erro ao ler e-mail de confirmação:', err);
      }
    };
    fetchEmail();
    const interval = setInterval(fetchEmail, 3000);
    return () => clearInterval(interval);
  }, [tenantId]);

  // Item 1: try sessionStorage first, fall back to Supabase auth session
  useEffect(() => {
    const init = async () => {
      const cached = sessionStorage.getItem('pendingTenantId');
      if (cached) { setTenantId(cached); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('owner_email', session.user.email)
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (tenant) {
        setTenantId(tenant.id);
      } else {
        router.push('/');
      }
    };
    init();
  }, [router]);

  // Polling de status a cada 3 segundos
  useEffect(() => {
    if (!tenantId) return;

    const poll = async () => {
      try {
        const status = await getTenantStatus(tenantId);
        setMpConnected(status.mpConnected);

        if (status.tenant === 'active' && status.whatsapp === 'connecting') {
          setStep('qrcode');
          if (status.qrCode) setQrCode(status.qrCode);
        }

        if (status.whatsapp === 'connected') {
          setStep('connected');
          sessionStorage.removeItem('pendingTenantId');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('polling error:', err);
      }
    };

    const interval = setInterval(poll, 3000);
    poll();
    return () => clearInterval(interval);
  }, [tenantId]);

  // Item 9: auto-refresh QR code before it expires (58s)
  useEffect(() => {
    if (step !== 'qrcode' || !tenantId) return;

    const interval = setInterval(async () => {
      try {
        const { qrCode: fresh } = await refreshQrCode(tenantId);
        setQrCode(fresh);
      } catch {}
    }, QR_TTL_MS);

    return () => clearInterval(interval);
  }, [step, tenantId]);

  const handleRefreshQr = async () => {
    if (!tenantId) return;
    setLoadingQr(true);
    try {
      const { qrCode: newQr } = await refreshQrCode(tenantId);
      setQrCode(newQr);
    } catch (err) {
      console.error('refresh qr error:', err);
    } finally {
      setLoadingQr(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '100px 1rem 2rem' }}>
        <div className="fade-in" style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>

          {/* STEP 1 — Aguardando confirmação do pagamento */}
          {step === 'confirming' && (
            <>
              <Loader2 size={56} style={{ color: '#9d4edd', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }} />
              <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Confirmando pagamento...</h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Aguarde enquanto processamos seu pagamento e configuramos sua automação. Isso pode levar alguns instantes.
              </p>
            </>
          )}

          {/* STEP 2 — QR Code */}
          {step === 'qrcode' && (
            <>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <Wifi size={40} style={{ color: '#9d4edd', margin: '0 auto 1rem' }} />
                <h1 style={{ color: '#fff', marginBottom: '0.75rem' }}>Conecte seu WhatsApp</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Abra o WhatsApp do número de atendimento da sua empresa → <strong style={{ color: '#fff' }}>Aparelhos conectados → Conectar aparelho</strong> → Escaneie o QR Code abaixo.
                </p>

                {qrCode ? (
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
                    <Image src={`data:image/png;base64,${qrCode}`} alt="QR Code WhatsApp" width={220} height={220} />
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface-hover)', borderRadius: '12px', width: '220px', height: '220px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={32} style={{ color: '#9d4edd', animation: 'spin 1s linear infinite' }} />
                  </div>
                )}

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  O código é renovado automaticamente a cada 58 segundos.
                </p>

                <button onClick={handleRefreshQr} disabled={loadingQr}
                  style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  {loadingQr ? <Loader2 size={16} /> : <RefreshCw size={16} />}
                  Gerar novo QR Code
                </button>
              </div>

              {!mpConnected && tenantId && (
                <div style={{ marginTop: '1.5rem', background: 'rgba(157,78,221,0.08)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <strong style={{ color: '#fff' }}>Opcional:</strong> Conecte seu Mercado Pago para que o bot gere cobranças automaticamente.
                  </p>
                  <a href={getMpOAuthUrl(tenantId)}
                    style={{ background: 'linear-gradient(90deg,#009ee3,#00bcff)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '8px', display: 'inline-block', fontWeight: '600', fontSize: '0.9rem' }}>
                    Conectar Mercado Pago
                  </a>
                </div>
              )}
            </>
          )}

          {/* STEP 3 — Conectado */}
          {step === 'connected' && (
            <>
              <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 1.5rem' }} />
              <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Tudo pronto!</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Seu bot de atendimento está online e funcionando. Pode enviar uma mensagem de teste para o número conectado.
              </p>

              {!mpConnected && tenantId && (
                <div style={{ background: 'rgba(157,78,221,0.08)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Conecte o Mercado Pago para habilitar cobranças automáticas pelo bot.
                  </p>
                  <a href={getMpOAuthUrl(tenantId)}
                    style={{ background: 'linear-gradient(90deg,#009ee3,#00bcff)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '8px', display: 'inline-block', fontWeight: '600', fontSize: '0.9rem' }}>
                    Conectar Mercado Pago
                  </a>
                </div>
              )}

              <button onClick={() => router.push('/dashboard')}
                style={{ background: 'linear-gradient(90deg,#9d4edd,#c77dff)', color: '#fff', padding: '0.85rem 2.5rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                Acessar Dashboard →
              </button>
            </>
          )}

          {/* Caixa de Entrada Virtual Sandbox */}
          {emailHtml && (
            <div style={{ marginTop: '2.5rem', textAlign: 'left', background: 'rgba(26,18,36,0.3)', border: '1px solid rgba(157,78,221,0.15)', borderRadius: '16px', overflow: 'hidden' }}>
              <button 
                onClick={() => setInboxOpen(!inboxOpen)}
                style={{ width: '100%', padding: '1.1rem 1.5rem', background: 'rgba(255,122,0,0.06)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', outline: 'none' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem', display: 'flex' }}>📬</span>
                  Caixa de Entrada Virtual (Recibo Recebido!)
                </span>
                <span style={{ color: '#FF7A00', fontSize: '0.85rem', fontWeight: '600' }}>{inboxOpen ? 'Recolher ▲' : 'Visualizar E-mail ▼'}</span>
              </button>

              {inboxOpen && (
                <div style={{ padding: '1.5rem', background: '#08080c' }} className="fade-in">
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem', marginTop: 0 }}>
                    Este é o e-mail de ativação transacional enviado para o seu endereço cadastrado com o recibo detalhado:
                  </p>
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', background: '#08080c', height: '480px', overflow: 'hidden' }}>
                    <iframe 
                      srcDoc={emailHtml} 
                      title="Recibo Capone" 
                      style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', background: '#08080c' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
