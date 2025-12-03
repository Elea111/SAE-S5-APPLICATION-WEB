#    Outillio Architecture

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

________________________________________________________________________________________________________________________________________________________________________

### Couche Domain (Métier)


**Entities**
* User
* Equipment
* Booking
* Payment
* Review
  
**Business Rules**
Couche Application (Use Cases)
Interfaces (Ports)
* UserRepository
* EquipmentRepository
* BookingRepository
* PaymentRepository
* ReviewRepository

**Use Cases**
* RegisterUserUseCase
* CompleteProfessionalProfileUseCase
* PublishEquipmentUseCase
* SearchEquipmentUseCase
* MakeReservationUseCase
* ConfirmHandoverUseCase
* ConfirmReturnUseCase
* ProcessPaymentUseCase
* HandleDepositRefundUseCase
* RateTransactionUseCase

**Couche Infrastructure**
*Repositories*
* UserRepositoryImpl (PostgreSQL)
* EquipmentRepositoryImpl (PostgreSQL)
* ...

  
**Controllers**
* AuthController
* EquipmentController
* BookingController
* ...

  
**Couche Presentation**
*Composants React*
* RegisterForm
* LoginForm
* EquipmentListing
* EquipmentSearch
* BookingForm

* src/
├── **metier/**           (DOMAIN)
│   ├── **entites/**      (User, Equipment, Booking)
│   └── **regles/**       (calculs prix, validations)
│
├── **cas-usage/**        (APPLICATION)  
│   ├── **actions/**      (inscrire, reserver, payer)
│   └── **contrats/**     (interfaces pour la base de données)
│
├── **infrastructure/**   (à faire PLUS TARD)
│   ├── **api/**          (controllers - PAS MAINTENANT)
│   └── **database/**     (PostgreSQL - PAS MAINTENANT)
│
└── **tests/**
    ├── **test-metier/**
    └── **test-cas-usage/**
