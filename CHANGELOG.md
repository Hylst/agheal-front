# Historique des modifications - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2025–2026

Toutes les modifications notables de ce projet sont documentées dans ce fichier.  
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.9.1] - 26 Mars 2026

### 🔧 Base de données — Centralisation & Correction
- **`seed.sql` v2.0** : Réécriture complète du script de données de test. Corrections de schéma : `password_hash` (au lieu de `password`), `email_confirmed_at` (TIMESTAMP), IDs de groupes en CHAR(36) UUID fixes, IDs de séances valides (≤36 chars), `received_by` (au lieu de `coach_id`), enum `espece` (sans 's'). Ajout d'un bloc de nettoyage en tête pour rendre le script idempotent (rejouable sans erreur).
- **Centralisation SQL** : Tous les scripts SQL sont maintenant dans `agheal-api/mysql/`. `seed.sql` supprimé du dossier frontend. `*.sql` retiré du `.gitignore` du frontend.
- **Archives SQL** : 9 scripts obsolètes (`seed_demo_data.sql`, `add_notifications_and_push.sql`, `add_payments_management.sql`, `migration_communications.sql`, `patch_email_campaigns.sql`, `add_missing_indexes.sql`, `update_schema.sql`, `debug_migration.php`, `fix_schema.php`) déplacés dans `docs/archive/`.
- **Guide BDD** : Nouveau document `docs/conseils_gestion_database.md` : stratégie de sauvegarde 3-2-1, procédure de reconstruction from scratch, export HeidiSQL et mysqldump, gestion des crashs.

### 🐛 Corrections de bugs
- **`Stats.tsx`** : Badge statut paiement toujours rouge car comparaison contre `'regle'` (inexistant en BDD). Corrigé en `'a_jour'`.
- **`StatsController.php`** : Vérification des rôles avec `array_intersect` sur le tableau `roles` du JWT (au lieu de `role` string inexistant) → corrige l'erreur 403 sur la page Statistiques pour les coachs.
- **`SessionController.php`** : Filtre temporel `CONCAT(date, end_time) >= NOW()` ajouté — les séances passées n'apparaissent plus dans le planning public.

### 📚 Documentation
- **`docs/explications_pedagogiques_completes.md`** : Réécriture complète — 14 sections (vs 6 initialement) : structure fichiers, JWT, rôles, parcours A→Z, module stats, design patterns, déploiement, glossaire 17 termes.
- **`docs/conseils_gestion_database.md`** : Nouveau guide gestion BDD (sauvegarde, restauration, hébergeur Hostinger).

---

## [1.9.0] - Mars 2026

### ✨ Gestion des Séances (Évolution)
- **Planning Public (`/sessions`)** : Fenêtre d'inscription de **7 jours glissants** — les séances hors délai sont en lecture seule pour éviter les réservations trop à l'avance. Colonne `limit_registration_7_days` ajoutée sur `sessions`.
- **Interface de Gestion** : Boutons Modifier/Supprimer ajoutés directement dans la modale du planning public (réservé Coachs/Admins).

### ✨ Gestion des Présences (Appel)
- **Backend API** : Création de `AttendanceController.php` — marquer présent, enregistrer l'horodatage, ajouter des participants de dernière minute (walk-ins).
- **Frontend** : Interface de pointage accessible depuis les détails d'une séance. Recherche instantanée pour ajouter des adhérents non-inscrits à la volée.
- **Base de données** : Ajout des champs `attended` et `attended_at` dans `registrations`. Script `migrate_attendance.sql` fourni pour les bases existantes.

### 📊 Dashboard Statistiques & Exports
- **Backend API** : `StatsController.php` avec 8 endpoints d'agrégation (KPIs, démographie, présences, historique financier, logs de pointage).
- **Frontend** : Page `/coach/stats` — 6 onglets : Vue d'ensemble, Séances, Présences, Adhérents, Paiements, Logs. Graphiques en barres CSS pur.
- **Exports** : Téléchargement de logs individuels en JSON, export global CSV avec BOM UTF-8 pour Excel.
- **Logs** : Enregistrement automatique dans la table `logs` à chaque sauvegarde d'appel (nom coach, type séance, inscrits/présents, walk-ins).

## [1.8.5] - Mars 2026

### 🔐 Authentification Google OAuth 2.0
- **Backend** : `GoogleAuthController` — flux OAuth 2.0 complet (redirect, callback CSRF, upsert user, JWT AGHeal).
- **Frontend** : `GoogleCallback.tsx` — reçoit le JWT dans l'URL après consent Google. Bouton "Continuer avec Google" dans `Login.tsx` fonctionnel.
- **Routes** : `GET /auth/google` et `GET /auth/google/callback`.

