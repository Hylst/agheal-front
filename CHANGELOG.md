# Historique des modifications - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2025

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

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
