# Historique des modifications - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2025

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.5.1] - Mars 2026

### 🎨 Responsive Mobile — Audit Complet

- **Toutes les pages** : Padding adaptatif `p-4 sm:p-8` sur l'ensemble des vues
- **Titres adaptatifs** : `text-2xl` sur mobile → `text-4xl` sur desktop (`h1`, `h2`)
- **Dashboard** : Bouton "Déconnexion" — texte masqué sur mobile, icône seule conservée
- **SettingsModal** : Hauteur plafonnée à `90vh`, contenu scrollable, boutons sticky full-width
- **Clients** : Vue en **cartes** sur mobile (tableau masqué), filtres empilés verticalement
- **CoachSessions** : Header en colonne, bouton "Créer une séance" full-width mobile
- **Groups** : CardHeader en colonne, tableau horizontal scrollable
- **Locations** : Titre adaptatif, bouton "Ajouter" full-width, tableau scrollable
- **AdminUsers** : Boutons rôles/statut passent sous le nom de l'utilisateur sur mobile
- **Profile** : Boutons Enregistrer/Annuler full-width sur mobile
- **Sessions** : Filtres empilés, boutons vue (Liste/Calendrier) icône seule sur mobile, modal scrollable
- **History** : Cartes padding réduit, titres h2 adaptatifs

---

## [1.5.0] - Mars 2026

### 🐛 Correctifs — Activités & Séances

- **Lieu par défaut** : Correction de la non-persistance lors de la création ou modification d'une activité (type UUID mal converti avec `parseInt`)
- **Mise à jour des séances** : Les modifications (titre, lieu, type) sont maintenant reflétées immédiatement après enregistrement
- **Backend** : Types des IDs corrigés de `int` → `string` dans les contrôleurs `SessionController`, `LocationController`, `GroupController`, `SessionTypeController`
- **Frontend** : Suppression des `parseInt()` sur les champs UUID dans `Activities.tsx` et `Schedule.tsx`
- **Pré-sélection** : Lieu et type par défaut de l'activité sont maintenant pré-remplis lors de la création d'une séance

### 🔐 Sécurité & Rôles

- **Profil (Admin/Coach)** : Statistut de règlement masqué dans les modals et fiches clients pour les comptes Admin et Coach

### 🎨 UI — Animations & Page Login

- **Login** : Zoom ×2 au survol du logo AGheal
- **Page /information** : Effets de survol améliorés sur les blocs (zoom, highlight, shadow), logo AGheal intégré en bas de page

### 🔧 Nettoyage Codebase

- Fichiers Supabase obsolètes déplacés dans un dossier `archive/`
- Script `migrate-from-supabase.sql` supprimé
- Warning de type dans `Database.php::lastInsertId()` corrigé

---

## [1.4.0] - Mars 2026

### ✨ Gestion de la Facturation & Abonnements
- **Historisation automatique** : Création de la table `payments_history` et enregistrement des transactions lors du passage au statut "À jour".
- **Visibilité Adhérent** : Affichage du statut de règlement et de la date de renouvellement sur le profil utilisateur.
- **Alertes Proactives** : Bandeau d'alerte sur le Dashboard pour les règlements en attente.
- **Filtres Coach** : Filtrage de la liste des clients par statut de paiement.
- **Automatisation** : Script de rappel par email (7 jours avant échéance) et basculement automatique en "En attente" le jour J.

### 🔐 Sécurité & Administration
- **Prévention du "Lockout"** : Triggers SQL et contrôles applicatifs empêchant un admin de se retirer ses propres droits ou de se bloquer.
- **Audit Logging** : Journalisation de toutes les actions administratives (changement de rôle, blocage) dans la table `logs`.
- **UX Améliorée** : Ajout de boîtes de dialogue de confirmation pour les changements de rôles sensibles.

### 🔧 Améliorations Techniques
- Indexation de la base de données sur les dates de renouvellement pour optimiser les performances des scripts de rappel.

---

## [1.3.0] - Mars 2026

### ✨ Ajouté

