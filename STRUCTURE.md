# Structure du projet - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2025  
**Mis à jour :** 2026-03-09

Ce document décrit l'architecture technique et l'organisation du code source de l'application AGHeal.

---

## 📁 Arborescence principale

```
d:\0CODE\AntiGravity\AGheal\         ← Frontend React
├── public/                           # Fichiers statiques
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/                              # Code source React
│   ├── assets/                       # Images et ressources
│   ├── components/                   # Composants réutilisables
│   ├── hooks/                        # Hooks personnalisés
│   ├── integrations/api/             # Client HTTP vers l'API PHP
│   ├── lib/                          # Utilitaires
│   ├── pages/                        # Pages de l'application
│   ├── App.tsx                       # Composant principal
│   ├── App.css                       # Styles globaux
│   ├── index.css                     # Variables CSS / Design system
│   └── main.tsx                      # Point d'entrée
│
├── .env                              # Variables d'environnement
├── index.html                        # HTML principal
├── package.json                      # Dépendances NPM
├── tailwind.config.ts                # Configuration Tailwind
├── vite.config.ts                    # Configuration Vite
└── tsconfig.json                     # Configuration TypeScript


C:\wamp64\www\agheal-api\            ← Backend PHP (API REST)
├── public/
│   └── index.php                     # Point d'entrée unique (routeur)
│
├── src/
│   ├── Auth.php                      # Gestion JWT
│   ├── Database.php                  # Wrapper PDO singleton
│   ├── Config/
│   │   └── database.php              # Configuration de connexion
│   ├── Controllers/
│   │   ├── AuthController.php        # Login, Signup, Reset
│   │   ├── SessionController.php     # CRUD séances
│   │   ├── ProfileController.php     # Profils utilisateurs
│   │   ├── LocationController.php    # CRUD lieux
│   │   ├── GroupController.php       # CRUD groupes
│   │   ├── SessionTypeController.php # CRUD types de séance
│   │   ├── RegistrationController.php# Inscriptions aux séances
│   │   ├── AdminController.php       # Gestion utilisateurs/rôles
│   │   ├── ClientController.php      # Vue coach des adhérents
│   │   ├── ContactController.php     # Formulaire de contact
│   │   └── AppInfoController.php     # Paramètres éditoriaux
│   ├── Middleware/
│   │   └── AuthMiddleware.php        # Vérification JWT
│   └── Services/
│       └── MailerService.php         # Envoi d'emails PHPMailer (Templates & SMTP)
│
├── mysql/                            # Scripts SQL (init, alter, seed)
├── scripts/                          # Scripts utilitaires et CRON
│   └── cron_daily.php               # Tâche quotidienne (rappels & expirations)
├── bin/                              # Scripts legacy / maintenance
├── vendor/                           # Dépendances Composer
├── .env                              # Config BDD et JWT
├── composer.json                     # Dépendances PHP
└── Dockerfile                        # Pour déploiement Docker
```

---

## 📂 Détail des dossiers

### `/src/pages/`

Pages principales de l'application :

| Fichier | Route | Description |
|---------|-------|-------------|
| `Index.tsx` | `/` | Page d'accueil (redirection) |
| `Login.tsx` | `/login` | Page de connexion |
| `Signup.tsx` | `/signup` | Page d'inscription |
| `ResetPassword.tsx` | `/reset-password` | Réinitialisation mot de passe |
| `Dashboard.tsx` | `/dashboard` | Tableau de bord principal |
| `Sessions.tsx` | `/sessions` | Liste des séances |
| `Profile.tsx` | `/profile` | Profil utilisateur |
| `History.tsx` | `/history` | Historique des séances |
| `Information.tsx` | `/information` | Page d'informations + contact |
| `ImageUploadModal.tsx` | Upload et recadrage optimisé des photos (WebP) |
| `InfoModal.tsx` | Panneau central d'information et communications cibllées (5 onglets) |
| `CookieSettings.tsx` | Gestion détaillée des préférences de confidentialité RGPD |
| `NotFound.tsx` | `*` | Page 404 |

### `/src/pages/coach/`

Pages réservées aux coachs et admins :

| Fichier | Route | Description |
|---------|-------|-------------|
| `Schedule.tsx` | `/coach/schedule` | Planning du coach |
| `CoachSessions.tsx` | `/coach/sessions` | Sessions du coach |
| `SessionForm.tsx` | `/coach/sessions/new` | Créer une séance |
| `Clients.tsx` | `/coach/clients` | Gestion des adhérents |
| `Activities.tsx` | `/coach/activities` | Gestion des activités |
| `Locations.tsx` | `/coach/locations` | Gestion des lieux |
| `Groups.tsx` | `/coach/groups` | Gestion des groupes |

