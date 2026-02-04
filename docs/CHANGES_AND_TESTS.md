# Changes, New Tests & How to run them 

Ce document décrit précisément les fichiers ajoutés/modifiés récemment, la raison de chaque changement, et comment valider le comportement en local.

## Raison générale
Objectif : rendre l'application entièrement fonctionnelle en mode "mock" pour valider le flux principal (inscription, connexion, publication, recherche, réservation, paiement simulé, messagerie) avant d'intégrer Stripe réel et une base Postgres/Supabase.

---

## 1) Corrections Frontend
- src/pages/inscription/Inscription.jsx
  - Type : Modification (correction)
  - Raison : Le formulaire appelait deux fois /api/register (via RegisterUser + fetch manuelle) et ne stockait pas toujours correctement l'auth. J'ai supprimé le double POST et maintenant on utilise uniquement RegisterUser, on récupère l'id retourné et on stocke `localStorage.auth`. Cela corrige le comportement "rien ne se passe" après soumission.

- src/pages/inscription/Inscription.css
  - Type : Création / Amélioration visuelle
  - Raison : Les labels radio pour le rôle (Pro / Particulier) étaient en texte blanc sur fond clair -> illisibles. J'ai forcé la couleur noire pour assurer lisibilité.

---

## 2) Tests React (RTL)
Ajout des tests frontend pour vérifier l'interaction utilisateur avec les composants principaux.

- src/tests/frontend/Inscription.test.jsx
  - Type : Création (test)
  - Raison : Vérifier que le formulaire d'inscription appelle l'API mock (via RegisterUser), écrit l'item `auth` en localStorage et redirige vers /profil.

- src/tests/frontend/Connexion.test.jsx
  - Type : Création (test)
  - Raison : Vérifier que le formulaire de connexion appelle /api/login, stocke token/user en localStorage et redirige.

- src/tests/frontend/Schedule.test.jsx
  - Type : Création (test)
  - Raison : Vérifier le flux client Schedule : chargement équipement, sélection de dates, création booking puis paiement via API mock.

Notes tests:
- Les tests mockent global.fetch pour simuler les réponses du serveur.
- setupTests.js fournit un mock global.fetch par défaut, mais chaque test redéfinit la réponse nécessaire.

---

