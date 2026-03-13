# 🔍 Analyse complète AGheal — Diagnostic & Guide

## ✅ Bonne nouvelle : ton app est (quasi) fonctionnelle !

J'ai testé l'API directement et voici le verdict :

| Test | Résultat |
|------|----------|
| API PHP répond | ✅ Oui (`http://localhost:8081/agheal-api/public/`) |
| Connexion MySQL | ✅ Fonctionne |
| Signup (inscription) | ✅ Fonctionne |
| Login avec `password` | ✅ **Fonctionne** |
| Login avec `password123` | ❌ **Échoue (401)** |

---

## 🐛 Problème principal : le mot de passe n'est PAS "password123"

> [!CAUTION]
> Le hash `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi` correspond au mot de passe **`password`** (sans "123"), pas `password123` !
> C'est le hash de test Laravel classique.

Le `README.md` documente `password123` comme mot de passe mais le dump SQL contient un hash pour `password`. **C'est la raison pour laquelle tu ne peux pas te connecter.**

### Comptes de test — mots de passe réels

| Email | Mot de passe réel | Rôle |
|-------|-------------------|------|
| `admin@agheal-adaptmovement.fr` | **`password`** | Admin |
| `guillaume@agheal.fr` | **`password`** | Coach + Adhérent |
| `amandine@adaptmovement.fr` | **`password`** | Coach + Adhérent |
| `marie.dupont@email.fr` | **`password`** | Adhérent |
| `jean.michel@email.fr` | **`password`** | Adhérent |
| `sophie.leroy@email.fr` | **`password`** | Adhérent |

Les comptes créés via inscription (ceux avec des hash `$2y$12$...`) ont leur propre mot de passe défini lors du signup.

---

## 🔧 Incohérence mineure dans le backend `.env`

Dans `C:\wamp64\www\agheal-api\.env` :

```diff
- FRONTEND_URL=http://localhost:8080
+ FRONTEND_URL=http://localhost:5173
```

Le frontend tourne sur **5173** (Vite), pas 8080. Cette valeur est utilisée pour les CORS et le JWT audience. Ça ne bloque rien pour l'instant car le routeur PHP a `localhost:5173` en dur dans la liste des origines CORS autorisées, mais c'est une incohérence à corriger.

---

## 📰 Le `reprise.md` est obsolète

> [!NOTE]
> Le fichier `reprise.md` dit que 3 fichiers frontend (`useAuth.tsx`, `Locations.tsx`, `SessionForm.tsx`) utilisent encore l'ancienne syntaxe Supabase. **C'est faux** — j'ai vérifié les 3 fichiers et ils sont **tous migrés** vers les méthodes `apiClient` correctes.

**Aucune correction de code n'est nécessaire** côté frontend.

---

## 📊 Comment fonctionne ta base de données

### Schéma des relations entre tables

```mermaid
erDiagram
    users ||--|| profiles : "1:1 même ID"
    users ||--o{ user_roles : "1:N rôles"
    users ||--o{ password_resets : "1:N resets"
    users ||--o{ refresh_tokens : "1:N tokens"
    
    profiles ||--o{ registrations : "inscriptions"
    profiles ||--o{ user_groups : "membre de groupes"
    profiles ||--o{ logs : "historique"
    
    sessions ||--o{ registrations : "participants"
    sessions }o--|| session_types : "type de séance"
    sessions }o--|| locations : "lieu"
    sessions }o--|| profiles : "créé par"
    
    groups ||--o{ user_groups : "membres"
    
    app_info : "3 clés de config"
```

### Explication des tables

| Table | Rôle | Colonnes clés |
|-------|------|---------------|
| **`users`** | Comptes d'authentification | `id` (UUID), `email`, `password_hash` |
| **`profiles`** | Infos personnelles (même `id` que `users`) | `first_name`, `last_name`, `phone`, `statut_compte`, `payment_status` |
| **`user_roles`** | Rôles attribués (`admin`/`coach`/`adherent`) | `user_id` + `role` (clé composite) |
| **`sessions`** | Séances planifiées | `title`, `date`, `start_time`, `end_time`, `status`, `type_id`, `location_id` |
| **`session_types`** | Types d'activités (Circuit training, Pilates…) | `name`, `description` |
| **`locations`** | Lieux des séances | `name`, `address`, `notes` |
| **`registrations`** | Inscriptions des adhérents aux séances | `session_id` + `user_id` |
| **`groups`** | Groupes d'adhérents | `name`, `details` |
| **`user_groups`** | Affectation adhérent ↔ groupe | `user_id` + `group_id` |
| **`app_info`** | Paramètres éditoriaux (3 clés) | `key` + `value` |
| **`logs`** | Journal d'activité | `user_id`, `action`, `details` |
| **`password_resets`** | Tokens de réinit. mot de passe | `token`, `expires_at` |
| **`refresh_tokens`** | Tokens de refresh JWT | `token`, `expires_at` |

### Comment ça marche

