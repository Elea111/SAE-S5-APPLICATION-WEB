# 📧 IMPLÉMENTATION EMAIL - GUIDE COMPLET

**Date:** 5 février 2026  
**Statut:** ✅ IMPLÉMENTATION COMPLÈTE (POC)

---

## 🎯 OBJECTIF

Envoyer des emails de notification automatiques lors des événements clés de location:
- ✅ Nouvelle demande de réservation (propriétaire + emprunteur)
- ⏳ Acceptation/refus réservation
- ⏳ Rappels avant récupération
- ⏳ Alertes d'avis

---

## 📂 FICHIERS CRÉÉS/MODIFIÉS

### 1. EmailService (`src/infra/services/EmailService.js`)
**Classe:** `EmailService`  
**Responsabilité:** Gérer l'envoi d'emails via Supabase

**Méthodes:**
```javascript
sendNewBookingNotification(params)  // Nouvelle réservation
sendReviewNotification(params)      // Nouvel avis
sendMessageNotification(params)     // Nouveau message
sendEmail({ to, subject, html })   // Générique
```

### 2. Server Update (`src/server/index.js`)
**Changements:**
- ✅ Ajouter import: `import emailService from '../infra/services/EmailService.js'`
- ✅ Modifier POST `/api/bookings` pour déclencher emails en background

**Flow:**
```
POST /api/bookings
  ↓
Créer réservation ✓
  ↓
Déclencher emailService.sendNewBookingNotification() (en background)
  ↓
Répondre au client (ne pas attendre l'email)
  ↓
Envoyer emails au propriétaire + emprunteur
```

### 3. SQL Migration (`supabase/migrations/004_email_function.sql`)
**Fonction créée:** `send_email(p_to, p_subject, p_html)`

**Utilité:** Permet à la fonction SQL Supabase de déclencher l'envoi d'emails

---

## 🔧 CONFIGURATION

### Option 1: Test en Mode Simulation (Actuel ✅)

L'EmailService log les emails en console sans les envoyer réellement:

```
📧 [SIMULATED EMAIL] To: user@example.com
📧 [SIMULATED EMAIL] Subject: Nouvelle demande de réservation
```

**Avantage:** Zéro configuration, parfait pour dev/test  
**Idéal pour:** POC et tests en local

---

### Option 2: Supabase Email (Gratuit, Limité)

Supabase offre un service d'email basic inclus:

**Étapes:**
1. Aller sur [Dashboard Supabase](https://app.supabase.com)
2. Projet → Settings → Email Templates
3. Configurer SMTP ou utiliser Email API
4. Ajouter clés d'API aux variables d'env

**Limites:**
- 50 emails/jour en gratuit
- Branding Supabase
- Pas de templates avancées

---

### Option 3: Sendgrid (Recommandé en Prod ⭐)

**Avantages:**
- 100 emails/jour gratuit
- Templates professionnels
- Analytics détaillées
- Délivrabilité garantie

**Installation:**
```bash
npm install @sendgrid/mail
```

**Modification EmailService:**
```javascript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Dans sendEmail():
await sgMail.send({
  to: to,
  from: 'noreply@outillio.fr',
  subject: subject,
  html: html
})
```

**Setup:**
1. Créer compte [Sendgrid](https://sendgrid.com)
2. Créer API key
3. Ajouter à `.env`: `SENDGRID_API_KEY=sk_...`

---

## 🚀 LANCER LES TESTS

### Test 1: Vérifier que les emails se "envoient"

```bash
# Démarrer l'app
npm start

# Dans autre terminal, créer une réservation:
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -d '{
    "item_id": "item-123",
    "start_date": "2026-02-10",
    "end_date": "2026-02-12"
  }'
```

**Résultat attendu:**
```
✅ Emails envoyés pour la réservation de [outil]
```

### Test 2: Vérifier les logs en console

```
✅ Emails envoyés pour la réservation de Perceuse Bosch
[SIMULATED EMAIL] To: owner@example.com
[SIMULATED EMAIL] To: borrower@example.com
```

### Test 3: Vérifier le contenu HTML

Les emails contiennent:
- ✅ Nom de l'outil
- ✅ Dates de réservation
- ✅ Prix journalier
- ✅ Lien d'action (accepter/refuser ou voir conversation)
- ✅ Design responsive

---

## 📊 STRUCTURE DES EMAILS

### Email au Propriétaire

```
Subject: 📬 Nouvelle demande de réservation: [Outil]

Contenu:
- Titre: "Nouvelle demande de réservation! 🎉"
- Nom de l'emprunteur
- Détails: outil, dates, prix
- Bouton: "Accepter ou refuser la demande"
```

### Email à l'Emprunteur

```
Subject: ✅ Votre demande de réservation a été envoyée

Contenu:
- Titre: "Demande envoyée! ✅"
- Infos réservation
- Message: "Vous recevrez une notification quand le propriétaire aura répondu"
```

---

## 🔄 FLOW COMPLET

```
1. User clique "Réserver"
   ↓
2. POST /api/bookings (avec CSRF token)
   ↓
3. Backend valide + crée réservation en BD
   ↓
4. Déclenche emailService.sendNewBookingNotification()
   ↓
5. EmailService récupère infos:
   - Propriétaire (email, nom)
   - Emprunteur (email, nom)
   - Outil (titre, prix, dates)
   ↓
6. Construit 2 emails HTML (prop + emp)
   ↓
7. Appelle supabaseClient.rpc('send_email')
   ↓
8. [EN PROD] Sendgrid envoie les emails ✉️
   [EN DEV] Simule l'envoi (console log)
   ↓
9. Répond 201 au client (réservation créée) ✓
   (n'attend pas l'email)
```

---

## ✅ CHECKLIST DÉPLOIEMENT

```
☐ EmailService.js créé
☐ Import emailService dans server.js
☐ POST /api/bookings modifié
☐ Migration SQL créée
☐ Tests en local OK (console logs)
☐ Configuration Sendgrid (si mode prod)
☐ Variables d'env (.env) configurées
☐ Les emails se "envoient" (simulés ou vrais)
```

---

## 📝 TEMPLATES À AJOUTER

Pour chaque type d'email, on peut créer des templates HTML améliorés:

**Prochaines évolutions:**
- ⏳ Template acceptation réservation
- ⏳ Template refus réservation
- ⏳ Template nouvel avis
- ⏳ Template nouveau message
- ⏳ Template rappel (24h avant)

---

## 🎨 PERSONNALISATION

### Ajouter le logo Outillio

```html
<img src="https://outillio.com/logo.png" width="200" alt="Outillio">
```

### Changer les couleurs

```html
<!-- Couleur principale: #007bff (bleu) -->
<!-- Couleur succès: #28a745 (vert) -->
<!-- Couleur alert: #ffc107 (orange) -->
```

### Ajouter un footer personnalisé

```html
<footer style="text-align: center; margin-top: 30px; color: #999;">
  <p>© 2026 Outillio - Plateforme de location d'outils professionnels</p>
  <p>
    <a href="https://outillio.com/terms">Conditions</a> | 
    <a href="https://outillio.com/privacy">Confidentialité</a> |
    <a href="https://outillio.com/help">Aide</a>
  </p>
</footer>
```

---

## 🐛 DÉPANNAGE

### "Email n'est pas envoyé"
1. Vérifier les logs en console
2. Vérifier que req.user est bien présent (authentification OK)
3. Vérifier que les infos (propriétaire, emprunteur, outil) sont en BD

### "Erreur: SMTP connection failed"
1. Vérifier que SENDGRID_API_KEY est configuré
2. Vérifier la clé (pas d'espace au début/fin)
3. Tester avec Sendgrid dashboard

### "Template HTML cassé"
1. Ouvrir email dans DevTools (console)
2. Vérifier que tout le HTML est valide
3. Tester sur [mailtrap.io](https://mailtrap.io) (gratuit, pour tester emails)

---

## 📚 RESSOURCES

- [Supabase Email Docs](https://supabase.com/docs/guides/auth/auth-email)
- [Sendgrid Docs](https://docs.sendgrid.com/for-developers/sending-email/api-overview)
- [MJML for Email](https://mjml.io/) (meilleurs templates)

---

**Status:** ✅ Phase 1 (Notification réservation) complètement implémentée  
**Prochaines phases:** Acceptation/refus, rappels, avis, messages
