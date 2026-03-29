# Structure du projet - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2025–2026  
**Mis à jour :** 2026-03-30

Ce document décrit l'architecture technique et l'organisation du code source de l'application AGHeal.

---

## 📁 Arborescence principale

```
d:\0CODE\AntiGravity\AGheal\         ← Frontend React (REPOSITORY: agheal-front)
├── public/                           # Fichiers statiques
│   ├── favicon.ico
│   └── robots.txt
│
├── src/                              # Code source React + TypeScript
│   ├── assets/                       # Images et ressources statiques
│   ├── components/                   # Composants réutilisables
│   │   ├── ui/                       # Composants Shadcn/UI (Button, Card, Badge…)
│   │   ├── Navbar.tsx                # Barre de navigation principale
│   │   ├── ProtectedRoute.tsx        # Garde de route (rôle requis)
│   │   ├── SettingsModal.tsx         # Modal paramètres (notifs, compte)
│   │   ├── AvatarUpload.tsx          # Upload + compression avatar (128×128 JPEG)
│   │   ├── ContactForm.tsx           # Formulaire de contact
│   │   ├── InfoModal.tsx             # Panneau 5 onglets (Infos/Comm/Guide)
│   │   └── CookieSettings.tsx        # Préférences RGPD
│   │
│   ├── hooks/                        # Hooks personnalisés React
│   │   ├── useAuth.tsx               # Authentification (connexion, rôles, JWT)
│   │   ├── use-toast.ts              # Notifications toast (pop-ups)
│   │   └── use-mobile.tsx            # Détection mobile
│   │
│   ├── integrations/api/
│   │   └── client.ts                 # ApiClient — TOUS les appels HTTP vers l'API PHP
│   │
│   ├── lib/
│   │   └── utils.ts                  # Utilitaires (cn, formatDate…)
│   │
│   ├── pages/                        # Pages de l'application
│   │   ├── Index.tsx                 # / → redirection
│   │   ├── Login.tsx                 # /login
│   │   ├── Signup.tsx                # /signup
│   │   ├── ResetPassword.tsx         # /reset-password
│   │   ├── GoogleCallback.tsx        # /auth/google/callback
│   │   ├── Dashboard.tsx             # /dashboard
│   │   ├── Sessions.tsx              # /sessions (planning public)
│   │   ├── Profile.tsx               # /profile
│   │   ├── History.tsx               # /history
│   │   ├── Information.tsx           # /information
│   │   ├── NotFound.tsx              # * (404)
│   │   │
│   │   ├── coach/                    # Routes /coach/* (coach + admin)
│   │   │   ├── Schedule.tsx          # /coach/schedule
│   │   │   ├── CoachSessions.tsx     # /coach/sessions
│   │   │   ├── SessionForm.tsx       # /coach/sessions/new
│   │   │   ├── SessionAttendance.tsx # Modal pointage présences
│   │   │   ├── Stats.tsx             # /coach/stats (Dashboard Stats 6 onglets)
│   │   │   ├── Clients.tsx           # /coach/clients
│   │   │   ├── Activities.tsx        # /coach/activities
│   │   │   ├── Locations.tsx         # /coach/locations
│   │   │   ├── Groups.tsx            # /coach/groups
│   │   │   └── Payments.tsx          # /coach/payments
│   │   │
│   │   └── admin/
│   │       └── AdminUsers.tsx        # /admin/users
│   │
│   ├── App.tsx                       # Arbre de routes + <ProtectedRoute>
│   ├── App.css                       # Styles globaux
│   ├── index.css                     # Variables CSS / Design tokens
│   └── main.tsx                      # Point d'entrée (ReactDOM.createRoot)
│
├── docs/                             # Documentation technique et pédagogique
│   ├── explications_pedagogiques_completes.md  # Guide A→Z pour débutant
│   ├── conseils_gestion_database.md            # Guides sauvegarde/restauration BDD
│   ├── 01_MCD_Merise.md
│   ├── 02_UML_Classes.md
│   ├── 03_UML_Use_Cases_Activites.md
│   └── archive/                                # Scripts SQL obsolètes
│
├── .env                              # Variables d'environnement (VITE_API_URL)
├── .gitignore
├── index.html                        # HTML principal (mountpoint React)
├── package.json                      # Dépendances NPM
├── tailwind.config.ts                # Configuration Tailwind CSS
├── vite.config.ts                    # Configuration Vite + PWA plugin
├── tsconfig.json                     # Configuration TypeScript
├── ABOUT.md                          # Guide d'utilisation
├── CHANGELOG.md                      # Historique des versions
├── FEATURES.md                       # Fonctionnalités implémentées
├── README.md                         # Documentation principale
├── STRUCTURE.md                      # CE FICHIER
├── TODO.md                           # Roadmap
└── use_cases.md                      # Cas d'utilisation par acteur


d:\0CODE\AntiGravity\agheal-api\      ← Backend PHP (REPOSITORY: api-agheal)
├── public/
│   └── index.php                     # Routeur unique — Front Controller
│
├── src/
│   ├── Auth.php                      # JWT : signer, vérifier, requireAuth/requireRole
│   ├── Database.php                  # Connexion PDO (Singleton)
│   ├── Config/
│   │   └── database.php              # .env loader pour connexion MySQL
│   │
│   ├── Controllers/
│   │   ├── AuthController.php        # login, register, refresh, Google OAuth
│   │   ├── GoogleAuthController.php  # Flux OAuth 2.0 Google complet
│   │   ├── SessionController.php     # CRUD séances + filtrage temporel
│   │   ├── AttendanceController.php  # Pointage présences + walk-ins
│   │   ├── StatsController.php       # 8 endpoints agrégation + CSV + JSON logs
│   │   ├── ProfileController.php     # Profils utilisateurs
│   │   ├── PaymentController.php     # Règlements (CRUD + dashboard)
│   │   ├── GroupController.php       # Groupes d'adhérents
│   │   ├── LocationController.php    # Lieux
│   │   ├── SessionTypeController.php # Types de séances
│   │   ├── RegistrationController.php# Inscriptions / désinscriptions
│   │   ├── AdminController.php       # Gestion users/rôles
│   │   ├── ClientController.php      # Vue coach des adhérents
│   │   ├── CommunicationController.php # Messages in-app
│   │   ├── EmailCampaignController.php # Campagnes e-mails programmées
│   │   ├── PushController.php        # Web Push VAPID
│   │   ├── ContactController.php     # Formulaire de contact
│   │
│   ├── Repositories/                 # ⭐ Accès BDD (Couche Données)
│   │   ├── BaseRepository.php        # Classe abstraite : PDO helpers, transactions
│   │   ├── UserRepository.php        # CRUD users, rôles, OAuth upsert
│   │   ├── ProfileRepository.php     # Profils, groupes, préférences notifications
│   │   ├── SessionRepository.php     # Séances — CRUD, filtrage temporel, allowlist update
│   │   ├── AttendanceRepository.php  # Appels présences, walk-ins, horodatage
│   │   ├── RegistrationRepository.php# Inscriptions + verrous FOR UPDATE (concurrence)
│   │   ├── PaymentRepository.php     # Règlements, agrégations dashboard financier
│   │   └── StatsRepository.php       # Agrégations BI complexes (KPIs, démographie)
│   │
│   ├── Middleware/
│   │   └── AuthMiddleware.php        # Vérification JWT
│   │
│   └── Services/
│       ├── MailerService.php         # PHPMailer (SMTP, templates HTML)
│       └── LogService.php            # Écriture dans la table `logs`
│
├── tests/                            # 🧪 Tests unitaires (PHPUnit 13)
│   ├── Support/
│   │   └── RepositoryTestCase.php    # Classe de base abstraite (mock PDO) — hors scan actif
│   └── Repositories/
│       └── SessionRepositoryTest.php # Tests SessionRepository (architecture prête)
│
├── mysql/                            # ⭐ SOURCE UNIQUE DE VÉRITÉ SQL
│   ├── init.sql                      # Schéma complet (CREATE TABLE, VUEs)
│   ├── init_trigger.sql              # Trigger after_user_insert (profil auto + UUID)
│   ├── migrate_attendance.sql        # Patch colonnes BDD existante (attended, etc.)
│   └── seed.sql                      # Données de test (11 users, 15 séances)
│
├── scripts/
│   ├── cron_daily.php                # CRON quotidien : certifs, abonnements, expirations
│   └── cron_hourly.php               # CRON horaire : campagnes e-mails différées
│
├── logs/sessions/                    # Fichiers JSON de logs générés par l'API
├── vendor/                           # Dépendances Composer (PHPMailer, web-push…)
├── .env                              # DB_HOST, DB_USER, DB_PASS, JWT_SECRET…
├── composer.json
├── phpunit.xml                       # Configuration PHPUnit 13
└── Dockerfile                        # Docker pour déploiement Coolify
```

