# Changes, New Tests & How to run them (detailed)

Ce document décrit précisément les fichiers ajoutés/modifiés, la raison de chaque changement et comment exécuter les tests.

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

## 10) Fix: use explicit API base in usecases RegisterUser & LoginUser

- Files changed:
  - src/domain/usecases/RegisterUser.js — modification
  - src/domain/usecases/LoginUser.js — modification

- Pourquoi :
  - En développement le frontend (CRA) tourne sur `localhost:3000` et le mock backend sur `localhost:4000`. Si le proxy CRA n'est pas actif ou si vous avez démarré le frontend sans config proxy, `fetch('/api/...')` ira au serveur frontend (retourne index.html) et provoque une erreur de parsing JSON ("Le serveur n'a pas renvoyé un JSON valide").  
  - Pour fiabiliser le flux en dev sans dépendre du proxy, ces usecases construisent maintenant explicitement l'URL `http://localhost:4000/api/...` quand la page est servie depuis `localhost` (détection via window.location.hostname).

- Effet :
  - Le frontend appellera directement le mock backend en dev. En production (non-localhost) le chemin reste relatif (''), donc `fetch('/api/...')` fonctionne si vous déployez l'API et le frontend sous le même domaine ou utilisez un proxy approprié.

---

## 11) Fix: enable CORS on mock API

- File changed:
  - src/server/index.js — addition of simple CORS middleware

- Why:
  - During development the frontend (localhost:3000) calls the mock API (localhost:4000). Browsers block cross‑origin requests that fail the preflight (OPTIONS) check if the API doesn't return proper CORS headers. That caused the error:
    "No 'Access-Control-Allow-Origin' header is present on the requested resource."
  - The server now sets Access-Control-Allow-Origin to http://localhost:3000 (dev) and handles OPTIONS requests with 204.

- Note:
  - This is a dev convenience. In production set a stricter policy (specific origins, allow credentials only if needed) or use a reverse proxy so frontend and API share the same origin.

---

Fin.
