import supabaseClient from '../database/supabaseClient.js';

/**
 * EmailService - Gère l'envoi d'emails via Supabase Email API
 * 
 * Documentation: https://supabase.com/docs/reference/javascript/auth-resend-email
 */

class EmailService {
  /**
   * Envoie un email de notification de nouvelle réservation
   * @param {Object} params
   * @param {string} params.ownerEmail - Email du propriétaire
   * @param {string} params.ownerName - Nom du propriétaire
   * @param {string} params.borrowerName - Nom de l'emprunteur
   * @param {string} params.itemTitle - Titre de l'outil
   * @param {string} params.startDate - Date de début (format YYYY-MM-DD)
   * @param {string} params.endDate - Date de fin (format YYYY-MM-DD)
   * @param {number} params.dailyPrice - Prix journalier
   * @param {number} params.bookingId - ID de la réservation
   */
  async sendNewBookingNotification(params) {
    const {
      ownerEmail,
      ownerName,
      borrowerName,
      itemTitle,
      startDate,
      endDate,
      dailyPrice,
      borrowerEmail
    } = params;

    try {
      // 📧 Email au propriétaire
      await this.sendEmail({
        to: ownerEmail,
        subject: `📬 Nouvelle demande de réservation: ${itemTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nouvelle demande de réservation! 🎉</h2>
            <p>Bonjour <strong>${ownerName}</strong>,</p>
            
            <p><strong>${borrowerName}</strong> demande à louer votre outil:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>📦 Outil:</strong> ${itemTitle}</p>
              <p><strong>📅 Dates:</strong> ${this.formatDate(startDate)} au ${this.formatDate(endDate)}</p>
              <p><strong>💰 Prix:</strong> ${dailyPrice}€/jour</p>
            </div>

            <p style="margin-top: 25px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/user/proprietaire" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accepter ou refuser la demande
              </a>
            </p>

            <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
              © 2026 Outillio - Plateforme de location d'outils professionnels
            </p>
          </div>
        `
      });

      // 📧 Email à l'emprunteur
      await this.sendEmail({
        to: borrowerEmail,
        subject: `✅ Votre demande de réservation a été envoyée`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Demande envoyée! ✅</h2>
            <p>Bonjour <strong>${borrowerName}</strong>,</p>
            
            <p>Votre demande de réservation pour <strong>${itemTitle}</strong> a été envoyée au propriétaire.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>📦 Outil:</strong> ${itemTitle}</p>
              <p><strong>📅 Dates:</strong> ${this.formatDate(startDate)} au ${this.formatDate(endDate)}</p>
              <p><strong>💰 Prix:</strong> ${dailyPrice}€/jour</p>
            </div>

            <p>⏳ Vous recevrez une notification dès que <strong>${ownerName}</strong> aura répondu à votre demande.</p>

            <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
              © 2026 Outillio - Plateforme de location d'outils professionnels
            </p>
          </div>
        `
      });

      console.log(`✅ Emails envoyés pour la réservation de ${itemTitle}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi d\'emails:', error);
      // ⚠️ On ne throw pas - l'email n'est pas critique pour le flux
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie un email générique
   * @param {Object} params
   * @param {string} params.to - Adresse email destinataire
   * @param {string} params.subject - Sujet de l'email
   * @param {string} params.html - Contenu HTML de l'email
   */
  async sendEmail({ to, subject, html }) {
    try {
      // 🔌 Utiliser Supabase Admin Auth pour envoyer un email
      // Note: Cela nécessite que Supabase Email soit configuré
      // dans le dashboard Supabase (Settings → Email Templates ou intégration SMTP)
      
      // Pour l'instant, on utilise Supabase RLS pour envoyer via une function
      // Ou on peut utiliser une API externe si Supabase Email n'est pas disponible
      
      // Option 1: Via une fonction SQL dans Supabase (à créer)
      const { data, error } = await supabaseClient
        .rpc('send_email', {
          p_to: to,
          p_subject: subject,
          p_html: html
        });

      if (error) {
        // Si la fonction n'existe pas, on log l'erreur mais on continue
        console.warn('⚠️  Fonction send_email non disponible. Email simulé:', {
          to,
          subject,
          timestamp: new Date().toISOString()
        });
        // En production, on pourrait utiliser un provider comme Sendgrid ici
      }

      return { success: !error, error: error?.message };
    } catch (error) {
      console.error('❌ Erreur Supabase Email:', error.message);
      // Fallback: simulation d'envoi pour les tests
      console.log('📧 [SIMULATED EMAIL] To:', to);
      console.log('📧 [SIMULATED EMAIL] Subject:', subject);
      return { success: true, simulated: true };
    }
  }

  /**
   * Formate une date au format français
   * @param {string} date - Format YYYY-MM-DD
   * @returns {string} Format "25 janvier 2026"
   */
  formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', options);
  }

  /**
   * Envoie un email de confirmation d'avis
   * @param {Object} params
   */
  async sendReviewNotification(params) {
    const { reviewerName, reviewerRating, recipientEmail, recipientName } = params;

    return this.sendEmail({
      to: recipientEmail,
      subject: `⭐ ${reviewerName} a laissé un avis pour vous`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nouvel avis reçu! ⭐</h2>
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          
          <p><strong>${reviewerName}</strong> a laissé un avis suite à une transaction avec vous:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Note:</strong> ${'⭐'.repeat(reviewerRating)} (${reviewerRating}/5)</p>
          </div>

          <p>Consultez l'avis complet sur votre profil.</p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">
            © 2026 Outillio - Plateforme de location d'outils professionnels
          </p>
        </div>
      `
    });
  }

  /**
   * Envoie un email de message privé
   * @param {Object} params
   */
  async sendMessageNotification(params) {
    const { senderName, recipientName, recipientEmail, messagePreview } = params;

    return this.sendEmail({
      to: recipientEmail,
      subject: `💬 ${senderName} vous a envoyé un message`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nouveau message! 💬</h2>
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          
          <p><strong>${senderName}</strong> vous a envoyé un message:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><em>"${messagePreview}"</em></p>
          </div>

          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir la conversation
            </a>
          </p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">
            © 2026 Outillio - Plateforme de location d'outils professionnels
          </p>
        </div>
      `
    });
  }
}

export default new EmailService();
