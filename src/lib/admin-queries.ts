// Queries server-side do painel admin — só chamar em Server Components / Server Actions.
import { supabaseAdmin } from './supabase-admin'
import type {
  Tenant, PlatformPayment, DashboardMetrics, RevenuePoint,
  WhatsappInstance, Appointment, Conversation, Segment, RevenueSummary,
} from '../types/admin'

// ── Dashboard ──────────────────────────────────────────────────
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [tenantsRes, paymentsRes, instancesRes, messagesRes] = await Promise.all([
    supabaseAdmin.from('tenants').select('status, created_at'),
    supabaseAdmin.from('platform_payments').select('amount, type, status, paid_at').eq('status', 'approved'),
    supabaseAdmin.from('whatsapp_instances').select('status'),
    supabaseAdmin.from('messages').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),
  ])

  const tenants   = tenantsRes.data   ?? []
  const payments  = paymentsRes.data  ?? []
  const instances = instancesRes.data ?? []

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  return {
    totalActive:     tenants.filter(t => t.status === 'active').length,
    totalPending:    tenants.filter(t => t.status === 'pending').length,
    totalSuspended:  tenants.filter(t => t.status === 'suspended').length,
    mrr:             payments.filter(p => p.type === 'monthly').reduce((s, p) => s + (p.amount ?? 0), 0),
    whatsappOnline:  instances.filter(i => i.status === 'connected').length,
    whatsappOffline: instances.filter(i => i.status !== 'connected').length,
    messagesToday:   messagesRes.count ?? 0,
    newThisMonth:    tenants.filter(t => t.created_at >= monthStart).length,
  }
}

// ── Tenants ────────────────────────────────────────────────────
export async function getTenants(limit = 50): Promise<Tenant[]> {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('*, segments(name, slug), whatsapp_instances(status, connected_at)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('[getTenants]', error); return [] }
  return data as Tenant[]
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select(`
      *,
      segments(name, slug),
      whatsapp_instances(status, connected_at),
      tenant_config(whatsapp_number, contact_phone, address, business_hours, services, generated_prompt, mp_access_token),
      platform_payments(amount, type, status, paid_at)
    `)
    .eq('id', id)
    .single()

  if (error) { console.error('[getTenantById]', error); return null }
  return data as Tenant
}

export async function updateTenantStatus(tenantId: string, status: 'active' | 'suspended') {
  const { error } = await supabaseAdmin.from('tenants').update({ status }).eq('id', tenantId)
  if (error) throw new Error(`Erro ao atualizar tenant: ${error.message}`)
}

// ── Pagamentos ─────────────────────────────────────────────────
export async function getRecentPayments(limit = 20): Promise<PlatformPayment[]> {
  const { data, error } = await supabaseAdmin
    .from('platform_payments')
    .select('*, tenants(company_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('[getRecentPayments]', error); return [] }
  return data as PlatformPayment[]
}

export async function getAllPayments(limit = 100): Promise<PlatformPayment[]> {
  const { data, error } = await supabaseAdmin
    .from('platform_payments')
    .select('*, tenants(company_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('[getAllPayments]', error); return [] }
  return data as PlatformPayment[]
}

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const { data } = await supabaseAdmin
    .from('platform_payments')
    .select('amount, type, status')

  const rows = data ?? []
  const approved = rows.filter(r => r.status === 'approved')
  return {
    totalApproved: approved.reduce((s, r) => s + (r.amount ?? 0), 0),
    totalSetup:    approved.filter(r => r.type === 'setup').reduce((s, r) => s + (r.amount ?? 0), 0),
    totalMonthly:  approved.filter(r => r.type === 'monthly').reduce((s, r) => s + (r.amount ?? 0), 0),
    totalPending:  rows.filter(r => r.status === 'pending').reduce((s, r) => s + (r.amount ?? 0), 0),
    countApproved: approved.length,
  }
}

// ── Receita por mês ────────────────────────────────────────────
export async function getRevenueByMonth(): Promise<RevenuePoint[]> {
  const months: RevenuePoint[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.toISOString()
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { data } = await supabaseAdmin
      .from('platform_payments')
      .select('amount')
      .eq('status', 'approved')
      .gte('paid_at', start)
      .lte('paid_at', end)

    const total = (data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0)
    const label = d.toLocaleDateString('pt-BR', { month: 'short' })
    months.push({ month: label.charAt(0).toUpperCase() + label.slice(1, 3), amount: total })
  }

  return months
}

// ── Instâncias WhatsApp ────────────────────────────────────────
export async function getWhatsappInstances(): Promise<WhatsappInstance[]> {
  const { data, error } = await supabaseAdmin
    .from('whatsapp_instances')
    .select('*, tenants(company_name, owner_email)')
    .order('created_at', { ascending: false })

  if (error) { console.error('[getWhatsappInstances]', error); return [] }
  return data as WhatsappInstance[]
}

// ── Agendamentos ───────────────────────────────────────────────
export async function getAppointments(limit = 100): Promise<Appointment[]> {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*, tenants(company_name)')
    .order('scheduled_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('[getAppointments]', error); return [] }
  return data as Appointment[]
}

// ── Conversas ──────────────────────────────────────────────────
export async function getConversations(limit = 50): Promise<Conversation[]> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*, tenants(company_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('[getConversations]', error); return [] }
  return data as Conversation[]
}

// ── Segmentos ──────────────────────────────────────────────────
export async function getSegments(): Promise<Segment[]> {
  const { data, error } = await supabaseAdmin
    .from('segments')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) { console.error('[getSegments]', error); return [] }
  return data as Segment[]
}

export async function updateSegmentActive(segmentId: string, active: boolean) {
  const { error } = await supabaseAdmin.from('segments').update({ active }).eq('id', segmentId)
  if (error) throw new Error(`Erro ao atualizar segmento: ${error.message}`)
}
