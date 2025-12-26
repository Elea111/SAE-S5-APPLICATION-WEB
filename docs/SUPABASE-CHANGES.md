# SUPABASE-CHANGES.md - Évolution complète de l'intégration Supabase

## 📋 Table des matières
1. [Fichiers créés](#fichiers-créés)
2. [Démarche complète](#démarche-complète)
3. [Problèmes rencontrés et solutions](#problèmes-rencontrés-et-solutions)
4. [Historique des changements](#historique-des-changements)
5. [État actuel du projet](#état-actuel-du-projet)
6. [Prochaines étapes](#prochaines-étapes)

---

## Fichiers créés pour l'intégration Supabase

### Infrastructure (Repositories)
- **src/infra/repositories/SupabaseUserRepository.js**  
  Gère la création, la recherche, la mise à jour et la suppression des utilisateurs dans la table `users` de Supabase.
  - `create(userData)` : Crée un nouvel utilisateur
  - `findById(id)` : Récupère un utilisateur par ID
  - `findByEmail(email)` : Récupère un utilisateur par email
  - `update(id, updates)` : Met à jour les données utilisateur
  - `delete(id)` : Supprime un utilisateur

- **src/infra/repositories/SupabaseEquipmentRepository.js**  
  Gère les équipements (CRUD) dans la table `items`.
  - `create(equipmentData)` : Publie un nouvel équipement
  - `findById(id)` : Récupère un équipement
  - `findByUserId(userId)` : Liste les équipements d'un utilisateur
  - `search(filters)` : Recherche avec filtres (titre, prix, disponibilité)
  - `update(id, data)` : Met à jour un équipement
  - `delete(id)` : Supprime une annonce

- **src/infra/repositories/SupabaseBookingRepository.js**  
  Gère les réservations dans la table `bookings`.
  - `create(bookingData)` : Crée une réservation
  - `findById(id)` : Récupère une réservation
  - `findByBorrowerId(userId)` : Liste les réservations d'un emprunteur
  - `findByItemId(itemId)` : Liste les réservations d'un équipement
  - `update(id, data)` : Met à jour le statut d'une réservation
  - `delete(id)` : Annule une réservation

- **src/infra/repositories/SupabasePaymentRepository.js**  
  Gère les paiements dans la table `payments`.
  - `create(paymentData)` : Crée un paiement
  - `findById(id)` : Récupère un paiement
  - `findByBookingId(bookingId)` : Trouve le paiement d'une réservation
  - `findByUserId(userId)` : Liste les paiements d'un utilisateur
  - `update(id, data)` : Met à jour un paiement (statut, remboursement)

- **src/infra/repositories/SupabaseReviewRepository.js**  
  Gère les avis dans la table `reviews`.
  - `create(reviewData)` : Crée un avis
  - `findByTargetUserId(userId)` : Liste les avis reçus par un utilisateur
  - `findByBookingId(bookingId)` : Récupère l'avis d'une réservation

- **src/infra/repositories/SupabaseMessageRepository.js**  
  Gère les messages dans la table `messages`.
  - `create(messageData)` : Envoie un message
  - `findByConversation(userId1, userId2)` : Liste la conversation entre deux utilisateurs
  - `findByReceiverId(receiverId)` : Liste les messages reçus
  - `markAsRead(messageId)` : Marque un message comme lu

### Services d'authentification et validation
- **src/infra/services/JwtService.js**  
  Gère la génération et vérification des JWT.
  - `generateToken(payload, expiresIn)` : Génère un JWT signé (24h par défaut)
  - `verifyToken(token)` : Vérifie et décode un JWT
  - `decodeToken(token)` : Décode sans vérifier la signature

- **src/infra/validation/schemas.js**  
  Définit les schémas Zod pour valider tous les inputs.
  - `RegisterSchema` : Validation inscriptions (email, mot de passe min 6 caractères)
  - `LoginSchema` : Validation connexion
  - `PublishEquipmentSchema` : Validation publication d'équipements
  - `BookEquipmentSchema` : Validation réservations avec vérification date_end > date_start
  - `ProcessPaymentSchema` : Validation paiements
  - `LeaveReviewSchema` : Validation avis (1-5 étoiles)
  - `SendMessageSchema` : Validation messages

### Middlewares
- **src/infra/middleware/authMiddleware.js**  
  Gère l'authentification et extraction du JWT.
  - `authMiddleware` : Vérifie le token et protège les routes
  - `optionalAuthMiddleware` : Charge l'utilisateur s'il existe un token valide

- **src/infra/middleware/validationMiddleware.js**  
  Valide les inputs avec Zod.
  - `validateBody(schema)` : Valide req.body
  - `validateQuery(schema)` : Valide req.query
  - `validateParams(schema)` : Valide req.params

### Usecases adaptés pour Supabase
- **src/domain/usecases/RegisterUser.js**  
  - Utilise SupabaseUserRepository pour créer un utilisateur
  - Hash le mot de passe avec bcryptjs (10 rounds)
  - Génère un JWT automatiquement après inscription
  - **Retour :** `{ id, email, token, isPro, first_name, last_name }`

- **src/domain/usecases/LoginUser.js**  
  - Récupère l'utilisateur via findByEmail
  - Vérifie le hash du mot de passe avec bcryptjs.compare()
  - Génère un JWT avec les informations utilisateur
  - **Retour :** `{ id, email, token, isPro, first_name, last_name }`

- **src/domain/usecases/PublishEquipment.js**  
  - Crée un équipement dans Supabase
  - Accepte soit `ownerId` soit `user_id`
  - Ajoute un `created_at` automatique

- **src/domain/usecases/SearchEquipment.js**  
  - Recherche avec filtres (titre, catégorie, prix, disponibilité)

- **src/domain/usecases/BookEquipment.js**  
  - Crée une réservation
  - Vérifie que la date de fin > date de début (validation Zod)

- **src/domain/usecases/ProcessPayment.js**  
  - Crée un paiement associé à une réservation

- **src/domain/usecases/LeaveReview.js**  
  - Crée un avis pour une réservation

- **src/domain/usecases/SendMessage.js**  
  - Envoie un message entre deux utilisateurs

### Configuration et Bootstrap
- **src/boot/di.js**  
  Injecte tous les repositories Supabase dans les usecases.

- **src/config/env.js**  
  Charge les variables d'environnement avec dotenv en premier.

- **src/infra/database/supabaseClient.js**  
  Initialise le client Supabase avec la service_role key.

### Pages Frontend (React)
- **src/pages/inscription/Inscription.jsx**  
  - Formulaire d'inscription avec validation côté frontend
  - Sauvegarde du token et des données utilisateur en localStorage
  - Redirection automatique vers `/profil` après inscription
  - Données sauvegardées : `userId`, `id`, `token`, `email`, `isPro`, `first_name`, `last_name`

- **src/pages/connexion/Connexion.jsx**  
  - Formulaire de connexion avec validation email/password
  - Récupération du token depuis l'API backend
  - Sauvegarde identique au format inscription pour cohérence
  - Redirection vers `/profil` après connexion réussie

- **src/pages/profil-proprietaire/ProfilProprietaire.jsx**  
  - Affiche le profil complet si utilisateur connecté
  - Affiche une page "démo" si pas connecté
  - Gestion de l'édition du profil (prénom, nom, téléphone, adresse)
  - Upload d'avatar (localisation ou Supabase Storage)
  - Affichage des avis et annonces
  - Fallback gracieux si le fetch échoue (utilise localStorage comme source de vérité)

- **src/components/layout/header/Header.jsx**  
  - Détecte l'authentification via localStorage
  - Accepte à la fois `userId` et `id` pour compatibilité
  - Affiche le nom de l'utilisateur et avatar en haut à droite
  - Boutons "Déconnexion" quand connecté
  - Boutons "Inscription/Connexion" quand déconnecté

### Serveur Express
- **src/server/index.js**  
  Endpoints REST avec validation et authentification.
  - Charge `config/env.js` EN PREMIER (avant tous les imports)
  - Middleware CORS activé
  - Middleware optionalAuthMiddleware appliqué globalement
  - POST `/api/register` - Retourne `{ id, email, token, isPro, first_name, last_name, avatar_url }`
  - POST `/api/login` - Retourne `{ id, email, token, isPro, first_name, last_name, avatar_url }`
  - GET `/api/users/:id` - Récupérer profil (protégé)
  - PATCH `/api/users/:id` - Modifier profil (protégé)
  - GET `/api/users/:id/payments` - Mes paiements (protégé)
  - GET `/api/users/:id/reviews` - Mes avis (protégé)
  - POST `/api/equipments` - Publier un équipement (protégé)
  - GET `/api/equipments/:id` - Détail équipement (public)
  - GET `/api/equipments` - Recherche équipements (public)
  - POST `/api/bookings` - Créer réservation (protégé)
  - PATCH `/api/bookings/:id` - Modifier réservation (protégé)
  - POST `/api/payments` - Créer paiement (protégé)
  - POST `/api/reviews` - Laisser avis (protégé)
  - POST `/api/messages` - Envoyer message (protégé)
  - GET `/api/messages` - Récupérer conversation (protégé)

---

## Démarche complète

### 1️⃣ Création des tables Supabase
- Créer un projet Supabase
- Exécuter le schéma SQL (`databasePostgreSQL.sql`) dans SQL Editor
- Désactiver RLS sur toutes les tables (développement)
- Récupérer les clés API :
  - **Frontend :** `REACT_APP_SUPABASE_URL` + `REACT_APP_SUPABASE_ANON_KEY` (Publishable key)
  - **Backend :** `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (Secret key)

### 2️⃣ Configuration du projet
- Créer `.env` avec les bonnes clés
- Installer dépendances essentielles
- Créer `src/config/env.js` pour charger dotenv
- Mettre à jour `src/server/index.js` pour importer `config/env.js` EN PREMIER

### 3️⃣ Création des repositories Supabase
- Chaque repository gère une table
- Gestion robuste des erreurs Supabase
- Méthodes CRUD simples et cohérentes

### 4️⃣ Implémentation de l'authentification JWT
- JwtService génère les tokens (24h expiration)
- Middleware authMiddleware protège les routes
- RegisterUser et LoginUser retournent le token + données utilisateur

### 5️⃣ Validation avec Zod
- Schémas définis pour chaque endpoint
- Middlewares validateBody, validateQuery, validateParams
- Messages d'erreur clairs avec détails des champs

### 6️⃣ Endpoints REST avec Express
- CORS configuré pour localhost:3000
- Authentification obligatoire sur les endpoints sensibles
- Validation automatique des inputs
- Gestion d'erreur cohérente (retour JSON systématique)

### 7️⃣ Pages Frontend React
- Formulaires d'inscription et connexion
- Sauvegarde localStorage cohérente (userId + id pour compatibilité)
- Profil avec affichage conditionnel (démo si déconnecté, complet si connecté)
- Header qui détecte l'authentification et affiche le bon state

---

## Problèmes rencontrés et solutions

### ❌ Problème 1 : Variables d'env non chargées
**Symptôme :** `Error: JWT_SECRET not defined in .env`

**Cause :** Les services/repositories importaient les variables avant que dotenv.config() soit appelé.

**Solution :** 
- Créer `src/config/env.js` qui charge dotenv en premier
- L'importer en PREMIER dans `src/server/index.js` AVANT tous les autres imports

### ❌ Problème 2 : Clés Supabase invalides
**Symptôme :** `Invalid API key` en enregistrant

**Cause :** Utilisation des legacy JWT keys (format ancien) au lieu des nouvelles API Keys.

**Solution :** 
- Utiliser les **Publishable/Secret API Keys** modernes (`sb_publishable_xxx` / `sb_secret_xxx`)

### ❌ Problème 3 : Webpack + Node.js v25 incompatibilité
**Symptôme :** `error:0308010C:digital envelope routines::unsupported`

**Cause :** Node.js v25 a changé les routines OpenSSL, webpack v4 ne les supporte pas.

**Solution :** 
- Ajouter le flag `--openssl-legacy-provider` au script npm start
- Mise à jour package.json : `"start": "cross-env NODE_OPTIONS='--openssl-legacy-provider --localstorage-file=./.localstorage' react-scripts start"`

### ❌ Problème 4 : localStorage + webpack
**Symptôme :** `SecurityError: Cannot initialize local storage without a --localstorage-file path`

**Cause :** HtmlWebpackPlugin essayait d'accéder à localStorage pendant la compilation.

**Solution :** 
- Ajouter le flag `--localstorage-file=./.localstorage` au script npm start

### ❌ Problème 5 : CORS bloquant les requêtes
**Symptôme :** `Access to fetch at 'http://localhost:4000/api/register' has been blocked by CORS policy`

**Cause :** Le serveur backend ne retournait pas les bons headers CORS.

**Solution :** 
- Configurer le middleware CORS dans Express avec les bons headers
- Vérifier que `Access-Control-Allow-Origin: http://localhost:3000` est présent
- Gérer les requêtes OPTIONS (preflight)

### ❌ Problème 6 : Incohérence localStorage (userId vs id)
**Symptôme :** Parfois `auth.userId` undefined, parfois `auth.id` undefined

**Cause :** Inscription sauvegardait `userId`, connexion sauvegardait `id` - pas de cohérence.

**Solution :** 
- Sauvegarder TOUJOURS les deux : `{ userId: data.id, id: data.id, token, email, ... }`
- Header accepte les deux formats : `const userId = auth.userId || auth.id`
- ProfilProprietaire accepte les deux formats : `const userId = auth.userId || auth.id`

### ❌ Problème 7 : Endpoint /api/login ne retourne pas les données
**Symptôme :** `Failed to parse URL from /api/login` + Erreur 401

**Cause :** Le endpoint retournait mal formé ou manquaient les champs `first_name`, `last_name`

**Solution :** 
- Mettre à jour l'endpoint pour retourner : `{ id, email, token, isPro, first_name, last_name, avatar_url }`
- Utiliser le repository pour récupérer les données complètes de l'utilisateur
- Gérer les erreurs avec des messages clairs

### ❌ Problème 8 : ProfilProprietaire affiche "Profil démo" même si connecté
**Symptôme :** Page vide après connexion / redirection vers page démo

**Cause :** `userData === null` au premier render (état initial)

**Solution :** 
- Vérifier le localStorage AVANT de fixer `userData` à null
- Ajouter un fallback gracieux : si fetch échoue, utiliser les données localStorage
- Afficher la page démo SEULEMENT si `userData === null` ET pas d'auth dans localStorage

### ❌ Problème 9 : jsonwebtoken + bcryptjs importés en frontend
**Symptôme :** `Module not found: Error: Can't resolve 'crypto'` (webpack error)

**Cause :** Ces packages Node.js ne fonctionnent pas en frontend (dépendent de modules Node.js).

**Solution :** 
- Supprimer `jsonwebtoken` et `bcryptjs` des dépendances React
- Garder ces packages SEULEMENT pour le backend Node.js
- Faire confiance à l'API pour valider et hasher les données

### ❌ Problème 10 : "type": "module" dans package.json cassait craco
**Symptôme :** `SyntaxError: Unexpected token '{'` dans craco.config.js

**Cause :** React-scripts ne supporte pas les modules ES6, craco attend CommonJS.

**Solution :** 
- Retirer `"type": "module"` de package.json
- Laisser `"type": "module"` SEULEMENT pour le backend dans un package.json séparé
- Utiliser `craco.config.cjs` pour la configuration

---

## Historique des changements

### Sprint 1 : Configuration de base ✅
- ✅ Création des repositories Supabase (User, Equipment, Booking, Payment, Review, Message)
- ✅ Bootstrap DI avec tous les repositories
- ✅ Adaptation des usecases RegisterUser et LoginUser
- ✅ Mise à jour du serveur Express

### Sprint 2 : Authentification JWT ✅
- ✅ JwtService pour générer/vérifier les tokens
- ✅ authMiddleware et optionalAuthMiddleware
- ✅ RegisterUser et LoginUser retournent un JWT
- ✅ Protection des routes sensibles

### Sprint 3 : Validation des inputs ✅
- ✅ Schémas Zod pour tous les endpoints
- ✅ Middlewares validateBody, validateQuery, validateParams
- ✅ Messages d'erreur clairs et structurés
- ✅ Tests des schémas Zod

### Sprint 4 : Frontend React - Inscription/Connexion ✅
- ✅ Page d'inscription avec formulaire complet
- ✅ Page de connexion avec eye toggle password
- ✅ Sauvegarde localStorage cohérente (userId + id)
- ✅ Redirection automatique vers /profil après success
- ✅ Gestion des erreurs avec messages d'affichage

### Sprint 5 : Frontend React - Profil ✅
- ✅ Page de profil avec condition (démo si déconnecté, complet si connecté)
- ✅ Affichage des données utilisateur depuis Supabase
- ✅ Édition du profil (prénom, nom, téléphone, adresse)
- ✅ Upload d'avatar avec preview
- ✅ Fallback gracieux si API échoue (utilise localStorage)
- ✅ Affichage des avis et statistiques
- ✅ Boutons de navigation (Chercher, Proposer, Messages, Déconnexion)

### Sprint 6 : Frontend React - Header ✅
- ✅ Détection automatique de l'authentification
- ✅ Affichage du nom et avatar si connecté
- ✅ Boutons contextuels (Messages, Paramètres, Déconnexion)
- ✅ Compatibilité userId vs id
- ✅ Navigation vers les pages essentielles

### Sprint 7 : Bug Fixes & Corrections ✅
- ✅ Fix webpack + Node.js v25 (--openssl-legacy-provider)
- ✅ Fix localStorage + webpack (--localstorage-file)
- ✅ Fix CORS (headers + preflight)
- ✅ Fix incohérence localStorage (userId vs id)
- ✅ Fix endpoint /api/login (retour données complètes)
- ✅ Fix ProfilProprietaire (page démo vs page complète)
- ✅ Suppression jsonwebtoken/bcryptjs du frontend

### Sprint 8 : Tests et documentation ✅
- ✅ Tests Supertest (api.integration.test.js)
- ✅ Tests manuels Node.js (scripts/test-manual.js)
- ✅ Client HTML/JS pour tester visuellement (test-client.html)
- ✅ Documentation SUPABASE-CHANGES.md (ce fichier!)

---

## État actuel du projet

### ✅ Fonctionnalités implémentées

**Authentification (100% fonctionnelle)**
- ✅ Inscription : formulaire → validation → création user → JWT → redirection profil
- ✅ Connexion : email/password → vérification → JWT → redirection profil
- ✅ Persistance : localStorage avec userId + id + token
- ✅ Déconnexion : efface localStorage → redirection accueil

**Profil utilisateur (95% fonctionnel)**
- ✅ Affichage profil complet si connecté
- ✅ Affichage page "démo" si déconnecté
- ✅ Édition du profil (prénom, nom, téléphone, adresse)
- ✅ Upload avatar avec preview
- ✅ Fallback si API échoue
- ⚠️ Upload avatar vers Supabase Storage (pas encore implémenté)

**Endpoints REST (16 endpoints)**
- ✅ POST `/api/register` - Inscription
- ✅ POST `/api/login` - Connexion
- ✅ GET `/api/users/:id` - Récupérer profil
- ✅ PATCH `/api/users/:id` - Modifier profil
- ✅ GET `/api/users/:id/payments` - Mes paiements
- ✅ GET `/api/users/:id/reviews` - Mes avis
- ✅ POST `/api/equipments` - Publier équipement
- ✅ GET `/api/equipments/:id` - Détail équipement
- ✅ GET `/api/equipments` - Recherche
- ✅ POST `/api/bookings` - Créer réservation
- ✅ PATCH `/api/bookings/:id` - Modifier réservation
- ✅ POST `/api/payments` - Créer paiement
- ✅ POST `/api/reviews` - Laisser avis
- ✅ POST `/api/messages` - Envoyer message
- ✅ GET `/api/messages` - Récupérer conversation
- ✅ GET `/api/health` - Health check

**Frontend React**
- ✅ Page accueil avec bannière
- ✅ Page inscription fonctionnelle
- ✅ Page connexion fonctionnelle
- ✅ Page profil fonctionnelle
- ✅ Header avec détection auth
- ✅ Footer
- ⚠️ Pages publication équipement (structure ok, intégration à finir)
- ⚠️ Pages réservation (structure ok, intégration à finir)
- ⚠️ Pages paiement (structure ok, intégration à finir)

**Base de données Supabase**
- ✅ 10 tables créées (users, items, bookings, payments, reviews, messages, etc.)
- ✅ RLS désactivé (développement)
- ✅ Clés API configurées
- ✅ Données test présentes

---

## Prochaines étapes

### Immédiat (cette semaine)
- [ ] Upload d'images Supabase Storage (avatars + photos équipements)
- [ ] Finaliser la page de publication d'équipement
- [ ] Finaliser la page de réservation
- [ ] Finaliser la page de paiement
- [ ] Pagination sur `/api/equipments` et `/api/messages`

### Court terme (2 prochaines semaines)
- [ ] Recherche avancée avec filtres complexes
- [ ] Géolocalisation (distance entre utilisateurs)
- [ ] Tri par popularité/prix/date
- [ ] Système de messagerie temps réel
- [ ] Tests E2E avec Cypress

### Moyen terme (1 mois)
- [ ] RLS policies pour la prod
- [ ] Intégration Stripe réelle (au lieu du mock)
- [ ] Webhooks Supabase pour emails
- [ ] Realtime messages avec Supabase Realtime
- [ ] Notifications push

### Production
- [ ] Déployer frontend (Vercel)
- [ ] Déployer backend (Railway/Render)
- [ ] Activer RLS
- [ ] Certificats SSL/TLS
- [ ] Monitoring et logs
- [ ] Backup automatique Supabase

---

## Comment contribuer

Pour tout changement dans l'intégration Supabase :
1. Documenter le problème rencontré (si applicable)
2. Documenter la solution implémentée
3. Mettre à jour la section "Historique des changements"
4. Ajouter des tests si possible
5. Tester avec les deux serveurs : backend + frontend

---

**Dernière mise à jour :** 2025-12-26 (Sprint 8)  
**Responsable :** Équipe Outillio  
**État :** ✅ **Authentification 100% fonctionnelle - Prêt pour les prochaines fonctionnalités**
