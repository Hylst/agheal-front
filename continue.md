# AGHeal — Document de Reprise et d'Architecture

> Ce document centralise l'architecture technique, les règles métier et l'état actuel du projet pour permettre une reprise de développement fluide (par un intervenant ou une IA). Mise à jour : **26/03/2026 — v1.9.1**.

---

## 1. Présentation Générale

**AGHeal** est une plateforme centralisée (Application Web / PWA) de gestion des activités sportives orientées santé et bien-être. Elle remplace les outils disparates (Excel, WhatsApp, e-mails de relance) par un espace sécurisé unifiant **adhérents, coachs et administrateurs**.

**URLs de production :**
- Frontend : https://agheal.hylst.fr
- API : https://api.agheal.hylst.fr

**URL locales :**
- Frontend : http://localhost:5173 (`npm run dev` dans `AGheal/`)
- API PHP : http://localhost:8081 (WAMP doit être actif, icône verte)

---

## 2. Architecture Technique

Le projet est séparé en **deux repositories Git** distincts.

### 2.1 Backend (API REST) — `agheal-api`

| Élément | Valeur |
|---------|--------|
| **Localisation locale** | `d:\0CODE\AntiGravity\agheal-api\` (symlink ou copie dans `C:\wamp64\www\agheal-api\`) |
| **Repository** | Hylst/api-agheal |
| **Technologie** | PHP 8+ natif (PDO MySQL). Pas de framework. |
| **Auth** | JWT (`Firebase\JWT`) + Refresh Tokens |
| **Entrée unique** | `public/index.php` (Front Controller) |
| **Controllers** | `src/Controllers/` — un par domaine métier |
| **Services** | `MailerService.php` (PHPMailer SMTP), `LogService.php` (logs DB) |
| **SQL source** | `mysql/` — **SOURCE UNIQUE DE VÉRITÉ** |

#### Ordre d'exécution SQL pour reconstruire la BDD from scratch :
```
1. mysql/init.sql              → Toutes les tables + vues
2. mysql/init_trigger.sql      → Trigger after_user_insert (profil auto)
3. mysql/seed.sql              → Données de test (LOCAL UNIQUEMENT)
```
> `migrate_attendance.sql` = patch pour BDD déjà existantes (colonnes `attended`, `attended_at`, `limit_registration_7_days`). Inutile sur une création from scratch.

### 2.2 Frontend (Application Client PWA) — `AGheal`

| Élément | Valeur |
|---------|--------|
| **Localisation** | `d:\0CODE\AntiGravity\AGheal\` |
| **Repository** | Hylst/agheal-front |
| **Technologie** | React 18, TypeScript, Vite |
| **UI / UX** | Tailwind CSS, Shadcn/UI, Lucide-React |
| **Client API** | `src/integrations/api/client.ts` — classe `ApiClient`, centralise tous les fetch() |
| **Auth hook** | `src/hooks/useAuth.tsx` — expose `user`, `role`, `roles`, `isAdmin`, `isCoach` |
| **Routeur** | React Router v6 — routes protégées via `<ProtectedRoute roles={[...]}/>` |
| **PWA** | `vite-plugin-pwa` + Service Worker — cache agressif (forcer Ctrl+F5 en dev) |

---

## 3. Modèle de Données

| Table | Rôle clé |
|-------|----------|
| `users` | Email + hash mot de passe |
| `profiles` | Infos personnelles (même UUID que `users.id`) |
| `user_roles` | Rôles par utilisateur (tableau, plusieurs possibles) |
| `sessions` | Séances planifiées (date, heure, capacité, statut) |
| `registrations` | Inscriptions + présence (`attended`, `attended_at`) |
| `payments_history` | Règlements (montant, mode, coach destinataire) |
| `logs` | Journal d'audit (appels de présences, actions admin) |
| `communications` | Messages in-app ciblés |
| `email_campaigns` | Campagnes e-mail différées |

**Trigger clé** : `after_user_insert` → crée automatiquement le profil + assigne le rôle `adherent` à chaque nouvel utilisateur.

---

## 4. Rôles & Permissions

| Rôle | Accès | Particularités |
|------|-------|----------------|
| `adherent` | Planning, profil, historique | Peut s'inscrire (fenêtre J-7 uniquement) |
| `coach` | + Séances, présences, clients, groupes, paiements, stats | Fait l'appel, voit les données santé |
| `admin` | Tout | Gestion users/rôles, protection anti-lockout |

> Un utilisateur peut avoir **plusieurs rôles simultanément** (ex: `coach` + `adherent`).  
> côté backend : `array_intersect($userRoles, ['coach', 'admin'])` pour vérifier les accès multi-rôles.

---

## 5. État Actuel — v1.9.1 (26 Mars 2026)

### ✅ Modules complètement implémentés et opérationnels

| Module | Fichiers clés |
|--------|---------------|
| Authentification (Email + Google OAuth) | `AuthController.php`, `GoogleAuthController.php`, `useAuth.tsx` |
| Séances (CRUD + duplication multi-semaines) | `SessionController.php`, `CoachSessions.tsx`, `SessionForm.tsx` |
| Planning public (filtrage temporel séances passées) | `SessionController.php` (filtre `CONCAT(date, end_time) >= NOW()`), `Sessions.tsx` |
| Présences (appel + walk-ins + logs) | `AttendanceController.php`, `SessionAttendance.tsx` |
| Statistiques (6 onglets + CSV + JSON) | `StatsController.php`, `Stats.tsx` |
| Règlements (saisie + historique + dashboard) | `PaymentController.php`, `Payments.tsx` |
| Clients / Groupes | `ClientController.php`, `Clients.tsx`, `Groups.tsx` |
| Communications in-app + e-mails programmés | `CommunicationController.php`, `EmailCampaignController.php` |
| Notifications Web Push | `PushController.php`, Service Worker PWA |
| CRON : rappels auto (certifs, abonnements, J-1 séance) | `cron_daily.php`, `cron_hourly.php` |

### 🐛 Bugs corrigés récemment (v1.9.1)

| Bug | Fichier | Correction |
|-----|---------|-----------|
| Erreur 403 Stats pour les coachs | `StatsController.php` | `array_intersect` sur `roles[]` au lieu de `role` string |
| Badge paiement toujours rouge | `Stats.tsx` | `'regle'` → `'a_jour'` |
| Séances passées visibles dans le planning | `SessionController.php` | Filtre `CONCAT(date, end_time) >= NOW()` |
| seed.sql — 6 erreurs de schéma | `mysql/seed.sql` | Réécriture complète (idempotent) |

### 📁 Centralisation SQL (v1.9.1)
- **`AGheal/seed.sql` supprimé** — doublons avec `agheal-api/mysql/seed.sql`
- **Source unique** : `agheal-api/mysql/` pour tous les scripts SQL
- **9 scripts obsolètes** archivés dans `AGheal/docs/archive/`

---

## 6. Conventions de Code

- **IDs** : UUID CHAR(36) fixes dans le seed, générés côté MySQL via trigger UUIDv4.
- **Dates** : utiliser `date-fns` avec locale `fr` côté frontend. Côté backend : MySQL `NOW()`, `DATE_SUB()`, `CURDATE()`.
- **Requêtes PDO** : toujours des requêtes préparées (`?` ou `:param`). Jamais de concaténation de variable dans une requête SQL.
- **Rôles** : toujours vérifier avec `array_intersect($payload['roles'], ['coach', 'admin'])` (le payload JWT contient un tableau `roles`, pas un `role` scalaire).
- **TypeScript** : `role` dans `useAuth` retourne le rôle principal. `roles` retourne le tableau complet.

---

## 7. Roadmap — Prochaines étapes

| Priorité | Fonctionnalité |
|----------|----------------|
| 🔴 Haute | **PWA hors-ligne avancée** — Dexie.js pour faire l'appel sans réseau, sync différée |
| 🟡 Moyenne | **Synchronisation iCal** — export `.ics` intégrable dans Google Calendar/Outlook |
| 🟡 Moyenne | **Vue semaine drag & drop** pour la planification coach |
| 🟢 Basse | **Paiements CB Stripe** — cotisations en ligne + factures PDF |
| 🟢 Basse | **Liste d'attente** — inscription secondaire si place libérée |
| 🟢 Basse | **Évaluation post-séance** — feedback adhérent agrégé côté coach |

---

## 8. Démarrage de l'environnement local

```powershell
# 1. Démarrer WAMP (icône verte dans la barre des tâches)
#    API disponible sur http://localhost:8081/agheal-api/public

