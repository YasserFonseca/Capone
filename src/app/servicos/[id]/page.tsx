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
import { notFound } from 'next/navigation';

// Types
type HoursDay    = { open: boolean; from: string; to: string };
type ServiceItem = { name: string; price: string; duration: string };
interface Feature { title: string; desc: string; icon: ReactNode }

// Fallback slug mapping for the 5 known segments (route_id → backend slug).
// When DB has route_id column populated, it's used directly from DB instead.
const SLUG_FALLBACK: Record<string, string> = {
  odontologia: 'dentista',
  barbearia:   'barbearia',
  petshop:     'petshop',
  advocacia:   'advocacia',
  psicologia:  'psicologia',
}

const professionalLabel: Record<string, string> = {
  dentista:   'Dentistas / Especialistas',
  barbearia:  'Barbeiros',
  psicologia: 'Psicólogos(as)',
  petshop:    'Tosadores / Veterinários',
  advocacia:  'Advogados(as)',
  salao:      'Profissionais / Cabeleireiros',
}

const DAYS = [
  { key: 'seg', label: 'Segunda-feira' },
  { key: 'ter', label: 'Terça-feira' },
  { key: 'qua', label: 'Quarta-feira' },
  { key: 'qui', label: 'Quinta-feira' },
  { key: 'sex', label: 'Sexta-feira' },
  { key: 'sab', label: 'Sabado' },
  { key: 'dom', label: 'Domingo' },
]

const DURATIONS = ['15', '20', '30', '40', '45', '60', '90', '120']

const subtitleMap: Record<string, string> = {
  dentista:   'Acabe com as faltas nao avisadas e automatize a confirmacao das consultas via WhatsApp.',
  barbearia:  'Nao perca mais tempo no WhatsApp tentando marcar horarios. A IA faz isso por voce.',
  petshop:    'Tranquilidade para os donos e organizacao impecavel para o seu banho e tosa.',
  advocacia:  'Triagem inteligente e recepcao juridica automatizada com maxima discricao.',
  psicologia: 'Acolhimento automatizado e organizacao financeira para seus pacientes.',
  salao:      'Agenda cheia sem esforco. A IA cuida dos horarios enquanto voce cuida dos clientes.',
}

const featuresFallback: Record<string, Feature[]> = {
  dentista:   [
    { title: 'Agendamento 24/7',       desc: 'Pacientes agendam a qualquer momento, sem intervencao humana.',      icon: <Clock /> },
    { title: 'Lembretes Inteligentes', desc: 'WhatsApp automatico 24h antes pedindo confirmacao de consulta.',     icon: <Smartphone /> },
    { title: 'Gestao Descomplicada',   desc: 'Agenda do dia organizada automaticamente no painel.',                icon: <Settings /> },
  ],
  barbearia:  [
    { title: 'Controle de Profissionais', desc: 'O cliente escolhe o barbeiro favorito e a IA verifica disponibilidade.', icon: <Clock /> },
    { title: 'Retorno Automatico',        desc: 'Avisos automaticos apos 20 dias sugerindo um novo corte.',              icon: <Smartphone /> },
    { title: 'Pagamento Facilitado',      desc: 'Integracao para pagamento antecipado ou link de PIX.',                  icon: <Settings /> },
  ],
  petshop:    [
    { title: 'Avisos de Finalizacao', desc: 'Dono notificado assim que o pet estiver pronto.',             icon: <Smartphone /> },
    { title: 'Historico Completo',    desc: 'A IA lembra da raca, tamanho e preferencias do pet.',        icon: <Settings /> },
    { title: 'Recorrencia de Vacinas', desc: 'Lembretes anuais para vacinacao e check-ups veterinarios.', icon: <Clock /> },
  ],
  advocacia:  [
    { title: 'Triagem de Casos',    desc: 'Bot coleta informacoes e documentos antes da reuniao.',           icon: <Settings /> },
    { title: 'Agendamento Seguro',  desc: 'Geracao de links para reunioes presenciais ou videoconferencia.', icon: <Clock /> },
    { title: 'Lembretes de Prazos', desc: 'Avisa o cliente sobre atualizacoes do processo automaticamente.', icon: <Smartphone /> },
  ],
  psicologia: [
    { title: 'Cobranca Discreta',   desc: 'Links de pagamento e lembretes financeiros de forma leve.', icon: <Settings /> },
    { title: 'Agenda Rotativa',     desc: 'Gestao inteligente de encaixes em caso de desistencia.',    icon: <Clock /> },
    { title: 'Mensagens de Acolhimento', desc: 'Comunicacao empatica antes e depois das sessoes.',    icon: <Smartphone /> },
  ],
}

