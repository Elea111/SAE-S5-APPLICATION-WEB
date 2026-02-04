# 📋 CAHIER DES CHARGES - SAé S6
## Outillio - Maintenance & Évolutions Logicielles

**Date:** 22 janvier 2026  
**Équipe:** Emmanuel, Leona, Romain, Éléa  
**Durée:** 4 semaines (23 jan - 20 fév 2026)

---

## PARTIE 1: RÉSUMÉ DE LA SAé S5

### 1.1 Cahier des Charges Initial S5

**Objectif Global:**
Développer une plateforme de location d'équipements professionnels entre artisans/PME/indépendants pour promouvoir l'économie circulaire et réduire les coûts d'accès aux outils.

**Public Cible:**
- Artisans, auto-entrepreneurs, TPE/PME, indépendants (B2B)
- Exemples: menuisiers, graphistes, plombiers, paysagistes

**Trois Piliers:**
1. 💰 **Économique:** Rentabiliser équipements inutilisés, accès à moindre coût
2. 🌍 **Écologique:** Réduire surproduction/déchets, empreinte carbone
3. 👥 **Social:** Créer réseau d'entraide entre professionnels locaux

**Fonctionnalités MVP (Prioritaires):**
- ✅ Inscription/Authentification utilisateur
- ✅ Publication d'annonces d'outils (titre, prix, description, photos)
- ✅ Recherche avancée (catégorie, localisation, disponibilités)
- ✅ Système de réservation avec demandes d'acceptation/refus
- ✅ Paiement en ligne sécurisé (Stripe)
- ✅ Messagerie interne entre utilisateurs
- ✅ Gestion des réservations avec timeline (Créée → Acceptée → Remise → Retour → Confirmé)
- ✅ Système de notation et avis (les deux rôles peuvent noter)
- ✅ Profil utilisateur avec outils publiés et historique réservations

**Stack Technique S5:**
- **Frontend:** React.js 18 (Hooks, responsive, mobile-first)
- **Backend:** Node.js + Express.js
- **Base de données:** PostgreSQL (Supabase)
- **Paiements:** Stripe API
- **Authentification:** JWT custom
- **Validation:** Zod
- **Déploiement:** Vercel (frontend) + Render/Railway (backend)
- **Architecture:** Domain-Driven Design (usecases, entities, repositories, adapters)

---

### 1.2 Ce qui a été Réalisé en S5

**Frontend (React):**
- ✅ Pages: Login, Inscription, Accueil, Recherche, Détails équipement, Publication, Profil propriétaire, Réservations, Paiement, Avis
- ✅ Composants réutilisables (Header, Footer, Layout)
- ✅ Gestion d'état (localStorage pour auth, state pour données)
- ✅ Upload fichiers (avatars, photos équipements) vers Supabase Storage
- ✅ Modal de réservation avec sélection dates
- ✅ Timeline visuelle des statuts de réservation
- ✅ Système de filtrage avancé (catégorie, localisation, prix)
- ✅ Design responsive (mobile, tablet, desktop)

**Backend (Node.js/Express):**
- ✅ 20+ endpoints REST (/api/login, /api/register, /api/bookings, /api/payments, etc.)
- ✅ Authentification JWT (génération et validation tokens)
- ✅ Middleware d'authentification et validation (Zod)
- ✅ Intégration Stripe (création sessions checkout, webhooks)
- ✅ Gestion des réservations avec transitions de statut
- ✅ Système de messages entre utilisateurs
- ✅ Calcul automatique des prix (jours × prix journalier + caution)
- ✅ Logs détaillés pour debugging

**Base de Données:**
- ✅ Tables: users, items, bookings, messages, reviews, payments
- ✅ Relations appropriées et contraintes
- ✅ Index de performance
- ✅ RLS (Row-Level Security) partiellement implémenté

**Architecture:**
- ✅ Séparation Domain (logique métier) / Infra (technique)
- ✅ UseCases: RegisterUser, LoginUser, PublishEquipment, BookEquipment, LeaveReview, ProcessPayment
- ✅ Repositories pour abstraction BD
- ✅ Services (StripeService, StorageService)
- ✅ Middleware d'authentification et validation

**Tests & Documentation:**
- ✅ Tests unitaires (Jest) pour usecases et validation
- ✅ README avec instructions de setup
- ✅ Architecture.md documentant la structure
- ✅ Commentaires dans le code

**Déploiement:**
- ✅ Build optimisé (109KB JS gzippé)
- ✅ Prêt pour production
- ✅ Variables d'env configurées

---

## PARTIE 2: ÉVOLUTIONS PROPOSÉES POUR S6

### 2.1 Évolution Fonctionnelle: Système de Notifications par Email

**Objectif:**
Permettre aux utilisateurs de recevoir des notifications par email pour les événements importants du cycle de location, sans avoir besoin de se connecter constamment.

