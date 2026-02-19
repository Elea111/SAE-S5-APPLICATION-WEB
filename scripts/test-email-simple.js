#!/usr/bin/env node

/**
 * Test simple d'envoi d'emails via API
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';

console.log('\n📧 === TEST EMAIL VIA RESEND ===\n');

// ⚠️  IMPORTANT: Resend n'envoie aux autres addresses que si domaine est vérifié
// Pour tester, on DOIT envoyer à l'email admin du compte Resend
const ADMIN_EMAIL = 'okitoemmanuel73@gmail.com'; // L'email admin de ton compte Resend

console.log('📌 Note: Resend envoie les emails de test à l\'email admin seulement');
console.log('   Admin email:', ADMIN_EMAIL, '\n');

// ============= EMAIL 1: NOTIFICATION AU PROPRIÉTAIRE (Demo) =============
console.log('📤 Envoi EMAIL 1 (Notification propriétaire)...\n');

const borrowerName = 'Jean Dupont';
const toolName = 'Perceuse Hitachi 65W';
const startDate = '2026-02-15';
const endDate = '2026-02-18';
const totalPrice = 150;

const ownerHtml = `
<h2>Nouvelle demande de réservation ⚡</h2>
<p>Un utilisateur souhaite emprunter votre outil!</p>
<hr>
<h3>${toolName}</h3>
<p><strong>Emprunteur:</strong> ${borrowerName}</p>
<p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
<p><strong>Total:</strong> <strong>${totalPrice}€</strong></p>
<hr>
<p><a href="http://localhost:3000/bookings">Voir les réservations →</a></p>
`;

const ownerEmailResponse = await fetch(`${API_BASE}/api/test-email-noauth`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: ADMIN_EMAIL,
    subject: '✨ Nouvelle demande de réservation - ' + toolName,
    html: ownerHtml
  })
});

const ownerResult = await ownerEmailResponse.json();
console.log('Response Status:', ownerEmailResponse.status);
console.log('Response:', JSON.stringify(ownerResult, null, 2));

if (ownerEmailResponse.ok) {
  console.log('\n✅ EMAIL 1 ENVOYÉ');
  console.log('   Destination:', ADMIN_EMAIL);
  console.log('   Type: Notification propriétaire');
  console.log('   Resend ID:', ownerResult.resendId);
} else {
  console.log('\n❌ ERREUR EMAIL 1:', ownerResult.message || ownerResult.error);
}

// ============= EMAIL 2: NOTIFICATION À L'EMPRUNTEUR (Demo) =============
console.log('\n\n📤 Envoi EMAIL 2 (Notification emprunteur)...\n');

const ownerName = 'Marie Leclerc';

const borrowerHtml = `
<h2>Réservation confirmée! 🎉</h2>
<p>Votre réservation a été envoyée au propriétaire.</p>
<hr>
<h3>${toolName}</h3>
<p><strong>Propriétaire:</strong> ${ownerName}</p>
<p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
<p><strong>Total:</strong> <strong>${totalPrice}€</strong></p>
<hr>
<p><a href="http://localhost:3000/bookings">Suivre votre réservation →</a></p>
`;

const borrowerEmailResponse = await fetch(`${API_BASE}/api/test-email-noauth`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: ADMIN_EMAIL,
    subject: '✅ Votre réservation a été envoyée',
    html: borrowerHtml
  })
});

const borrowerResult = await borrowerEmailResponse.json();
console.log('Response Status:', borrowerEmailResponse.status);
console.log('Response:', JSON.stringify(borrowerResult, null, 2));

if (borrowerEmailResponse.ok) {
  console.log('\n✅ EMAIL 2 ENVOYÉ');
  console.log('   Destination:', ADMIN_EMAIL);
  console.log('   Type: Notification emprunteur');
  console.log('   Resend ID:', borrowerResult.resendId);
} else {
  console.log('\n❌ ERREUR EMAIL 2:', borrowerResult.message || borrowerResult.error);
}

// ============= RÉSUMÉ =============
console.log('\n' + '='.repeat(60));
console.log('\n📧 RÉSUMÉ DU TEST:\n');
console.log('✉️  Emails de test envoyés à:', ADMIN_EMAIL);
console.log('   Email 1: Notification propriétaire (demo)');
console.log('   Email 2: Notification emprunteur (demo)');
console.log('\n🔍 VÉRIFICATIONS:');
console.log('  1. Ouvre ta boîte mail:', ADMIN_EMAIL);
console.log('  2. Tu dois voir 2 emails avec ces sujets:');
console.log('     - "✨ Nouvelle demande de réservation - Perceuse Hitachi..."');
console.log('     - "✅ Votre réservation a été envoyée"');
console.log('  3. Regarde aussi sur le dashboard Resend: https://resend.com/emails');
console.log('\n💡 INFORMATIONS:');
console.log('  • Resend envoie les mails de test uniquement à l\'email admin du compte');
console.log('  • Pour envoyer à d\'autres adresses, il faut vérifier le domaine (outillio.fr)');
console.log('  • En production, les emails iront aux vrais propriétaires/emprunteurs');
console.log('  • Une fois le domaine vérifié, change le "from" dans EmailService.js');
console.log('    (remplacer onboarding@resend.dev par noreply@outillio.fr)\n');

console.log('='.repeat(60) + '\n');
