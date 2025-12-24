## Members: Emmanuel Okito, Éléa REN, Romain Cristev and Leona TRAN Group 305


# OUTILLIO




![image](https://github.com/user-attachments/assets/fd5e0a2d-06fa-41d7-a8a9-67d9957a131e)



# Project Progress - Summary of Completed Tasks

## ✅ What Has Been Done So Far By The Team , SPRINT 3 

| Task | Responsible(s) | Notes |
| :--- | :--- | :--- |
| **Implementiong the Search Page**  | Leona | allow a user to look for a tool . |
| **Implementing the auth Page** (Register and Login) | Elea | fixing error due with user registration . |
| **Mock test ** | Emmanuel | Verify the flow of registering and login with manual and jest test. |




![2C092411-D219-4534-8F67-D7501AA02FCA_4_5005_c](https://github.com/user-attachments/assets/67248353-7728-4910-8586-21d3f075026a)






## ✅ What Has Been Done So Far By The Team , SPRINT 1 AND 2

| Task | Responsible(s) | Notes |
| :--- | :--- | :--- |
| **Définir l'entité Payment avec ses règles métier et reservation**  | Elea | this entity serve to manage the payment fonctionality . |
| **Définir l'entité Review avec ses règles métie ** (Register and Login) | Elea | this entity serve to manage the Review fonctionality . |
| **Définir l'entité Equipment avec ses règles métier** | Leona | this entity serve to manage the Equipement fonctionality . |
| **Créer les value objects (Email, Money, DateRange)** ) | Leona |  These objects  serve to set conditions for each request according to the input of the user . |
| **User cases , RegisterUser, LoginUser, PublishEqquipement,SearchEquipement| Emmanuel| User case serve to manage the different action a user will perform on the platform. |
| **Définir les interfaces pour les repositories (UserRepository, EquipmentRepository etc..,)** |Emmanuel | Mnage the different client request to the data base  . |





![E7613FB5-FBC1-45A3-9875-BBD823895BD2_1_201_a](https://github.com/user-attachments/assets/5991cc82-834c-400b-90e9-2020abd4986f)



## TEST RESULT SCREEN FROM USE CASES 
![EEAD04D3-CF94-4897-A7D0-2D9F6D9F5E33_1_201_a](https://github.com/user-attachments/assets/2c26831f-3c87-4978-a185-5822c6531fa2)



## 🎯 Next Steps
*check to trello for more info*

* [Done] Implementing the first and the second layer.
* [ ] Finishing the Infrastructure Layer a.k.a 3 layer. and implement real data base and real stripe api payment gate and adding auth tests and booking process test 




# Project Progress - Summary of Completed Tasks

## ✅ What Has Been Done So Far By The Team , SPRINT 0 

| Task | Responsible(s) | Notes |
| :--- | :--- | :--- |
| **Home Page** (Including Header and Footer) | Leona | Design and initial integration completed. |
| **Authentification Page** (Register and Login) | Elea |
| **GitHub Project Setup** | Elea | Repository and basic structure established. |
| **Trello Setup** (For project advancement tracking) | Emmanuel | Task management and progress monitoring implemented. |
| **Platform Design (Mockup)** | The entire team | Overall product vision validated. |
| **Specifications Document (Cahier des charges)** | The entire team | Reference document for project requirements. |

---

## 🎯 Next Steps
*check to trello for more info*

* [Done] Implementing the first and the second layer.
* [ ] Finishing the Infrastructure Layer a.k.a 3 layer.
* [ ] ...

---


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

## 👥 Team Members and Roles

* **Elea:** GitHub Setup and Front-end Development.
* **Leona:** Front-end Development (Design and Integration).
* **Emmanuel:** Project Management (Trello).
* **Romain:** Fullstack dev and Task Tracking (Trello).




This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
