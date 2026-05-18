// ============================================================
// lib/evolution.ts — Cliente da Evolution API v2
// Todas as chamadas server-side (nunca expor a apikey no front)
// ============================================================

const BASE_URL = process.env.EVOLUTION_API_URL ?? ''
const API_KEY  = process.env.EVOLUTION_API_KEY  ?? ''

async function evReq<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) throw new Error('EVOLUTION_API_URL não está configurada')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Evolution ${res.status}: ${body}`)
  }
  return res.json()
}

// Remove o prefixo "data:image/png;base64," se presente
export function stripBase64Prefix(b64: string | null | undefined): string | null {
  if (!b64) return null
  return b64.replace(/^data:image\/[a-z]+;base64,/, '')
}

// Mapeia estado da Evolution para o padrão do projeto
export function mapEvState(state: string): 'connected' | 'connecting' | 'disconnected' {
  if (state === 'open')       return 'connected'
  if (state === 'connecting') return 'connecting'
  return 'disconnected'
}

// Criar instância WhatsApp para um tenant
export async function evCreateInstance(tenantId: string, webhookUrl: string) {
  return evReq('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName:    tenantId,
      token:           tenantId,
      integration:     'WHATSAPP-BAILEYS',
      qrcode:          true,
      webhookUrl,
      webhookByEvents: true,
      events:          ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
    }),
  })
}

// Estado de conexão da instância
export async function evConnectionState(
  tenantId: string
): Promise<{ instance: { state: string } }> {
  return evReq(`/instance/connectionState/${tenantId}`)
}

// Conectar / gerar QR Code
export async function evConnect(
  tenantId: string
): Promise<{ base64?: string; code?: string }> {
  return evReq(`/instance/connect/${tenantId}`)
}

// Desconectar instância
export async function evLogout(tenantId: string) {
  return evReq(`/instance/logout/${tenantId}`, { method: 'DELETE' })
}

// Enviar mensagem de texto
export async function evSendText(
  instanceName: string,
  phone:        string,
  text:         string
) {
  return evReq(`/message/sendText/${instanceName}`, {
    method: 'POST',
    body: JSON.stringify({
      number:      phone,
      options:     { delay: 1000 },
      textMessage: { text },
    }),
  })
}
