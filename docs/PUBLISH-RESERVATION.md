# Documentation : Publish et Reservation - Workflow complet

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture générale](#architecture-générale)
3. [Workflow Publish (Publication)](#workflow-publish-publication)
4. [Workflow Reservation (Réservation)](#workflow-reservation-réservation)
5. [Fichiers modifiés](#fichiers-modifiés)
6. [Historique des changements](#historique-des-changements)
7. [Problèmes rencontrés et solutions](#problèmes-rencontrés-et-solutions)
8. [Guide de test](#guide-de-test)
9. [Checklist d'intégration](#checklist-dintégration)

---

## Vue d'ensemble

### Objectif global
Permettre aux utilisateurs de :
1. **PUBLIER** un équipement à louer (page `/publish`)
2. **RÉSERVER** un équipement trouvé (page `/reservation?equipmentId=XXX`)
3. **GÉRER** les détails, dates, prix et confirmation

### Flux utilisateur complet

L'utilisateur commence sur la page d'accueil où il peut choisir entre publier un équipement ou en réserver un. 

- **Publication** : L'utilisateur remplit un formulaire avec les détails de l'équipement, télécharge des photos, et fixe un prix. Une fois publié, l'équipement apparaît sur la plateforme comme disponible à la location.
- **Réservation** : L'utilisateur parcourt les équipements disponibles, sélectionne celui qui l'intéresse, choisit des dates de début et de fin pour la location, et procède au paiement. Une confirmation de réservation est ensuite envoyée à l'utilisateur.

### Technologies utilisées
- **Frontend** : React.js, Redux pour la gestion d'état, Axios pour les requêtes HTTP.
- **Backend** : Node.js, Express.js, MongoDB pour la base de données.
- **Authentification** : JWT (JSON Web Tokens) pour sécuriser les routes et les échanges entre le client et le serveur.
- **Stockage de fichiers** : Multer pour la gestion des fichiers uploadés (photos d'équipement).

---

## Architecture générale

```
[Client - React.js]
      |
      | Axios
      |
[Serveur - Node.js/Express.js]
      |
      | Mongoose
      |
[Base de données - MongoDB]
```

---

## Workflow Publish (Publication)

1. L'utilisateur se rend sur la page `/publish`.
2. Il remplit le formulaire de publication avec les détails de l'équipement.
3. Il télécharge des photos de l'équipement.
4. Il fixe un prix de location.
5. Il soumet le formulaire.
6. Le serveur reçoit les données, valide et enregistre l'équipement dans la base de données.
7. L'équipement est marqué comme disponible sur la plateforme.

---

## Workflow Reservation (Réservation)

1. L'utilisateur parcourt les équipements disponibles sur la page d'accueil ou via des filtres de recherche.
2. Il sélectionne un équipement pour voir ses détails.
3. Il choisit des dates de début et de fin pour la location.
4. Il procède au paiement.
5. Une fois le paiement confirmé, une réservation est créée et liée à l'utilisateur dans la base de données.
6. L'utilisateur reçoit une confirmation de réservation par email.

---

## Fichiers modifiés

- `client/src/App.js` : Ajout des routes pour les pages de publication et de réservation.
- `client/src/actions/equipmentActions.js` : Ajout des actions pour publier et réserver un équipement.
- `client/src/components/Publish.js` : Nouveau composant pour le formulaire de publication.
- `client/src/components/Reservation.js` : Nouveau composant pour la page de réservation.
- `server/routes/equipment.js` : Ajout des routes pour gérer les publications et réservations.
- `server/models/Equipment.js` : Mise à jour du modèle pour inclure les détails nécessaires à la réservation.
- `server/controllers/equipmentController.js` : Ajout de la logique pour traiter les publications et réservations.

---

## Historique des changements

- **v1.0** : Mise en place de la structure de base du projet avec les fonctionnalités de publication et de réservation.
- **v1.1** : Ajout de la gestion des utilisateurs et de l'authentification.
- **v1.2** : Amélioration de l'interface utilisateur et optimisation des performances.
- **v1.3** : Correction de bugs et mise à jour des dépendances.

---

## Problèmes rencontrés et solutions

- **Problème** : Difficultés à gérer les uploads d'images volumineuses.
  - **Solution** : Compression des images avant upload et limitation de la taille des fichiers acceptés.

- **Problème** : Conflits de version entre les dépendances npm.
  - **Solution** : Mise à jour régulière des dépendances et utilisation de `npm audit` pour identifier les vulnérabilités.

---

## Guide de test

1. Cloner le dépôt et installer les dépendances (`npm install`).
2. Lancer le serveur de développement (`npm run dev`).
3. Accéder à l'application via `http://localhost:3000`.
4. Tester les fonctionnalités de publication et de réservation avec des comptes utilisateurs différents.
5. Vérifier la réception des emails de confirmation de réservation.

---

## Checklist d'intégration

- [x] Les routes `/publish` et `/reservation` sont accessibles et fonctionnelles.
- [x] Les formulaires de publication et de réservation sont correctement validés.
- [x] Les données sont bien enregistrées dans la base de données.
- [x] Les emails de confirmation sont envoyés avec les bonnes informations.
- [x] L'interface utilisateur est responsive et sans bug majeur.