const defaultHours = (): Record<string, HoursDay> => ({
  seg: { open: true,  from: '08:00', to: '18:00' },
  ter: { open: true,  from: '08:00', to: '18:00' },
  qua: { open: true,  from: '08:00', to: '18:00' },
  qui: { open: true,  from: '08:00', to: '18:00' },
  sex: { open: true,  from: '08:00', to: '18:00' },
  sab: { open: false, from: '08:00', to: '13:00' },
  dom: { open: false, from: '08:00', to: '12:00' },
})

function formatHours(h: Record<string, HoursDay>): string {
  const labels: Record<string, string> = {
    seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sab', dom: 'Dom',
  }
  return DAYS
    .filter(d => h[d.key]?.open)
    .map(d => `${labels[d.key]}: ${h[d.key].from} as ${h[d.key].to}`)
    .join(' | ') || 'A definir'
}

function formatServices(list: ServiceItem[]): string {
  return list
    .filter(s => s.name.trim() && s.price.trim())
    .map(s => `${s.name.trim()}: R$${parseFloat(s.price || '0').toFixed(2).replace('.', ',')} (${s.duration} min)`)
    .join('\n') || 'A definir'
}

export default function ServicoForm({ params }: { params: { id: string } }) {
  const router = useRouter()

  // backSlug resolved from DB (route_id -> slug), fallback to static map
  const [backSlug, setBackSlug]       = useState<string>(SLUG_FALLBACK[params.id] ?? params.id)
  const [segmentName, setSegmentName] = useState('Servico Personalizado')
  const [notFound404, setNotFound404] = useState(false)
  const [fetching, setFetching]       = useState(true)

  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [telefone, setTelefone]       = useState('')
  const [endereco, setEndereco]       = useState('')
  const [hours, setHours]             = useState<Record<string, HoursDay>>(defaultHours())
  const [services, setServices]       = useState<ServiceItem[]>([{ name: '', price: '', duration: '30' }])
  const [professionals, setProfessionals] = useState<string[]>([''])
  const [selectedPlan, setSelectedPlan]   = useState<string>('pro')

  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = sessionStorage.getItem('selectedPlan') ?? 'pro'
      setSelectedPlan(p)
    }
  }, [])

  useEffect(() => {
    // Fetch segment by route_id from DB, fall back to slug-based lookup
    const init = async () => {
      try {
        // Try route_id first (new schema), then slug (backward compat)
        const { data: byRouteId } = await supabase
          .from('segments')
          .select('slug, name')
          .eq('route_id', params.id)
          .eq('active', true)
          .single()

        if (byRouteId) {
          setBackSlug(byRouteId.slug)
          setSegmentName(byRouteId.name)
          setFetching(false)
          return
        }

        // Fallback: look up by backend slug derived from static map
        const resolvedSlug = SLUG_FALLBACK[params.id] ?? params.id
        const { data: bySlug } = await supabase
          .from('segments')
          .select('slug, name')
          .eq('slug', resolvedSlug)
          .eq('active', true)
          .single()

        if (bySlug) {
          setBackSlug(bySlug.slug)
          setSegmentName(bySlug.name)
        } else if (!SLUG_FALLBACK[params.id]) {
          // Unknown route_id and not in fallback map — 404
          setNotFound404(true)
        }
      } catch {
        // DB unavailable — use static fallback silently
      } finally {
        setFetching(false)
      }
    }
    init()
  }, [params.id])

  const profLabel = professionalLabel[backSlug] ?? 'Profissionais'

  const toggleDay    = (k: string) => setHours(p => ({ ...p, [k]: { ...p[k], open: !p[k].open } }))
  const setHourField = (k: string, f: 'from' | 'to', v: string) =>
    setHours(p => ({ ...p, [k]: { ...p[k], [f]: v } }))

  const addService    = () => setServices(p => [...p, { name: '', price: '', duration: '30' }])
  const removeService = (i: number) => setServices(p => p.filter((_, idx) => idx !== i))
  const setService    = (i: number, f: keyof ServiceItem, v: string) =>
    setServices(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s))

  const addProf    = () => {
    if ((selectedPlan === 'starter' || selectedPlan === 'pro') && professionals.length >= 1) {
      alert(`O seu plano (${selectedPlan.toUpperCase()}) é limitado a no máximo 1 profissional. Para ter profissionais ilimitados, escolha o plano ELITE!`)
      return
    }
    setProfessionals(p => [...p, ''])
  }
  const removeProf = (i: number) => setProfessionals(p => p.filter((_, idx) => idx !== i))
  const setProf    = (i: number, v: string) =>
    setProfessionals(p => p.map((x, idx) => idx === i ? v : x))

  const basicOk    = Boolean(nomeEmpresa.trim() && telefone.trim() && endereco.trim())
  const hoursOk    = Object.values(hours).some(h => h.open)
  const servicesOk = services.some(s => s.name.trim() && s.price.trim())
  const isValid    = basicOk && hoursOk && servicesOk

  const buildFormData = (): Record<string, string> => {
    const fd: Record<string, string> = {
      nome_empresa: nomeEmpresa.trim(),
      telefone:     telefone.trim(),
      endereco:     endereco.trim(),
      horario:      formatHours(hours),
      servicos:     formatServices(services),
    }
    const profs = professionals.filter(p => p.trim())
    if (profs.length) fd.profissionais = profs.join(', ')
    return fd
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    setLoading(true); setError('')

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        sessionStorage.setItem('pendingCheckout', JSON.stringify({ serviceId: params.id, formData: buildFormData() }))
        router.push('/login')
        return
      }
      const user = session.session.user
      const { checkoutUrl, tenantId } = await createCheckout({
        segmentSlug: backSlug,
        companyName: nomeEmpresa,
        ownerEmail:  user.email!,
        ownerName:   user.user_metadata?.full_name ?? user.email!,
        formData:    buildFormData(),
        plan:        selectedPlan,
      })
      sessionStorage.setItem('pendingTenantId', tenantId)
      router.push(`/checkout/${tenantId}`)
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao iniciar checkout. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (notFound404) return notFound()

  if (fetching) return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} style={{ color: '#9d4edd', animation: 'spin 1s linear infinite' }} />
      </main>
      <Footer />
      <style jsx global>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )

  const features = featuresFallback[backSlug] ?? []
  const subtitle = subtitleMap[backSlug] ?? 'Automacao sob medida para o seu negocio.'

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>

        <section className={styles.hero}>
          <h1 className={`${styles.heroTitle} gradient-text fade-in`}>{segmentName}</h1>
          <p className={`${styles.heroSubtitle} fade-in`} style={{ animationDelay: '0.1s' }}>{subtitle}</p>
        </section>

        <section className={styles.mainContent}>

          <div className={`${styles.infoSection} fade-in`} style={{ animationDelay: '0.2s' }}>
            <h2>Como a IA vai transformar seu negocio</h2>
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
                A configuracao e feita automaticamente apos o pagamento. Basta escanear o QR Code e seu bot entra em operacao.
              </p>
            </div>
          </div>

          <div className={`${styles.formSection} fade-in`} style={{ animationDelay: '0.3s' }}>
            <h3>Configure sua Automacao</h3>
            <p className={styles.formIntro}>Essas informacoes treinam o bot para atender exatamente como o seu negocio funciona.</p>
            {selectedPlan === 'starter' && (
              <div style={{ padding: '1rem', background: 'rgba(192, 57, 43, 0.15)', border: '1px solid #ff4d4d', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <p style={{ color: '#ff4d4d', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>⚠️ Plano STARTER selecionado</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Este plano NÃO inclui pagamento integrado via Mercado Pago. O bot cuidará exclusivamente de tirar dúvidas (FAQ) e registrar agendamentos.</p>
              </div>
            )}

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit}>

              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>1. Dados Basicos</p>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="nome_empresa">Nome da Empresa</label>
                  <input id="nome_empresa" type="text" className={styles.input}
                    placeholder="Ex: Barbearia do Joao"
                    value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="telefone">WhatsApp Comercial</label>
                  <input id="telefone" type="text" className={styles.input}
                    placeholder="Ex: (51) 99999-9999"
                    value={telefone} onChange={e => setTelefone(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="endereco">Endereco Completo</label>
                  <input id="endereco" type="text" className={styles.input}
                    placeholder="Ex: Rua das Flores, 123 - Centro, Porto Alegre"
                    value={endereco} onChange={e => setEndereco(e.target.value)} required />
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>2. Horario de Funcionamento</p>
                <div className={styles.hoursGrid}>
                  {DAYS.map(({ key, label }) => {
                    const day = hours[key]
                    return (
                      <div key={key} className={styles.hoursRow}>
                        <button type="button" className={styles.dayToggle} onClick={() => toggleDay(key)}>
                          <span className={`${styles.toggleTrack} ${day.open ? styles.on : ''}`}>
                            <span className={styles.toggleThumb} />
                          </span>
                          <span className={`${styles.dayLabel} ${day.open ? styles.open : ''}`}>{label}</span>
                        </button>
                        <input type="time" className={styles.timeInput}
                          value={day.from} disabled={!day.open}
                          onChange={e => setHourField(key, 'from', e.target.value)} />
                        <span className={styles.timeSep}>as</span>
                        <input type="time" className={styles.timeInput}
                          value={day.to} disabled={!day.open}
                          onChange={e => setHourField(key, 'to', e.target.value)} />
                      </div>
                    )
                  })}
                </div>
                {submitted && !hoursOk && (
                  <span className={styles.errorText} style={{ marginTop: '0.75rem' }}>Marque ao menos um dia de funcionamento.</span>
                )}
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>3. Servicos e Precos</p>
                <div className={styles.servicesHeader}>
                  <span>Servico</span><span>Preco (R$)</span><span>Duracao</span><span />
                </div>
                {services.map((svc, i) => (
                  <div key={i} className={styles.serviceRow}>
                    <input type="text" className={styles.smallInput} placeholder="Ex: Corte"
                      value={svc.name} onChange={e => setService(i, 'name', e.target.value)} />
                    <input type="number" className={styles.smallInput} placeholder="35,00" min="0" step="0.01"
                      value={svc.price} onChange={e => setService(i, 'price', e.target.value)} />
                    <select className={styles.durationSelect}
                      value={svc.duration} onChange={e => setService(i, 'duration', e.target.value)}>
                      {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                    <button type="button" className={styles.removeBtn}
                      onClick={() => removeService(i)} disabled={services.length === 1} aria-label="Remover servico">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addRowBtn} onClick={addService}>
                  <Plus size={14} /> Adicionar Servico
                </button>
                {submitted && !servicesOk && (
                  <span className={styles.errorText} style={{ display: 'block', marginTop: '0.5rem' }}>
                    Adicione ao menos um servico com nome e preco.
                  </span>
                )}
              </div>

              <div className={styles.sectionBlock}>
                <p className={styles.sectionTitle}>
                  4. {profLabel}{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                </p>
                {(selectedPlan === 'starter' || selectedPlan === 'pro') && (
                  <p style={{ color: '#E8C97A', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 500 }}>
                    ℹ️ Seu plano ({selectedPlan.toUpperCase()}) é limitado a 1 profissional.
                  </p>
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '1rem' }}>
                  O bot vai informar os profissionais disponiveis e permitir que o cliente escolha.
                </p>
                {professionals.map((name, i) => (
                  <div key={i} className={styles.profRow}>
                    <input type="text" className={styles.smallInput} placeholder="Ex: Joao Silva"
                      value={name} onChange={e => setProf(i, e.target.value)} />
                    <button type="button" className={styles.removeBtn}
                      onClick={() => removeProf(i)} disabled={professionals.length === 1} aria-label="Remover profissional">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addRowBtn} onClick={addProf}>
                  <Plus size={14} /> Adicionar Profissional
                </button>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={!isValid || loading}>
                {loading
                  ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  : <><span>Ir para Pagamento</span><ArrowRight size={18} /></>}
              </button>
              {submitted && !isValid && !loading && (
                <span className={styles.errorText} style={{ textAlign: 'center', display: 'block', marginTop: '0.5rem' }}>
                  Preencha os dados basicos, horarios e ao menos um servico.
                </span>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <style jsx global>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
