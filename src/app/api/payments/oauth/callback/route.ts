import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const tenantId = searchParams.get('state') // O Mercado Pago retorna o 'state' original que enviamos

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!code || !tenantId) {
    console.error('[oauth/callback] Código ou tenantId ausentes no retorno do Mercado Pago')
    return NextResponse.redirect(`${appUrl}/onboarding/success?error=invalid_params`)
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID
    const clientSecret = process.env.MP_CLIENT_SECRET
    const redirectUri = process.env.MP_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Configuração do Mercado Pago ausente no arquivo .env.local')
    }

    // 1. Troca o código pelo Access Token do cliente no Mercado Pago
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: clientSecret,
        client_id:     clientId,
        grant_type:    'authorization_code',
        code:          code,
        redirect_uri:  redirectUri,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error_description ?? tokenData.message ?? 'Erro ao obter token do Mercado Pago')
    }

    // 2. Salva o mp_access_token no Supabase (tabela tenant_config) para este tenantId
    const { error: dbError } = await supabaseAdmin
      .from('tenant_config')
      .update({
        mp_access_token: tokenData.access_token,
        updated_at:      new Date().toISOString(),
      })
      .eq('tenant_id', tenantId)

    if (dbError) {
      throw new Error(`Erro ao salvar token no banco: ${dbError.message}`)
    }

    console.log(`[oauth/callback] Mercado Pago conectado com sucesso para o tenant: ${tenantId}`)

    // 3. Redireciona o cliente com flag de sucesso
    return NextResponse.redirect(`${appUrl}/onboarding/success?mp_connected=true`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[oauth/callback] Erro no fluxo OAuth:', msg)
    return NextResponse.redirect(`${appUrl}/onboarding/success?error=oauth_failed`)
  }
}
