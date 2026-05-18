import { redirect }           from 'next/navigation'
import { cookies }            from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin }      from '@/lib/supabase-admin'
import {
  Wifi, WifiOff, CreditCard, CheckCircle,
  Calendar, MessageSquare, AlertTriangle,
  Edit, RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { QrCodePanel }          from '@/components/dashboard/QrCodePanel'
import { DashboardLiveMetrics } from '@/components/dashboard/DashboardLiveMetrics'
import styles from '@/app/styles/Dashboard.module.css'

export const revalidate = 30

export default async function DashboardPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Admin client para dados (bypassa RLS, filtrado pelo email da sessão verificada)
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, company_name, status, next_billing_at, segment_id')
    .eq('owner_email', session.user.email)
    .in('status', ['active', 'pending', 'suspended'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!tenant) {
    return (
      <div>
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.topbarTitle}>Início</h1>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
            <AlertTriangle size={48} color="#fbbf24" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ marginBottom: '8px' }}>Nenhuma automação ativa</h2>
            <p style={{ color: '#a496b8', marginBottom: '24px', fontSize: '14px' }}>
              Você ainda não tem nenhuma automação configurada.
            </p>
            <Link href="/servicos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#5a189a,#9d4edd)' }}>
              Ver Serviços Disponíveis
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const tenantId = tenant.id
  const today    = new Date().toISOString().split('T')[0]

  // Admin client para todos os dados — filtrado por tenantId da sessão verificada
  const [instanceRes, configRes, apptRes, apptTodayRes, conversasRes] = await Promise.all([
    supabaseAdmin.from('whatsapp_instances')
      .select('status, qr_code, connected_at')
      .eq('tenant_id', tenantId)
      .single(),
    supabaseAdmin.from('tenant_config')
      .select('mp_access_token, services, business_hours')
      .eq('tenant_id', tenantId)
      .single(),
    supabaseAdmin.from('appointments')
      .select('id, customer_name, customer_phone, service, price, scheduled_at, status')
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', new Date().toISOString())
      .in('status', ['pending', 'confirmed'])
      .order('scheduled_at', { ascending: true })
      .limit(5),
    supabaseAdmin.from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', today)
      .lt('scheduled_at', `${today}T23:59:59`),
    supabaseAdmin.from('conversations')
      .select('id')
      .eq('tenant_id', tenantId),
  ])

  const instance     = instanceRes.data
  const config       = configRes.data
  const appointments = apptRes.data ?? []
  const apptToday    = apptTodayRes.count ?? 0
  const mpConnected  = !!config?.mp_access_token

  // Mensagens hoje — filtradas pelas conversas deste tenant
  const convIds = (conversasRes.data ?? []).map(c => c.id)
  let msgToday = 0
  if (convIds.length > 0) {
    const { count } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .gte('created_at', today)
    msgToday = count ?? 0
  }

  const whatsappStatus = instance?.status ?? 'disconnected'
  const isConnected    = whatsappStatus === 'connected'

  const nextBilling = tenant.next_billing_at
    ? new Date(tenant.next_billing_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : null

  const userName = session.user.user_metadata?.full_name ?? session.user.email ?? ''

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.topbarTitle}>
            Olá, {userName.split(' ')[0]} 👋
          </h1>
          <p className={styles.topbarSub}>{tenant.company_name}</p>
        </div>
      </div>

      <div className={styles.content}>

        {tenant.status === 'suspended' && (
          <div className={styles.alertBar} style={{ borderColor: 'rgba(192,57,43,.3)', background: 'rgba(192,57,43,.08)' }}>
            <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
            <span>Sua automação está <strong>suspensa</strong> por falta de pagamento. Entre em contato com o suporte.</span>
          </div>
        )}

        <DashboardLiveMetrics
          tenantId={tenantId}
          initialAppt={apptToday}
          initialMsg={msgToday}
          mpConnected={mpConnected}
          nextBilling={nextBilling}
        />

        {!isConnected && tenant.status === 'active' && (
          <QrCodePanel tenantId={tenantId} initialQrCode={instance?.qr_code ?? null} />
        )}

        <div className={styles.twoCol}>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Status da automação</h2>
            </div>

            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>
                {isConnected ? <Wifi size={16} color="#4ade80" /> : <WifiOff size={16} color="#f87171" />}
                WhatsApp
              </span>
              <span className={`${styles.badge} ${isConnected ? styles.badgeOn : whatsappStatus === 'connecting' ? styles.badgeWait : styles.badgeOff}`}>
                <span className={`${styles.dot} ${isConnected ? styles.dotOn : whatsappStatus === 'connecting' ? styles.dotWait : styles.dotOff}`} />
                {isConnected ? 'Conectado' : whatsappStatus === 'connecting' ? 'Conectando' : 'Desconectado'}
              </span>
            </div>

            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>
                <span style={{ fontSize: '16px' }}>🤖</span> Bot IA
              </span>
              <span className={`${styles.badge} ${tenant.status === 'active' ? styles.badgeOn : styles.badgeOff}`}>
                <span className={`${styles.dot} ${tenant.status === 'active' ? styles.dotOn : styles.dotOff}`} />
                {tenant.status === 'active' ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>
                <CreditCard size={16} /> Mercado Pago
              </span>
              <span className={`${styles.badge} ${mpConnected ? styles.badgeOn : styles.badgeWait}`}>
                <span className={`${styles.dot} ${mpConnected ? styles.dotOn : styles.dotWait}`} />
                {mpConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>

            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>
                <CheckCircle size={16} /> Plano
              </span>
              <span className={`${styles.badge} ${tenant.status === 'active' ? styles.badgeOn : styles.badgeOff}`}>
                <span className={`${styles.dot} ${tenant.status === 'active' ? styles.dotOn : styles.dotOff}`} />
                {tenant.status === 'active' ? 'Ativo' : 'Suspenso'}
              </span>
            </div>

            <div className={styles.quickActions}>
              <Link href="/dashboard/configuracoes" className={styles.btn}>
                <Edit size={14} /> Editar bot
              </Link>
              {!isConnected && (
                <Link href="/dashboard" className={styles.btn}>
                  <RefreshCw size={14} /> Novo QR Code
                </Link>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Próximos agendamentos</h2>
              <Link href="/dashboard/agendamentos" className={styles.cardLink}>ver todos →</Link>
            </div>

            {appointments.length === 0 ? (
              <p style={{ color: '#a496b8', fontSize: '13px', textAlign: 'center', padding: '1.5rem 0' }}>
                Nenhum agendamento futuro.
              </p>
            ) : (
              appointments.map(appt => {
                const initials = (appt.customer_name ?? appt.customer_phone)
                  .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

                const dateStr = new Date(appt.scheduled_at).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                })

                return (
                  <div key={appt.id} className={styles.apptItem}>
                    <div className={styles.apptInfo}>
                      <div className={styles.apptAvatar}>{initials}</div>
                      <div>
                        <div className={styles.apptName}>{appt.customer_name ?? appt.customer_phone}</div>
                        <div className={styles.apptService}>{appt.service}</div>
                      </div>
                    </div>
                    <div>
                      <div className={styles.apptDate}>{dateStr}</div>
                      <div className={styles.apptPrice}>
                        {appt.price ? `R$${Number(appt.price).toFixed(2)}` : '—'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Prévia do bot</h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#4ade80' }}>
              <span className={`${styles.dot} ${styles.dotOn}`} />
              ao vivo
            </span>
          </div>
          <div className={styles.chatMessages}>
            <div className={styles.chatRow}>
              <div className={styles.chatAvatar} style={{ background: '#261a35', fontSize: '14px' }}>👤</div>
              <div>
                <div className={`${styles.chatBubble} ${styles.chatBubbleUser}`}>
                  Oi, quero marcar um horário
                </div>
                <div className={styles.chatTime} style={{ textAlign: 'right' }}>14:32</div>
              </div>
            </div>
            <div className={styles.chatRow}>
              <div className={styles.chatAvatar}>🤖</div>
              <div>
                <div className={`${styles.chatBubble} ${styles.chatBubbleBot}`}>
                  Olá! Seja bem-vindo à <strong>{tenant.company_name}</strong> 👋
                  Tenho horários disponíveis hoje às 15h, 16h30 e 18h. Qual prefere?
                </div>
                <div className={styles.chatTime}>14:32</div>
              </div>
            </div>
            <div className={styles.chatRow}>
              <div className={styles.chatAvatar} style={{ background: '#261a35', fontSize: '14px' }}>👤</div>
              <div>
                <div className={`${styles.chatBubble} ${styles.chatBubbleUser}`}>15h tá bom</div>
                <div className={styles.chatTime} style={{ textAlign: 'right' }}>14:33</div>
              </div>
            </div>
            <div className={styles.chatRow}>
              <div className={styles.chatAvatar}>🤖</div>
              <div>
                <div className={`${styles.chatBubble} ${styles.chatBubbleBot}`}>
                  Perfeito! Agendei para hoje às 15h00. Te espero lá! ✅
                </div>
                <div className={styles.chatTime}>14:33</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <Link href="/dashboard/conversas" className={styles.btn}>
              <MessageSquare size={14} /> Ver todas as conversas
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
