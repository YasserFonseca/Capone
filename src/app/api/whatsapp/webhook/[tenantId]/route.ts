// POST /api/whatsapp/webhook/[tenantId]
// Recebe eventos da Evolution API e atualiza o banco.
// Eventos tratados: CONNECTION_UPDATE, MESSAGES_UPSERT

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = params

  // Verifica que o tenant existe
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .single()

  if (!tenant) return NextResponse.json({ ok: false }, { status: 404 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }) }

  const event = body?.event as string | undefined

  // ── CONNECTION_UPDATE ──────────────────────────────────────────
  if (event === 'CONNECTION_UPDATE') {
    const state = body?.data?.state as string | undefined

    if (state === 'open') {
      await supabaseAdmin
        .from('whatsapp_instances')
        .update({ status: 'connected', connected_at: new Date().toISOString(), qr_code: null })
        .eq('tenant_id', tenantId)
    } else if (state === 'close' || state === 'refused') {
      await supabaseAdmin
        .from('whatsapp_instances')
        .update({ status: 'disconnected' })
        .eq('tenant_id', tenantId)
    } else if (state === 'connecting') {
      await supabaseAdmin
        .from('whatsapp_instances')
        .update({ status: 'connecting' })
        .eq('tenant_id', tenantId)
    }
  }

  // ── MESSAGES_UPSERT ───────────────────────────────────────────
  if (event === 'MESSAGES_UPSERT') {
    const msg  = body?.data
    if (!msg) return NextResponse.json({ ok: true })

    const phone     = (msg.key?.remoteJid as string ?? '').replace('@s.whatsapp.net', '')
    const text      = msg.message?.conversation
               ?? msg.message?.extendedTextMessage?.text
               ?? ''
    const fromMe    = msg.key?.fromMe === true
    const timestamp = msg.messageTimestamp
      ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
      : new Date().toISOString()

    // Encontra ou cria conversa
    let { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!conv) {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({ tenant_id: tenantId, customer_phone: phone, status: 'active' })
        .select('id')
        .single()
      conv = newConv
    }

    if (conv) {
      await Promise.all([
        supabaseAdmin.from('messages').insert({
          conversation_id: conv.id,
          content:         text,
          role:            fromMe ? 'assistant' : 'user',
          created_at:      timestamp,
        }),
        supabaseAdmin
          .from('conversations')
          .update({ last_message_at: timestamp, status: 'active' })
          .eq('id', conv.id),
      ])
    }
  }

  return NextResponse.json({ ok: true })
}
