// ============================================================
// lib/api.ts — Camada centralizada de chamadas ao backend
// ============================================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
if (!BACKEND_URL && typeof window !== 'undefined') {
  console.error('[api] NEXT_PUBLIC_BACKEND_URL não está definida. Defina no .env.local.')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error ?? `Erro ${res.status}`)
  }
  return res.json()
}

export interface CheckoutPayload {
  segmentSlug: string
  companyName: string
  ownerEmail:  string
  ownerName:   string
  formData:    Record<string, string>
  plan:        string
}

export interface CheckoutResponse {
  checkoutUrl: string
  tenantId:    string
}

export async function createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return request<CheckoutResponse>('/payments/checkout', {
    method: 'POST',
    body:   JSON.stringify(payload),
  })
}

export interface TenantStatus {
  tenant:      'pending' | 'active' | 'suspended' | 'not_found'
  whatsapp:    'disconnected' | 'connecting' | 'connected' | 'not_provisioned'
  qrCode:      string | null
  mpConnected: boolean
}

export async function getTenantStatus(tenantId: string): Promise<TenantStatus> {
  const res = await fetch(`/api/whatsapp/status/${tenantId}`)
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  return res.json()
}

export async function refreshQrCode(tenantId: string): Promise<{ qrCode: string }> {
  const res = await fetch(`/api/whatsapp/qrcode/${tenantId}`)
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  return res.json()
}

export function getMpOAuthUrl(tenantId: string): string {
  return `/api/payments/oauth/connect?tenantId=${tenantId}`
}