**Justification:**
- 🎯 **Engagement:** Les utilisateurs sont avertis immédiatement des actions importantes (acceptation réservation, rappels, etc.)
- 🎯 **Confiance:** Les propriétaires savent que leurs demandes ne seront pas oubliées
- 🎯 **UX:** Réduit la surcharge cognitive (check l'app) en envoyant des alertes proactives
- 🎯 **Fidélité:** Les notifications augmentent la rétention utilisateurs

**Fonctionnalités à Implémenter:**

1. **Email de confirmation d'inscription**
   - Bienvenue + lien "confirmer email"
   - Template HTML professionnel

2. **Notifications de réservation**
   - 📧 Propriétaire reçoit: "Nouvelle demande de réservation de Marc pour X du 23-25 jan"
   - 📧 Emprunteur reçoit confirmation d'envoi de demande

3. **Acceptation/Refus réservation**
   - 📧 Propriétaire confirme: "Vous avez accepté la réservation de Marc"
   - 📧 Emprunteur notifié: "Votre réservation a été acceptée ✅"

4. **Rappels avant prise en charge**
   - 📧 24h avant: "Rappel: récupération demain à 10h"

5. **Notifications de retour**
   - 📧 "L'outil a été retourné et confirmé en bon état"

6. **Alertes d'avis**
   - 📧 "Marc a laissé un avis ⭐⭐⭐⭐ sur votre transaction"

**Stack Technique:**
- Service d'email: Sendgrid ou Nodemailer (SMTP)
- Templates HTML avec variabilisation (prénom, dates, prix)
- Queue de jobs (Bull queue) pour envois asynchrones
- Logs d'envois pour audit

**Architecture:**
```
booking.update(status) 
  → Trigger événement
    → EmailService.sendBookingAccepted(user, booking)
      → Queue job
        → Sendgrid API
          → ✉️ Email utilisateur
```

**Critères de Succès:**
- ✅ 100% des événements importants génèrent un email
- ✅ Emails reçus en < 2 secondes
- ✅ Templates professionnels et responsive
- ✅ Taux de délivrabilité > 95%

---

### 2.2 Évolution Sécurité: Authentification OAuth2/SSO

**Objectif:**
Remplacer l'authentification JWT custom par une solution OAuth2 plus sécurisée et permettre aux utilisateurs de se connecter avec leurs comptes Google/GitHub.

**Justification:**
- 🔒 **Sécurité:** OAuth2 est un standard éprouvé, mieux que JWT custom maison
- 🔒 **Protection tokens:** Les tokens sont gérés par un tiers de confiance (Google/GitHub), pas stockés en localStorage
- 🔒 **2FA gratuit:** Google/GitHub gère la double authentification
- 🎯 **UX:** Les utilisateurs n'ont pas besoin de créer un nouveau mot de passe
- 🎯 **Compliance:** Conforme aux standards OWASP

**Vulnérabilités Actuelles à Corriger:**

1. **JWT stocké en localStorage** 
   - ❌ Vulnérable au XSS
   - ✅ Solution: Ajouter httpOnly cookie + refresh token

2. **Pas de rate limiting**
   - ❌ Attaques brute-force sur login possibles
   - ✅ Solution: Limiter 5 tentatives/5min par IP

3. **Pas de CSRF protection**
   - ❌ Requêtes cross-site peuvent modifier réservations
   - ✅ Solution: CSRF tokens

4. **Exposition de données sensibles**
   - ❌ API retourne password_hash parfois
   - ✅ Solution: Ne jamais exposer données sensibles

5. **Pas de validation stricte des entrées**
   - ❌ Possible injection
   - ✅ Solution: Valider avec Zod (déjà en place ✅)

**Fonctionnalités OAuth2:**

1. **Login Google**
   - Redirection vers consentement Google
   - Récupération email + profil
   - Création utilisateur Outillio si nouveau
   - Connexion automatique

2. **Login GitHub**
   - Même flow que Google
   - Récupération email + avatar GitHub

3. **Linking comptes**
   - Utilisateur existant peut lier Google/GitHub à son compte
   - Connexion future possible par n'importe quelle méthode

4. **Logout propre**
   - Revoke du token OAuth
   - Suppression refresh token

**Stack Technique:**
- Provider OAuth: Google (OAuth 2.0) + GitHub (OAuth 2.0)
- Librairie: passport.js ou NextAuth.js
- Tokens: Access token (court) + Refresh token (long, httpOnly)
- Storage: Refresh token en httpOnly cookie (sécurisé)

**Architecture:**
```
Login button "Sign in with Google"
  ↓
Google consent screen
  ↓
Redirect + auth code
  ↓
Backend échange code → Access token
  ↓
Récupère profil utilisateur
  ↓
Crée/met à jour user Outillio
  ↓
Émet access + refresh token
  ↓
Frontend connecté ✅
```

**Audit Sécurité Supplémentaire:**
- 🔍 SonarQube scan (code review statique)
- 🔍 OWASP ZAP pentest (détection automatique vulnérabilités)
- 🔍 Valider contre Top 10 OWASP

**Critères de Succès:**
- ✅ OAuth2 implementé et fonctionnel (Google + GitHub)
- ✅ 5 vulnérabilités corrigées minimum
- ✅ Rate limiting actif
- ✅ CSRF protection implémentée
- ✅ Score SonarQube A
- ✅ Pas de vulnérabilité OWASP détectée

---

### 2.3 Intégration IA: Chatbot Support Client

**Objectif:**
Intégrer un chatbot IA pour supporter les utilisateurs 24/7, répondre aux questions fréquentes et améliorer l'accessibilité.

**Justification:**
- 🤖 **UX:** Support immédiat sans attendre un humain
- 🤖 **Coûts:** Réduit besoin d'équipe support manuelle
- 🤖 **Accessibilité:** Les questions peuvent être posées en langage naturel (pas besoin de formulaires)
- 🤖 **Apprentissage:** Utiliser une IA moderne (Claude/GPT) pour résoudre un vrai problème business
- 🤖 **Engagement:** Users se sentent écoutés et aidés

**Use Cases du Chatbot:**

1. **Aide à la recherche**
   - User: "Je dois percer du béton pour 2 jours"
   - Chatbot: "Je vous recommande une perceuse-burineur. Voici les options à X km"

2. **FAQ automatique**
   - "Comment ça marche les réservations?"
   - "Comment je paie?"
   - "Que faire si l'outil est endommagé?"

3. **Aide publication outil**
   - "Quel prix je dois demander pour ma scie circulaire?"
   - Chatbot analyse marché + recommande prix

4. **Suivi de réservation**
   - "Où en est ma réservation?"
   - Chatbot: "Elle a été acceptée, remise confirmée pour samedi 10h"

5. **Dispute/Problème**
   - "L'outil que j'ai reçu est cassé"
   - Chatbot dirige vers support humain + remonte ticket

**Stack Technique:**
- Modèle IA: Claude 3 API (Anthropic) ou GPT-4 (OpenAI)
- Framework: Langchain (orchestration IA)
- Memory: Historique conversation pour contexte
- Intégration: Widget chat dans coin de l'écran

**Architecture:**
```
User pose question dans chat widget
  ↓
Envoi au backend
  ↓
Backend → Claude API (prompt contextualisé)
  ↓
Claude répond
  ↓
Backend → Frontend (afficher réponse)
  ↓
User lit réponse en temps réel
```

**Prompt du Chatbot:**
```
"Tu es un assistant support pour Outillio, plateforme de location d'outils.
Tu connais:
- Comment fonctionne les réservations
- Les prix et conditions
- Les politiques d'utilisation
- FAQ complète

Réponds en français, simplement, et propose des actions (ex: 'Voulez-vous contacter support?')"
```

**Apprentissage Continu:**
- 📚 Entraîner le modèle sur FAQ Outillio
- 📚 Logs des conversations pour améliorer

**Critères de Succès:**
- ✅ Chatbot répond correctement 90% des questions
- ✅ Temps de réponse < 2 secondes
- ✅ Accessible sur mobile et desktop
- ✅ Peut transitionner vers support humain
- ✅ Logs de conversation pour amélioration

---

## RÉSUMÉ DES LIVRABLES S6

### Avant 20 février 23h59:

1. **Rapport écrit S6** (10-15 pages):
   - Description existant (architecture, schémas UML)
   - Maintenances détaillées (code snippets, design decisions)
   - Organisation équipe + calendrier réalisation
   - Tests et résultats

2. **Code source complet:**
   - Branche `develop` avec toutes les évolutions
   - Commits clairs et commentés

3. **Support de présentation orale** (diapos):
   - Résumé des 3 évolutions
   - Démo live si possible
   - Résultats/métriques

4. **Documentation:**
   - README mis à jour
   - API documentation mise à jour
   - Setup instructions pour nouveau dev

---

## CALENDRIER DE RÉALISATION

| Semaine | Tâches |
|---|---|
| **1 (23-29 jan)** | Setup branches / Authentification OAuth2 |
| **2 (30 jan - 5 fév)** | OAuth2 finalisé + Audit sécurité avec SonarQube |
| **3 (6-12 fév)** | Chatbot Claude API + Tests intégration |
| **4 (13-19 fév)** | Notifications email + Finalisation + Tests complets |
| **20 fév** | 🎤 Soutenance |

---

## CRITÈRES D'ACCEPTATION GLOBAL

- ✅ Notifications email: 100% fonctionnel, tous événements couverts
- ✅ OAuth2/Sécurité: 5+ vulnérabilités corrigées, score SonarQube A
- ✅ Chatbot: 90% taux de succès, intégré dans UI
- ✅ Code: Clean, commenté, testé
- ✅ Documentation: Complète et à jour
- ✅ Déploiement: Fonctionnel en production

---

**Préparé par:** Emmanuel, Leona, Romain, Éléa  
**Date:** 22 janvier 2026  
**Signature:** ________________