## 3) Tests d'intégration existants
- src/tests/flow-auth/registerAndLogin.test.js (Supertest)
  - Type : Création (test d'intégration)
  - Raison : Valide register+login contre le serveur mock Express.

- src/tests/flow-platform/bookingMessageFlow.test.js (Supertest)
  - Type : Création (test d'intégration)
  - Raison : Valide publish equipment, booking, payment mock, messages.

---

## 4) Autres fichiers d'infrastructure (rappel)
- Plusieurs repositories in-memory, mock Stripe, adapter StripePaymentAdapter, bootstrap DI, serveur Express mock ont été ajoutés pour permettre le fonctionnement complet en local (voir docs/INFRA_ADDED.md pour liste complète et raisons).

---

## 5) Comment exécuter localement (ordre recommandé)
1. Installer dépendances :
   - npm install
   - npm install --save-dev supertest @testing-library/react @testing-library/jest-dom @testing-library/user-event

2. Lancer le serveur mock (optionnel pour tests unitaires locaux) :
   - node src/server/index.js
   - le serveur écoute par défaut sur le port 4000 (si NODE_ENV !== 'test').

3. Lancer tests backend/integration (Supertest) :
   - npm test (Jest exécutera tous les tests, y compris supertest)
   - pour n'exécuter que les tests d'intégration : npx jest src/tests/flow-platform --runInBand

4. Lancer tests frontend (RTL) :
   - npm test (Jest détecte les tests frontend ajoutés)
   - ou npx jest src/tests/frontend --runInBand

---

## 6) Pourquoi ces changements sont importants
- Permettent de valider le produit end‑to‑end sans dépendre de services externes.
- Corrigent des problèmes UX bloquants (inscription visible mais non effective).
- Préparent la migration future vers Stripe/DB réelle en garantissant la logique métier et le flux utilisateur.

---

## 7) Liste synthétique des fichiers créés/modifiés et raison (court)
- Modified: src/pages/inscription/Inscription.jsx — fix double POST & store auth (bugfix)
- Created: src/pages/inscription/Inscription.css — make role labels readable (UX)
- Created: src/tests/frontend/Inscription.test.jsx — RTL test (functionality)
- Created: src/tests/frontend/Connexion.test.jsx — RTL test
- Created: src/tests/frontend/Schedule.test.jsx — RTL test
- Updated earlier docs with full infra list (see docs/INFRA_ADDED.md)

---

## Résumé des changements récents (nouveautés importantes)

1. Header / Auth UX
- Files touchés:
  - src/components/layout/header/Header.jsx
  - src/components/layout/header/Header.css
- Quoi:
  - Restauration du logo et du menu hamburger sur toutes les pages.
  - Actions "Messages", "Mon compte", "Paramètres" désormais affichées uniquement si l'utilisateur est connecté (détection via `localStorage.auth`).
  - Affichage d'un avatar mini et nom dans le header quand connecté.
- Pourquoi:
  - Garder la navigation principale visible (UX) tout en rendant les actions privées visibles seulement quand connecté.
- Test:
  - Démarrer frontend + mock server, vérifier header avant/après login.

2. Page Profil (améliorations)
- Files touchés:
  - src/pages/profil-proprietaire/ProfilProprietaire.jsx
  - src/pages/profil-proprietaire/ProfilProprietaire.css
- Quoi:
  - Page profil enrichie : actions rapides (Chercher, Proposer, Messagerie, Déconnexion), édition profil, upload avatar (preview + PATCH mock), badge rôle "Professionnel/Particulier", section annonces et avis, responsive CSS.
  - Ajout d’un bouton "Paramètres" visible sur l’entête du profil.
- Pourquoi:
  - Offrir un point d'entrée riche et cohérent pour l'utilisateur (gestion compte, annonces, messages).
- Test:
  - Login → /profil → upload photo → modifier infos → vérifier que avatar apparaît dans header.

3. Publication d'un outil (formulaire + preview)
- Files créés/modifiés:
  - src/pages/publish/Publish.jsx
  - src/pages/publish/Publish.css
- Quoi:
  - Formulaire complet (catégorie, état, titre, description, prix, caution, images, caractéristiques).
  - Étape de prévisualisation avant publication; sauvegarde publish via POST /api/equipments (mock).
  - Draft temporaire en sessionStorage entre étapes.
- Pourquoi:
  - Workflow UX complet pour proposer un outil et vérifier l'annonce avant publication.
- Test:
  - Se connecter → Proposer → remplir → Aperçu → Publier → vérifier redirection vers /equipments/:id.

4. Recherche améliorée (barre + suggestions)
- Files créés/modifiés:
  - src/pages/search/SearchResults.jsx
  - src/pages/search/SearchResults.css
- Quoi:
  - Barre de recherche avec suggestions (ex: perceuse, ponceuse).
  - Cliquer suggestion déclenche recherche et affiche résultats; actions directes vers détail / profil / réservation.
- Pourquoi:
  - Faciliter découverte d'outils et navigation rapide.
- Test:
  - Aller sur /search, utiliser suggestion, cliquer un résultat pour voir détail.

5. Messagerie / Réservation / Paiements
- Files modifiés/ajoutés:
  - src/server/index.js (endpoints GET /api/messages, POST /api/messages, PATCH /api/users/:id, GET /api/users/:id/payments)
  - src/pages/payments/Payments.jsx + src/pages/payments/Payments.css
- Quoi:
  - Endpoints serveur mock pour messages, mise à jour user, liste paiements.
  - Page Paiements côté frontend pour lister paiements de l’utilisateur (mock).
- Pourquoi:
  - Permettre au propriétaire de suivre revenus et paiement mock post‑booking.
- Test:
  - Effectuer une réservation → POST /api/payments (mock) → vérifier /payments liste.

6. Backend mock & infra fixes
- Files modifiés:
  - src/server/index.js
  - src/boot/di.js
  - src/infra/repositories/* (in‑memory repos)
- Quoi:
  - Ajout CORS middleware (dev), GET / root handler, routes PATCH user & payments.
  - DI bootstrap instancie InMemory repos et Stripe mock adapter.
- Pourquoi:
  - Éviter erreurs CORS en dev; fournir routes nécessaires pour les nouveaux workflows.
- Test:
  - node src/server/index.js puis verify /api/health, /api/users/:id, /api/users/:id/payments.

7. Usecases / client HTTP resilient
- Files modifiés:
  - src/domain/usecases/RegisterUser.js
  - src/domain/usecases/LoginUser.js
- Quoi:
  - Utilisation d'API_BASE explicite en dev (http://localhost:4000) pour éviter dépendance au proxy CRA.
  - Parsing robuste des réponses (text() ou json(), corps vide géré).
- Pourquoi:
  - Réduire erreurs "Le serveur n'a pas renvoyé un JSON valide" quand proxy absent ou backend retourne HTML.
- Test:
  - Frontend sur 3000 + mock server sur 4000 → Inscription / Connexion→ vérifier pas d'erreur JSON.

8. Tests
- Files ajoutés:
  - src/tests/frontend/* (Inscription, Connexion, Schedule)
  - src/tests/flow-auth/* (supertest)
  - src/tests/flow-platform/* (supertest)
- Quoi:
  - Tests RTL pour composants clés; tests d’intégration supertest pour le flux end‑to‑end mock.
- Pourquoi:
  - Assurer stabilité des usecases principaux et intégration backend mock.

9. Corrections CSS manquantes
- Files ajoutés:
  - src/pages/payments/Payments.css
  - src/pages/settings/Settings.css
- Pourquoi:
  - Corriger erreurs compilation (imports CSS manquants) et assurer rendu minimal.

---

## Problèmes connus et recommandations
- Proxy CRA: si vous préférez utiliser le proxy CRA, assurez‑vous d'avoir `"proxy": "http://localhost:4000"` dans package.json et redémarrer `npm start`. Sinon les usecases utilisent l'API_BASE explicite en dev.
- CORS en dev: middleware CORS ajouté, ajuster `allowedOrigin` si frontend hébergé ailleurs.
- Upload d'images: en mock on stocke dataURL. Remplacer par upload/stockage réel en production.
- Security: mots de passe en clair uniquement en dev; ajouter hashing (bcrypt) et JWT avant production.
- DB: in‑memory -> migrer vers Postgres/Supabase en implémentant repositories Postgres.

---

## Comment vérifier rapidement (checklist)
1. Démarrer mock API: `node src/server/index.js` (vérifier `Mock API server running on http://localhost:4000`).  
2. Démarrer frontend: `npm start` (port 3000).  
3. Flux rapide:
   - Inscription -> Connexion
   - Header : avatar, Messages, Mon compte, Paramètres visibles après connexion
   - /publish : remplir, preview, publier -> redirige vers détail
   - /search : utiliser suggestions -> ouvrir outil -> voir profil du propriétaire
   - Envoyer message depuis profil -> vérifier via API /api/messages
   - Réserver / paiement mock -> vérifier /payments

---

## Fichiers créés / modifiés (liste rapide)
- Modified: src/components/layout/header/Header.jsx, Header.css
- Modified: src/pages/profil-proprietaire/ProfilProprietaire.jsx, ProfilProprietaire.css
- Created: src/pages/publish/Publish.jsx, Publish.css
- Created: src/pages/search/SearchResults.jsx, SearchResults.css
- Modified: src/pages/payments/Payments.jsx; Created: src/pages/payments/Payments.css
- Modified: src/pages/settings/Settings.jsx; Created: src/pages/settings/Settings.css
- Modified: src/server/index.js (CORS, GET /, PATCH /api/users/:id, GET /api/users/:id/payments, messages endpoints)
- Modified: src/domain/usecases/RegisterUser.js, src/domain/usecases/LoginUser.js
- Added: tests (src/tests/frontend + src/tests/flow-*)

---

Fin du document.
