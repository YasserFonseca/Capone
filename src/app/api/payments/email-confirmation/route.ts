import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { tenantId, email, companyName, planName, setup, monthly, cycle } = await req.json();

    if (!tenantId || !email) {
      return NextResponse.json({ error: 'tenantId e email são obrigatórios' }, { status: 400 });
    }

    const totalPaidNow = Number(setup) + Number(monthly);

    // Template de E-mail HTML Premium com Identidade Visual Capone
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmação de Assinatura Capone</title>
  <style>
    body {
      background-color: #08080c;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      background-color: #08080c;
      padding: 40px 20px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #161021;
      border: 1px solid rgba(157, 78, 221, 0.2);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #1a1228 0%, #0d0914 100%);
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid rgba(157, 78, 221, 0.15);
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: 0.5px;
    }
    .logo span {
      color: #9d4edd;
    }
    .content {
      padding: 30px;
    }
    .welcome {
      font-size: 22px;
      color: #ffffff;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 25px;
    }
    .badge-success {
      display: inline-block;
      background-color: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .receipt {
      background-color: rgba(8, 8, 12, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .receipt-title {
      font-size: 14px;
      font-weight: 700;
      color: #FF7A00;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
    }
    .pricing-row td {
      padding: 10px 0;
      font-size: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .pricing-row:last-child td {
      border-bottom: none;
    }
    .pricing-label {
      color: #94a3b8;
    }
    .pricing-value {
      text-align: right;
      color: #ffffff;
      font-weight: 600;
    }
    .total-row td {
      padding-top: 15px;
      font-size: 16px;
      font-weight: 700;
    }
    .total-value {
      color: #FF7A00;
      font-size: 18px;
    }
    .steps-box {
      background-color: rgba(255, 122, 0, 0.04);
      border: 1px dashed rgba(255, 122, 0, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .steps-title {
      font-size: 15px;
      color: #ffffff;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    .steps-list {
      margin: 0;
      padding-left: 18px;
      color: #94a3b8;
      font-size: 13.5px;
      line-height: 1.6;
    }
    .steps-list li {
      margin-bottom: 8px;
    }
    .steps-list li strong {
      color: #ffffff;
    }
    .footer {
      background-color: #0d0914;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid rgba(157, 78, 221, 0.1);
      font-size: 12px;
      color: #64748b;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #9d4edd;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Cabeçalho -->
      <div class="header">
        <a href="#" class="logo">Capone<span>.</span></a>
      </div>

      <!-- Conteúdo principal -->
      <div class="content">
        <div class="badge-success">✓ ASSINATURA ATIVADA</div>
        
        <h1 class="welcome">Olá, ${companyName}!</h1>
        <p class="subtitle">
          Parabéns! Sua assinatura foi aprovada e seu robô Capone de atendimento inteligente já está pronto para automatizar seu WhatsApp!
        </p>

        <!-- Detalhes do Recibo -->
        <div class="receipt">
          <h3 class="receipt-title">Comprovante de Assinatura</h3>
          <table class="pricing-table">
            <tr class="pricing-row">
              <td class="pricing-label">Plano Ativado</td>
              <td class="pricing-value">${planName}</td>
            </tr>
            <tr class="pricing-row">
              <td class="pricing-label">Ciclo de Faturamento</td>
              <td class="pricing-value">${cycle === 'annual' ? 'Anual (20% de Desconto)' : 'Mensal'}</td>
            </tr>
            <tr class="pricing-row">
              <td class="pricing-label">Taxa Única de Setup</td>
              <td class="pricing-value">R$ ${Number(setup).toFixed(2).replace('.', ',')}</td>
            </tr>
            <tr class="pricing-row">
              <td class="pricing-label">Mensalidade Assinatura</td>
              <td class="pricing-value">R$ ${Number(monthly).toFixed(2).replace('.', ',')}</td>
            </tr>
            <tr class="total-row">
              <td class="pricing-label" style="color: #ffffff; font-weight: 700;">Valor Total Pago</td>
              <td class="pricing-value total-value">R$ ${totalPaidNow.toFixed(2).replace('.', ',')}</td>
            </tr>
          </table>
        </div>

        <!-- Próximos Passos -->
        <div class="steps-box">
          <h4 class="steps-title">🚀 Próximos passos para configuração:</h4>
          <ol class="steps-list">
            <li>Acesse sua tela de onboarding e <strong>conecte o WhatsApp</strong> escaneando o QR Code dinâmico gerado.</li>
            <li>Conecte sua conta do <strong>Mercado Pago via OAuth</strong> em um clique para o bot registrar recebimentos direto no seu bolso.</li>
            <li>Acesse o seu <strong>Painel Administrativo (Dashboard)</strong> para monitorar conversas ao vivo, taxas de conversão e métricas de satisfação.</li>
          </ol>
        </div>

        <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 30px;">
          Se precisar de qualquer auxílio, fale com nosso time de SLA Premium no e-mail <a href="mailto:suporte@capone.com.br" style="color: #9d4edd; text-decoration: none;">suporte@capone.com.br</a>.
        </p>
      </div>

      <!-- Rodapé -->
      <div class="footer">
        <p>© 2026 Capone Automações Conversacionais Ltda.</p>
        <p>Avenida Brigadeiro Faria Lima, São Paulo - SP</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Persiste o arquivo HTML na pasta pública do projeto para o preview no frontend
    const dir = path.join(process.cwd(), 'public', 'mock-emails');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${tenantId}.html`);
    fs.writeFileSync(filePath, htmlContent, 'utf-8');

    console.log(`[api/payments/email-confirmation] E-mail de recibo gerado e salvo para o tenant: ${tenantId}`);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[api/payments/email-confirmation] Erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
