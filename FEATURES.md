# Fonctionnalités - AGHeal

Ce fichier liste l'ensemble des fonctionnalités implémentées dans AGHeal à la **version 1.9.1**.

---

## 👤 Pour l'Adhérent

- **Création de compte** (Email/Mot de passe ou Google OAuth).
- **Profil personnalisé** : Photo, informations personnelles, validité de l'abonnement et du certificat médical (lecture seule).
- **Consultation du planning** : Calendrier et liste des séances publiées. Les séances passées sont automatiquement masquées.
- **Inscription aux séances** : Fenêtre de réservation limitée à **7 jours** pour éviter le surbooking. Gestion des places min/max.
- **Historique personnel** : Séances passées et futures auxquelles l'adhérent est/était inscrit.
- **Gestion des préférences de notification** : Email et Web Push — rappels J-1 de séance, M-1 certificat médical, J-7 abonnement.
- **Boîte de réception d'informations** : Lecture des annonces du club et messages ciblés urgents.
- **Formulaire de contact** pour joindre l'équipe.

---

## 🏋️‍♂️ Pour le Coach

Toutes les fonctionnalités de l'adhérent, plus :

- **Gestion des séances** : Création, modification (édition rapide depuis le planning public), annulation, suppression et duplication automatique sur plusieurs semaines.
- **Gestion des présences (Appel)** : Interface de pointage lors de la séance — cocher les présents, enregistrer l'heure d'arrivée. Ajout possible d'adhérents de dernière minute (walk-ins) via une barre de recherche.
- **Logs de séances** : Chaque appel sauvegardé génère une entrée structurée (coach, type, inscrits/présents, walk-ins, horodatage) téléchargeable en JSON.
- **Gestion des activités et lieux** : Création de modèles réutilisables pour accélérer la planification.
- **Fichiers Adhérents** : Accès à la fiche de chaque adhérent. Modification de la date de renouvellement d'abonnement, expiration du certificat médical, statut de paiement (`à jour` / `en attente` / `bloqué`), remarques privées (invisibles par l'adhérent).
- **Groupes** : Création de groupes (ex : "Séniors", "Yoga") et assignation des adhérents pour cibler le public de séances ou de communications.
- **Paiements** : Saisie et historique des règlements (espèces, chèques, virements) avec commentaires et coach destinataire.
- **Statistiques & Exports** : Dashboard complet 6 onglets (KPIs, Séances, Présences, Adhérents, Paiements, Logs). Export CSV global (encodage UTF-8 BOM pour Excel) et JSON individuel par log.
- **Communications in-app & e-mailing** : Messages ciblés (tous, groupe, individu) et campagnes d'e-mails HTML programmables (envoi différé via CRON).

---

## ⚙️ Pour l'Administrateur

Toutes les fonctionnalités du coach, plus :

- **Gestion des Utilisateurs** : Modification des rôles (promouvoir adhérent → coach → admin). Protection anti-lockout (impossible de se retirer ses propres droits).
- **Sécurité et modération** : Blocage/déblocage de comptes. Forçage de la validation d'une adresse email.
- **Supervision technique** : Accès complet aux logs d'audit et téléchargement de chaque trace de séance.

---

## 🤖 Mécanismes Système (Automatismes)

- **Trigger SQL** `after_user_insert` : Création automatique du profil et du rôle `adherent` à chaque nouvel utilisateur.
- **CRON quotidien** (`cron_daily.php`) : Rappels certificats M-1, alertes abonnements expirés, bascule automatique du statut en "en attente" à J+1.
- **CRON horaire** (`cron_hourly.php`) : Exécution des campagnes d'e-mails programmées.
- **Web Push** : Notifications natives PWA sur mobile et desktop.

---

## 🔐 Sécurité

- **JWT** (JSON Web Tokens) pour toutes les routes protégées. Refresh tokens long-lived.
- **Rôles multi-niveaux** stockés dans `user_roles` (un utilisateur peut avoir plusieurs rôles simultanément).
- **PDO** avec requêtes préparées — protection contre les injections SQL.
- **CORS** configuré pour n'accepter que le domaine frontend.
- **Audit logging** : Toutes les actions sensibles (changement de rôle, blocage, appel de séance) sont journalisées dans `logs`.

---

*Fonctionnalités documentées par Geoffroy Streit — Mars 2026*
