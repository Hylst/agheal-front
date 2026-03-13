# 🚀 Reprise du Projet : AGHeal (Dossier Complet)

Ce document est le guide de référence pour tout développeur reprenant le projet AGHeal. Il contient les chemins absolus, les URLs de production, et l'architecture détaillée des 3 conteneurs.

## 📁 Chemins Absolus (Local)
- **Frontend (React)** : `d:\0CODE\AntiGravity\AGheal`
- **Backend (API PHP)** : `D:\0CODE\AntiGravity\agheal-api`
- **Scripts SQL Critiques** :
    - Nettoyage complet : `d:\0CODE\AntiGravity\AGheal\cleanup.sql`
    - Initialisation (Tables/Vues) : `D:\0CODE\AntiGravity\agheal-api\mysql\init.sql`
    - Trigger & Fonction UUID : `D:\0CODE\AntiGravity\agheal-api\mysql\init_trigger.sql`

## 🌍 Environnement & URLs de Production
L'infrastructure est hébergée sur un **VPS Hostinger** (IP: `31.97.116.175`) et orchestrée par **Coolify**.

| Composant | URL de Production | Type de Conteneur / Déploiement |
| :--- | :--- | :--- |
| **Frontend** | [https://agheal.hylst.fr](https://agheal.hylst.fr) | Nixpacks (Node/Vite) |
| **Backend API** | [https://api.agheal.hylst.fr](https://api.agheal.hylst.fr) | Dockerfile (Apache/PHP 8.1) |
| **Coolify (Admin)** | [https://31.97.116.175:8000](https://31.97.116.175:8000) | Panel de gestion |
| **Base de Données** | *Accès Interne uniquement* | MariaDB 10.11 |

## 🏗️ Architecture des 3 Conteneurs (Docker)
L'application fonctionne sur un réseau Docker privé géré par Coolify :

1.  **Conteneur Frontend** : Sert les fichiers statiques compilés. Communique avec l'API via le domaine public HTTPS.
2.  **Conteneur Backend** : Exécute le code PHP. Il est isolé derrière un reverse proxy (Traefik). Il communique avec la base de données via le **nom d'hôte interne** (ex: `mariadb-database-ogg4...`).
3.  **Conteneur MariaDB** : Stocke les données. Le port 3306 est fermé au public. Pour un accès externe (HeidiSQL), on utilise temporairement le port **3307** (configuré via l'option "Make it publicly available" dans Coolify).

## 💾 État de la Base de Données (Synchronisation API)
La base a été auditée en Mars 2026 pour correspondre à 100% aux requêtes SQL du code PHP.
- **Tables (13)** : `users`, `profiles`, `user_roles`, `groups`, `user_groups`, `locations`, `session_types`, `sessions`, `registrations`, `app_info`, `logs`, `password_resets`, `refresh_tokens`.
- **Triggers** : Un trigger `after_user_insert` crée automatiquement le profil et assigne le rôle `adherent` lors d'un signup.

## 🛠️ Procédures de Travail
### Mise à jour (CI/CD Automatique)
- Tout **push** sur la branche `main` des repos respectifs déclenche un build et un redéploiement automatique sur Coolify.

### Débogage
- **Backend** : Les erreurs PHP sont visibles dans les logs du conteneur sur Coolify.
- **Database** : Utiliser HeidiSQL sur l'IP `31.97.116.175` avec le port `3307` (si ouvert).
- **SSL** : SSL est géré automatiquement. Si une erreur de "Mixed Content" apparaît, vérifier que `VITE_API_URL` commence bien par `https://`.

## 🚀 Prochaines Étapes Immédiates pour le Repreneur
1. S'inscrire sur `https://agheal.hylst.fr/signup`.
2. Via HeidiSQL, aller dans la table `user_roles` et changer le rôle de l'utilisateur créé en `admin`.
3. Se reconnecter pour accéder aux panneaux Coach et Admin.
