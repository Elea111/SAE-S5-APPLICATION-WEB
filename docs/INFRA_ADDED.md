# Infra & Domain additions (summary)

Ce document décrit les fichiers ajoutés pour rendre les usecases exécutables en local (mock/in-memory) et les value‑objects/enums créés.
Le projet dispose désormais d'une véritable base de données, les simulations ne sont donc plus nécessaires, mais ce document est conservé afin de mieux comprendre l'historique des implémentations.






## 1 — Value objects / enums ajoutés
- src/domain/value-objects/Money.js — simple VO pour montants.
- src/domain/value-objects/Location.js — latitude/longitude + distance (Haversine).
- src/domain/value-objects/equipment/EquipmentCondition.js
- src/domain/value-objects/equipment/EquipmentStatus.js
- src/domain/value-objects/equipment/EquipmentCategory.js
- src/domain/exceptions/EquipmentError.js — exceptions domain spécifiques.

## 2 — Repositories in‑memory (Infrastructure)
- src/infra/repositories/InMemoryUserRepository.js
- src/infra/repositories/InMemoryEquipmentRepository.js
- src/infra/repositories/InMemoryBookingRepository.js
- src/infra/repositories/InMemoryPaymentRepository.js
- src/infra/repositories/InMemoryReviewRepository.js

Ces repositories sont minimalistes et destinés au développement/local tests. Ils stockent les entités en mémoire et exposent les méthodes attendues par les usecases (create, findById, search, create booking, confirmHandover/Return, charge, refund, etc.).

## 3 — Bootstrap DI
- src/boot/di.js — instancie et exporte les repositories in‑memory. Utiliser `import di from '.../boot/di'` pour obtenir les repos.

## 4 — Mock backend (Express)
- src/server/index.js — serveur minimal avec endpoints:
  - GET /api/health
  - POST /api/register
  - POST /api/login
  - GET/POST /api/equipments
  - POST /api/bookings
  - POST /api/payments
  - POST /api/reviews

Le serveur appelle les usecases existants en injectant les repositories via `di`. Démarrer : `node src/server/index.js` (ou avec nodemon). Port par défaut 4000.

## 5 — Base de données (plan)
Le schéma relationnel fourni par vous a été conservé et cité ci‑dessus (users, items, item_photos, categories, item_categories, bookings, payments, reviews, messages, admin_moderation). Pour la suite :
- Implémenter des adapters Postgres (ex : src/infra/repositories/PostgresUserRepository.js) qui respectent les interfaces des repositories in‑memory.
- Migration / seed pour Postgres (ou Supabase) quand prêt.

## 6 — Bonnes pratiques et prochains pas
- Pour production remplacer les repos in‑memory par des implémentations Postgres et une vraie intégration Stripe (ex: src/infra/services/StripePaymentService.js).
- Ajouter authentification JWT (infra/auth), protection d'API, validation (Joi/Zod) et tests d'intégration (supertest) contre `src/server`.
- Ajouter scripts npm pour démarrer serveur mock (`"start:server": "node src/server/index.js"`) et CI pour exécuter tests.

## 7 — Fichiers créés
Liste complète dans les sections 1–3 ci‑dessus.

## 8 — Mock Stripe service & adapter

Pour permettre de tester le flux de paiement sans Stripe réel, j'ai ajouté :
- src/infra/services/MockStripeService.js — simule la création/confirmation/refund des payment intents (en mémoire).
- src/infra/adapters/StripePaymentAdapter.js — adapte l'API du mock pour exposer les méthodes attendues par les usecases/repositories (charge, refund, findById).

Le bootstrap DI (src/boot/di.js) a été mis à jour pour utiliser StripePaymentAdapter comme `paymentRepository`. Ainsi les usecases/appels à ProcessPayment utilisent désormais le mock Stripe automatiquement.

### Comment tester localement
1. Installer dépendances (si nécessaire) :
   - npm install
2. Démarrer le serveur mock :
   - node src/server/index.js
   - (le serveur utilise `di` et le mock Stripe par défaut)
3. Appeler POST /api/payments avec payload:
   {
     "amount": 120,
     "currency": "EUR",
     "bookingId": "booking-123",
     "userId": "user-123"
   }
   -> Retournera un objet payment simulé avec stripe_payment_intent_id et status 'paid'.

### Remarques
- Le mock est volontairement simple : pas de persistance durable et les "passwords" restent en clair dans le repo in‑memory — acceptable uniquement pour dev/test.
- Quand vous serez prêt à intégrer Stripe réel :
  - remplacer MockStripeService par un service réel (stripe SDK) et adapter StripePaymentAdapter pour appeler l'API Stripe.
  - implémenter Postgres repositories et migrer les données.

---
Fin du résumé.
