import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId')

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId obrigatório' }, { status: 400 })
  }

  const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID
  const redirectUri = process.env.MP_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Configuração do Mercado Pago incompleta no servidor' }, { status: 500 })
  }

  const authUrl = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${tenantId}&redirect_uri=${encodeURIComponent(redirectUri)}`

  return NextResponse.redirect(authUrl)
}
