# Domain Layer - Enterprise Business Rules

This layer contains the core business logic of Outillio, independent of any framework or external dependencies.


## User Entity , CREATED BY EMMANUEL 

### Properties
- `id`: Unique user identifier (UUID)
- `email`: User email (Email value object)
- `passwordHash`: Hashed password (never plain text)
- `firstName`: User's first name
- `lastName`: User's last name
- `companyName`: Optional (professional users only)
- `siret`: Optional SIRET number (professional users)
- `phone`: Optional contact phone
- `address`: Optional full address
- `location`: Optional GPS coordinates (Location value object)
- `avatarUrl`: Optional profile picture URL
- `isPro`: Boolean flag for professional status
- `rating`: Sum of all review ratings
- `reviewCount`: Number of reviews received
- `emailVerified`: Email verification status
- `verificationToken`: Token for email verification
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Business Rules

#### Registration
- Email must be valid and unique (handled by repository)
- Password must be hashed (handled by application layer)
- First name and last name are required
- Professional users must provide company name and SIRET
- SIRET must be valid (14 digits, Luhn algorithm)

#### Professional Profile
- Only professionals can list items
- SIRET must be unique and valid
- Company name is required for professionals

#### Email Verification
- Users must verify email before renting items
- Users must verify email before listing items
- Verification token is single-use

#### Reviews & Ratings
- Ratings are between 1-5
- Average rating calculated from reviewCount/rating sum
- Reviews cannot be negative

#### User Roles
- INDIVIDUAL: Standard user (can rent)
- PROFESSIONAL: Business user (can rent + list)

### Key Methods

- `create()` - Factory method for creating new users
- `updateProfile()` - Update non-sensitive profile information
- `completeProfessionalProfile()` - Complete professional setup
- `verifyEmail()` - Mark email as verified
- `addReview()` - Record a review
- `upgradeToProfessional()` - Convert individual to professional
- `canRentItems()` - Check if user can rent
- `canListItems()` - Check if professional can list

## Value Objects

### Email
Encapsulates email validation. Email addresses are stored in lowercase.

### Location
Immutable representation of GPS coordinates. Includes distance calculation method.

### UserRole
Enum-like value object for user roles (INDIVIDUAL, PROFESSIONAL).

## Structure

domain/
├── entities/ # Core business entities
│ └── User.js # User entity with business rules
├── value-objects/ # Immutable objects representing specific values
│ ├── Email.js
│ ├── Location.js
│ └── UserRole.js
└── exceptions/ # Custom business rule exceptions
├── InvalidUserError.js
└── UserAlreadyExistsError.js


PUT HERE THE REST OF OTHER ENTITIES .........