'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './Form.module.css';
import { ArrowRight, CheckCircle, Clock, Smartphone, Settings, Loader2, Plus, X } from 'lucide-react';
import { ReactNode } from 'react';
import { createCheckout } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ── Types ────────────────────────────────────────────────────
type HoursDay    = { open: boolean; from: string; to: string };
type ServiceItem = { name: string; price: string; duration: string };
interface Feature { title: string; desc: string; icon: ReactNode }

// ── Static config ─────────────────────────────────────────────
const slugMap: Record<string, string> = {
  odontologia: 'dentista',
  barbearia:   'barbearia',
  petshop:     'petshop',
  advocacia:   'advocacia',
  psicologia:  'psicologia',
};

const professionalLabel: Record<string, string> = {
  dentista:   'Dentistas / Especialistas',
  barbearia:  'Barbeiros',
  psicologia: 'Psicólogos(as)',
  petshop:    'Tosadores / Veterinários',
  advocacia:  'Advogados(as)',
};

const DAYS = [
  { key: 'seg', label: 'Segunda-feira' },
  { key: 'ter', label: 'Terça-feira' },
  { key: 'qua', label: 'Quarta-feira' },
  { key: 'qui', label: 'Quinta-feira' },
  { key: 'sex', label: 'Sexta-feira' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const DURATIONS = ['15', '20', '30', '40', '45', '60', '90', '120'];

const subtitleMap: Record<string, string> = {
  dentista:   'Acabe com as faltas não avisadas e automatize a confirmação das consultas via WhatsApp.',
  barbearia:  'Não perca mais tempo no WhatsApp tentando marcar horários. A IA faz isso por você.',
  petshop:    'Tranquilidade para os donos e organização impecável para o seu banho e tosa.',
  advocacia:  'Triagem inteligente e recepção jurídica automatizada com máxima discrição.',
  psicologia: 'Acolhimento automatizado e organização financeira para seus pacientes.',
};

const featuresFallback: Record<string, Feature[]> = {
  dentista:   [
    { title: 'Agendamento 24/7',        desc: 'Pacientes agendam a qualquer momento, sem intervenção humana.',       icon: <Clock /> },
    { title: 'Lembretes Inteligentes',   desc: 'WhatsApp automático 24h antes pedindo confirmação de consulta.',      icon: <Smartphone /> },
    { title: 'Gestão Descomplicada',     desc: 'Agenda do dia organizada automaticamente no painel.',                 icon: <Settings /> },
  ],
  barbearia:  [
    { title: 'Controle de Profissionais', desc: 'O cliente escolhe o barbeiro favorito e a IA verifica disponibilidade.', icon: <Clock /> },
    { title: 'Retorno Automático',        desc: 'Avisos automáticos após 20 dias sugerindo um novo corte.',             icon: <Smartphone /> },
    { title: 'Pagamento Facilitado',      desc: 'Integração para pagamento antecipado ou link de PIX.',                 icon: <Settings /> },
  ],
  petshop:    [
    { title: 'Avisos de Finalização', desc: 'Dono notificado assim que o pet estiver pronto.',              icon: <Smartphone /> },
    { title: 'Histórico Completo',    desc: 'A IA lembra da raça, tamanho e preferências do pet.',         icon: <Settings /> },
    { title: 'Recorrência de Vacinas', desc: 'Lembretes anuais para vacinação e check-ups veterinários.', icon: <Clock /> },
  ],
  advocacia:  [
    { title: 'Triagem de Casos',     desc: 'Bot coleta informações e documentos antes da reunião.',           icon: <Settings /> },
    { title: 'Agendamento Seguro',   desc: 'Geração de links para reuniões presenciais ou videoconferência.', icon: <Clock /> },
    { title: 'Lembretes de Prazos', desc: 'Avisa o cliente sobre atualizações do processo automaticamente.',  icon: <Smartphone /> },
  ],
  psicologia: [
    { title: 'Cobrança Discreta',          desc: 'Links de pagamento e lembretes financeiros de forma leve.', icon: <Settings /> },
    { title: 'Agenda Rotativa',            desc: 'Gestão inteligente de encaixes em caso de desistência.',   icon: <Clock /> },
    { title: 'Mensagens de Acolhimento', desc: 'Comunicação empática antes e depois das sessões.',           icon: <Smartphone /> },
  ],
};

// ── Helpers ───────────────────────────────────────────────────
const defaultHours = (): Record<string, HoursDay> => ({
  seg: { open: true,  from: '08:00', to: '18:00' },
  ter: { open: true,  from: '08:00', to: '18:00' },
  qua: { open: true,  from: '08:00', to: '18:00' },
  qui: { open: true,  from: '08:00', to: '18:00' },
  sex: { open: true,  from: '08:00', to: '18:00' },
  sab: { open: false, from: '08:00', to: '13:00' },
  dom: { open: false, from: '08:00', to: '12:00' },
});

function formatHours(h: Record<string, HoursDay>): string {
  const labels: Record<string, string> = {
    seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom',
  };
  return DAYS
    .filter(d => h[d.key]?.open)
    .map(d => `${labels[d.key]}: ${h[d.key].from} às ${h[d.key].to}`)
    .join(' | ') || 'A definir';
}

function formatServices(list: ServiceItem[]): string {
  return list
    .filter(s => s.name.trim() && s.price.trim())
    .map(s => `${s.name.trim()}: R$${parseFloat(s.price || '0').toFixed(2).replace('.', ',')} (${s.duration} min)`)
    .join('\n') || 'A definir';
}

// ── Component ─────────────────────────────────────────────────
export default function ServicoForm({ params }: { params: { id: string } }) {
  const router   = useRouter();
  const backSlug = slugMap[params.id] ?? params.id;
  const profLabel = professionalLabel[backSlug] ?? 'Profissionais';

  // DB-fetched segment name
  const [fetching, setFetching]             = useState(true);
  const [segmentName, setSegmentName] = useState('Serviço Personalizado');

  // Form sections state
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [telefone, setTelefone]       = useState('');
  const [endereco, setEndereco]       = useState('');
  const [hours, setHours]             = useState<Record<string, HoursDay>>(defaultHours());
  const [services, setServices]       = useState<ServiceItem[]>([{ name: '', price: '', duration: '30' }]);
  const [professionals, setProfessionals] = useState<string[]>(['']);

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from('segments').select('name').eq('slug', backSlug).single()
      .then(({ data }) => { if (data) setSegmentName(data.name); })
      .then(() => setFetching(false), () => setFetching(false));
  }, [backSlug]);

  // ── Hours handlers
  const toggleDay       = (k: string) => setHours(p => ({ ...p, [k]: { ...p[k], open: !p[k].open } }));
  const setHourField    = (k: string, f: 'from' | 'to', v: string) =>
    setHours(p => ({ ...p, [k]: { ...p[k], [f]: v } }));

  // ── Services handlers
  const addService    = () => setServices(p => [...p, { name: '', price: '', duration: '30' }]);
  const removeService = (i: number) => setServices(p => p.filter((_, idx) => idx !== i));
  const setService    = (i: number, f: keyof ServiceItem, v: string) =>
    setServices(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s));

  // ── Professionals handlers
  const addProf    = () => setProfessionals(p => [...p, '']);
  const removeProf = (i: number) => setProfessionals(p => p.filter((_, idx) => idx !== i));
  const setProf    = (i: number, v: string) =>
    setProfessionals(p => p.map((x, idx) => idx === i ? v : x));

  // ── Validation
  const basicOk    = Boolean(nomeEmpresa.trim() && telefone.trim() && endereco.trim());
  const hoursOk    = Object.values(hours).some(h => h.open);
  const servicesOk = services.some(s => s.name.trim() && s.price.trim());
  const isValid    = basicOk && hoursOk && servicesOk;

  // ── Build flat formData for backend
  const buildFormData = (): Record<string, string> => {
    const fd: Record<string, string> = {
      nome_empresa: nomeEmpresa.trim(),
      telefone:     telefone.trim(),
      endereco:     endereco.trim(),
      horario:      formatHours(hours),
      servicos:     formatServices(services),
    };
    const profs = professionals.filter(p => p.trim());
    if (profs.length) fd.profissionais = profs.join(', ');
    return fd;
  };

  // ── Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    setLoading(true); setError('');

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        sessionStorage.setItem('pendingCheckout', JSON.stringify({ serviceId: params.id, formData: buildFormData() }));
        router.push('/login');
        return;
      }
      const user = session.session.user;
      const { checkoutUrl, tenantId } = await createCheckout({
        segmentSlug: backSlug,
        companyName: nomeEmpresa,
        ownerEmail:  user.email!,
        ownerName:   user.user_metadata?.full_name ?? user.email!,
        formData:    buildFormData(),
      });
      sessionStorage.setItem('pendingTenantId', tenantId);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <><Header />
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={40} style={{ color: '#9d4edd', animation: 'spin 1s linear infinite' }} />
    </main>
    <Footer />
    <style jsx global>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );

  const features = featuresFallback[backSlug] ?? [];

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>

        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={`${styles.heroTitle} gradient-text fade-in`}>{segmentName}</h1>
          <p className={`${styles.heroSubtitle} fade-in`} style={{ animationDelay: '0.1s' }}>{subtitleMap[backSlug] ?? 'Automação sob medida para o seu negócio.'}</p>
        </section>

        <section className={styles.mainContent}>

          {/* Left — benefits */}
          <div className={`${styles.infoSection} fade-in`} style={{ animationDelay: '0.2s' }}>
            <h2>Como a IA vai transformar seu negócio</h2>
            <div className={styles.featureList}>
              {features.map((f, i) => (
                <div key={i} className={styles.featureItem}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <div className={styles.featureText}><h3>{f.title}</h3><p>{f.desc}</p></div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(45,106,79,0.1)', border: '1px solid var(--success)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--success)', fontWeight: 'bold' }}>
                <CheckCircle size={20} /> Setup Incluso
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                A configuração é feita automaticamente após o pagamento. Basta escanear o QR Code e seu bot entra em operação.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className={`${styles.formSection} fade-in`} style={{ animationDelay: '0.3s' }}>
            <h3>Configure sua Automação</h3>
            <p className={styles.formIntro}>Essas informações treinam o bot para atender exatamente como o seu negócio funciona.</p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit}>

              {/* ── Seção 1: Dados Básicos ── */}
              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>1. Dados Básicos</p>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="nome_empresa">Nome da Empresa</label>
                  <input
                    id="nome_empresa" type="text" className={styles.input}
                    placeholder="Ex: Barbearia do João"
                    value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="telefone">WhatsApp Comercial</label>
                  <input
                    id="telefone" type="text" className={styles.input}
                    placeholder="Ex: (51) 99999-9999"
                    value={telefone} onChange={e => setTelefone(e.target.value)} required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="endereco">Endereço Completo</label>
                  <input
                    id="endereco" type="text" className={styles.input}
                    placeholder="Ex: Rua das Flores, 123 – Centro, Porto Alegre"
                    value={endereco} onChange={e => setEndereco(e.target.value)} required
                  />
                </div>
              </div>

              {/* ── Seção 2: Horário de Funcionamento ── */}
              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>2. Horário de Funcionamento</p>
                <div className={styles.hoursGrid}>
                  {DAYS.map(({ key, label }) => {
                    const day = hours[key];
                    return (
                      <div key={key} className={styles.hoursRow}>
                        <button type="button" className={styles.dayToggle} onClick={() => toggleDay(key)}>
                          <span className={`${styles.toggleTrack} ${day.open ? styles.on : ''}`}>
                            <span className={styles.toggleThumb} />
                          </span>
                          <span className={`${styles.dayLabel} ${day.open ? styles.open : ''}`}>{label}</span>
                        </button>
                        <input
                          type="time" className={styles.timeInput}
                          value={day.from} disabled={!day.open}
                          onChange={e => setHourField(key, 'from', e.target.value)}
                        />
                        <span className={styles.timeSep}>às</span>
                        <input
                          type="time" className={styles.timeInput}
                          value={day.to} disabled={!day.open}
                          onChange={e => setHourField(key, 'to', e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
                {submitted && !hoursOk && (
                  <span className={styles.errorText} style={{ marginTop: '0.75rem' }}>Marque ao menos um dia de funcionamento.</span>
                )}
              </div>

              {/* ── Seção 3: Serviços e Preços ── */}
              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>3. Serviços e Preços</p>
                <div className={styles.servicesHeader}>
                  <span>Serviço</span>
                  <span>Preço (R$)</span>
                  <span>Duração</span>
                  <span />
                </div>
                {services.map((svc, i) => (
                  <div key={i} className={styles.serviceRow}>
                    <input
                      type="text" className={styles.smallInput}
                      placeholder="Ex: Corte"
                      value={svc.name} onChange={e => setService(i, 'name', e.target.value)}
                    />
                    <input
                      type="number" className={styles.smallInput}
                      placeholder="35,00" min="0" step="0.01"
                      value={svc.price} onChange={e => setService(i, 'price', e.target.value)}
                    />
                    <select
                      className={styles.durationSelect}
                      value={svc.duration} onChange={e => setService(i, 'duration', e.target.value)}
                    >
                      {DURATIONS.map(d => (
                        <option key={d} value={d}>{d} min</option>
                      ))}
                    </select>
                    <button
                      type="button" className={styles.removeBtn}
                      onClick={() => removeService(i)} disabled={services.length === 1}
                      aria-label="Remover serviço"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addRowBtn} onClick={addService}>
                  <Plus size={14} /> Adicionar Serviço
                </button>
                {submitted && !servicesOk && (
                  <span className={styles.errorText} style={{ display: 'block', marginTop: '0.5rem' }}>
                    Adicione ao menos um serviço com nome e preço.
                  </span>
                )}
              </div>

              {/* ── Seção 4: Profissionais ── */}
              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>4. {profLabel} <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '1rem' }}>
                  O bot vai informar os profissionais disponíveis e permitir que o cliente escolha.
                </p>
                {professionals.map((name, i) => (
                  <div key={i} className={styles.profRow}>
                    <input
                      type="text" className={styles.smallInput}
                      placeholder="Ex: João Silva"
                      value={name} onChange={e => setProf(i, e.target.value)}
                    />
                    <button
                      type="button" className={styles.removeBtn}
                      onClick={() => removeProf(i)} disabled={professionals.length === 1}
                      aria-label="Remover profissional"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addRowBtn} onClick={addProf}>
                  <Plus size={14} /> Adicionar Profissional
                </button>
              </div>

              {/* ── Submit ── */}
              <button type="submit" className={styles.submitBtn} disabled={!isValid || loading}>
                {loading
                  ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  : <><span>Ir para Pagamento</span><ArrowRight size={18} /></>
                }
              </button>

              {submitted && !isValid && !loading && (
                <span className={styles.errorText} style={{ textAlign: 'center', display: 'block', marginTop: '0.5rem' }}>
                  Preencha os dados básicos, horários e ao menos um serviço.
                </span>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <style jsx global>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
