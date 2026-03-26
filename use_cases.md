# 📋 Cas d'Utilisation : AGHeal — v1.9.1

Ce document détaille l'ensemble des cas d'utilisation (Use Cases) de l'application AGHeal, classés par acteur et par domaine fonctionnel.

## 👥 Acteurs de l'application

1. **Visiteur** : Utilisateur non connecté.
2. **Adhérent** : Utilisateur inscrit pratiquant les activités.
3. **Coach** : Professionnel gérant les séances et le suivi des adhérents.
4. **Admin** : Administrateur technique et métier de la plateforme.
5. **Système** : Automatismes (triggers SQL, cron jobs, web push…).

---

## 🔐 1. Gestion des Comptes & Authentification

| Acteur | Cas d'Utilisation | Description |
| :--- | :--- | :--- |
| **Visiteur** | S'inscrire (Email/OAuth) | Création d'un compte. Le **Système** génère automatiquement un profil vide et assigne le rôle `adherent` via un trigger SQL. |
| **Visiteur** | Se connecter | Identification via Email/Password ou Google OAuth 2.0. Génération d'un JWT + Refresh Token. |
| **Visiteur** | Réinitialiser le mot de passe | Email de récupération → token sécurisé → page `/reset-password`. |
| **Adhérent** | Gérer son profil | Mise à jour des informations personnelles (nom, tél, âge, organisation, avatar en Base64). Vue de la date de certificat médical (lecture seule pour l'adhérent). |
| **Adhérent** | Configurer ses notifications | Activation/Désactivation granulaire : rappels séances (J-1), renouvellement (J-7), certificat (M-1) — par Email et/ou Push. |
| **Admin** | Gérer le statut des comptes | Bloquer/Débloquer un utilisateur. Forcer la confirmation de son email. |
| **Admin** | Assigner des rôles | Promotion d'un adhérent au rang de `coach` ou `admin`. Confirmation obligatoire. Protection anti-lockout (impossible de se retirer ses propres droits admin). |

---

## 📅 2. Gestion des Séances & Inscriptions

| Acteur | Cas d'Utilisation | Description |
| :--- | :--- | :--- |
| **Coach** | Créer une séance | Définition du titre, type, lieu, date/heure, capacité (min/max, `null` = illimitée). Statut par défaut : `publiée`. |
| **Coach** | Dupliquer des séances | Génération automatique d'une série de séances identiques sur 1 à 12 semaines consécutives. |
| **Coach** | Modifier une séance | Depuis le planning coach **ou** directement depuis le planning public (bouton rapide en modal). |
| **Coach** | Supprimer une séance | Suppression physique. Toutes les inscriptions associées sont supprimées en cascade. |
| **Coach** | Gérer le statut de séance | Passage en `Brouillon`, `Publiée` ou `Annulée`. Seules les séances `Publiées` + futures sont visibles du public. |
| **Coach** | Gérer les Presets (Types/Lieux) | Création de types d'activités (Pilates, Circuit Training…) et de lieux réutilisables, avec lieu par défaut par activité. |
| **Adhérent** | Consulter le planning | Vue filtrable des séances publiées et **à venir** (les séances passées sont automatiquement masquées). |
| **Adhérent** | S'inscrire à une séance | Inscription simple. Le système vérifie la capacité maximale. Fenêtre d'inscription limitée aux **7 prochains jours** (`limit_registration_7_days`). |
| **Adhérent** | Se désister | Désinscription d'une séance. Libère instantanément la place. |
| **Adhérent** | Consulter son historique | Liste des séances passées et à venir de l'adhérent avec statut de présence. |
| **Coach/Admin** | Faire l'appel (Pointage) | Cocher les présents lors de la séance. Horodatage automatique (`attended_at`). Ajout de walk-ins (adhérents de dernière minute) via barre de recherche. Sauvegarde génère une entrée dans `logs`. |
| **Coach/Admin** | Télécharger un log de séance | Export JSON d'une entrée de log depuis l'onglet Logs du dashboard Stats. |

---

## 🤝 3. Suivi Client & Groupes

| Acteur | Cas d'Utilisation | Description |
| :--- | :--- | :--- |
| **Coach** | Consulter la base client | Recherche et filtrage de tous les adhérents. Tri alphabétique ou par groupe. Accès aux fiches détaillées. |
| **Coach** | Gérer les remarques santé | Lecture des remarques d'auto-évaluation de l'adhérent. Saisie de notes privées (Coach Remarks — invisibles par l'adhérent). |
| **Coach** | Gérer les paiements | Suivi manuel du statut de règlement (`a_jour`, `en_attente`, `bloque`) et des dates de renouvellement. Saisie de paiements (montant, mode, commentaire). |
| **Coach** | Gérer les certificats | Saisie et mise à jour de la date d'expiration du certificat médical annuel. |
| **Coach** | Gérer les groupes | Création de groupes personnalisés (ex : "Groupe Diabète", "Matinaux") pour organiser les adhérents et cibler les communications. |
| **Coach** | Assigner des adhérents | Ajout ou retrait d'un adhérent dans un ou plusieurs groupes (jusqu'à 3). |

---

## 📢 4. Communication & Information

| Acteur | Cas d'Utilisation | Description |
| :--- | :--- | :--- |
| **Admin / Coach** | Créer des communications ciblées | Messages in-app (tous, groupe, individu) — urgents (affichés en rouge) ou normaux. Gérés depuis `InfoModal` onglet "Dans l'application". |
| **Admin / Coach** | Programmer des campagnes e-mail | Création de mailing HTML ou texte avec envoi différé planifié. Exécution via `cron_hourly.php`. Historique immuable dans `message_history`. |
| **Tout acteur** | Envoyer un message de contact | Formulaire de contact sur `/information` → email aux coachs/admin via `MailerService`. |
| **Système** | Envoyer des rappels automatiques | J-1 séance, M-1 certificat, J-7 abonnement — par Email (`cron_daily.php`) et/ou Web Push (`PushController`). |
| **Système** | Gérer les expirations | Bascule automatique du statut de règlement en "en_attente" à J+1 de la date de renouvellement. |
| **Système** | Nettoyer les tokens | Suppression des Refresh Tokens expirés pour maintenir les performances. |

---

## 📊 5. Statistiques & Historique (Coach / Admin)

| Acteur | Cas d'Utilisation | Description |
| :--- | :--- | :--- |
| **Admin / Coach** | Vue d'ensemble (KPIs) | Membres totaux, séances passées, taux de présence, total règlements, paiements en attente. |
| **Admin / Coach** | Analyser les séances | Historique détaillé de toutes les séances avec inscrits/présents par séance. Accordéon dépliable par séance. |
| **Admin / Coach** | Analyser les présences | Taux par type de séance, évolution mensuelle, palmarès Top 10 adhérents les plus assidus. |
| **Admin / Coach** | Analyser les adhérents | Pyramide des âges, répartition par groupe, statuts paiements (badges colorés `a_jour`/`en_attente`/`bloque`), validité certificats (valide/expiré/manquant). |
| **Admin / Coach** | Analyser les paiements | Chiffre d'affaires par mois, répartition par méthode (espèce/chèque/virement). |
| **Admin / Coach** | Consulter les logs | Liste brute des appels sauvegardés (filtré sur `action='attendance_saved'`). Téléchargement JSON individuel. |
| **Admin / Coach** | Exporter CSV global | Téléchargement de tout l'historique séances/présences au format CSV (encodage UTF-8 BOM pour ouverture directe Excel). |

---

## 🏗️ 6. Configuration & Paramétrage (Admin / Coach)

| Acteur | Cas d'Utilisation | Description |
| :--- | :--- | :--- |
| **Admin / Coach** | Gérer les Lieux | CRUD des lieux d'entraînement. La suppression d'un lieu met sa référence à `NULL` dans les séances existantes (conservation historique). |
| **Admin / Coach** | Gérer les Types de Séances | Définition des catégories d'activités avec description par défaut et lieu préféré. |
| **Admin** | Gérer les Utilisateurs | Promotion de rôles, blocage de comptes, forçage de confirmation email. |

---

## 🛡️ Règles Métier & Sécurité Logique

- **Invisibilité des données sensibles** : Les remarques coach et le statut financier ne sont jamais visibles par l'adhérent.
- **Primat de l'admissibilité** : Un compte bloqué ne peut plus s'inscrire à de nouvelles séances.
- **Fenêtre temporelle** : Seules les séances dans les 7 prochains jours acceptent les nouvelles inscriptions.
- **Filtrage temporel** : Les séances passées (date+heure fin < maintenant) sont masquées du planning public.
- **Intégrité référentielle** : La suppression d'un lieu/type met à `NULL` les références dans les séances (pas de cascade). La suppression d'une séance déclenche une cascade sur `registrations`.
- **Traçabilité** : Chaque action sensible (appel de présences, changement de rôle, blocage) génère une entrée dans `logs`.
- **Anti-lockout admin** : Un administrateur ne peut pas se retirer ses propres droits ni se bloquer lui-même.
