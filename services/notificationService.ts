// Notification service using ntfy.sh (free push notifications)
// Admin needs to:
// 1. Download "ntfy" app on phone (iOS/Android)
// 2. Subscribe to the channel: autoscuola-aba-prenotazioni

const NTFY_CHANNEL = 'autoscuola-teorie';
const NTFY_URL = `https://ntfy.sh/${NTFY_CHANNEL}`;

interface BookingData {
  nome_cognome: string;
  tipo_patente: string;
  email: string;
  mese_preferito: string;
  periodo_mese?: string;
  note?: string;
}

export const NotificationService = {
  // Send notification for new booking
  async sendNewBookingNotification(booking: BookingData): Promise<void> {
    try {
      const message = `${booking.nome_cognome}\n` +
        `Patente: ${booking.tipo_patente}\n` +
        `Email: ${booking.email}\n` +
        `Mese: ${booking.mese_preferito}` +
        (booking.periodo_mese ? ` (${booking.periodo_mese})` : '') +
        (booking.note ? `\nNote: ${booking.note}` : '');

      await fetch(NTFY_URL, {
        method: 'POST',
        headers: {
          'Title': 'Nuova Prenotazione Esame',
          'Priority': 'high',
          'Tags': 'car,new'
        },
        body: message
      });

      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  },

  // Send notification when booking is confirmed
  async sendConfirmationNotification(booking: BookingData): Promise<void> {
    try {
      await fetch(NTFY_URL, {
        method: 'POST',
        headers: {
          'Title': `Prenotazione Confermata`,
          'Priority': 'default',
          'Tags': 'white_check_mark'
        },
        body: `${booking.nome_cognome} - ${booking.mese_preferito}`
      });
    } catch (error) {
      console.error('Failed to send confirmation notification:', error);
    }
  }
};
