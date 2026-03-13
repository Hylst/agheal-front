# Guide de Migration AGHeal vers Installation Locale

> **Migration complète de Supabase/Lovable Cloud vers WAMP/LAMP + MySQL**  
> Auteur : Geoffroy Streit | 2025

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Installation de l'environnement local](#installation-de-lenvironnement-local)
4. [Migration du schéma de base de données](#migration-du-schéma-de-base-de-données)
5. [Création du backend API](#création-du-backend-api)
6. [Adaptation du code React](#adaptation-du-code-react)
7. [Migration du système d'authentification](#migration-du-système-dauthentification)
8. [Conversion des Edge Functions](#conversion-des-edge-functions)
9. [Configuration des emails](#configuration-des-emails)
10. [Tests et validation](#tests-et-validation)
11. [Checklist de migration](#checklist-de-migration)

---

## Vue d'ensemble

### Architecture actuelle (Supabase/Lovable Cloud)

```
┌─────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE ACTUELLE                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────────────────────────┐
│   Frontend   │     │            Supabase Cloud            │
│    React     │────▶│  ┌────────────┐  ┌────────────────┐  │
│   (Vite)     │     │  │ PostgreSQL │  │ Edge Functions │  │
└──────────────┘     │  └────────────┘  └────────────────┘  │
                     │  ┌────────────┐  ┌────────────────┐  │
                     │  │    Auth    │  │    Storage     │  │
                     │  └────────────┘  └────────────────┘  │
                     └──────────────────────────────────────┘
```

### Architecture cible (Local WAMP/LAMP + MySQL)

```
┌─────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE LOCALE                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────────────────────────┐
│   Frontend   │     │              WAMP / LAMP             │
│    React     │────▶│  ┌────────────┐  ┌────────────────┐  │
│   (Vite)     │     │  │   MySQL    │  │   PHP API      │  │
└──────────────┘     │  │    8.x     │  │   (Custom)     │  │
      │              │  └────────────┘  └────────────────┘  │
      │              │  ┌────────────┐  ┌────────────────┐  │
      ▼              │  │   Apache   │  │  PHPMailer     │  │
 localhost:5173      │  │   2.4.x    │  │   (Emails)     │  │
                     │  └────────────┘  └────────────────┘  │
                     └──────────────────────────────────────┘
                              localhost:80/api
```

### Composants à migrer

| Composant Supabase | Remplacement Local | Complexité |
|--------------------|-------------------|------------|
| PostgreSQL | MySQL 8.x | Moyenne |
| Supabase Auth | PHP + JWT | Élevée |
| Edge Functions | Scripts PHP | Moyenne |
| Supabase Client | Service API custom | Moyenne |
| RLS Policies | Logique PHP/MySQL | Élevée |
| Realtime | - (non utilisé) | - |
| Storage | Système de fichiers local | Faible |

---

## Prérequis

### Logiciels requis

| Logiciel | Version minimale | Téléchargement |
|----------|-----------------|----------------|
| **WAMP Server** (Windows) | 3.3.x | [wampserver.com](https://www.wampserver.com/) |
| **LAMP** (Linux) | - | `apt install apache2 mysql-server php` |
| **MAMP** (macOS) | 6.x | [mamp.info](https://www.mamp.info/) |
| **Node.js** | 18.x | [nodejs.org](https://nodejs.org/) |
| **Composer** | 2.x | [getcomposer.org](https://getcomposer.org/) |
| **Git** | 2.x | [git-scm.com](https://git-scm.com/) |

### Configuration PHP requise

```ini
; php.ini - Extensions requises
extension=mysqli
extension=pdo_mysql
extension=openssl
extension=mbstring
extension=json
extension=curl
```

### Versions PHP recommandées

- PHP 8.1 ou supérieur (pour les attributs et types modernes)
- Activer `display_errors = On` en développement

---

## Installation de l'environnement local

### Windows avec WAMP

#### Étape 1 : Installation de WAMP

1. Télécharger WAMP depuis [wampserver.com](https://www.wampserver.com/)
2. Installer avec les options par défaut
3. Lancer WAMP et attendre que l'icône devienne verte
4. Vérifier : `http://localhost` affiche la page WAMP

#### Étape 2 : Configuration de MySQL

```bash
# Accéder à MySQL via la console WAMP ou phpMyAdmin
# Créer la base de données
mysql -u root -p
```

```sql
-- Créer la base de données
CREATE DATABASE agheal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur dédié
CREATE USER 'agheal_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON agheal.* TO 'agheal_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Étape 3 : Configuration d'Apache

Créer un Virtual Host pour l'API :

```apache
# C:\wamp64\bin\apache\apache2.4.x\conf\extra\httpd-vhosts.conf

<VirtualHost *:80>
    ServerName api.agheal.local
    DocumentRoot "C:/wamp64/www/agheal-api/public"
    
    <Directory "C:/wamp64/www/agheal-api/public">
        AllowOverride All
        Require all granted
    </Directory>
    
    # Activer CORS pour le frontend React
    Header set Access-Control-Allow-Origin "http://localhost:5173"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</VirtualHost>
```

Ajouter au fichier hosts :
```
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1 api.agheal.local
```

### Linux avec LAMP

```bash
# Installation des composants
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-curl php-mbstring php-json

# Activer les modules Apache
sudo a2enmod rewrite headers

# Redémarrer Apache
sudo systemctl restart apache2

# Sécuriser MySQL
sudo mysql_secure_installation
```

---

## Migration du schéma de base de données

### Correspondance des types PostgreSQL → MySQL

| PostgreSQL | MySQL | Notes |
|------------|-------|-------|
| `UUID` | `CHAR(36)` | Utiliser `UUID()` pour générer |
| `BIGSERIAL` | `BIGINT AUTO_INCREMENT` | |
| `SERIAL` | `INT AUTO_INCREMENT` | |
| `TIMESTAMPTZ` | `TIMESTAMP` | MySQL n'a pas de timezone native |
| `JSONB` | `JSON` | Moins performant mais fonctionnel |
| `TEXT` | `TEXT` ou `LONGTEXT` | |
| `BOOLEAN` | `TINYINT(1)` | 0 = false, 1 = true |
| `app_role ENUM` | `ENUM(...)` | Syntaxe similaire |

### Script SQL complet pour MySQL

```sql
-- ============================================
-- MIGRATION AGHEAL : POSTGRESQL → MYSQL
-- ============================================
-- Auteur : Geoffroy Streit
-- Date : 2025
-- ============================================

-- Utiliser la base de données
USE agheal;

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour générer des UUID
DELIMITER //
CREATE FUNCTION IF NOT EXISTS uuid_v4()
RETURNS CHAR(36)
DETERMINISTIC
BEGIN
    RETURN LOWER(CONCAT(
        HEX(RANDOM_BYTES(4)), '-',
        HEX(RANDOM_BYTES(2)), '-',
        '4', SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3), '-',
        CONCAT(HEX(FLOOR(ASCII(RANDOM_BYTES(1)) / 64) + 8), SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3)), '-',
        HEX(RANDOM_BYTES(6))
    ));
END //
DELIMITER ;

-- ============================================
-- TABLE : profiles (Profils utilisateurs)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
    id CHAR(36) NOT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    remarks_health TEXT DEFAULT NULL,
    statut_compte VARCHAR(20) DEFAULT 'actif',
    organization VARCHAR(100) DEFAULT NULL,
    avatar_base64 LONGTEXT DEFAULT NULL,
    additional_info TEXT DEFAULT NULL,
    coach_remarks TEXT DEFAULT NULL,
    age INT DEFAULT NULL,
    payment_status VARCHAR(20) DEFAULT 'en_attente',
    renewal_date DATE DEFAULT NULL,
    notify_session_reminder_email TINYINT(1) DEFAULT 1,
    notify_new_session_email TINYINT(1) DEFAULT 1,
    notify_renewal_reminder_email TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_profiles_email (email),
    INDEX idx_profiles_statut (statut_compte),
    INDEX idx_profiles_payment (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : users (Authentification - remplace auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_confirmed_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_sign_in_at TIMESTAMP DEFAULT NULL,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : user_roles (Rôles utilisateurs)
-- ============================================

CREATE TABLE IF NOT EXISTS user_roles (
    user_id CHAR(36) NOT NULL,
    role ENUM('admin', 'coach', 'adherent') NOT NULL DEFAULT 'adherent',
    
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : locations (Lieux)
-- ============================================

CREATE TABLE IF NOT EXISTS locations (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_by CHAR(36) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_locations_name (name),
    CONSTRAINT fk_locations_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : session_types (Types d'activités)
-- ============================================

CREATE TABLE IF NOT EXISTS session_types (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    default_location_id CHAR(36) DEFAULT NULL,
    created_by CHAR(36) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_session_types_name (name),
    CONSTRAINT fk_session_types_location FOREIGN KEY (default_location_id) REFERENCES locations(id) ON DELETE SET NULL,
    CONSTRAINT fk_session_types_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : sessions (Séances)
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    type_id CHAR(36) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    location_id CHAR(36) DEFAULT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    min_people INT DEFAULT 1,
    max_people INT DEFAULT 10,
    equipment_location TEXT DEFAULT NULL,
    equipment_coach TEXT DEFAULT NULL,
    equipment_clients TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'published',
    created_by CHAR(36) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_sessions_date (date),
    INDEX idx_sessions_status (status),
    INDEX idx_sessions_type (type_id),
    CONSTRAINT fk_sessions_type FOREIGN KEY (type_id) REFERENCES session_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_sessions_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    CONSTRAINT fk_sessions_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : registrations (Inscriptions)
-- ============================================

CREATE TABLE IF NOT EXISTS registrations (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_registrations_session_user (session_id, user_id),
    INDEX idx_registrations_session (session_id),
    INDEX idx_registrations_user (user_id),
    CONSTRAINT fk_registrations_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : groups (Groupes)
-- ============================================

CREATE TABLE IF NOT EXISTS `groups` (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    details TEXT DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_by CHAR(36) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_groups_name (name),
    CONSTRAINT fk_groups_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : user_groups (Affectations aux groupes)
-- ============================================

CREATE TABLE IF NOT EXISTS user_groups (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    group_id CHAR(36) NOT NULL,
    assigned_by CHAR(36) DEFAULT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_groups (user_id, group_id),
    INDEX idx_user_groups_user (user_id),
    INDEX idx_user_groups_group (group_id),
    CONSTRAINT fk_user_groups_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_groups_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_groups_assigned_by FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : app_info (Configuration application)
-- ============================================

CREATE TABLE IF NOT EXISTS app_info (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    `key` VARCHAR(100) NOT NULL,
    value TEXT DEFAULT NULL,
    updated_by CHAR(36) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_info_key (`key`),
    CONSTRAINT fk_app_info_updated_by FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : logs (Journalisation)
-- ============================================

CREATE TABLE IF NOT EXISTS logs (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_created_at (created_at),
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : password_resets (Réinitialisation mot de passe)
-- ============================================

CREATE TABLE IF NOT EXISTS password_resets (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token CHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_password_resets_token (token),
    INDEX idx_password_resets_user (user_id),
    CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE : refresh_tokens (Tokens de rafraîchissement)
-- ============================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token CHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_tokens_token (token),
    INDEX idx_refresh_tokens_user (user_id),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger pour créer automatiquement un profil après création d'un utilisateur
DELIMITER //
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO profiles (id, email, created_at)
    VALUES (NEW.id, NEW.email, NOW());
    
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'adherent');
END //
DELIMITER ;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Insérer les configurations par défaut
INSERT INTO app_info (`key`, value) VALUES
    ('infos_complementaires', ''),
    ('precisions', ''),
    ('communication_speciale', '')
ON DUPLICATE KEY UPDATE value = value;

-- ============================================
-- VUES UTILITAIRES
-- ============================================

-- Vue pour les sessions avec informations complètes
CREATE OR REPLACE VIEW v_sessions_full AS
SELECT 
    s.*,
    st.name AS type_name,
    st.description AS type_description,
    l.name AS location_name,
    l.address AS location_address,
    CONCAT(p.first_name, ' ', p.last_name) AS created_by_name,
    (SELECT COUNT(*) FROM registrations r WHERE r.session_id = s.id) AS registration_count
FROM sessions s
LEFT JOIN session_types st ON s.type_id = st.id
LEFT JOIN locations l ON s.location_id = l.id
LEFT JOIN profiles p ON s.created_by = p.id;

-- Vue pour les profils avec rôles
CREATE OR REPLACE VIEW v_profiles_with_roles AS
SELECT 
    p.*,
    GROUP_CONCAT(ur.role ORDER BY 
        CASE ur.role 
            WHEN 'admin' THEN 1 
            WHEN 'coach' THEN 2 
            ELSE 3 
        END
    ) AS roles,
    (SELECT ur2.role FROM user_roles ur2 WHERE ur2.user_id = p.id 
     ORDER BY CASE ur2.role WHEN 'admin' THEN 1 WHEN 'coach' THEN 2 ELSE 3 END 
     LIMIT 1) AS primary_role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.id;

-- ============================================
-- DONNÉES DE SEED (TYPES & LIEUX)
-- ============================================

-- Types de séances
INSERT INTO session_types (name, description) VALUES
  ('Circuit training', 'Entraînement en circuit avec exercices variés'),
  ('Marche nordique', 'Marche sportive avec bâtons'),
  ('Pilates', 'Renforcement musculaire doux et posture'),
  ('Bilan santé / capacités', 'Évaluation forme physique'),
  ('Coaching remise en forme', 'Accompagnement personnalisé'),
  ('Atelier mobilité', 'Travail de la souplesse et mobilité'),
  ('Renfo doux', 'Renforcement musculaire adapté')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Lieux
INSERT INTO locations (name, address, notes) VALUES
  ('Parc des Sports', 'Brumath', 'Terrain extérieur'),
  ('Salle AGHeal', '39 rue Balzac, 67170 Brumath', 'Salle couverte'),
  ('Bord du Lac', 'Brumath', 'Parcours nature'),
  ('Studio Adapt''Movement', '6 rue des Champs, 67170 Hochstett', 'Studio équipé'),
  ('Parcours Santé Ville', 'Centre-ville Brumath', 'Parcours aménagé')
ON DUPLICATE KEY UPDATE name = VALUES(name);
```

### Exécution du script

```bash
# Via ligne de commande
mysql -u agheal_user -p agheal < migration_schema.sql

# Ou via phpMyAdmin
# 1. Ouvrir http://localhost/phpmyadmin
# 2. Sélectionner la base "agheal"
# 3. Onglet "Importer" > Sélectionner le fichier SQL
```

---

## Création du backend API

### Structure du projet API PHP

```
agheal-api/
├── public/
│   ├── index.php              # Point d'entrée unique
│   └── .htaccess              # Réécriture URL
├── src/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── SessionController.php
│   │   ├── ProfileController.php
│   │   ├── LocationController.php
│   │   ├── GroupController.php
│   │   └── EmailController.php
│   ├── Middleware/
│   │   ├── AuthMiddleware.php
│   │   ├── CorsMiddleware.php
│   │   └── RoleMiddleware.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Profile.php
│   │   ├── Session.php
│   │   └── ...
│   ├── Services/
│   │   ├── JWTService.php
│   │   ├── EmailService.php
│   │   └── GoogleAuthService.php
│   └── Config/
│       ├── database.php
│       └── app.php
├── vendor/                     # Dépendances Composer
├── composer.json
└── .env
```

### Installation des dépendances PHP

```json
{
    "name": "agheal/api",
    "require": {
        "php": ">=8.1",
        "firebase/php-jwt": "^6.0",
        "vlucas/phpdotenv": "^5.5",
        "phpmailer/phpmailer": "^6.8",
        "google/apiclient": "^2.15"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

```bash
# Installer les dépendances
cd agheal-api
composer install
```

### Configuration de la base de données

```php
<?php
// src/Config/database.php

return [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'port' => $_ENV['DB_PORT'] ?? '3306',
    'database' => $_ENV['DB_NAME'] ?? 'agheal',
    'username' => $_ENV['DB_USER'] ?? 'agheal_user',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];
```

### Classe de connexion PDO

```php
<?php
// src/Database.php

namespace App;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;
    
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $config = require __DIR__ . '/Config/database.php';
            
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $config['host'],
                $config['port'],
                $config['database'],
                $config['charset']
            );
            
            try {
                self::$instance = new PDO($dsn, $config['username'], $config['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                throw new \RuntimeException('Database connection failed: ' . $e->getMessage());
            }
        }
        
        return self::$instance;
    }
}
```

### Point d'entrée API (Router)

```php
<?php
// public/index.php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Charger les variables d'environnement
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Router simple
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Routes
$routes = [
    // Auth
    'POST /api/auth/signup' => ['AuthController', 'signup'],
    'POST /api/auth/login' => ['AuthController', 'login'],
    'POST /api/auth/logout' => ['AuthController', 'logout'],
    'POST /api/auth/refresh' => ['AuthController', 'refresh'],
    'POST /api/auth/reset-password' => ['AuthController', 'resetPassword'],
    'POST /api/auth/update-password' => ['AuthController', 'updatePassword'],
    'GET /api/auth/google' => ['AuthController', 'googleRedirect'],
    'GET /api/auth/google/callback' => ['AuthController', 'googleCallback'],
    
    // Profiles
    'GET /api/profiles' => ['ProfileController', 'index'],
    'GET /api/profiles/{id}' => ['ProfileController', 'show'],
    'PUT /api/profiles/{id}' => ['ProfileController', 'update'],
    
    // Sessions
    'GET /api/sessions' => ['SessionController', 'index'],
    'GET /api/sessions/{id}' => ['SessionController', 'show'],
    'POST /api/sessions' => ['SessionController', 'store'],
    'PUT /api/sessions/{id}' => ['SessionController', 'update'],
    'DELETE /api/sessions/{id}' => ['SessionController', 'destroy'],
    
    // Registrations
    'POST /api/registrations' => ['RegistrationController', 'store'],
    'DELETE /api/registrations/{id}' => ['RegistrationController', 'destroy'],
    
    // Locations
    'GET /api/locations' => ['LocationController', 'index'],
    'POST /api/locations' => ['LocationController', 'store'],
    'PUT /api/locations/{id}' => ['LocationController', 'update'],
    'DELETE /api/locations/{id}' => ['LocationController', 'destroy'],
    
    // Session Types
    'GET /api/session-types' => ['SessionTypeController', 'index'],
    'POST /api/session-types' => ['SessionTypeController', 'store'],
    'PUT /api/session-types/{id}' => ['SessionTypeController', 'update'],
    'DELETE /api/session-types/{id}' => ['SessionTypeController', 'destroy'],
    
    // Groups
    'GET /api/groups' => ['GroupController', 'index'],
    'POST /api/groups' => ['GroupController', 'store'],
    'PUT /api/groups/{id}' => ['GroupController', 'update'],
    'DELETE /api/groups/{id}' => ['GroupController', 'destroy'],
    
    // Email
    'POST /api/contact' => ['EmailController', 'sendContact'],
];

// Trouver la route correspondante
$routeKey = "$method $uri";
$handler = null;
$params = [];

foreach ($routes as $pattern => $controller) {
    $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
    $regex = '#^' . str_replace('/', '\/', $regex) . '$#';
    
    if (preg_match($regex, $routeKey, $matches)) {
        $handler = $controller;
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        break;
    }
}

if ($handler) {
    [$controllerClass, $method] = $handler;
    $controllerClass = "App\\Controllers\\$controllerClass";
    
    try {
        $controller = new $controllerClass();
        $response = $controller->$method($params);
        echo json_encode($response);
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}
```

### Fichier .htaccess

```apache
# public/.htaccess

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

---

## Migration du système d'authentification

### Service JWT

```php
<?php
// src/Services/JWTService.php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTService
{
    private string $secretKey;
    private string $algorithm = 'HS256';
    private int $accessTokenExpiry = 3600; // 1 heure
    private int $refreshTokenExpiry = 604800; // 7 jours
    
    public function __construct()
    {
        $this->secretKey = $_ENV['JWT_SECRET'] ?? throw new \RuntimeException('JWT_SECRET not configured');
    }
    
    public function generateAccessToken(string $userId, array $roles): string
    {
        $payload = [
            'iss' => $_ENV['APP_URL'] ?? 'http://localhost',
            'sub' => $userId,
            'roles' => $roles,
            'iat' => time(),
            'exp' => time() + $this->accessTokenExpiry,
            'type' => 'access'
        ];
        
        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }
    
    public function generateRefreshToken(string $userId): string
    {
        $token = bin2hex(random_bytes(32));
        
        // Sauvegarder en base de données
        $db = \App\Database::getInstance();
        $stmt = $db->prepare('
            INSERT INTO refresh_tokens (id, user_id, token, expires_at)
            VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
        ');
        $stmt->execute([$userId, hash('sha256', $token)]);
        
        return $token;
    }
    
    public function validateAccessToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, $this->algorithm));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
    
    public function validateRefreshToken(string $token): ?string
    {
        $db = \App\Database::getInstance();
        $stmt = $db->prepare('
            SELECT user_id FROM refresh_tokens 
            WHERE token = ? AND expires_at > NOW() AND revoked_at IS NULL
        ');
        $stmt->execute([hash('sha256', $token)]);
        $result = $stmt->fetch();
        
        return $result ? $result['user_id'] : null;
    }
    
    public function revokeRefreshToken(string $token): void
    {
        $db = \App\Database::getInstance();
        $stmt = $db->prepare('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?');
        $stmt->execute([hash('sha256', $token)]);
    }
}
```

### Contrôleur d'authentification

```php
<?php
// src/Controllers/AuthController.php

namespace App\Controllers;

use App\Database;
use App\Services\JWTService;

class AuthController
{
    private JWTService $jwtService;
    
    public function __construct()
    {
        $this->jwtService = new JWTService();
    }
    
    public function signup(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return ['error' => 'Email and password are required'];
        }
        
        if (strlen($data['password']) < 6) {
            http_response_code(400);
            return ['error' => 'Password must be at least 6 characters'];
        }
        
        $db = Database::getInstance();
        
        // Vérifier si l'email existe déjà
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            return ['error' => 'Email already exists'];
        }
        
        // Créer l'utilisateur
        $userId = $this->generateUuid();
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        
        $db->beginTransaction();
        
        try {
            // Insérer l'utilisateur
            $stmt = $db->prepare('
                INSERT INTO users (id, email, password_hash, email_confirmed_at)
                VALUES (?, ?, ?, NOW())
            ');
            $stmt->execute([$userId, $data['email'], $passwordHash]);
            
            // Mettre à jour le profil avec les infos supplémentaires
            if (!empty($data['first_name']) || !empty($data['last_name'])) {
                $stmt = $db->prepare('
                    UPDATE profiles SET first_name = ?, last_name = ? WHERE id = ?
                ');
                $stmt->execute([
                    $data['first_name'] ?? null,
                    $data['last_name'] ?? null,
                    $userId
                ]);
            }
            
            $db->commit();
            
            // Générer les tokens
            $accessToken = $this->jwtService->generateAccessToken($userId, ['adherent']);
            $refreshToken = $this->jwtService->generateRefreshToken($userId);
            
            return [
                'user' => [
                    'id' => $userId,
                    'email' => $data['email']
                ],
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken
            ];
            
        } catch (\Exception $e) {
            $db->rollBack();
            http_response_code(500);
            return ['error' => 'Registration failed'];
        }
    }
    
    public function login(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return ['error' => 'Email and password are required'];
        }
        
        $db = Database::getInstance();
        
        // Récupérer l'utilisateur
        $stmt = $db->prepare('SELECT id, password_hash FROM users WHERE email = ?');
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            http_response_code(401);
            return ['error' => 'Invalid credentials'];
        }
        
        // Vérifier le statut du compte
        $stmt = $db->prepare('SELECT statut_compte FROM profiles WHERE id = ?');
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();
        
        if ($profile && $profile['statut_compte'] === 'bloqué') {
            http_response_code(403);
            return ['error' => 'Account is blocked'];
        }
        
        // Récupérer les rôles
        $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $roles = array_column($stmt->fetchAll(), 'role');
        
        // Mettre à jour last_sign_in_at
        $stmt = $db->prepare('UPDATE users SET last_sign_in_at = NOW() WHERE id = ?');
        $stmt->execute([$user['id']]);
        
        // Générer les tokens
        $accessToken = $this->jwtService->generateAccessToken($user['id'], $roles);
        $refreshToken = $this->jwtService->generateRefreshToken($user['id']);
        
        return [
            'user' => ['id' => $user['id']],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken
        ];
    }
    
    public function resetPassword(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['email'])) {
            http_response_code(400);
            return ['error' => 'Email is required'];
        }
        
        $db = Database::getInstance();
        
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        if ($user) {
            $token = bin2hex(random_bytes(32));
            
            $stmt = $db->prepare('
                INSERT INTO password_resets (id, user_id, token, expires_at)
                VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
            ');
            $stmt->execute([$user['id'], hash('sha256', $token)]);
            
            // Envoyer l'email (via EmailService)
            $emailService = new \App\Services\EmailService();
            $emailService->sendPasswordReset($data['email'], $token);
        }
        
        // Toujours retourner success pour éviter l'énumération
        return ['message' => 'If the email exists, a reset link has been sent'];
    }
    
    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
```

### Middleware d'authentification

```php
<?php
// src/Middleware/AuthMiddleware.php

namespace App\Middleware;

use App\Services\JWTService;

class AuthMiddleware
{
    private JWTService $jwtService;
    
    public function __construct()
    {
        $this->jwtService = new JWTService();
    }
    
    public function handle(): ?array
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            exit;
        }
        
        $token = $matches[1];
        $payload = $this->jwtService->validateAccessToken($token);
        
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
        
        return $payload;
    }
}
```

---

## Adaptation du code React

### Nouveau service API

```typescript
// src/services/api.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens(): void {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Si le token a expiré, essayer de le rafraîchir
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        this.saveTokens(tokens);
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }

    this.clearTokens();
    return false;
  }

  // ========== AUTH ==========

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    const data = await this.request<{ user: any } & AuthTokens>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });
    this.saveTokens(data);
    return data;
  }

  async signIn(email: string, password: string) {
    const data = await this.request<{ user: any } & AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.saveTokens(data);
    return data;
  }

  async signOut() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearTokens();
  }

  async resetPassword(email: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  getGoogleAuthUrl(): string {
    return `${API_URL}/auth/google`;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ========== PROFILES ==========

  async getProfiles() {
    return this.request<any[]>('/profiles');
  }

  async getProfile(id: string) {
    return this.request<any>(`/profiles/${id}`);
  }

  async updateProfile(id: string, data: any) {
    return this.request<any>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========== SESSIONS ==========

  async getSessions(filters?: { date?: string; status?: string }) {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request<any[]>(`/sessions?${params}`);
  }

  async getSession(id: string) {
    return this.request<any>(`/sessions/${id}`);
  }

  async createSession(data: any) {
    return this.request<any>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: string, data: any) {
    return this.request<any>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string) {
    return this.request(`/sessions/${id}`, { method: 'DELETE' });
  }

  // ========== REGISTRATIONS ==========

  async register(sessionId: string) {
    return this.request<any>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  async unregister(registrationId: string) {
    return this.request(`/registrations/${registrationId}`, { method: 'DELETE' });
  }

  // ========== LOCATIONS ==========

  async getLocations() {
    return this.request<any[]>('/locations');
  }

  async createLocation(data: any) {
    return this.request<any>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: string, data: any) {
    return this.request<any>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLocation(id: string) {
    return this.request(`/locations/${id}`, { method: 'DELETE' });
  }

  // ========== SESSION TYPES ==========

  async getSessionTypes() {
    return this.request<any[]>('/session-types');
  }

  async createSessionType(data: any) {
    return this.request<any>('/session-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSessionType(id: string, data: any) {
    return this.request<any>(`/session-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSessionType(id: string) {
    return this.request(`/session-types/${id}`, { method: 'DELETE' });
  }

  // ========== GROUPS ==========

  async getGroups() {
    return this.request<any[]>('/groups');
  }

  async createGroup(data: any) {
    return this.request<any>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGroup(id: string, data: any) {
    return this.request<any>(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string) {
    return this.request(`/groups/${id}`, { method: 'DELETE' });
  }

  // ========== CONTACT ==========

  async sendContactEmail(data: { name: string; email: string; subject: string; message: string }) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
```

### Hook useAuth adapté

```typescript
// src/hooks/useAuth.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';

type AppRole = 'admin' | 'coach' | 'adherent';

interface User {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (api.isAuthenticated()) {
        // Récupérer les infos utilisateur depuis le token
        const token = localStorage.getItem('access_token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ id: payload.sub });
          setRoles(payload.roles || ['adherent']);
          setRole(getPrimaryRole(payload.roles || ['adherent']));
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryRole = (roles: AppRole[]): AppRole => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('coach')) return 'coach';
    return 'adherent';
  };

  const signIn = async (email: string, password: string) => {
    const response = await api.signIn(email, password);
    setUser(response.user);
    await checkAuth();
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await api.signUp(email, password, firstName, lastName);
    setUser(response.user);
    await checkAuth();
  };

  const signInWithGoogle = () => {
    window.location.href = api.getGoogleAuthUrl();
  };

  const signOut = async () => {
    await api.signOut();
    setUser(null);
    setRole(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, role, roles, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Variables d'environnement

```bash
# .env (frontend React)
VITE_API_URL=http://api.agheal.local
```

```bash
# agheal-api/.env (backend PHP)
APP_URL=http://api.agheal.local
FRONTEND_URL=http://localhost:5173

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agheal
DB_USER=agheal_user
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise_minimum_32_caracteres

# Email (Resend ou SMTP)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=votre_email
MAIL_PASSWORD=votre_mot_de_passe
MAIL_FROM_ADDRESS=noreply@agheal.fr
MAIL_FROM_NAME=AGHeal

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=http://api.agheal.local/auth/google/callback
```

---

## Conversion des Edge Functions

### Envoi d'email de contact (PHP)

```php
<?php
// src/Services/EmailService.php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private PHPMailer $mailer;
    
    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        $this->configure();
    }
    
    private function configure(): void
    {
        $this->mailer->isSMTP();
        $this->mailer->Host = $_ENV['MAIL_HOST'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $_ENV['MAIL_USERNAME'];
        $this->mailer->Password = $_ENV['MAIL_PASSWORD'];
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = (int) $_ENV['MAIL_PORT'];
        $this->mailer->setFrom($_ENV['MAIL_FROM_ADDRESS'], $_ENV['MAIL_FROM_NAME']);
        $this->mailer->CharSet = 'UTF-8';
    }
    
    public function sendContactEmail(string $name, string $email, string $subject, string $message): bool
    {
        try {
            $this->mailer->clearAddresses();
            
            // Envoyer aux coachs
            $recipients = [
                'guillaume.trautmann@agheal.fr',
                'amandine.motsch@agheal.fr',
                'ag.heal67@gmail.com'
            ];
            
            foreach ($recipients as $recipient) {
                $this->mailer->addAddress($recipient);
            }
            
            $this->mailer->Subject = "[AGHeal Contact] $subject";
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getContactEmailTemplate($name, $email, $subject, $message);
            $this->mailer->AltBody = "Nouveau message de $name ($email)\n\nSujet: $subject\n\nMessage:\n$message";
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email error: " . $this->mailer->ErrorInfo);
            return false;
        }
    }
    
    public function sendPasswordReset(string $email, string $token): bool
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $resetUrl = $_ENV['FRONTEND_URL'] . '/reset-password?token=' . $token;
            
            $this->mailer->Subject = "Réinitialisation de votre mot de passe AGHeal";
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getPasswordResetTemplate($resetUrl);
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email error: " . $this->mailer->ErrorInfo);
            return false;
        }
    }
    
    public function sendSessionReminder(string $email, string $name, array $session): bool
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $this->mailer->Subject = "Rappel : Séance demain - " . $session['title'];
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getSessionReminderTemplate($name, $session);
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email error: " . $this->mailer->ErrorInfo);
            return false;
        }
    }
    
    private function getContactEmailTemplate(string $name, string $email, string $subject, string $message): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                .content { background: #f9fafb; padding: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Nouveau message de contact</h1>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">Nom :</div>
                        <div>{$name}</div>
                    </div>
                    <div class="field">
                        <div class="label">Email :</div>
                        <div><a href="mailto:{$email}">{$email}</a></div>
                    </div>
                    <div class="field">
                        <div class="label">Sujet :</div>
                        <div>{$subject}</div>
                    </div>
                    <div class="field">
                        <div class="label">Message :</div>
                        <div style="white-space: pre-wrap;">{$message}</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        HTML;
    }
    
    private function getPasswordResetTemplate(string $resetUrl): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Réinitialisation de mot de passe</h1>
                <p>Vous avez demandé à réinitialiser votre mot de passe AGHeal.</p>
                <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{$resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                </p>
                <p><small>Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</small></p>
            </div>
        </body>
        </html>
        HTML;
    }
    
    private function getSessionReminderTemplate(string $name, array $session): string
    {
        $date = date('d/m/Y', strtotime($session['date']));
        $startTime = date('H:i', strtotime($session['start_time']));
        $endTime = date('H:i', strtotime($session['end_time']));
        
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .session-card { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Rappel de séance</h1>
                <p>Bonjour {$name},</p>
                <p>Nous vous rappelons votre séance de demain :</p>
                <div class="session-card">
                    <h2>{$session['title']}</h2>
                    <p><strong>Date :</strong> {$date}</p>
                    <p><strong>Horaire :</strong> {$startTime} - {$endTime}</p>
                    <p><strong>Lieu :</strong> {$session['location_name']}</p>
                </div>
                <p>À demain !</p>
                <p>L'équipe AGHeal</p>
            </div>
        </body>
        </html>
        HTML;
    }
}
```

### Script cron pour les rappels

```php
<?php
// cron/send-reminders.php
// À exécuter via cron : 0 7 * * * php /path/to/agheal-api/cron/send-reminders.php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use App\Database;
use App\Services\EmailService;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$db = Database::getInstance();
$emailService = new EmailService();

// Récupérer les séances de demain
$tomorrow = date('Y-m-d', strtotime('+1 day'));

$stmt = $db->prepare('
    SELECT 
        s.*,
        l.name AS location_name,
        l.address AS location_address
    FROM sessions s
    LEFT JOIN locations l ON s.location_id = l.id
    WHERE s.date = ? AND s.status = "published"
');
$stmt->execute([$tomorrow]);
$sessions = $stmt->fetchAll();

foreach ($sessions as $session) {
    // Récupérer les inscrits qui veulent recevoir les notifications
    $stmt = $db->prepare('
        SELECT p.email, p.first_name, p.last_name
        FROM registrations r
        JOIN profiles p ON r.user_id = p.id
        WHERE r.session_id = ?
        AND p.notify_session_reminder_email = 1
        AND p.email IS NOT NULL
    ');
    $stmt->execute([$session['id']]);
    $registrants = $stmt->fetchAll();
    
    foreach ($registrants as $registrant) {
        $name = trim($registrant['first_name'] . ' ' . $registrant['last_name']) ?: 'Adhérent';
        $emailService->sendSessionReminder($registrant['email'], $name, $session);
        echo "Sent reminder to {$registrant['email']} for session {$session['title']}\n";
    }
}

echo "Done. Sent reminders for " . count($sessions) . " sessions.\n";
```

### Configuration cron (Linux)

```bash
# Éditer le crontab
crontab -e

# Ajouter la ligne suivante pour exécuter à 7h00 chaque jour
0 7 * * * /usr/bin/php /var/www/agheal-api/cron/send-reminders.php >> /var/log/agheal-reminders.log 2>&1
```

---

## Tests et validation

### Checklist de tests

#### 1. Base de données
- [ ] Toutes les tables créées
- [ ] Contraintes et indexes fonctionnels
- [ ] Triggers actifs
- [ ] Données de test insérées

#### 2. Authentification
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Réinitialisation mot de passe
- [ ] Google OAuth (si configuré)
- [ ] Refresh token fonctionne

#### 3. API REST
- [ ] GET /profiles
- [ ] GET/PUT /profiles/:id
- [ ] CRUD /sessions
- [ ] CRUD /locations
- [ ] CRUD /session-types
- [ ] CRUD /groups
- [ ] POST/DELETE /registrations

#### 4. Emails
- [ ] Email de contact
- [ ] Email de réinitialisation
- [ ] Rappels de séance (cron)

#### 5. Frontend
- [ ] Connexion/Inscription
- [ ] Navigation selon rôle
- [ ] Affichage des séances
- [ ] Inscription aux séances
- [ ] Profil utilisateur

### Script de test API

```bash
#!/bin/bash
# test-api.sh

API_URL="http://api.agheal.local"

echo "=== Test API AGHeal ==="

# Test signup
echo -n "Testing signup... "
RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}')
echo $RESPONSE | jq -e '.access_token' > /dev/null && echo "OK" || echo "FAIL"

# Extraire le token
TOKEN=$(echo $RESPONSE | jq -r '.access_token')

# Test get sessions
echo -n "Testing get sessions... "
curl -s -X GET "$API_URL/sessions" \
  -H "Authorization: Bearer $TOKEN" | jq -e '. | type == "array"' > /dev/null && echo "OK" || echo "FAIL"

# Test get locations
echo -n "Testing get locations... "
curl -s -X GET "$API_URL/locations" \
  -H "Authorization: Bearer $TOKEN" | jq -e '. | type == "array"' > /dev/null && echo "OK" || echo "FAIL"

echo "=== Tests terminés ==="
```

---

## Checklist de migration

### Phase 1 : Préparation
- [ ] Installer WAMP/LAMP/MAMP
- [ ] Configurer PHP et extensions
- [ ] Créer la base de données MySQL
- [ ] Configurer le Virtual Host Apache

### Phase 2 : Base de données
- [ ] Exécuter le script de création des tables
- [ ] Vérifier les contraintes et indexes
- [ ] Exporter les données de Supabase (si nécessaire)
- [ ] Importer les données dans MySQL

### Phase 3 : Backend API
- [ ] Créer la structure du projet PHP
- [ ] Installer les dépendances Composer
- [ ] Configurer le fichier .env
- [ ] Implémenter l'authentification JWT
- [ ] Implémenter les endpoints API
- [ ] Tester chaque endpoint

### Phase 4 : Frontend
- [ ] Créer le service API
- [ ] Adapter le hook useAuth
- [ ] Mettre à jour les variables d'environnement
- [ ] Remplacer les appels Supabase par l'API
- [ ] Tester l'application complète

### Phase 5 : Emails
- [ ] Configurer PHPMailer avec SMTP
- [ ] Tester l'envoi d'emails
- [ ] Configurer le cron pour les rappels

### Phase 6 : Production
- [ ] Désactiver les erreurs PHP en production
- [ ] Configurer HTTPS (Let's Encrypt)
- [ ] Mettre en place les sauvegardes
- [ ] Monitorer les logs

---

## Estimation du temps de migration

| Tâche | Durée estimée |
|-------|---------------|
| Installation environnement | 2-4 heures |
| Migration base de données | 4-8 heures |
| Développement API PHP | 2-3 semaines |
| Adaptation frontend React | 3-5 jours |
| Système d'authentification | 1 semaine |
| Configuration emails | 1-2 jours |
| Tests et debugging | 1 semaine |
| **Total** | **4-6 semaines** |

---

*Guide de migration AGHeal - Geoffroy Streit - 2025*
