// Supabase Edge Function per invio email di conferma tramite Resend
// Deploy: dalla dashboard Supabase o con `supabase functions deploy send-confirmation-email`

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  nome: string
  tipo_patente: string
  mese_preferito: string
  periodo_mese?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, nome, tipo_patente, mese_preferito, periodo_mese }: EmailRequest = await req.json()

    if (!to || !nome) {
      return new Response(
        JSON.stringify({ error: 'Email e nome sono obbligatori' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #2D3748;
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
    }
    .wrapper {
      background-color: #f7f7f7;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: #ffffff;
      padding: 40px 30px;
      text-align: center;
      border-bottom: 4px solid #C41E3A;
    }
    .logo {
      max-width: 220px;
      height: auto;
    }
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .status-bar {
      background: #1a1a1a;
      padding: 15px 30px;
      text-align: center;
    }
    .success-badge {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      display: inline-block;
      padding: 10px 24px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 35px;
    }
    .greeting {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 20px 0;
    }
    .message {
      font-size: 16px;
      color: #4A5568;
      margin-bottom: 30px;
    }
    .message strong {
      color: #C41E3A;
    }
    .info-card {
      background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%);
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      border-left: 5px solid #C41E3A;
    }
    .info-card-title {
      font-weight: 700;
      color: #C41E3A;
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    .info-card-text {
      color: #4A5568;
      margin: 0;
      font-size: 15px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #E2E8F0, transparent);
      margin: 30px 0;
    }
    .contact-section {
      background: #1a1a1a;
      padding: 30px 35px;
    }
    .contact-title {
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 20px 0;
      text-align: center;
    }
    .contact-buttons {
      text-align: center;
    }
    .contact-btn {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin: 5px 8px;
    }
    .btn-phone {
      background: #C41E3A;
      color: #ffffff !important;
    }
    .btn-whatsapp {
      background: #25D366;
      color: #ffffff !important;
    }
    .footer {
      background: #f7f7f7;
      text-align: center;
      padding: 30px;
    }
    .footer-text {
      color: #718096;
      font-size: 14px;
      margin: 0 0 5px 0;
    }
    .footer-brand {
      color: #C41E3A;
      font-weight: 700;
      font-size: 16px;
    }
    .footer-address {
      color: #A0AEC0;
      font-size: 12px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,fit=crop,q=95/AVLx7baXQxsEDWn2/aba-png-Awv84kVo4ZfzRl7Z.png" alt="ABA Autoscuole" class="logo">
      </div>

      <div class="status-bar">
        <span class="success-badge">&#10003; Prenotazione Confermata</span>
      </div>

      <div class="content">
        <h1 class="greeting">Ciao ${nome.split(' ')[0]}!</h1>

        <p class="message">
          La tua prenotazione per l'esame di teoria patente <strong>${tipo_patente}</strong>
          nel mese di <strong>${mese_preferito}</strong>${periodo_mese ? ` (${periodo_mese})` : ''}
          è stata confermata con successo.
        </p>

        <div class="info-card">
          <p class="info-card-title">&#128198; Prossimi passi</p>
          <p class="info-card-text">Ti contatteremo a breve per comunicarti la data e l'ora esatte del tuo esame. Tieni d'occhio il telefono!</p>
        </div>

        <div class="divider"></div>

        <p style="text-align: center; color: #718096; font-size: 14px; margin: 0;">
          In bocca al lupo per il tuo esame!
        </p>
      </div>

      <div class="contact-section">
        <p class="contact-title">Hai domande? Siamo qui per te!</p>
        <div class="contact-buttons">
          <a href="tel:+390424523690" class="contact-btn btn-phone">&#128222; Chiamaci</a>
          <a href="https://wa.me/390424523690" class="contact-btn btn-whatsapp">&#128172; WhatsApp</a>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">A presto!</p>
        <p class="footer-brand">ABA Autoscuole</p>
        <p class="footer-address">Bassano del Grappa (VI)</p>
      </div>
    </div>
  </div>
</body>
</html>
`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ABA Autoscuole <onboarding@resend.dev>',
        to: [to],
        subject: `Prenotazione Esame Teoria Confermata - ${mese_preferito}`,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data)
      return new Response(
        JSON.stringify({ error: data.message || 'Errore invio email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
