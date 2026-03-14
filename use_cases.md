# 📋 Cas d'Utilisation : AGHeal

Ce document détaille l'ensemble des cas d'utilisation (Use Cases) de l'application AGHeal, classés par acteur et par domaine fonctionnel.

## 👥 Acteurs de l'application
1.  **Visiteur** : Utilisateur non connecté.
2.  **Adhérent** : Utilisateur inscrit pratiquant les activités.
3.  **Coach** : Professionnel gérant les séances et le suivi des adhérents.
4.  **Admin** : Administrateur technique et métier de la plateforme.
5.  **Système** : Automatismes (triggers, cron jobs, etc.).

---

## 🔐 1. Gestion des Comptes & Authentification
| Acteur | Cas d'Utilisation | Description en profondeur |
| :--- | :--- | :--- |
| **Visiteur** | S'inscrire (Email/OAuth) | Création d'un compte. Le **Système** génère alors automatiquement un profil vide et assigne le rôle `adhérent` via un trigger SQL. |
| **Visiteur** | Se connecter | Identification via Email/Password ou Google OAuth. Génération d'un token JWT et d'un Refresh Token. |
| **Visiteur** | Réinitialiser le mot de passe | Demande d'email de récupération, génération d'un token sécurisé, et mise à jour via une page dédiée. |
| **Adhérent** | Gérer son profil | Mise à jour des informations personnelles (nom, tel, âge, organisation) et de l'avatar (stocké en Base64). Accès à la date de certificat médical. |
| **Adhérent** | Configurer ses notifications | Activation/Désactivation granulaire des rappels de séances, de renouvellement et de certificat médical. |
| **Admin** | Gérer le statut des comptes | Possibilité de **Bloquer/Débloquer** un utilisateur ou de forcer la confirmation de son email. |
| **Admin** | Assigner des rôles | Promotion d'un adhérent au rang de `coach` ou d' `admin`. |

---

## 📅 2. Gestion des Séances & Inscriptions
| Acteur | Cas d'Utilisation | Description en profondeur |
| :--- | :--- | :--- |
| **Coach** | Créer une séance | Définition du titre, type, lieu, date/heure et capacités (min/max). Une capacité `null` signifie illimitée. |
| **Coach** | Dupliquer des séances | Création automatique d'une série de séances identiques sur plusieurs semaines consécutives. |
| **Coach** | Gérer le statut de séance | Passage d'une séance en `Brouillon`, `Publiée` ou `Annulée`. |
| **Coach** | Gérer les Presets (Types/Lieux) | Création de types d'activités (Pilates, etc.) et de lieux réutilisables pour accélérer la saisie. |
| **Adhérent** | Consulter le planning | Vue filtrable des séances publiées. |
| **Adhérent** | S'inscrire à une séance | Inscription simple. Le système vérifie la capacité maximale. |
| **Adhérent** | Se désister | Désinscription d'une séance. Libère instantanément la place pour un autre adhérent. |
| **Adhérent** | Consulter son historique | Liste des séances passées et à venir auxquelles l'adhérent est/était inscrit. |

---

## 🤝 3. Suivi Client & Groupes
| Acteur | Cas d'Utilisation | Description en profondeur |
| :--- | :--- | :--- |
| **Coach** | Consulter la base client | Recherche et filtrage de tous les adhérents inscrits. Accès aux fiches détaillées. |
| **Coach** | Gérer les remarques santé | Lecture des remarques d'auto-évaluation de l'adhérent et saisie de notes professionnelles (Coach Remarks). |
| **Coach** | Gérer les paiements | Suivi manuel du statut de règlement (`à jour`, `en attente`) et des dates de renouvellement. Alerte email si expiration. |
| **Coach** | Gérer les certificats | Saisie et mise à jour de la date d'expiration du certificat médical annuel de l'adhérent. |
| **Coach** | Gérer les groupes | Création de groupes personnalisés (ex: "Groupe Diabète", "Matinaux") pour mieux organiser les adhérents. |
| **Coach** | Assigner des adhérents | Ajout ou retrait d'un adhérent dans un ou plusieurs groupes. |

---

## 📢 4. Communication & Information
| Acteur | Cas d'Utilisation | Description en profondeur |
| :--- | :--- | :--- |
| **Admin / Coach** | Créer des communications ciblées | Création de messages ciblés (urgents, par groupe, individuels ou globaux) gérés depuis la page Informations. |
| **Tout acteur** | Envoyer un message de contact | Formulaire de contact envoyant un email aux coachs/admin pour des questions spécifiques. |
| **Système** | Envoyer des rappels | Envoi automatisé (via Cron) d'emails de rappel J-1 pour les séances, rappel de renouvellement J-7 et rappel certificat médical M-1. |
| **Système** | Gérer les expirations | Bascule automatique du statut de règlement à "en attente" à J+1 de la date de renouvellement. |
| **Système** | Nettoyer les tokens | Suppression automatique des Refresh Tokens expirés ou révoqués pour maintenir la performance. |

---

## 🏗️ 5. Configuration & Paramétrage (Admin / Coach)
| Acteur | Cas d'Utilisation | Description en profondeur |
| :--- | :--- | :--- |
| **Admin / Coach** | Gérer les Lieux | Création, modification et suppression des lieux d'entraînement. |
| **Admin / Coach** | Gérer les Types de Séances | Définition des catégories d'activités (Pilates, Circuit Training, etc.) avec description par défaut. |
| **Admin** | Consulter les Logs | (Via Base de données) Suivi de qui a fait quoi (changement de rôle, blocage) pour l'audit de sécurité. |

## 🛡️ Règles Métier & Sécurité Logique
- **Héritage de visibilité** : Un adhérent **ne voit JAMAIS** les remarques que le coach écrit sur lui ni son statut de règlement financier.
- **Primat de l'admissibilité** : Un compte bloqué par l'admin ne peut plus s'inscrire à de nouvelles séances.
- **Intégrité référentielle** : La suppression d'un lieu ou d'un type d'activité met à `NULL` les références dans les séances existantes (pas de suppression en cascade pour garder l'historique).
- **Trabilité** : Chaque action sensible (création de séance, modification de profil) génère une entrée dans la table `logs`.
