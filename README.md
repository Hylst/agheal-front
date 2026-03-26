# AGHeal — Application de gestion de séances sportives

> **Version actuelle : 1.9.1** | [Fonctionnalités](./FEATURES.md) | [CHANGELOG](./CHANGELOG.md) | [TODO](./TODO.md) | [Structure](./STRUCTURE.md)

## 👤 Auteur & Droits
**Geoffroy Streit** - Développeur apprenant.  
*© 2026 Geoffroy Streit. Tous droits réservés. Code source propriétaire, non libre de droits.*

---

## 🧭 Architecture — Vue d'ensemble

L'application est composée de **3 couches distinctes** :

```
┌──────────────────────────────────────────────────────────────────┐
│  1. FRONTEND (React + TypeScript)    → http://localhost:5173      │
│     Ce que vous voyez dans le navigateur (HTML/CSS/JavaScript)   │
│     Code dans : d:\0CODE\AntiGravity\AGheal\                    │
│     Démarrage  : npm run dev                                      │
├──────────────────────────────────────────────────────────────────┤
│  2. BACKEND PHP (Apache via WAMP)    → http://localhost:8081      │
│     L'API REST : reçoit les requêtes, lit/écrit en BDD, JSON.    │
│     Code dans : d:\0CODE\AntiGravity\agheal-api\                │
│     Démarrage  : automatique via WAMP (Apache)                    │
├──────────────────────────────────────────────────────────────────┤
│  3. BASE DE DONNÉES MySQL            → localhost:3306             │
│     Stocke utilisateurs, séances, présences, paiements…          │
│     Démarrage  : automatique via WAMP                             │
│     Accès      : http://localhost:8081/phpmyadmin (root/root123)  │
└──────────────────────────────────────────────────────────────────┘
```

> **Note :** Le backend est en **PHP pur** (pas de Laravel/Symfony). Node.js sert uniquement à faire tourner React en développement (`npm run dev`).

---

## ⚡ Démarrer l'application en local

### Étape 1 — Démarrer WAMP (Apache + MySQL)

> WAMP doit être **actif** (icône **verte** dans la barre des tâches Windows)

Si WAMP est bloqué :
1. `Ctrl+Alt+Suppr` → Gestionnaire des tâches → terminer `wampmanager.exe`, `httpd.exe`, `mysqld.exe`
2. Relancer WAMP depuis le bureau — attendre l'icône verte (10–20 sec)
3. Si l'icône reste orange : un port (80, 8081) est pris → clic droit sur WAMP → Outils → Tester les ports

### Étape 2 — Lancer le frontend React

```powershell
cd d:\0CODE\AntiGravity\AGheal
npm run dev
```

### Étape 3 — Ouvrir l'application

➡️ **http://localhost:5173** (frontend)  
⚠️ `http://localhost:8081` = l'API PHP (retourne du JSON brut, pas l'interface)

---

## 📂 Où se trouvent les fichiers ?

| Composant | Emplacement local |
|-----------|------------------|
| **Frontend React** | `d:\0CODE\AntiGravity\AGheal\` |
| **Backend PHP (API)** | `d:\0CODE\AntiGravity\agheal-api\` (symlink ou copié dans `C:\wamp64\www\`) |
| **Scripts SQL (source canonique)** | `d:\0CODE\AntiGravity\agheal-api\mysql\` |
| **Config frontend** | `d:\0CODE\AntiGravity\AGheal\.env` |
| **Config backend** | `d:\0CODE\AntiGravity\agheal-api\.env` |
| **phpMyAdmin** | http://localhost:8081/phpmyadmin |

---

## 🔑 Comptes de test (après exécution de `seed.sql`)

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@agheal-adaptmovement.fr` | `password` | Admin |
| `guillaume@adaptmovement.fr` | `password` | Coach + Adhérent |
| `amandine@adaptmovement.fr` | `password` | Coach + Adhérent |
| `marie.dupont@email.fr` | `password` | Adhérent |
| `jean.michel@email.fr` | `password` | Adhérent |
| `sylvie.martin@email.fr` | `password` | Adhérent |
| `paul.bernard@email.fr` | `password` | Adhérent |

---

## 🗄️ Base de données — Reconstruction from scratch

Pour reconstruire la BDD entièrement, exécuter dans l'ordre dans HeidiSQL :

```
1. agheal-api/mysql/init.sql              → Crée toutes les tables et vues
2. agheal-api/mysql/init_trigger.sql      → Crée le trigger d'auto-profiling
3. agheal-api/mysql/seed.sql              → Insère les données de test (local uniquement)
```

> `migrate_attendance.sql` n'est **pas** nécessaire lors d'une création from scratch — les colonnes sont déjà dans `init.sql`.

---

## 🛠️ Configuration

### Frontend — `d:\0CODE\AntiGravity\AGheal\.env`
```
VITE_API_URL=http://localhost:8081/agheal-api/public
```

### Backend PHP — `d:\0CODE\AntiGravity\agheal-api\.env`
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=agheal
DB_USER=root
DB_PASSWORD=root123
JWT_SECRET=votre_cle_secrete_super_longue_et_aleatoire_123456
API_URL=http://localhost:8081/agheal-api/public
FRONTEND_URL=http://localhost:5173
```

---

## 🌐 Déploiement Production (Coolify / Hostinger VPS)

| Composant | URL | Technologie |
|-----------|-----|-------------|
| **Frontend** | https://agheal.hylst.fr | Nixpacks (React/Vite) |
| **API Backend** | https://api.agheal.hylst.fr | Docker (PHP 8.1 / Apache) |
| **Base de données** | Réseau interne Coolify | MariaDB |

**Variables d'environnement Production :**
- Frontend : `VITE_API_URL=https://api.agheal.hylst.fr`
- Backend : `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` configurés dans Coolify

---

## 📱 Responsive Mobile

- Design **mobile-first** avec Tailwind CSS (breakpoints `sm`, `md`, `lg`)
- **Navigation** : Barre en bas de l'écran sur mobile (MobileNav)
- **Clients** : Vue en **cartes** sur mobile, tableau sur desktop
- **Modals** : Hauteur max `90vh`, contenu scrollable
- **Tableaux** : scrollables horizontalement sur mobile

---

## 🔔 Système de Rappels & Automates

| Déclencheur | Événement | Canal |
|-------------|-----------|-------|
| J-1 séance | Rappel avant la séance | Email + Push |
| M-1 certificat | Renouvellement certificat médical | Email + Push |
| J-7 abonnement | Rappel avant échéance | Email + Push |
| J+1 expired | Bascule statut → "en attente" | Email coach + Push |

---

## 📂 Documentation Technique (`/docs`)

| Fichier | Contenu |
|---------|---------|
| [explications_pedagogiques_completes.md](./docs/explications_pedagogiques_completes.md) | Guide complet A→Z pour débutant (14 sections) |
| [conseils_gestion_database.md](./docs/conseils_gestion_database.md) | Sauvegarde, restauration, gestion BDD |
| [01_MCD_Merise.md](./docs/01_MCD_Merise.md) | Schéma de données Merise |
| [02_UML_Classes.md](./docs/02_UML_Classes.md) | Modèle objet UML |
| [03_UML_Use_Cases_Activites.md](./docs/03_UML_Use_Cases_Activites.md) | Processus et cas d'utilisation UML |
| [use_cases.md](./use_cases.md) | Inventaire des fonctionnalités par rôle |

---

*Documentation maintenue par Geoffroy Streit — 2026*