---

## 📂 Dossier `mysql/` — Ordre d'exécution pour réinitialiser la BDD

| Ordre | Fichier | Quand ? |
|-------|---------|---------|
| 1 | `init.sql` | Toujours (création des tables, vues) |
| 2 | `init_trigger.sql` | Toujours, juste après init.sql |
| 3 | `migrate_attendance.sql` | Uniquement sur une BDD **déjà créée** |
| 4 | `seed.sql` | En local uniquement (données de test) |

> 📖 Voir `docs/conseils_gestion_database.md` pour la procédure complète.

---

## 📂 Pages de l'application

### `/src/pages/` — Pages générales

| Fichier | Route | Description |
|---------|-------|-------------|
| `Index.tsx` | `/` | Redirection automatique |
| `Login.tsx` | `/login` | Connexion (email/mdp + Google) |
| `Signup.tsx` | `/signup` | Inscription |
| `ResetPassword.tsx` | `/reset-password` | Réinitialisation mot de passe |
| `GoogleCallback.tsx` | `/auth/google/callback` | Callback OAuth Google |
| `Dashboard.tsx` | `/dashboard` | Tableau de bord selon le rôle |
| `Sessions.tsx` | `/sessions` | Planning public filtré (séances futures) |
| `Profile.tsx` | `/profile` | Profil utilisateur |
| `History.tsx` | `/history` | Historique des séances de l'adhérent |
| `Information.tsx` | `/information` | Informations + contact + communications |

