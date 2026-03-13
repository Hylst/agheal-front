# AGHeal — Fichier de reprise pour dev

> Document de reprise mis à jour le 2026-03-09.
> Ce fichier explique l'état exact du projet et ce qui reste à faire.

---

## Contexte général

**AGHeal** est une application de gestion de séances de sport/bien-être.
- **Frontend** : React + TypeScript + Vite, dans `d:\0CODE\AntiGravity\AGheal\`
- **Backend** : PHP 8.1 + MySQL, dans `C:\wamp64\www\agheal-api\`
- **Base de données** : MySQL via WAMP, accessible via phpMyAdmin (`http://localhost:8081/phpmyadmin`)

Le projet a été **migré de Supabase vers un backend PHP/MySQL auto-hébergé**.
La migration est **terminée** : le backend PHP et le frontend React sont fonctionnels.

---

## Architecture de l'API PHP

**Base URL en local** : `http://localhost:8081/agheal-api/public` (configurable via `VITE_API_URL` dans `.env`)

Le client HTTP central est dans :
```
d:\0CODE\AntiGravity\AGheal\src\integrations\api\client.ts
```

C'est une classe `ApiClient` qui fait des appels `fetch` directs à l'API PHP.
Elle expose ces méthodes (toutes publiques, toutes async, retournent `{ data?, error? }`) :

| Méthode | Route PHP |
|---|---|
| `login(email, password)` | `POST /auth/login` |
| `signup(email, password, firstName, lastName)` | `POST /auth/signup` |
| `resetPassword(email)` | `POST /auth/reset-password` |
| `getMyProfile()` | `GET /profiles/me` |
| `updateProfile(userId, data)` | `PUT /profiles/:id` |
| `getUsers()` | `GET /admin/users` |
| `getClients()` | `GET /clients` |
| `getSessions(filters?)` | `GET /sessions` |
| `getSession(id)` | `GET /sessions/:id` |
| `createSessions(data)` | `POST /sessions` |
| `updateSession(id, data)` | `PUT /sessions/:id` |
| `deleteSession(id)` | `DELETE /sessions/:id` |
| `getSessionTypes()` | `GET /session-types` |
| `createSessionType(data)` | `POST /session-types` |
| `updateSessionType(id, data)` | `PUT /session-types/:id` |
| `deleteSessionType(id)` | `DELETE /session-types/:id` |
| `getLocations()` | `GET /locations` |
| `createLocation(data)` | `POST /locations` |
| `updateLocation(id, data)` | `PUT /locations/:id` |
| `deleteLocation(id)` | `DELETE /locations/:id` |
| `getGroups()` | `GET /groups` |
| `registerToSession(sessionId)` | `POST /registrations` |
| `unregisterFromSession(sessionId)` | `DELETE /registrations/:id` |
| `getAppInfo()` | `GET /app-info` |
| `updateAppInfo(data)` | `PUT /app-info` |
| `sendContact(data)` | `POST /contact` |

> ⚠️ **Il n'y a PAS de méthode `.from()`, `.signIn()`, `.signUp()`, `.signOut()`, `.getUser()` ni `.request()` (privée) exposée.**
> Ces méthodes appartiennent à l'ancienne API Supabase et N'EXISTENT PLUS.

---

## État des fichiers — Tout est migré ✅

### Backend PHP

| Fichier | État |
|---|---|
| `public/index.php` | ✅ Routeur complet, 35+ routes |
| `src/Auth.php` | ✅ JWT, requireAuth, requireRole, getPayload |
| `src/Database.php` | ✅ Wrapper PDO singleton |
| `src/Config/database.php` | ✅ Configuration BDD |
| `src/Controllers/AuthController.php` | ✅ login, signup, reset |
| `src/Controllers/SessionController.php` | ✅ CRUD complet + bulk insert |
| `src/Controllers/ProfileController.php` | ✅ me, show, update, notifications, groups |
| `src/Controllers/RegistrationController.php` | ✅ register, unregister |
| `src/Controllers/SessionTypeController.php` | ✅ CRUD complet |
| `src/Controllers/LocationController.php` | ✅ CRUD complet |
| `src/Controllers/AdminController.php` | ✅ users, roles |
| `src/Controllers/ClientController.php` | ✅ |
| `src/Controllers/ContactController.php` | ✅ (utilise EmailService) |
| `src/Controllers/AppInfoController.php` | ✅ |
| `src/Controllers/GroupController.php` | ✅ |
| `src/Services/EmailService.php` | ✅ PHPMailer SMTP |
| `bin/send-reminders.php` | ✅ Script cron rappels |

### Frontend React

| Fichier | État |
|---|---|
| `src/hooks/useAuth.tsx` | ✅ Migré vers apiClient |
| `src/pages/coach/Locations.tsx` | ✅ Migré vers apiClient |
| `src/pages/coach/SessionForm.tsx` | ✅ Migré vers apiClient |
| `src/pages/Sessions.tsx` | ✅ Migré |
| `src/pages/coach/CoachSessions.tsx` | ✅ Migré |
| `src/pages/coach/Schedule.tsx` | ✅ Migré |
| `src/pages/Information.tsx` | ✅ Migré |
| `src/pages/Profile.tsx` | ✅ Migré |
| `src/pages/History.tsx` | ✅ Migré |
| `src/pages/AdminUsers.tsx` | ✅ Migré |
| `src/pages/coach/Groups.tsx` | ✅ Migré |
| `src/pages/coach/Clients.tsx` | ✅ Migré |
| `src/pages/coach/Activities.tsx` | ✅ Migré |
| `src/components/SettingsModal.tsx` | ✅ Migré |

---

## Comment démarrer en local

1. **WAMP** : Démarrer WAMP (icône verte)
2. **Base de données** : Vérifier que la base `agheal` existe dans phpMyAdmin
3. **Backend** : Le fichier `C:\wamp64\www\agheal-api\.env` doit contenir les bonnes variables
4. **Frontend** : `npm install && npm run dev` dans `d:\0CODE\AntiGravity\AGheal\`
5. **Comptes de test** : voir README.md (mot de passe = `password`)

---

## Ce qui reste à faire (fonctionnalités futures)

Voir le fichier `TODO.md` pour la liste complète.

---

*Document mis à jour le 2026-03-09 par Geoffroy Streit*
