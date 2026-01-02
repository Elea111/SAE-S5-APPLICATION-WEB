# Documentation : Intégration Stripe - Guide complet

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Configuration initiale](#configuration-initiale)
3. [Architecture générale](#architecture-générale)
4. [Installation des dépendances](#installation-des-dépendances)
5. [Backend Stripe](#backend-stripe)
6. [Frontend Stripe](#frontend-stripe)
7. [Webhooks Stripe](#webhooks-stripe)
8. [Cartes de test](#cartes-de-test)
9. [Flux de paiement complet](#flux-de-paiement-complet)
10. [Problèmes rencontrés et solutions](#problèmes-rencontrés-et-solutions)
11. [Guide de test](#guide-de-test)
12. [Checklist de déploiement](#checklist-de-déploiement)

---

## Vue d'ensemble

### Objectif
Intégrer **Stripe** pour gérer les paiements sécurisés sur la plateforme Outillio :
- Création de sessions Stripe Checkout
- Paiement par carte bancaire
- Gestion des webhooks Stripe
- Confirmation et stockage des paiements

### Technologies utilisées
- **Stripe Node.js Library** : `stripe@20.1.0`
- **Stripe React Components** : `@stripe/react-stripe-js@5.4.1`
- **Stripe.js** : `@stripe/js@3.x.x`
- **Stripe CLI** : Pour tester les webhooks localement

### Flux global