- **Audit & Synchronisation Base de Données**
  - Refonte totale du script `init.sql` pour correspondre à l'API PHP.
  - Création de `init_trigger.sql` (Fonction UUIDv4 et Trigger d'auto-profiling).
  - Script `cleanup.sql` pour une réinitialisation propre.
  - Suppression des tables inutilisées (`maintenance_types`, `reminders`, `vehicles`, etc.).

### 🔧 Modifié

- **Déploiement Coolify**
  - Correction des endpoints API pour forcer le HTTPS (SSL Mixed Content).
  - Optimisation des variables d'environnement pour la connexion DB.

---

## [1.2.1] - Février 2026

### ✨ Ajouté

- Page interactive d’explications (HTML/CSS/JS) pour coachs et admin
- Cartographie simplifiée des modules, de la logique métier et des tables MySQL
- Schéma animé interactif pour visualiser les flux et la mission de l’app
- Conseils d’utilisation supplémentaires issus du guide ABOUT

---

## [1.2.0] - Décembre 2025

### ✨ Ajouté

- **Authentification Google OAuth**
  - Bouton "Continuer avec Google" sur les pages Login et Signup
  - Création automatique du profil utilisateur
  - Configuration dans les paramètres backend

- **Réinitialisation de mot de passe**
  - Page dédiée `/reset-password`
  - Formulaire de demande par email
  - Gestion du token Supabase pour le nouveau mot de passe

- **Formulaire de contact**
  - Intégré à la page Informations
  - Envoi d'email aux coachs via Edge Function
  - Validation des champs

- **Notifications par email**
  - Edge Function `send-session-reminders`
  - Rappel automatique la veille des séances
  - Configuration Cron pour exécution quotidienne

- **Documentation complète**
  - `DEPLOYMENT.md` : Guide de déploiement Docker/Coolify
  - `STRUCTURE.md` : Architecture technique du projet
  - Mise à jour de `README.md` et `ABOUT.md`

---

## [1.1.0] - Décembre 2025

### ✨ Ajouté

- **Page Informations**
  - Présentation de l'équipe AGHeal
  - Description des activités
  - Coordonnées de contact
  - Champs de communication modifiables (Admin/Coach)

- **Paramètres de notifications**
  - Rappels de séances par email/push
  - Rappels de renouvellement automatiques

- **Gestion avancée des clients**
  - Remarques coach (privées)
  - Statut de règlement masqué pour les adhérents
  - Date de renouvellement

### 🔧 Modifié

- Amélioration de l'interface responsive
- Optimisation des requêtes base de données

---

## [1.0.0] - Décembre 2025

### ✨ Fonctionnalités initiales

- **Authentification**
  - Connexion par email/mot de passe
  - Système de rôles (Admin, Coach, Adhérent)
  - Confirmation automatique des emails

- **Gestion des séances**
  - Création, modification, suppression de séances
  - Duplication sur plusieurs semaines
  - Affichage calendrier et liste
  - Gestion des inscriptions

- **Gestion des activités**
  - Création de types d'activités
  - Lieu par défaut configurable
  - Description automatique

- **Gestion des lieux**
  - Création et modification des emplacements
  - Adresse et notes

- **Gestion des clients**
  - Fiches adhérents complètes
  - Statut de règlement
  - Avatar personnalisé
  - Blocage de compte

- **Gestion des groupes**
  - Création de groupes
  - Assignation des adhérents (jusqu'à 3 groupes)

### 🔐 Sécurité

- Politiques RLS (Row Level Security) sur toutes les tables
- Protection des données personnelles
- Séparation des rôles dans une table dédiée
- Accès restreint selon les rôles

### 🎨 Interface

- Design responsive (mobile et desktop)
- Mode sombre/clair automatique
- Animations fluides avec Framer Motion
- Composants accessibles (Shadcn/UI)

---

## À venir

- Relecture métier de la page Explications avec l’équipe coach

Voir le fichier [TODO.md](./TODO.md) pour les fonctionnalités prévues.

---

## Légende

- ✨ **Ajouté** : Nouvelles fonctionnalités
- 🔧 **Modifié** : Changements dans les fonctionnalités existantes
- 🐛 **Corrigé** : Corrections de bugs
- 🗑️ **Supprimé** : Fonctionnalités supprimées
- 🔐 **Sécurité** : Corrections de vulnérabilités

---

*Historique maintenu par Geoffroy Streit - 2025*
