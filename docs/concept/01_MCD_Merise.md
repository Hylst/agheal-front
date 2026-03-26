# 📊 Modèle Conceptuel de Données (MCD) — Méthode Merise

L'application **AGHeal** repose sur un modèle de données relationnel complexe. Ce document présente le Modèle Conceptuel de Données (MCD) complet et exhaustif, incluant toutes les entités, propriétés et associations telles qu'elles sont définies dans la base de données réelle.

## 1. Diagramme MCD Global

Voici la représentation visuelle complète du MCD utilisant la syntaxe Entity-Relationship (ER) :

```mermaid
erDiagram
    %% ==========================================
    %% 1. AUTHENTIFICATION & COMPTES
    %% ==========================================
    UTILISATEUR {
        UUID id PK
        VARCHAR email "UNIQUE"
        VARCHAR password_hash
        TIMESTAMP email_confirmed_at
        TIMESTAMP last_sign_in_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    TOKEN_RESET_PASSWORD {
        UUID id PK
        VARCHAR token
        TIMESTAMP expires_at
        TIMESTAMP created_at
    }

    TOKEN_REFRESH {
        UUID id PK
        VARCHAR token
        TIMESTAMP expires_at
        BOOLEAN revoked
        TIMESTAMP created_at
    }

    ROLE {
        ENUM nom_role PK "admin, coach, adherent"
    }

    %% ==========================================
    %% 2. IDENTITÉ & MÉTIER (Core Business)
    %% ==========================================
    PROFIL {
        UUID id PK "FK Utilisateur"
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email "Dénormalisé"
        VARCHAR phone
        ENUM statut_compte "actif, suspendu"
        ENUM payment_status "à jour, en retard"
        INT age
        LONGTEXT avatar_base64
        TEXT coach_remarks
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    SEANCE {
        UUID id PK
        VARCHAR title
        TEXT description
        DATE date
        TIME start_time
        TIME end_time
        INT min_people
        INT max_people
        VARCHAR equipment_coach
        VARCHAR equipment_clients
        VARCHAR equipment_location
        ENUM status "draft, published, cancelled"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    TYPE_SEANCE {
        UUID id PK
        VARCHAR name
        TEXT description
        VARCHAR color
        TIMESTAMP created_at
    }

    INSCRIPTION {
        UUID id PK
        ENUM status "confirmed, cancelled"
        TIMESTAMP registered_at
        TIMESTAMP cancelled_at
    }

    %% ==========================================
    %% 3. ORGANISATION SPATIALE & LOGIQUE
    %% ==========================================
    LIEU {
        UUID id PK
        VARCHAR name
        VARCHAR address
        TEXT notes
        TIMESTAMP created_at
    }

    GROUPE {
        UUID id PK
        VARCHAR name
        TEXT details
        TEXT remarks
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    APPARTENANCE_GROUPE {
        TIMESTAMP added_at
    }

    %% ==========================================
    %% 4. SYSTÈME & PARAMÉTRAGE
    %% ==========================================
    PARAMETRES_APP {
        VARCHAR key PK
        TEXT value
        TIMESTAMP updated_at
    }

    LOG {
        UUID id PK
        VARCHAR action
        JSON details
        TIMESTAMP created_at
    }

    %% ==========================================
    %% RELATIONS (ASSOCIATIONS MERISE)
    %% ==========================================
    
    %% Utilisateur / Profil
    UTILISATEUR ||--|| PROFIL : "A_POUR_IDENTITE (1,1 - 1,1)"
    UTILISATEUR ||--o{ TOKEN_RESET_PASSWORD : "DEMANDE_RESET (0,n - 1,1)"
    UTILISATEUR ||--o{ TOKEN_REFRESH : "EMET_TOKEN (0,n - 1,1)"
    PROFIL ||--o{ ROLE : "DETIENT_ROLE (1,n - 0,n)"
    
    %% Séances & Types
    SEANCE }o--|| TYPE_SEANCE : "EST_DE_TYPE (1,1 - 0,n)"
    TYPE_SEANCE }o--o| LIEU : "SE_DEROULE_PAR_DEFAUT_A (0,1 - 0,n)"
    SEANCE }o--|| LIEU : "A_LIEU_A (1,1 - 0,n)"
    
    %% Créateurs
    PROFIL ||--o{ SEANCE : "PLANIFIE (0,n - 1,1)"
    PROFIL ||--o{ LIEU : "AJOUTE_LIEU (0,n - 0,1)"
    
    %% Inscriptions aux séances
    PROFIL ||--o{ INSCRIPTION : "S_INSCRIT_A (0,n - 1,1)"
    SEANCE ||--o{ INSCRIPTION : "ACCUEILLE (0,n - 1,1)"
    
    %% Groupes
    PROFIL ||--o{ APPARTENANCE_GROUPE : "EST_MEMBRE (0,n - 1,1)"
    GROUPE ||--o{ APPARTENANCE_GROUPE : "CONTIENT (0,n - 1,1)"
    
    %% Système
    PROFIL ||--o{ LOG : "DECLENCHE_EVENEMENT (0,n - 1,1)"
    PROFIL |o--o{ PARAMETRES_APP : "MODIFIE_REGLAGE (0,n - 0,1)"
```