1. **Inscription** : un INSERT dans `users` → le **trigger `after_user_insert`** crée automatiquement une ligne dans `profiles` (avec l'email) et une ligne dans `user_roles` (rôle `adherent`). Le contrôleur PHP fait aussi ces INSERT manuellement avec `REPLACE INTO`, donc ça ne plante pas grâce au `REPLACE`.

2. **Connexion** : le PHP vérifie l'email dans `users`, compare le hash bcrypt, puis récupère le profil et les rôles pour générer un JWT (JSON Web Token) valide 1h.

3. **Séances** : les séances sont liées à un `session_type` (activité) et un `location` (lieu). Les coachs les créent, les adhérents s'inscrivent via la table `registrations`.

4. **Vues SQL** : deux vues facilitent les requêtes :
   - `v_profiles_with_roles` : profil + rôles concaténés
   - `v_sessions_full` : séances enrichies avec nom du type, lieu, coach, et nombre d'inscrits

---

## 🛠️ Actions à faire maintenant

### 1. Corriger le mot de passe OU la doc

**Option A — Changer les mots de passe en base** (recommandé) :

Va sur **http://localhost:8081/phpmyadmin**, sélectionne la base `agheal`, onglet **SQL**, et exécute :

```sql
-- Met à jour les 6 comptes de test avec le hash de "password123"
UPDATE users 
SET password_hash = '$2y$10$HkPL8PST/2iT8VBpG33rUeqPKH7cJ6ANZ7XyAy0g2VoLHhBfLIgqG'
WHERE email IN (
    'admin@agheal-adaptmovement.fr',
    'guillaume@agheal.fr',
    'amandine@adaptmovement.fr',
    'marie.dupont@email.fr',
    'jean.michel@email.fr',
    'sophie.leroy@email.fr'
);
```

> [!WARNING]
> Il faut d'abord **générer le bon hash**. La requête ci-dessus utilise un hash placeholder. La façon la plus simple : utilise le signup de l'app pour créer un compte avec `password123`, puis copie le hash depuis phpMyAdmin et fais l'UPDATE.

**Option B — Utiliser `password` comme mot de passe** (plus simple) :

Connecte-toi simplement avec **`password`** au lieu de `password123`. Tu peux mettre à jour le README.md ensuite.

### 2. Corriger le FRONTEND_URL du backend

Modifie `C:\wamp64\www\agheal-api\.env` ligne 10 :

```
FRONTEND_URL=http://localhost:5173
```

### 3. Tester la connexion dans le navigateur

1. Va sur **http://localhost:5173/login**
2. Email : `admin@agheal-adaptmovement.fr`  
3. Mot de passe : `password`
4. Tu devrais arriver sur le Dashboard !

---

## 👤 Comment créer manuellement des utilisateurs de chaque rôle

### Via l'app (recommandé)

1. **Créer un adhérent** : Va sur http://localhost:5173/signup → inscription normale → rôle `adherent` automatique
2. **Promouvoir en coach/admin** : Connecte-toi en admin → page **Gestion des utilisateurs** → change le rôle

### Via phpMyAdmin (SQL direct)

```sql
-- 1. Créer un Admin
INSERT INTO users (id, email, password_hash, created_at) 
VALUES (UUID(), 'nouvel.admin@test.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());
-- Le trigger crée automatiquement le profil + rôle adherent
-- Puis ajouter le rôle admin :
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM users WHERE email = 'nouvel.admin@test.fr';

-- 2. Créer un Coach
INSERT INTO users (id, email, password_hash, created_at) 
VALUES (UUID(), 'nouveau.coach@test.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());
INSERT INTO user_roles (user_id, role) 
SELECT id, 'coach' FROM users WHERE email = 'nouveau.coach@test.fr';

-- 3. Créer un Adhérent (le plus simple, le trigger suffit)
INSERT INTO users (id, email, password_hash, created_at) 
VALUES (UUID(), 'nouvel.adherent@test.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());
-- Le trigger crée automatiquement le profil + rôle adherent

-- Mettre à jour les prénoms/noms des profils créés :
UPDATE profiles SET first_name = 'Prénom', last_name = 'Nom' WHERE email = 'nouvel.admin@test.fr';
UPDATE profiles SET first_name = 'Prénom', last_name = 'Nom' WHERE email = 'nouveau.coach@test.fr';
UPDATE profiles SET first_name = 'Prénom', last_name = 'Nom' WHERE email = 'nouvel.adherent@test.fr';
```

> Tous ces comptes créés via SQL auront le mot de passe **`password`** (le hash utilisé).

---

## 📋 Résumé des incohérences trouvées

| # | Problème | Gravité | Solution |
|---|----------|---------|----------|
| 1 | **Mot de passe doc vs BDD** : README dit `password123`, le hash est pour `password` | 🔴 Bloquant | Utiliser `password` ou regénérer les hash |
| 2 | **FRONTEND_URL** dans backend `.env` = `8080` au lieu de `5173` | 🟡 Mineur | Corriger la ligne dans `.env` |
| 3 | **reprise.md obsolète** : dit que 3 fichiers frontend non migrés, alors qu'ils le sont | 🟢 Cosmétique | Mettre à jour `reprise.md` |
| 4 | **STRUCTURE.md obsolète** : mentionne encore Supabase dans l'arborescence | 🟢 Cosmétique | Mettre à jour |
| 5 | **Trigger + INSERT explicite** lors du signup : double insertion dans `profiles` et `user_roles` | 🟡 Mineur | Fonctionne grâce au `REPLACE INTO`, mais le trigger pourrait être supprimé |