### `/src/pages/coach/` — Coach & Admin uniquement

| Fichier | Route | Description |
|---------|-------|-------------|
| `Schedule.tsx` | `/coach/schedule` | Vue planning du coach |
| `CoachSessions.tsx` | `/coach/sessions` | Gestion des séances |
| `SessionAttendance.tsx` | (Modal) | Interface de pointage présences |
| `Stats.tsx` | `/coach/stats` | Dashboard 6 onglets + Exports |
| `Clients.tsx` | `/coach/clients` | Base adhérents + fiches |
| `Activities.tsx` | `/coach/activities` | Types de séances |
| `Locations.tsx` | `/coach/locations` | Lieux |
| `Groups.tsx` | `/coach/groups` | Groupes |
| `Payments.tsx` | `/coach/payments` | Règlements |

---

## 🔐 Authentification & Rôles

### Méthodes supportées
1. **Email + Mot de passe** (JWT + Refresh Token)
2. **Google OAuth 2.0**

### Gestion des rôles

| Rôle | Accès |
|------|-------|
| `adherent` | Routes de base (/sessions, /profile, /history) |
| `coach` | + /coach/* (sauf /admin/*) |
| `admin` | Toutes les routes |

> Un utilisateur peut avoir plusieurs rôles simultanément (ex: `coach` + `adherent`).  
> Stockés dans la table `user_roles` (une ligne par rôle).

---

## 📊 Base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `users` | Comptes d'authentification (email, hash) |
| `profiles` | Profils utilisateurs (même ID que `users`) |
| `user_roles` | Rôles (un utilisateur peut en avoir plusieurs) |
| `sessions` | Séances planifiées |
| `session_types` | Types d'activités (modèles réutilisables) |
| `locations` | Lieux des séances |
| `registrations` | Inscriptions + présence (`attended`, `attended_at`) |
| `groups` | Groupes d'adhérents |
| `user_groups` | Liaison adhérent ↔ groupe |
| `payments_history` | Règlements enregistrés |
| `logs` | Journal d'audit (appels de présences, actions admin) |
| `communications` | Messages in-app ciblés |
| `email_campaigns` | Campagnes e-mail programmées |
| `message_history` | Historique immuable des messages envoyés |
| `push_subscriptions` | Abonnements Web Push VAPID |
| `password_resets` | Tokens de réinitialisation |
| `refresh_tokens` | Tokens JWT long-lived |

### Vues SQL

| Vue | Description |
|-----|-------------|
| `v_profiles_with_roles` | Profils enrichis avec rôles concaténés |
| `v_sessions_full` | Séances avec type, lieu, coach, nb inscrits |

---

## 🎨 Design System

- **Tailwind CSS** : classes utilitaires, mobile-first, breakpoints `sm/md/lg`.
- **Variables CSS** dans `index.css` : `--primary`, `--background`, modes clair/sombre.
- **Shadcn/UI** : composants accessibles prêts à l'emploi.
- **Mode sombre/clair** : automatique selon préférence système.

---

## 📦 Dépendances principales

| Package | Usage |
|---------|-------|
| `react` + `react-dom` | Framework UI |
| `react-router-dom` | Routage SPA |
| `@tanstack/react-query` | Cache et requêtes HTTP |
| `tailwindcss` | Styles utilitaires |
| `shadcn/ui` (via Radix UI) | Composants UI accessibles |
| `lucide-react` | Icônes |
| `date-fns` | Manipulation des dates |
| `zod` | Validation des données |
| `react-hook-form` | Gestion des formulaires |
| `vite-plugin-pwa` | Service Worker + PWA |

---

## 🔄 Flux de données

```
┌──────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐
│  Client      │────▶│  React Query │────▶│   API PHP   │────▶│  MySQL  │
│  (React TSX) │◀────│   (Cache)    │◀────│  (Apache)   │◀────│  (BDD)  │
└──────────────┘     └──────────────┘     └─────────────┘     └─────────┘
     :5173                                     :8081              :3306
  AGheal/src/        integrations/api/      public/index.php   agheal DB
                       client.ts
```

---

## 🚀 Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (localhost:5173) |
| `npm run build` | Build de production → `dist/` |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Vérification ESLint |

---

## 🌐 Déploiement Production

| Composant | URL | Technologie |
|-----------|-----|-------------|
| Frontend | https://agheal.hylst.fr | Nixpacks (React/Vite) via Coolify |
| API Backend | https://api.agheal.hylst.fr | Docker PHP 8.1/Apache via Coolify |
| Base de données | Réseau interne Coolify | MariaDB |

---

*Documentation technique par Geoffroy Streit — 2025-2026*
