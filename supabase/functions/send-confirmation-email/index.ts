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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, nome, tipo_patente, mese_preferito }: EmailRequest = await req.json()

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
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B0F19 0%, #1F2937 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .success-badge { background: #10B981; color: white; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
    .info-box { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0B0F19; }
    .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
    .contact { background: #0B0F19; color: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .contact a { color: #60A5FA; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ABA AUTOSCUOLE</h1>
    </div>
    <div class="content">
      <div class="success-badge">CONFERMATA</div>

      <h2>Ciao ${nome.split(' ')[0]}!</h2>

      <p>La tua prenotazione per l'esame di teoria patente <strong>${tipo_patente}</strong> nel mese di <strong>${mese_preferito}</strong> e stata <strong>CONFERMATA</strong>!</p>

      <div class="info-box">
        <p><strong>Prossimi passi:</strong></p>
        <p>Ti contatteremo a breve per comunicarti la data e l'ora esatte dell'esame.</p>
      </div>

      <div class="contact">
        <p style="margin: 0 0 10px 0;"><strong>Per qualsiasi domanda:</strong></p>
        <p style="margin: 0;">Tel: <a href="tel:+390424523690">0424 523690</a></p>
        <p style="margin: 0;">WhatsApp: <a href="https://wa.me/390424523690">0424 523690</a></p>
      </div>

      <div class="footer">
        <p>A presto!<br><strong>ABA Autoscuole</strong></p>
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