### `/src/pages/admin/`

Pages réservées aux administrateurs :

| Fichier | Route | Description |
|---------|-------|-------------|
| `AdminUsers.tsx` | `/admin/users` | Gestion des utilisateurs |

---

### `/src/components/`

Composants React réutilisables :

| Fichier | Description |
|---------|-------------|
| `NavLink.tsx` | Lien de navigation |
| `ProtectedRoute.tsx` | Protection des routes selon le rôle |
| `SettingsModal.tsx` | Modal des paramètres |
| `AvatarUpload.tsx` | Upload d'avatar (Redimensionnement 128x128 + Compression JPEG 0.9) |
| `ContactForm.tsx` | Formulaire de contact |

### `/src/components/ui/`

Composants UI (Shadcn/UI) :

```
accordion, alert, avatar, badge, button, calendar, card,
checkbox, dialog, dropdown-menu, form, input, label,
popover, progress, select, separator, sheet, skeleton,
switch, table, tabs, textarea, toast, tooltip, ...
```

---

### `/src/hooks/`

Hooks personnalisés :

| Fichier | Description |
|---------|-------------|
| `useAuth.tsx` | Authentification (login, signup, Google OAuth placeholder) |
| `use-toast.ts` | Notifications toast |
| `use-mobile.tsx` | Détection mobile |

---

### `/src/integrations/api/`

Client HTTP pour l'API PHP :

| Fichier | Description |
|---------|-------------|
| `client.ts` | Classe `ApiClient` — fait des `fetch` vers l'API PHP REST |

---

## 🔐 Authentification

### Méthodes supportées

1. **Email + Mot de passe**
   - Inscription avec création automatique du profil
   - Connexion classique avec JWT
   - Réinitialisation de mot de passe (TODO: envoi email)

2. **Google OAuth** (non implémenté en local)

### Gestion des rôles

| Rôle | Valeur | Accès |
|------|--------|-------|
| Adhérent | `adherent` | Routes de base |
| Coach | `coach` | Routes coach |
| Admin | `admin` | Toutes les routes |

---

## 📊 Base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `users` | Comptes d'authentification (email, hash) |
| `profiles` | Profils utilisateurs (même ID que users) |
| `user_roles` | Rôles des utilisateurs |
| `sessions` | Séances planifiées |
| `session_types` | Types d'activités (modèles) |
| `locations` | Lieux des séances |
| `registrations` | Inscriptions aux séances |
| `groups` | Groupes d'adhérents |
| `user_groups` | Affectation adhérent ↔ groupe |
| `app_info` | Paramètres éditoriaux de l'application |
| `logs` | Journal d'activité (Audit Administratif) |
| `payments_history` | Historique des règlements (Passage à "À jour") |
| `password_resets` | Tokens de réinitialisation |
| `refresh_tokens` | Tokens de refresh JWT |

### Vues SQL

| Vue | Description |
|-----|-------------|
| `v_profiles_with_roles` | Profils enrichis avec rôles concaténés |
| `v_sessions_full` | Séances avec type, lieu, coach, nb inscrits |

---

## 🎨 Design System

### Configuration Tailwind

Le fichier `tailwind.config.ts` définit :
- Couleurs personnalisées (primaire, secondaire, etc.)
- Typographie
- Espacements
- Breakpoints responsive

### Variables CSS

Le fichier `index.css` contient :
- Variables de couleurs (--primary, --background, etc.)
- Mode sombre automatique
- Styles de base

---

## 📦 Dépendances principales

| Package | Usage |
|---------|-------|
| `react` | Framework UI |
| `react-router-dom` | Routage |
| `@tanstack/react-query` | Cache et requêtes |
| `tailwindcss` | Styles utilitaires |
| `shadcn/ui` | Composants UI |
| `lucide-react` | Icônes |
| `date-fns` | Manipulation des dates |
| `zod` | Validation des données |
| `react-hook-form` | Gestion des formulaires |

---

## 🔄 Flux de données

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐
│   Client    │────▶│  React Query │────▶│  API PHP    │────▶│  MySQL  │
│   (React)   │◀────│   (Cache)    │◀────│  (WAMP)     │◀────│  (BDD)  │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────┘
      :5173                                    :8081               :3306
```

---

## 🚀 Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Vérification ESLint |

---

*Documentation technique par Geoffroy Streit - 2025*
