
    /*RELATION
STRUTURE DE LA BASE DE DONNEES POUR UNE PLATEFORME DE 
LOCATION D'OBJETS ENTRE PARTICULIERS 

   users ||--o{ items : "propose"
    users ||--o{ bookings : "effectue"
    users ||--o{ reviews : "ecrit"
    users ||--o{ messages : "envoie"
    users ||--o{ payments : "effectue"
    
    items ||--o{ bookings : "disponible_pour"
    items ||--o{ reviews : "receoit"
    items ||--o{ item_categories : "categorise"
    
    categories ||--o{ item_categories : "classifie"
    
    bookings ||--|| payments : "inclut"
    bookings ||--o{ reviews : "genere"
    bookings ||--o{ messages : "concerne" */


    users {
        uuid id PK "IDENTIFIANT UNIQUE"
        varchar email "EMAIL (UNIQUE)"
        varchar password_hash "MOT DE PASSE HACHE"
        varchar first_name "PRENOM"
        varchar last_name "NOM"
        varchar company_name "NOM ENTREPRISE"
        varchar siret "SIRET (UNIQUE)"
        varchar phone "TELEPHONE"
        text address "ADRESSE COMPLETE"
        decimal latitude "LATITUDE GPS"
        decimal longitude "LONGITUDE GPS"
        varchar avatar_url "URL PHOTO PROFIL"
        boolean is_pro "STATUT PROFESSIONNEL"
        decimal rating "NOTE MOYENNE"
        integer review_count "NOMBRE D'AVIS"
        timestamp created_at "DATE CREATION"
        timestamp updated_at "DATE MODIFICATION"
        boolean email_verified "EMAIL VERIFIE"
        varchar verification_token "TOKEN VERIFICATION"
    }

    items ||--o{ item_photos : "contient"
    items {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid user_id FK "PROPRIETAIRE"
        uuid category_id FK "CATEGORIE"
        varchar title "TITRE ANNONCE"
        text description "DESCRIPTION COMPLETE"
        decimal daily_price "PRIX JOURNALIER"
        decimal caution_deposit "CAUTION"
        varchar location "LOCALISATION"
        decimal latitude "LATITUDE GPS"
        decimal longitude "LONGITUDE GPS"
        boolean is_available "DISPONIBLE"
        varchar condition "ETAT (neuf/occasion)"
        text specifications "CARACTERISTIQUES JSON"
        integer view_count "NOMBRE DE VUES"
        timestamp created_at "DATE CREATION"
        timestamp updated_at "DATE MODIFICATION"
        boolean is_approved "ANNONCE APPROUVEE"
    }

    item_photos {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid item_id FK "ANNONCE ASSOCIEE"
        varchar image_url "URL PHOTO"
        integer sort_order "ORDRE AFFICHAGE"
        boolean is_main "PHOTO PRINCIPALE"
        timestamp created_at "DATE CREATION"
    }

    categories {
        uuid id PK "IDENTIFIANT UNIQUE"
        varchar name "NOM CATEGORIE"
        varchar slug "SLUG URL"
        varchar description "DESCRIPTION"
        varchar icon "ICONE"
        uuid parent_id FK "CATEGORIE PARENTE"
        timestamp created_at "DATE CREATION"
    }

    item_categories {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid item_id FK "ANNONCE"
        uuid category_id FK "CATEGORIE"
        timestamp created_at "DATE CREATION"
    }

    bookings {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid item_id FK "OBJET LOUÉ"
        uuid borrower_id FK "EMPRUNTEUR"
        timestamp start_date "DATE DEBUT"
        timestamp end_date "DATE FIN"
        integer total_days "NOMBRE JOURS"
        decimal total_amount "MONTANT TOTAL"
        decimal caution_amount "MONTANT CAUTION"
        varchar status "STATUT"
        text borrower_message "MESSAGE EMPRUNTEUR"
        timestamp created_at "DATE CREATION"
        timestamp updated_at "DATE MODIFICATION"
        timestamp accepted_at "DATE ACCEPTATION"
        timestamp completed_at "DATE FINALISATION"
        timestamp pickup_confirmed_at "DATE REMISE"
        timestamp return_confirmed_at "DATE RESTITUTION"
    }

    payments {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid booking_id FK "RESERVATION"
        uuid user_id FK "UTILISATEUR"
        varchar stripe_payment_intent_id "ID STRIPE"
        decimal amount "MONTANT"
        decimal platform_fee "FRAIS PLATEFORME"
        varchar status "STATUT PAIEMENT"
        varchar payment_method "METHODE PAIEMENT"
        timestamp paid_at "DATE PAIEMENT"
        timestamp refunded_at "DATE REMBOURSEMENT"
        text refund_reason "RAISON REMBOURSEMENT"
        timestamp created_at "DATE CREATION"
    }

    reviews {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid booking_id FK "RESERVATION"
        uuid author_id FK "AUTEUR AVIS"
        uuid target_user_id FK "UTILISATEUR NOTE"
        uuid item_id FK "OBJET NOTE"
        integer rating "NOTE (1-5)"
        text comment "COMMENTAIRE"
        varchar type "TYPE (borrower/lender)"
        boolean is_verified "AVIS VERIFIE"
        timestamp created_at "DATE CREATION"
        timestamp updated_at "DATE MODIFICATION"
    }

    messages {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid booking_id FK "RESERVATION"
        uuid sender_id FK "EXPEDITEUR"
        uuid receiver_id FK "DESTINATAIRE"
        text content "CONTENU MESSAGE"
        boolean is_read "MESSAGE LU"
        timestamp read_at "DATE LECTURE"
        timestamp created_at "DATE CREATION"
    }

    admin_moderation {
        uuid id PK "IDENTIFIANT UNIQUE"
        uuid item_id FK "ANNONCE MODEREE"
        varchar action "ACTION (approve/reject)"
        text moderation_reason "RAISON MODERATION"
        uuid moderator_id FK "MODERATEUR"
        timestamp created_at "DATE MODERATION"
    }


