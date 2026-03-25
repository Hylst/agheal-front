# 📘 Guide Pédagogique Complet — AGHeal, de A à Z

> Ce guide a été rédigé spécialement pour un débutant en développement qui souhaite comprendre comment fonctionne AGHeal, pourquoi chaque décision technique a été prise, et comment tous les morceaux s'emboîtent. Pas de jargon inutile — chaque terme technique est expliqué à sa première apparition.

---

## Table des matières

1. [L'architecture globale — Le Client-Serveur](#1-larchitecture-globale--le-client-serveur)
2. [Le Frontend — Ce que voit l'utilisateur](#2-le-frontend--ce-que-voit-lutilisateur)
3. [Le Backend — Le moteur invisible](#3-le-backend--le-moteur-invisible)
4. [La Base de données — La mémoire de l'application](#4-la-base-de-données--la-mémoire-de-lapplication)
5. [La Sécurité — Les jetons JWT](#5-la-sécurité--les-jetons-jwt)
6. [Les Rôles — Admin, Coach, Adhérent](#6-les-rôles--admin-coach-adhérent)
7. [Parcours complet : de la connexion à l'appel d'une séance](#7-parcours-complet--de-la-connexion-à-lappel-dune-séance)
8. [Le module Statistiques & Historique](#8-le-module-statistiques--historique)
9. [Les Mécanismes automatisés (Cron Jobs)](#9-les-mécanismes-automatisés-cron-jobs)
10. [Les fichiers SQL — init, seed, migrate](#10-les-fichiers-sql--init-seed-migrate)
11. [Structure des fichiers, fichier par fichier](#11-structure-des-fichiers-fichier-par-fichier)
12. [Les Design Patterns utilisés](#12-les-design-patterns-utilisés)
13. [Le Déploiement — Local vs Production](#13-le-déploiement--local-vs-production)
14. [Glossaire des termes techniques](#14-glossaire-des-termes-techniques)

---

## 1. L'architecture globale — Le Client-Serveur

Imaginez un grand restaurant.

- La **salle** où les clients lisent le menu = le **Frontend** (ce qui s'affiche dans votre navigateur)
- La **cuisine** qui prépare les plats selon des règles = le **Backend** (le serveur PHP)
- Le **garde-manger** où tout est stocké = la **Base de données** (MySQL)

AGHeal suit exactement cette architecture en **3 couches séparées** :

```
Navigateur (React)  ←HTTP/JSON→  API PHP  ←SQL→  Base MySQL
     AGheal/                  agheal-api/         Serveur DB
```

**Pourquoi séparer les 3 ?**

Pour la **sécurité** : le Frontend ne touche jamais directement la base de données. Il doit passer par l'API, qui vérifie les droits. Pour la **flexibilité** : demain, on peut remplacer le Frontend React par une app mobile, sans toucher au Backend.

---

## 2. Le Frontend — Ce que voit l'utilisateur

### Les technologies

| Outil | Rôle | Analogie |
|---|---|---|
| **React** | Bibliothèque pour créer des interfaces | Le chef qui assemble les plats |
| **TypeScript** | JavaScript amélioré avec vérification de types | Le chef qui vérifie ses ingrédients avant de cuisiner |
| **Vite** | Serveur de développement ultra-rapide | Le four qui cuit en 1 seconde |
| **Tailwind CSS** | Système de classes CSS utilitaires (`text-red-500`) | La palette de couleurs du chef |
| **Shadcn/UI** | Composants prêts à l'emploi (boutons, modales) | Les plats préparés du traiteur |
| **React Router** | Gère les "pages" sans recharger le navigateur | Le GPS de l'application |
| **React Query** | Gère les requêtes réseau + mise en cache | Le garçon qui note les commandes |

### Qu'est-ce qu'une SPA ?

AGHeal est une **SPA** (Single Page Application). Cela signifie que le navigateur charge une seule fois le code de l'application, et ensuite **navigue sans jamais recharger la page**. Quand on clique sur "Séances", le contenu change mais il n'y a pas de "blanc" entre les pages — c'est instantané et fluide.

### Structure du dossier `src/`

```
src/
├── main.tsx              # Point d'entrée : monte React dans le HTML
├── App.tsx               # Liste toutes les routes + <ProtectedRoute>
├── pages/
│   ├── Login.tsx         # Page de connexion
│   ├── Dashboard.tsx     # Tableau de bord principal
│   ├── coach/
│   │   ├── Stats.tsx         # Tableau de bord stats (coach/admin)
│   │   ├── SessionPlanning.tsx  # Planification des séances
│   │   └── SessionAttendance.tsx # Appel des présences
│   └── adherent/
│       └── MySchedule.tsx    # Mon planning (adhérent)
├── components/
│   ├── ui/               # Composants Shadcn (Button, Card, Badge...)
│   ├── Navbar.tsx        # Barre de navigation
│   └── SettingsModal.tsx # Modale paramètres
├── hooks/
│   ├── useAuth.tsx       # "Suis-je connecté ? Quel est mon rôle ?"
│   └── use-toast.tsx     # Notifications toast (messages pop-up)
└── integrations/api/
    └── client.ts         # TOUS les appels réseau centralisés ici
```

### Comment les composants parlent-ils à l'API ?

```
SessionAttendance.tsx
    → apiClient.updateAttendance(sessionId, userId, true)
        → PUT /sessions/{id}/attendance  [via HTTP avec JWT]
            → AttendanceController.php
```

Le fichier `client.ts` centralise **tous** les appels vers le backend. Chaque méthode (`getStatsOverview()`, `updateAttendance()`) correspond exactement à une route dans l'API.

### ProtectedRoute — le gardien des pages

Dans `App.tsx`, certaines routes sont enveloppées dans un `<ProtectedRoute roles={['coach', 'admin']}>`. Cela signifie : "Si l'utilisateur n'est pas connecté, ou n'a pas le bon rôle, redirige-le vers la page de connexion."

---

## 3. Le Backend — Le moteur invisible

### PHP pur, sans framework lourd

Le Backend est écrit en **PHP pur** (sans Laravel, sans Symfony). Ce choix délibéré offre :
- **Légèreté** : pas de 50 fichiers de configuration à comprendre
- **Lisibilité** : chaque fichier fait une seule chose
- **Portabilité** : fonctionne sur n'importe quel hébergement mutualisé

### L'architecture MVC adaptée à une API REST

**MVC** signifie **Modèle-Vue-Contrôleur**. Dans une API, la "Vue" n'est pas une page HTML mais du **JSON** (un format de données textuelles lisible par n'importe quel programme).

```
Requête HTTP → index.php (Routeur) → Controller → Database → JSON
```

### `public/index.php` — Le chef d'orchestre

Toutes les requêtes arrivent ici en premier. C'est lui qui lit l'URL et dit "toi, c'est la `SessionController` qui te gérera".

```php
// Exemple simplifié de routage dans index.php
if ($method === 'GET' && $path === '/sessions') {
    $controller->index();       // Liste les séances
}
if ($method === 'POST' && $path === '/sessions') {
    $controller->store();       // Crée une séance
}
```

### Les Contrôleurs (`src/Controllers/`)

| Fichier | Responsabilité |
|---|---|
| `AuthController.php` | Connexion, inscription, JWT |
| `SessionController.php` | Créer/modifier/supprimer des séances |
| `AttendanceController.php` | Marquer les présences, walk-ins |
| `StatsController.php` | Toutes les statistiques agrégées |
| `ProfileController.php` | Gérer les profils des membres |
| `PaymentController.php` | Enregistrer les paiements |
| `GroupController.php` | Gérer les groupes d'adhérents |
| `PushController.php` | Notifications push (PWA) |

### `Database.php` — Le traducteur sécurisé

C'est le seul fichier qui parle directement à MySQL. Il utilise :
- **PDO** (PHP Data Objects) : une couche d'abstraction qui empêche les injections SQL (attaques par manipulation de requêtes)
- **Pattern Singleton** : une seule instance de connexion est ouverte pendant toute la durée d'une requête, pour économiser les ressources

```php
// L'injectionSQL classique — PDO l'empêche :
// URL malveillante : /sessions?id=1' OR 1=1 --
// PDO sépare la donnée de la requête → la virgule n'est pas interprétée
$db->query("SELECT * FROM sessions WHERE id = ?", [$id]);
```

### `Auth.php` — Le contrôleur de sécurité

Deux méthodes clés :
- `Auth::requireAuth()` — vérifie que le JWT est valide, retourne le payload (dont `roles`)
- `Auth::requireRole('coach')` — appelle requireAuth() + vérifie le rôle

---

## 4. La Base de données — La mémoire de l'application

### Pourquoi des UUIDs plutôt que des chiffres ?

Les IDs "classiques" sont `1, 2, 3...` (auto-incrément). Le problème : ils sont **prédictibles**. Si votre ID est `42`, un pirate peut essayer `41`, `43`, `44`... Les **UUID** (ex: `usr-guil--0000-0000-0000-000000000002`) sont des chaînes de 36 caractères pseudo-aléatoires — impossible à deviner.

### Les tables et leur rôle

| Table | Ce qu'elle contient | Clé |
|---|---|---|
| `users` | Email + mot de passe hashé | `id` CHAR(36) |
| `profiles` | Prénom, nom, téléphone, certif médical | `id` = même que `users.id` |
| `user_roles` | Quel rôle a cet utilisateur ? | `(user_id, role)` |
| `sessions` | Les séances planifiées | `id` CHAR(36) |
| `session_types` | Types de séances (Yoga, Gym...) | `id` CHAR(36) |
| `locations` | Lieux des séances | `id` CHAR(36) |
| `registrations` | Qui est inscrit à quelle séance + était-il présent ? | `id` UUID |
| `groups` | Groupes d'adhérents (Seniors, Cardio...) | `id` CHAR(36) |
| `user_groups` | Table de liaison utilisateur ↔ groupe | composite |
| `payments_history` | Encaissements réalisés | `id` UUID |
| `logs` | Journal de toutes les actions importantes | `id` INT |
| `communications` | Messages internes | `id` INT |

### Relation `users` ↔ `profiles` — Pourquoi deux tables ?

`users` contient les informations d'**authentification** (email + mot de passe). ``profiles` contient les informations **métier** (nom, âge, certif, groupe). Cette séparation suit le principe de **responsabilité unique** : si demain on veut permettre la connexion via Google OAuth sans mot de passe, on touche uniquement à `users`, pas aux profils.

Un **trigger** (`after_user_insert`) crée automatiquement le profil correspondant dès qu'un nouvel utilisateur est inséré dans `users` — c'est un mécanisme côté base de données qui se déclenche automatiquement, comme une alarme.

### La table `registrations` — le cœur des présences

```sql
-- Une ligne de registrations raconte :
-- "Paul (user_id) s'est inscrit à la séance de Pilates (session_id)
-- le 06/03 à 10h32 — et il était bien PRÉSENT (attended=1)
-- Son arrivée a été enregistrée à 10h35 (attended_at)"

SELECT * FROM registrations WHERE session_id = 'ses-0000-p02-...';
-- → user_id            | attended | attended_at
-- → usr-paul-...       |    1     | 2026-03-06 10:30:00
-- → usr-nath-...       |    0     | NULL        (inscrit mais absent)
```

---

## 5. La Sécurité — Les jetons JWT

### Comment fonctionne la connexion ?

1. L'utilisateur entre son email + mot de passe
2. Le Backend vérifie le mot de passe contre le hash stocké (`password_verify()`)
3. Si correct, le Backend forge un **JWT** (JSON Web Token)
4. Ce JWT est un paquet de données **signé cryptographiquement** qui contient : l'ID utilisateur, ses rôles, la date d'expiration
5. Le Frontend stocke ce JWT (dans `localStorage`)

### Pourquoi "JWT" et pas juste un cookie de session classique ?

Un JWT est **autonome** : le serveur n'a pas besoin de stocker les sessions en base de données. Il lui suffit de vérifier la signature cryptographique du token. C'est plus léger et naturellement adapté aux APIs. De plus, il fonctionne entre plusieurs domaines (front sur `agheal.hylst.fr`, API sur `api.agheal.hylst.fr`).

### Structure d'un JWT

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIn0.abcdef
     ↑ Header             ↑ Payload (données)     ↑ Signature
```

Le Payload contient les `roles` sous forme de tableau : `["coach", "adherent"]`.

---

## 6. Les Rôles — Admin, Coach, Adhérent

### Les 3 rôles

| Rôle | Ce qu'il peut faire |
|---|---|
| `admin` | Tout — y compris gérer les coachs et consulter toutes les stats |
| `coach` | Planifier des séances, faire l'appel, voir les stats et logs |
| `adherent` | S'inscrire aux séances, voir son planning personnel |

Un utilisateur peut avoir **plusieurs rôles** (ex: Guillaume est à la fois `coach` ET `adherent`). C'est pourquoi `user_roles` est une table séparée avec une ligne par rôle, et non une simple colonne.

### Vérification des rôles — côté Backend

```php
// Dans StatsController.php
private function requireCoachOrAdmin(): void {
    $currentUser = Auth::requireAuth(); // Vérifie le JWT
    $userRoles = $currentUser['roles'] ?? [];
    // array_intersect : "y a-t-il une intersection entre les rôles de l'user
    // et les rôles autorisés ?"
    if (empty(array_intersect($userRoles, ['coach', 'admin']))) {
        http_response_code(403); // "Interdit"
        exit;
    }
}
```

### Vérification des rôles — côté Frontend

```typescript
// Dans useAuth.tsx
const isCoach = user?.roles?.includes('coach');
// Dans App.tsx
<ProtectedRoute roles={['coach', 'admin']}>
  <Stats />
</ProtectedRoute>
```

---

## 7. Parcours complet : de la connexion à l'appel d'une séance

Voici l'histoire complète d'une action, du clic de la souris jusqu'à l'enregistrement en base de données.

### Étape 1 : Amandine se connecte

```
1. Elle tape amandine@adaptmovement.fr + password dans Login.tsx
2. apiClient.login(email, password) → POST /auth/login
3. AuthController.php vérifie en DB : le hash correspond ?  ✓
4. Il génère un JWT signé avec les rôles ["coach","adherent"]
5. Le Frontend stocke le JWT dans localStorage
6. React Router redirige vers /dashboard
```

### Étape 2 : Elle navigue vers la séance du jour

```
7. Elle clique sur "Planification" → SessionPlanning.tsx
8. apiClient.getSessions() → GET /sessions
9. SessionController@index filtre les séances futures (>= maintenant)
10. Retourne le JSON des séances à venir → affichées dans l'interface
```

### Étape 3 : Elle ouvre l'onglet Présences d'une séance

```
11. Clic sur la séance "Pilates Mercredi 26/03"
12. apiClient.getSessionAttendance(sessionId) → GET /sessions/{id}/attendance
13. AttendanceController retourne : les 5 inscrits avec attended=false
14. SessionAttendance.tsx affiche la liste avec des cases à cocher vides
```

### Étape 4 : Elle coche Marie Dupont

```
15. Clic sur la case de Marie → toggleAttendance(sessionId, userId, true)
16. apiClient.updateAttendance(...) → PUT /sessions/{id}/attendance/{userId}
17. AttendanceController.php :
    a. Vérifie le JWT → OK, c'est bien un coach
    b. UPDATE registrations SET attended=1, attended_at=NOW()
       WHERE session_id=... AND user_id=...
    c. Retourne HTTP 200 + JSON {success: true}
18. React Query invalide le cache → réaffiche la liste
19. La case de Marie est maintenant cochée ✅
20. Un log est écrit dans la table `logs` avec les détails de la séance
```

---

## 8. Le module Statistiques & Historique

### Architecture

Ce module est accessible uniquement aux **coachs et administrateurs**. Il comprend :

| Onglet | Endpoint API | Données |
|---|---|---|
| Vue d'ensemble | `GET /stats/overview` | KPIs globaux |
| Séances | `GET /stats/sessions?months=6` | Historique des séances avec présences |
| Présences | `GET /stats/attendance?months=6` | Top membres, par type, par mois |
| Adhérents | `GET /stats/members` | Âge, groupes, certificats |
| Paiements | `GET /stats/payments?months=12` | Par méthode, par mois |
| Logs | `GET /stats/logs` | Journal des appels sauvegardés |

### Le contrôleur `StatsController.php`

Chaque méthode fait plusieurs requêtes SQL agrégées et retourne un seul JSON structuré. Exemple pour `overview()` :

```sql
-- Nombre d'adhérents actifs :
SELECT COUNT(DISTINCT p.id) FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'adherent' AND p.statut_compte = 'actif'

-- Taux de présence global :
SELECT SUM(r.attended) / COUNT(*) * 100
FROM registrations r
JOIN sessions s ON s.id = r.session_id
WHERE s.date <= CURDATE() AND s.status != 'draft'
```

### Export CSV

Le bouton "Export CSV" appelle `GET /stats/logs/export?months=12`. Le Backend génère un fichier CSV avec une **BOM UTF-8** (3 octets magiques au début : `EF BB BF`) pour que **Excel** reconnaisse automatiquement les caractères accentués.

### Téléchargement d'un log individuel

Chaque entrée de log (un appel sauvegardé) peut être téléchargée au format JSON via `GET /stats/logs/{id}/download`. Le Backend fabrique dynamiquement les headers HTTP pour forcer le téléchargement du fichier.

---

## 9. Les Mécanismes automatisés (Cron Jobs)

L'application fait des choses toute seule, même quand personne n'est connecté.

### `cron_daily.php` — tourne chaque jour

```
Chaque jour à 8h00 (configuré sur le serveur) :
1. Vérifie les certificats médicaux qui expirent dans 30 jours
2. Envoie un email automatique à l'adhérent → MailerService.php
3. Envoie une notification push → PushController.php
4. Archive les séances passées si nécessaire
```

### `cron_hourly.php` — tourne chaque heure

```
Chaque heure :
1. Nettoie les tokens d'invitation expirés
2. Met à jour les statuts de séances si nécessaire
```

### Comment fonctionne un CRON sur un serveur ?

C'est une instruction donnée au système d'exploitation : "Exécute ce fichier PHP à cette heure". Sur l'hébergeur, c'est configurable dans le cPanel ("Tâches CRON"). En local avec WAMP, il faut le déclencher manuellement ou avec un planificateur Windows.

---

## 10. Les fichiers SQL — init, seed, migrate

### Pourquoi plusieurs fichiers ?

| Fichier | Contexte d'utilisation | Quand l'exécuter |
|---|---|---|
| `init.sql` | Création complète de la BDD | Installation from scratch uniquement |
| `init_trigger.sql` | Création du trigger de profil auto | Juste après init.sql |
| `migrate_attendance.sql` | Ajout de colonnes à une BDD existante | Sur BDD déjà déployée, une seule fois |
| `seed.sql` | Données de test réalistes | En local pour tester |

### Pourquoi `init_trigger.sql` est-il séparé ?

MySQL utilise le caractère `;` pour délimiter les requêtes. Un trigger contient lui-même des `;` à l'intérieur de son corps. Pour l'écrire, on doit **changer le délimiteur** temporairement (`DELIMITER $$`). HeidiSQL exécute les fichiers SQL requête par requête — si le trigger est mélangé aux autres `CREATE TABLE`, le changement de délimiteur crée des ambiguïtés. Le séparer dans son propre fichier évite tout problème.

### Pourquoi `migrate_attendance.sql` est-il séparé ?

C'est un **patch** : il ajoute des colonnes (`attended`, `limit_registration_7_days`) à des tables **déjà existantes** en production. Si on crée une nouvelle base depuis `init.sql`, ces colonnes y sont déjà — le script de migration serait donc inutile (et générerait des erreurs "colonne déjà existante" sans `IF NOT EXISTS`). Seuls les serveurs déjà en production en ont besoin.

### Le seed — IDEMPOTENT

Le `seed.sql` commence par des `DELETE WHERE id LIKE '...'` : il se nettoie lui-même avant d'insérer. Cela le rend **idempotent** : on peut l'exécuter 10 fois de suite, on obtient toujours le même résultat propre.

---

## 11. Structure des fichiers, fichier par fichier

### Frontend (`AGheal/`)

```
AGheal/
├── src/
│   ├── App.tsx                     ← Routes + ProtectedRoute
│   ├── main.tsx                    ← Montage React
│   ├── pages/
│   │   ├── Login.tsx               ← Connexion / inscription
│   │   ├── Dashboard.tsx           ← Tableau de bord (menu principal)
│   │   ├── coach/
│   │   │   ├── SessionPlanning.tsx  ← Créer / gérer les séances
│   │   │   ├── SessionAttendance.tsx← Faire l'appel
│   │   │   ├── Stats.tsx           ← Statistiques & Historique
│   │   │   └── MemberManagement.tsx← Gérer les adhérents
│   │   └── adherent/
│   │       ├── MySchedule.tsx      ← Mon planning
│   │       └── MyProfile.tsx       ← Mon profil
│   ├── components/
│   │   ├── Navbar.tsx              ← Barre de navigation
│   │   └── ui/                    ← Shadcn (Button, Card...)
│   ├── hooks/
│   │   └── useAuth.tsx             ← Hook d'authentification
│   └── integrations/api/
│       └── client.ts               ← Tous les appels API
├── seed.sql                        ← Données de test
├── index.html                     ← Racine HTML (mountpoint React)
├── vite.config.ts                 ← Configuration Vite + PWA
└── docs/
    ├── explications_pedagogiques_completes.md  ← CE FICHIER
    ├── conseils_gestion_database.md
    └── archive/                   ← Scripts SQL obsolètes
```

### Backend (`agheal-api/`)

```
agheal-api/
├── public/
│   └── index.php                  ← Routeur unique (toutes les routes)
├── src/
│   ├── Auth.php                   ← JWT : sign, verify, requireAuth
│   ├── Database.php               ← Connexion PDO (Singleton)
│   ├── Controllers/
│   │   ├── AuthController.php     ← login, register, refresh
│   │   ├── SessionController.php  ← CRUD séances
│   │   ├── AttendanceController.php← Appel et walk-ins
│   │   ├── StatsController.php    ← Toutes les stats + logs + CSV
│   │   ├── ProfileController.php  ← Profils membres
│   │   ├── PaymentController.php  ← Paiements
│   │   ├── GroupController.php    ← Groupes
│   │   ├── CommunicationController.php ← Messages
│   │   └── PushController.php     ← Notifications push
│   └── Services/
│       ├── MailerService.php      ← Envoi d'emails
│       └── LogService.php         ← Écriture dans la table `logs`
├── mysql/
│   ├── init.sql                   ← Schéma complet (source de vérité)
│   ├── init_trigger.sql           ← Trigger création profil
│   ├── migrate_attendance.sql     ← Patch colonnes BDD existante
│   └── seed.sql                   ← Copie du seed de test
├── logs/sessions/                 ← Logs texte sur le filesystem
├── cron_daily.php                 ← Tâche automatique quotidienne
└── cron_hourly.php                ← Tâche automatique horaire
```

---

## 12. Les Design Patterns utilisés

Un "design pattern" (patron de conception) est une solution éprouvée à un problème récurrent de programmation.

### 1. Singleton — `Database.php`

**Problème** : Ouvrir une connexion MySQL prend du temps et de la mémoire. Si chaque classe en ouvrait une, on gaspillerait les ressources.

**Solution** : Le Singleton garantit qu'il n'existe **qu'une seule instance** de `Database` pendant toute l'exécution d'une requête.

```php
class Database {
    private static ?Database $instance = null;
    
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database(); // créé UNE SEULE fois
        }
        return self::$instance; // retourne toujours la même
    }
}
```

### 2. MVC (Modèle-Vue-Contrôleur)

**Rôles** :
- **Modèle** = les données (tables MySQL)
- **Vue** = la réponse JSON renvoyée
- **Contrôleur** = la logique métier (le "Et si l'utilisateur est bloqué, on refuse l'inscription")

### 3. Repository / Service Layer (léger)

`LogService.php` et `MailerService.php` sont des "services" : des classes dédiées à une tâche transverse (écrire des logs, envoyer des emails) qui peuvent être appelées depuis n'importe quel contrôleur.

### 4. Front Controller — `index.php`

Un seul fichier d'entrée gère **toutes** les requêtes. C'est le patron **Front Controller** : un aiguilleur unique qui distribue le travail.

### 5. Hook personnalisé React — `useAuth.tsx`

En React, un "hook" est une fonction qui commence par `use` et encapsule de la logique réutilisable. `useAuth()` retourne l'état de connexion actuel depuis n'importe quel composant, sans avoir à repasser les informations de parent en enfant.

---

## 13. Le Déploiement — Local vs Production

### En local (développement)

```
WAMP (Windows) → MySQL sur localhost:3306, Apache sur localhost:8081
npm run dev    → Vite sur localhost:5173
```

Le Frontend fait ses requêtes vers `http://localhost:8081/` et l'API répond.

### En production (agheal.hylst.fr)

```
Hébergeur Hostinger
├── Frontend (React buildé) → via Netlify ou hébergement statique
└── API PHP → via le panneau cPanel d'Hostinger
    └── Base de données MySQL → sur le serveur MySQL d'Hostinger
```

**Le processus de déploiement :**

1. `npm run build` → génère un dossier `dist/` avec les fichiers statiques optimisés
2. Uploader `dist/` sur le CDN/hébergeur du frontend
3. `git push` sur `agheal-api` → déploiement automatique ou manuel via cPanel
4. Si des migrations SQL sont nécessaires, les exécuter dans phpMyAdmin

### La variable d'environnement `VITE_API_URL`

Dans le fichier `.env` du frontend :
```
VITE_API_URL=https://api.agheal.hylst.fr
```

Vite remplace au moment du build toutes les occurrences de `import.meta.env.VITE_API_URL` par la vraie URL. C'est comme ça que le même code tourne en local (`localhost`) et en production (`api.agheal.hylst.fr`).

---

## 14. Glossaire des termes techniques

| Terme | Explication simple |
|---|---|
| **API** | Interface de communication entre applications. Un "serveur de questions-réponses". |
| **REST** | Style d'API qui utilise les verbes HTTP (GET, POST, PUT, DELETE) pour agir sur les données. |
| **HTTP** | Le protocole de communication du Web. Comme des lettres avec un format standardisé. |
| **JSON** | Format texte pour échanger des données. Lisible par les humains et les machines. |
| **JWT** | Jeton cryptographié qui prouve l'identité et les droits d'un utilisateur. |
| **UUID** | Identifiant unique universel de 36 caractères. Impossible à deviner. |
| **Hash** | Transformation irréversible d'un texte (le mot de passe devient une suite de caractères). |
| **PDO** | Outil PHP pour parler à MySQL de façon sécurisée (contre les injections SQL). |
| **Singleton** | Patron de conception garantissant qu'une classe n'a qu'une seule instance. |
| **Trigger** | Mécanisme MySQL qui se déclenche automatiquement sur une action (ex: création d'un user). |
| **Cron Job** | Tâche planifiée qui s'exécute automatiquement à un horaire défini. |
| **SPA** | Application qui charge une seule page HTML et navigue sans rechargement. |
| **React Query** | Bibliothèque React pour gérer les requêtes réseau avec cache automatique. |
| **migration SQL** | Script qui modifie une base de données existante (ajouter une colonne, etc.). |
| **CORS** | Mécanisme de sécurité du navigateur qui contrôle quels sites peuvent faire des requêtes à l'API. |
| **BOM UTF-8** | 3 octets au début d'un fichier CSV pour qu'Excel affiche correctement les accents. |
| **Walk-in** | Adhérent qui arrive à une séance sans s'être inscrit au préalable. |

---

*Document créé le 26/03/2026 — Mis à jour au fil des avancées du projet AGHeal.*
*Pour toute question sur le code, commencer par explorer `src/pages/` (Frontend) et `public/index.php` (Backend).*