# 2. Lancer le frontend
cd d:\0CODE\AntiGravity\AGheal
npm run dev
# → http://localhost:5173

# 3. Si un composant Shadcn manque :
npx shadcn-ui@latest add [composant]
```

### Comptes de test (après `seed.sql`)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@agheal-adaptmovement.fr` | `password` | Admin |
| `guillaume@adaptmovement.fr` | `password` | Coach + Adhérent |
| `amandine@adaptmovement.fr` | `password` | Coach + Adhérent |
| `marie.dupont@email.fr` | `password` | Adhérent |
| `sylvie.martin@email.fr` | `password` | Adhérent |

### Points d'attention en développement

- **Cache PWA** : Les Service Workers peuvent masquer les derniers changements → `Ctrl+Shift+F5` ou vider le cache manuellement dans DevTools → Application → Service Workers → Unregister.
- **CORS** : Configuré dans `public/index.php` — si le frontend change de port, mettre à jour `FRONTEND_URL` dans `.env` du backend.
- **Dates** : les séances passées sont filtrées par `CONCAT(s.date, ' ', s.end_time) >= NOW()` dans `SessionController`. Attention aux fuseaux horaires serveur vs client.
- **Rôles multi** : un utilisateur peut avoir `['coach', 'adherent']` — ne jamais utiliser `role === 'coach'` côté PHP pour vérifier (utiliser `in_array` ou `array_intersect`).
