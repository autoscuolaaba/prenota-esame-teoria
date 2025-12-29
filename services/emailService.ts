// Email service using Supabase Edge Function + Resend

const SUPABASE_URL = 'https://qoddxlyrltzhkwfuxbdg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZGR4bHlybHR6aGt3ZnV4YmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTA4NjUsImV4cCI6MjA4MjU4Njg2NX0.NvDmctXk4hlHuy8Wa1pT1_qkGnubpxsL8TVOThTxtyU';

interface EmailData {
  to: string;
  nome: string;
  tipo_patente: string;
  mese_preferito: string;
}

export const EmailService = {
  async sendConfirmationEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore invio email');
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }
};
