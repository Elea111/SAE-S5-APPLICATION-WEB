## Members: Emmanuel Okito, Éléa REN, Romain Cristev and Leona TRAN Group 305


# OUTILLIO




![image](https://github.com/user-attachments/assets/fd5e0a2d-06fa-41d7-a8a9-67d9957a131e)





##  Couches de l'Application

### 1. Domain Layer (Enterprise Business Rules)
- **Entities** : User, Equipment, Booking, Payment, Review
- **Business Rules** : Règles métier pures, indépendantes de la technique

### 2. Application Layer (Application Business Rules)  
- **Use Cases** : RegisterUser, BookEquipment, ProcessPayment, etc.
- **Interfaces** : UserRepository, PaymentService, NotificationGateway

### 3. Infrastructure Layer (Frameworks & Drivers)
- **Repositories** : PostgreSQLUserRepository, StripePaymentService
- **Controllers** : REST API endpoints
- **External Services** : Email, SMS, File Storage

### 4. Presentation Layer (UI & Delivery)
- **React Components** : Pages, Forms, Layouts
- **PWA Setup** : Service Worker, Manifest
- **State Management** : Context/Redux








# Project Progress - Summary of Completed Tasks

## ✅ What Has Been Done So Far By The Team

| Task | Responsible(s) | Notes |
| :--- | :--- | :--- |
| **Home Page** (Including Header and Footer) | Elea and Leona | Design and initial integration completed. |
| **GitHub Project Setup** | Elea | Repository and basic structure established. |
| **Trello Setup** (For project advancement tracking) | Emmanuel | Task management and progress monitoring implemented. |
| **Platform Design (Mockup)** | The entire team | Overall product vision validated. |
| **Specifications Document (Cahier des charges)** | The entire team | Reference document for project requirements. |

---

## 🎯 Next Steps
*check to trello for more info*

* [ ] Implementing the first and the second layer.
* [ ] Start database integration.
* [ ] ...

---

## 👥 Team Members and Roles

* **Elea:** GitHub Setup and Front-end Development.
* **Leona:** Front-end Development (Design and Integration).
* **Emmanuel:** Project Management (Trello).
* **Romain:** Fullstack dev and Task Tracking (Trello).














This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