### 🐛 Corrections de bugs (BUG-02 à BUG-13)
- Suppression des doubles appels `requireAuth+requireRole` (BUG-02, BUG-10)
- Fix type `getProfile()` TypeScript (BUG-03)
- Suppression auto-insert paiement fantôme (BUG-05)
- Endpoint dédié `GET /admin/coaches` pour "Reçu par" (BUG-07)
- Alias route `/admin/clients` + lien Dashboard adapté au rôle (BUG-08)
- Filtre email dans recherche AdminUsers (BUG-11)
- Sécurisation des `fetch()` dans `PaymentController::summary()` (BUG-13)

## [1.8.0] - Mars 2026

### ✨ Système de Gestion des Règlements
- **Backend API** : `PaymentController` avec CRUD complet et agrégations.
- **Frontend** : Page `/coach/payments` — saisie, historique filtrable, dashboard (KPIs, barres d'évolution).
- **Base de Données** : Enrichissement de `payments_history` avec `payment_method` (espèce/chèque/virement) et `comment`.

## [1.5.5] - Mars 2026

### ✨ Communications Ciblées & E-mails Programmables
- `message_history` et `email_campaigns` fusionnés dans `init.sql`.
- CRUD communications in-app et e-mails programmables (HTML). Interface 3 onglets : "Dans l'application", "E-mails programmables", "Historique".
- `InfoModal` : 5 onglets avec roadmap et guide par rôle.

### ✨ Notifications Web Push & Alertes
- `minishlink/web-push`, Service Worker (PWA), `PushController`, `SettingsModal` granulaire.
- CRON `cron_daily.php` / `cron_hourly.php` : alertes J-1 séance, M-1 certificat, J-7 abonnement.

### ✨ Certificats Médicaux & Règlements
- Affichage date certif sur profil adhérent. Saisie par coach. Rappel email M-1.

## [1.5.3] - Mars 2026

### 🐛 Bug Fixes & Refactoring
- Correction désinscription séance (Erreur 500 nommage `{id}` vs `$sessionId`).
- Affichage correct du nombre total d'inscrits dans la vue séance.
- Refonte Clients : tri alphabétique, filtre par groupe, recherche unifiée.
- Nettoyage : suppression de 19 paquets NPM et 19 composants orphelins.

## [1.5.0] - Mars 2026

### 🐛 Correctifs — Activités & Séances
- Types des IDs corrigés de `int` → `string` dans les contrôleurs.
- Pré-sélection du lieu et type par défaut lors de la création d'une séance.
- Mise à jour immédiate des modifications de séances.

### 🎨 UI — Animations
- Login : zoom ×2 au survol du logo. Page `/information` : effets de survol améliorés.

## [1.4.0] - Mars 2026

### ✨ Gestion de la Facturation & Abonnements
- Table `payments_history`, enregistrement des transactions automatiques.
- Bandeau d'alerte sur le Dashboard pour les règlements en attente.
- Script de rappel email (7 jours avant échéance), basculement automatique en "En attente".
- Protection anti-lockout admin : triggers SQL empêchant de se retirer ses propres droits.

## [1.3.0] - Mars 2026

### ✨ Base de données — Refonte Totale
- Réécriture de `init.sql` (synchronisation avec l'API PHP).
- Création de `init_trigger.sql` (trigger d'auto-profiling + UUID).
- Suppression des tables inutilisées (`maintenance_types`, `reminders`, etc.).

## [1.2.1] - Février 2026

### ✨ Documentation
- Page interactive HTML/CSS/JS d'explications pour coachs et admin.
- Schéma animé des flux et de la mission de l'application.

## [1.2.0] - Décembre 2025

### ✨ Ajouté
- Google OAuth (bouton + flux backend), réinitialisation de mot de passe, formulaire de contact.
- Notifications email via Edge Function (`send-session-reminders`).
- Documentation : `DEPLOYMENT.md`, `STRUCTURE.md`.

## [1.1.0] - Décembre 2025

### ✨ Ajouté
- Page Informations (équipe, activités, contact). Paramètres de notifications. Gestion avancée clients (remarques coach, statut règlement masqué, date renouvellement).

## [1.0.0] - Décembre 2025

### ✨ Fonctionnalités initiales
- Authentification email/mdp + rôles (Admin, Coach, Adhérent).
- CRUD séances (création, modification, suppression, duplication multi-semaines, affichage calendrier/liste, inscriptions).
- Gestion activités, lieux, clients, groupes (jusqu'à 3 groupes/adhérent).
- Design responsive, mode sombre/clair, composants Shadcn/UI.

---

## Légende
- ✨ **Ajouté** | 🔧 **Modifié** | 🐛 **Corrigé** | 🗑️ **Supprimé** | 🔐 **Sécurité** | 📊 **Analytics** | 📚 **Documentation**

---

*Historique maintenu par Geoffroy Streit - 2025-2026*
