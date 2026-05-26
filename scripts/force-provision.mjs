// Script temporário para forçar tenant active + provisionar WhatsApp
// Uso: node scripts/force-provision.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://ucfnhmpilohwkdjibczs.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZm5obXBpbG9od2tkamliY3pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ4MDMwOCwiZXhwIjoyMDk0MDU2MzA4fQ.q36mQ_vNQ7XJAFbvY3Uw1laxqm4JhKpYNL70p3F-oAc'
const EVOLUTION_URL    = 'https://evolution-api-production-7f59.up.railway.app'
const EVOLUTION_KEY    = '429683C4C977415CAAFCCE10F7D57E11'
const APP_URL          = 'http://localhost:3000'
const TARGET_EMAIL     = 'yasserguns@gmail.com'

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function evFetch(path, method = 'GET', body) {
  const res = await fetch(`${EVOLUTION_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_KEY },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

async function main() {
  // 1. Lista todos os tenants para diagnóstico
  const { data: allTenants } = await db
    .from('tenants')
    .select('id, owner_email, company_name, status')
    .order('created_at', { ascending: false })
    .limit(10)
  console.log('Tenants no banco:', JSON.stringify(allTenants, null, 2))

  // 2. Busca o tenant pelo email
  let tenant = allTenants?.find(t => t.owner_email === TARGET_EMAIL)

  if (!tenant) {
    console.log(`\nTenant não encontrado para ${TARGET_EMAIL} — criando...`)
    const { data: segs } = await db.from('segments').select('id, name').limit(5)
    console.log('Segmentos:', segs)
    const segId = segs?.[0]?.id ?? null

    const { data: newTenant, error: insErr } = await db
      .from('tenants')
      .insert({ owner_email: TARGET_EMAIL, company_name: 'Barbearia Teste', status: 'active', segment_id: segId })
      .select('id, owner_email, company_name, status')
      .single()

    if (insErr) { console.error('Erro ao criar tenant:', insErr.message); process.exit(1) }
    tenant = newTenant
    console.log('Tenant criado:', tenant)
  }

  console.log(`\nUsando tenant: "${tenant.company_name}" [${tenant.id}] status=${tenant.status}`)

  // 3. Ativa se necessário
  if (tenant.status !== 'active') {
    await db.from('tenants').update({ status: 'active' }).eq('id', tenant.id)
    console.log('Tenant ativado.')
  }

  // 4. Provisiona instância na Evolution API
  const instanceName = tenant.id
  const webhookUrl   = `${APP_URL}/api/whatsapp/webhook/${tenant.id}`

  console.log(`\nCriando instância na Evolution API...`)
  const createRes = await evFetch('/instance/create', 'POST', {
    instanceName,
    integration: 'WHATSAPP-BAILEYS',
    webhook: { url: webhookUrl, enabled: true, events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT'] },
    webhookByEvents: true,
  })
  console.log('Resposta create:', JSON.stringify(createRes).slice(0, 300))

  // 5. Obtém QR Code
  console.log('\nObtendo QR Code...')
  const connectRes = await evFetch(`/instance/connect/${instanceName}`)
  const base64Raw  = connectRes?.base64 ?? null
  const qrCode     = base64Raw?.replace(/^data:image\/\w+;base64,/, '') ?? null
  console.log('QR Code:', qrCode ? `${qrCode.slice(0, 60)}...` : 'nenhum')

  // 6. Upsert em whatsapp_instances
  const { data: existing } = await db
    .from('whatsapp_instances')
    .select('id')
    .eq('tenant_id', tenant.id)
    .maybeSingle()

  if (existing) {
    await db.from('whatsapp_instances')
      .update({ status: 'connecting', qr_code: qrCode, instance_name: instanceName })
      .eq('tenant_id', tenant.id)
    console.log('whatsapp_instances atualizado.')
  } else {
    await db.from('whatsapp_instances')
      .insert({ tenant_id: tenant.id, instance_name: instanceName, status: 'connecting', qr_code: qrCode })
    console.log('whatsapp_instances criado.')
  }

  console.log('\nProvisioning concluído!')
  console.log(`Logue em http://localhost:3000/login com ${TARGET_EMAIL} e acesse /dashboard`)
}

main().catch(console.error)