---

## 2. Dictionnaire des Entités et Attributs Détaillés

### 2.1. Pôle Authentification

**Entité : UTILISATEUR (users)**
Gère l'accès sécurisé à la plateforme.
- `id` : Identifiant universel (UUID).
- `email` : Adresse e-mail (clé alternative, unique).
- `password_hash` : Empreinte de sécurité (Algorithme Bcrypt).
- `last_sign_in_at` : Date de la dernière connexion réussie.

**Entité : TOKEN_REFRESH (refresh_tokens)** & **TOKEN_RESET_PASSWORD**
Gèrent la persistance des sessions (Refresh Token JWT) et la récupération de mot de passe.
- `token` : Chaîne cryptographique générée aléatoirement.
- `expires_at` : Limite de validité temporelle.
- `revoked` : (Refresh) Boolean indiquant si le token a été révoqué manuellement (déconnexion).

**Entité : ROLE (user_roles)**
Définit les permissions (Contrôle d'accès basé sur les rôles - RBAC).
- `nom_role` : Liste finie (admin, coach, adherent).

### 2.2. Pôle Profil & Identité

**Entité : PROFIL (profiles)**
Contient les informations signalétiques de l'utilisateur. **Partage la même clé primaire que UTILISATEUR (relation 1:1 stricte).**
- `first_name` & `last_name` : Identité civile.
- `statut_compte` : État global de l'utilisateur (actif, suspendu).
- `payment_status` : Suivi sommaire de la cotisation (à jour, en retard).
- `coach_remarks` : Espace privé réservé aux notes du coach sur un adhérent.
- `avatar_base64` : Image de profil encodée (limitée en taille).

### 2.3. Pôle Séances (Cœur de métier)

**Entité : SEANCE (sessions)**
Événement planifié par un coach.
- `title` & `description` : Informations affichées aux adhérents.
- `date`, `start_time`, `end_time` : Plage horaire stricte.
- `min_people`, `max_people` : Seuils d'ouverture et capacité d'accueil.
- `equipment_coach`, `equipment_clients`, `equipment_location` : Listes textuelles du matériel requis pour la logistique.
- `status` : Cycle de vie (draft = brouillon, published = visible, cancelled = annulée).

**Entité : TYPE_SEANCE (session_types)**
Modèle ou catégorie d'activité (Ex: Pilates, HIIT).
- `name` : Nom de l'activité.
- `color` : Code couleur hexadécimal pour l'affichage dans le calendrier frontend.

**Entité : LIEU (locations)**
Lieu physique où se déroule l'activité.
- `name`, `address`, `notes` : Détails logistiques.

**Entité : INSCRIPTION (registrations)**
Concrétise la participation d'un adhérent à une séance. C'est la résolution de la relation N:M entre Profils et Séances.
- `status` : État de la réservation (confirmed, cancelled).
- `registered_at`, `cancelled_at` : Horodatages permettant des statistiques et des listes d'attente.

### 2.4. Pôle Organisationnel

**Entité : GROUPE (groups)** & **APPARTENANCE_GROUPE (user_groups)**
Permet de regrouper les adhérents (ex: "Groupe Mardi 18h", "Niveau Avancé").
- `remarks` : Notes internes.
- L'appartenance conserve la date d'ajout (`added_at`).

### 2.5. Pôle Système métier

**Entité : PARAMETRES_APP (app_info)**
Données clés/valeur éditables (ex: Message d'accueil, Liens réseaux sociaux, Tarifs).
- `key` : Identifiant texte unique (ex: "contact_email").
- `value` : Contenu riche (HTML ou texte long).

**Entité : LOG (logs)**
Registre d'audit pour tracer les actions sensibles.
- `action` : Nom de l'action (ex: 'login_failed', 'session_cancelled').
- `details` : Format JSON contenant le contexte (IP partiel, modifications de champs).
