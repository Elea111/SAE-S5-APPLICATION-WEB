/**
 * Service pour gérer les paiements Stripe
 * Crée des sessions de checkout et gère les webhooks
 */

import Stripe from 'stripe';

class StripeService {
  constructor() {
    this.stripe = null;
  }

  /**
   * Initialiser Stripe (lazy initialization)
   */
  getStripe() {
    if (!this.stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY not configured. Check .env file.');
      }
      console.log('🔑 Initialisation Stripe avec clé:', secretKey.substring(0, 10) + '...');
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20'
      });
    }
    return this.stripe;
  }


  /**
   * Créer une session Stripe Checkout
   * @param {Object} paymentData - Données du paiement
   * @param {string} paymentData.bookingId - ID de la réservation
   * @param {number} paymentData.amount - Montant en centimes (ex: 2500 = 25.00€)
   * @param {string} paymentData.itemTitle - Titre de l'équipement
   * @param {string} paymentData.itemId - ID de l'équipement
   * @param {string} paymentData.borrowerEmail - Email de l'emprunteur
   * @param {number} paymentData.days - Nombre de jours
   * @returns {Promise<string>} URL de la session Stripe
   */
  async createCheckoutSession(paymentData) {
    const {
      bookingId,
      amount,
      itemTitle,
      itemId,
      borrowerEmail,
      days,
      successUrl = 'http://localhost:3000/paiement/success',
      cancelUrl = 'http://localhost:3000/paiement'
    } = paymentData;

    if (!amount || amount <= 0) {
      throw new Error('Montant invalide');
    }

    try {
      console.log('💳 Création session Stripe pour:', {
        bookingId,
        amount,
        itemTitle,
        borrowerEmail
      });

      const session = await this.getStripe().checkout.sessions.create({
        // Mode de paiement
        payment_method_types: ['card'],
        mode: 'payment',

        // Client
        customer_email: borrowerEmail,

        // Articles
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: itemTitle,
                description: `Location pour ${days} jour(s)`,
                metadata: {
                  itemId,
                  bookingId
                }
              },
              unit_amount: amount // Montant en centimes
            },
            quantity: 1
          }
        ],

        // URLs de redirection
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl,

        // Métadonnées pour tracking
        metadata: {
          bookingId,
          itemId,
          days
        }
      });

      console.log('✅ Session Stripe créée:', session.id);
      return session.url;
    } catch (error) {
      console.error('❌ Erreur création session Stripe:', error);
      throw new Error(`Erreur Stripe: ${error.message}`);
    }
  }

  /**
   * Récupérer les détails d'une session
   * @param {string} sessionId - ID de la session
   * @returns {Promise<Object>} Détails de la session
   */
  async getSession(sessionId) {
    try {
      const session = await this.getStripe().checkout.sessions.retrieve(sessionId);
      console.log('📋 Session récupérée:', session.id);
      return session;
    } catch (error) {
      console.error('❌ Erreur récupération session:', error);
      throw error;
    }
  }

  /**
   * Vérifier le paiement depuis un webhook
   * @param {string} body - Raw body du webhook
   * @param {string} signature - Signature Stripe
   * @returns {Object} Événement Stripe
   */
  constructEvent(body, signature) {
    try {
      const event = this.getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Webhook vérifié:', event.type);
      return event;
    } catch (error) {
      console.error('❌ Erreur vérification webhook:', error);
      throw error;
    }
  }

  /**
   * Créer un remboursement
   * @param {string} paymentIntentId - ID du paiement
   * @param {number} amount - Montant à rembourser (optionnel = entier)
   * @returns {Promise<Object>} Détails du remboursement
   */
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = amount; // En centimes
      }

      const refund = await this.getStripe().refunds.create(refundData);
      console.log('✅ Remboursement créé:', refund.id);
      return refund;
    } catch (error) {
      console.error('❌ Erreur remboursement:', error);
      throw error;
    }
  }

  /**
   * Récupérer un paiement
   * @param {string} paymentIntentId - ID du paiement
   * @returns {Promise<Object>} Détails du paiement
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Erreur récupération paiement:', error);
      throw error;
    }
  }
}

export default new StripeService();
