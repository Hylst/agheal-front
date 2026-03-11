# AGHeal — Application de gestion de séances sportives

## 🧭 Architecture — Expliqué simplement

L'application est composée de **3 morceaux distincts** qui tournent en même temps :

```
┌─────────────────────────────────────────────────────────────────┐
│  1. FRONTEND (React)          → http://localhost:5173           │
│     Ce que vous voyez dans le navigateur (HTML/CSS/JavaScript)  │
│     Code dans : d:\0CODE\AntiGravity\AGheal\                   │
│     Lancé avec : npm run dev                                    │
├─────────────────────────────────────────────────────────────────┤
│  2. BACKEND PHP (Apache/WAMP) → http://localhost:8081           │
│     L'API REST : reçoit les requêtes du frontend,               │
│     lit/écrit en base de données, renvoie du JSON.              │
│     Code dans : C:\wamp64\www\agheal-api\                       │
│     Lancé automatiquement par WAMP.                             │
├─────────────────────────────────────────────────────────────────┤
│  3. BASE DE DONNÉES MySQL     → localhost:3306                  │
│     Stocke les utilisateurs, séances, profils…                  │
│     Données dans : C:\wamp64\bin\mysql\mysql8.4.7\data\agheal\  │
│     Lancé automatiquement par WAMP.                             │
│     Accessible via phpMyAdmin : http://localhost:8081/phpmyadmin│
└─────────────────────────────────────────────────────────────────┘
```

**Ce n'est PAS une application Node.js.** Le backend est en **PHP pur** qui tourne via Apache (WAMP). Node.js sert uniquement à faire tourner React en développement (`npm run dev`).

Il n'y a **plus d'appels à Supabase, ni à des Edge Functions**.

---

## ⚡ Démarrer l'application en local

### Étape 1 — Démarrer WAMP (Apache + MySQL)

> WAMP doit être **actif** (icône verte dans la barre des tâches Windows en bas à droite)

Si WAMP est bloqué / ne répond plus :

1. **Tuer le processus manuellement** :
   - `Ctrl+Alt+Suppr` → Gestionnaire des tâches
   - Chercher `wampmanager.exe` → clic droit → **Terminer la tâche**
   - Chercher aussi `httpd.exe` et `mysqld.exe` → Terminer la tâche sur les deux
2. **Relancer WAMP** : Double-clic sur l'icône WAMP sur le bureau
3. Attendre que l'icône devienne **verte** (peut prendre 10-20 secondes)

Si WAMP ne démarre pas (icône orange = un service n'a pas démarré) :
- Le port 80 ou 8081 est probablement pris par un autre programme
- Clic droit sur l'icône WAMP → Outils → Tester les ports

### Étape 2 — Lancer le frontend React

```powershell
# Dans le dossier d:\0CODE\AntiGravity\AGheal
npm run dev
```

### Étape 3 — Ouvrir l'application

➡️ **http://localhost:5173** (le frontend React)

> ⚠️ Ne pas aller sur http://localhost:8081 — c'est l'API PHP, elle renvoie du JSON brut.

---

## 📂 Où se trouvent les fichiers ?

| Composant | Emplacement |
|-----------|-------------|
| **Frontend React** | `d:\0CODE\AntiGravity\AGheal\` |
| **Backend PHP (API)** | `C:\wamp64\www\agheal-api\` |
| **Base de données MySQL** | Gérée par WAMP, accessible via phpMyAdmin |
| **Dump SQL** | `d:\0CODE\AntiGravity\AGheal\agheal.sql` |
| **Config frontend** | `d:\0CODE\AntiGravity\AGheal\.env` |
| **Config backend** | `C:\wamp64\www\agheal-api\.env` |

---

## 🔑 Comptes de test

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@agheal-adaptmovement.fr` | `password` | Admin |
| `guillaume@agheal.fr` | `password` | Coach + Adhérent |
| `amandine@adaptmovement.fr` | `password` | Coach + Adhérent |
| `marie.dupont@email.fr` | `password` | Adhérent |
| `jean.michel@email.fr` | `password` | Adhérent |

> **Note :** Les comptes créés via le formulaire d'inscription ont leur propre mot de passe.

---

## 📁 Structure du projet

```
AGheal/                          ← Frontend React (ce dossier)
├── src/
│   ├── pages/                   ← Les écrans de l'application
│   ├── hooks/useAuth.tsx        ← Gestion connexion/déconnexion
│   ├── integrations/api/client.ts  ← Client HTTP vers l'API PHP
│   └── components/             ← Composants réutilisables (boutons, etc.)
├── .env                         ← URL de l'API PHP (VITE_API_URL)
└── vite.config.ts               ← Config du serveur de dev (port 5173)

C:\wamp64\www\agheal-api\        ← Backend PHP (API REST)
├── public/index.php             ← Point d'entrée unique (routeur)
├── src/Controllers/             ← Logique métier (Auth, Séances, etc.)
├── src/Database.php             ← Connexion MySQL
├── src/Config/database.php      ← Configuration de connexion DB
├── mysql/                       ← Scripts SQL (création, migration)
│   ├── init.sql                 ← Créer les tables
│   └── migrate-from-supabase.sql ← Importer les utilisateurs
└── .env                         ← Config DB (DB_HOST, DB_USER, DB_PASS)
```

---

## 🗄️ Accéder à la base de données

- **phpMyAdmin** : http://localhost:8081/phpmyadmin
  - Identifiants : `root` / `root123`
  - Base : `agheal`
- **Directement depuis WAMP** : clic gauche sur l'icône WAMP → phpMyAdmin

---

## 🛠️ Configuration

### Frontend — `d:\0CODE\AntiGravity\AGheal\.env`
```
VITE_API_URL=http://localhost:8081/agheal-api/public
```

### Backend PHP — `C:\wamp64\www\agheal-api\.env`
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

## 🌐 Déploiement Production (Coolify)

L'application est déployée sur un VPS Hostinger géré par Coolify.

| Composant | URL | Technologie |
|-----------|-----|-------------|
| **Frontend** | [https://agheal.hylst.fr](https://agheal.hylst.fr) | Nixpacks (React/Vite) |
| **API Backend** | [https://api.agheal.hylst.fr](https://api.agheal.hylst.fr) | Docker (PHP 8.1 / Apache) |
| **Base de données** | Réseau interne Coolify | MariaDB |

### Variables d'environnement Production
- **Frontend** : `VITE_API_URL=https://api.agheal.hylst.fr`
- **Backend** : `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (configurés dans Coolify)

---

## 📂 Documentation Technique (`/docs`)

Les documents de référence pour la conception sont :
- [01_MCD_Merise.md](file:///d:/0CODE/AntiGravity/AGheal/docs/01_MCD_Merise.md) : Schéma de données complet.
- [02_UML_Classes.md](file:///d:/0CODE/AntiGravity/AGheal/docs/02_UML_Classes.md) : Modèle objet et logique métier.
- [03_UML_Use_Cases_Activites.md](file:///d:/0CODE/AntiGravity/AGheal/docs/03_UML_Use_Cases_Activites.md) : Processus et cas d'utilisation.

---

*Documentation maintenue par Geoffroy Streit - 2025*
