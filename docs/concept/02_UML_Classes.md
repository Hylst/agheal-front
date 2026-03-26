# 🏛️ Diagramme de Classes UML détaillé

Ce document présente l'architecture orientée objet sous-jacente à l'application **AGHeal**. Il traduit le modèle relationnel de la base de données en classes, incluant leurs attributs complets (avec types de données) et leurs méthodes métiers (déduites des contrôleurs PHP).

## 1. Diagramme de Classes Complet

```mermaid
classDiagram
    %% Core Users
    class User {
        +UUID id
        +String email
        -String password_hash
        +DateTime email_confirmed_at
        +DateTime last_sign_in_at
        +DateTime created_at
        +DateTime updated_at
        +login(password: String) Object
        +resetPassword()
        +hasRole(role: String) Boolean
    }

    class Profile {
        +UUID id
        +String first_name
        +String last_name
        +String email
        +String phone
        +Enum statut_compte
        +Enum payment_status
        +Int age
        +String avatar_base64
        +String coach_remarks
        +DateTime created_at
        +DateTime updated_at
        +updateProfile(data: Object)
        +suspendAccount()
    }

    class Role {
        <<enumeration>>
        ADMIN
        COACH
        ADHERENT
    }

    %% Security
    class RefreshToken {
        +UUID id
        +UUID user_id
        +String token
        +DateTime expires_at
        +Boolean revoked
        +DateTime created_at
        +isValid() Boolean
        +revoke()
    }
    
    class PasswordResetToken {
        +UUID id
        +UUID user_id
        +String token
        +DateTime expires_at
        +DateTime created_at
        +isValid() Boolean
    }

    %% Business Core
    class Session {
        +UUID id
        +String title
        +String description
        +Date date
        +Time start_time
        +Time end_time
        +Int min_people
        +Int max_people
        +String equipment_coach
        +String equipment_clients
        +String equipment_location
        +Enum status
        +UUID created_by
        +DateTime created_at
        +DateTime updated_at
        +publish()
        +cancel()
        +getRemainingSeats() Int
        +isFull() Boolean
    }

    class SessionType {
        +UUID id
        +String name
        +String description
        +String color
        +DateTime created_at
        +updateColor(hex: String)
    }

    class Location {
        +UUID id
        +String name
        +String address
        +String notes
        +DateTime created_at
        +UUID created_by
        +getMapUrl() String
    }

    class Registration {
        +UUID id
        +UUID session_id
        +UUID user_id
        +Enum status
        +DateTime registered_at
        +DateTime cancelled_at
        +confirm()
        +cancel()
    }

    %% Organization
    class Group {
        +UUID id
        +String name
        +String details
        +String remarks
        +DateTime created_at
        +DateTime updated_at
        +addMember(user: Profile)
        +removeMember(user: Profile)
    }

    %% System
    class AppInfo {
        +String key
        +String value
        +DateTime updated_at
        +UUID updated_by
        +updateValue(newValue: String)
    }

    class Log {
        +UUID id
        +UUID user_id
        +String action
        +JSON details
        +DateTime created_at
        +static logAction(user: UUID, action: String, details: JSON)
    }

    %% Relations (Associations)
    User "1" *-- "1" Profile : Identité
    Profile "1" --> "*" Role : Possède
    User "1" *-- "*" RefreshToken : Génère
    User "1" *-- "*" PasswordResetToken : Demande

    Session "*" --> "1" SessionType : Type
    Session "*" --> "1" Location : Lieu
    SessionType "*" --> "0..1" Location : Lieu par défaut
    
    Profile "1" --> "*" Session : Organise (Coach)
    Profile "1" --> "*" Location : Crée (Coach)

    Profile "1" -- "*" Registration : Inscrit >
    Session "1" -- "*" Registration : < Accueille

    Profile "*" -- "*" Group : Membre
    
    Profile "1" --> "*" Log : Génère action
    Profile "1" --> "*" AppInfo : Modifie
```

---

## 2. Description des Patterns et Comportements (POO)

### Pattern d'Identité (User & Profile)
Le système sépare strictement l'authentification (classe `User`) des données métier et personnelles (classe `Profile`). 
- **Sécurité** : La classe `User` masque le `password_hash` (`-` private shortcut) et gère les tokens.
- **Métier** : La classe `Profile` centralise les relations avec le reste de l'application (Sessions, Groupes, Inscriptions).

### Cycle de vie d'une séance (Session)
La classe `Session` possède des méthodes d'état modifiant l'attribut `status` (`draft`, `published`, `cancelled`). Elle délègue le typage à `SessionType` et la logistique à `Location`. 
- Ses attributs de capacité (`min_people`, `max_people`) interagissent avec le nombre d'instances de la classe de liaison `Registration`.

### Journalisation (Log)
La classe `Log` est conçue pour être instanciée statiquement (`+static logAction()`) depuis divers contrôleurs (Auth, Profil, Admin) afin d'assurer l'audit et la traçabilité des modifications dans `AppInfo` ou les statuts des utilisateurs.

### Types de Données Spécifiques
- L'utilisation de `UUID` pour la majorité des identifiants (au lieu d'entiers auto-incrémentés) rend les objets intrinsèquement uniques avant même leur persistance en base de données, ce qui facilite la conception d'API REST asynchrones.
- Les champs comme `details` (dans `Log`) utilisent le type `JSON`, offrant une flexibilité non structurée au sein d'un modèle par ailleurs strictement typé.
