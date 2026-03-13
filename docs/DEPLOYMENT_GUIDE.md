# 🚀 Guide de Déploiement AGHeal sur VPS (Coolify + Hostinger)

Ce guide t'accompagne pas-à-pas pour déployer ton application complète (Frontend React, Backend PHP et Base de Données MariaDB) sur ton VPS Hostinger via Coolify.

---

## Étape 1 : Préparation des Sous-Domaines (Hostinger)

Puisque tu as le domaine `hylst.fr`, le plus propre est de séparer le front et le back sur deux sous-domaines.

1. Connecte-toi à ton espace **Hostinger** (gestion des domaines / DNS).
2. Crée **deux enregistrements A** qui pointent vers l'adresse IP de ton VPS (31.97.116.175) :
   *   **Nom :** `agheal` (ce qui donnera `agheal.hylst.fr` pour ton frontend)
   *   **Nom :** `api.agheal` (ce qui donnera `api.agheal.hylst.fr` pour ton backend PHP)

---

## Étape 2 : Migration de la Base de Données vers Coolify

D'après ta capture, tu as déjà un conteneur MariaDB actif (`mariadb-database-ogg4kwwcwcco04okwsw0oog8`) sur le port 3306. 

**Pour importer ton fichier local `agheal.sql` :**

### Option A : Depuis l'interface Coolify (Le plus simple)
1. Va dans ton projet Coolify > Sélectionne ta MariaDB.
2. Va dans l'onglet **Terminal**.
3. **TRÈS IMPORTANT :** Tu arrives sur un terminal "Linux" (le shell). Tu ne dois **pas** coller ton code SQL tout de suite.
4. Dans certains conteneurs récents, la commande est `mariadb` au lieu de `mysql`. Essaie d'abord :
   `mariadb -u mariadb -p default`
5. Si ça ne marche pas, essaie :
   `mysql -u mariadb -p default`
6. Tape le mot de passe quand il est demandé (celui que tu as copié dans l'URL interne).
7. Une fois que tu vois `MariaDB [default]>`, tu es dans le bon programme. **C'est seulement à ce moment-là** que tu peux coller le contenu de ton fichier `agheal.sql`.
8. Tape `exit` pour sortir quand c'est fini.

### Option B : Via DBeaver ou HeidiSQL (Plus visuel)
1. Dans Coolify (Database > Configuration), coche la case **"Make it publicly available"** (Port 3306) et sauvegarde.
2. Ouvre DBeaver/HeidiSQL sur ton PC.
3. IP : `31.97.116.175`, Port : `3306`, User : `mariadb`, Serveur : `default`, Mot de passe : (celui de Coolify).
4. Connecte-toi, fais un clic droit sur la base `default` > Importer un script SQL > Choisis `agheal.sql`.
5. **IMPORTANT :** Une fois fini, retourne dans Coolify et décoche "Make it publicly available" pour sécuriser la base.

---

## Étape 3 : Déploiement du Backend (API PHP)

1.  **Prépare ton code local :** Ton fichier `Dockerfile` (à la racine de `agheal-api`) doit maintenant ressembler à ceci pour éviter les erreurs de déploiement :

```dockerfile
FROM php:8.1-apache
RUN a2enmod rewrite
RUN apt-get update && apt-get install -y git unzip libzip-dev && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql zip
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
COPY . /var/www/html/
RUN composer install --no-dev --optimize-autoloader
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80
```

2.  **Mise à jour GitHub :**
    *   Exécute ces commandes : `git add Dockerfile`, `git commit -m "Fix: Add system dependencies"`, `git push`.

3.  **Dans Coolify :**
    *   **Écran Initial** : Entre l'URL de ton repo, choisis la branche `main` et le Build Pack **Dockerfile**. Clique sur **Continue**.
    *   **Configuration (Page suivante)** :
        *   **Domains** : Écris `https://api.agheal.hylst.fr` (et clique sur *Save* en haut à droite !).
        *   **Environment Variables** : Clique sur l'onglet à gauche et ajoute ces variables :
            *   `DB_HOST` : C'est le **Internal Nom** du conteneur MariaDB (ex: `mariadb-database-ogg4...`). Tu le trouves dans Coolify > Database > MariaDB > en haut de la page.
            *   `DB_PORT` : `3306`
            *   `DB_NAME` : `default` (ou le nom que tu as donné à ta base).
            *   `DB_USER` : `mariadb`
            *   `DB_PASSWORD` : Celle trouvée dans l'URL interne de ta base dans Coolify.
            *   `JWT_SECRET` : Une phrase secrète très longue.
            *   `FRONTEND_URL` : `https://agheal.hylst.fr`
    *   Clique sur **Deploy**.

---

## Étape 4 : Déploiement du Frontend (React + Vite)

Le frontend est très facile à déployer grâce à Nixpacks intégré à Coolify.

1. **Prépare ton code local :**
   *   Vérifie que tu as poussé ton dossier `AGheal` (qui contient le `package.json` et le dossier `src`) sur GitHub.
2. **Dans Coolify :**
   *   Projects > Ajoute une nouvelle ressource depuis GitHub.
   *   Sélectionne le dépôt du Frontend.
   *   **Build Pack** : Choisis **Nixpacks**.
   *   **Domains** : Écris `https://agheal.hylst.fr`
   *   **Build Command** : `npm run build`
   *   **Publish Directory** : `dist`
   *   **Environment Variables** :
       *   Ajoute la variable `VITE_API_URL` avec la valeur `https://api.agheal.hylst.fr` (⚠️ attention, sans `/public` à la fin cette fois-ci, car notre Dockerfile Backend route déjà le serveur directement sur le dossier public ! C'est la beauté de Docker).
   *   Clique sur **Deploy**.

---

## Résumé de vérification

Une fois les deux déploiements terminés et les DNS propagés :
1. Tu pourras aller sur `https://agheal.hylst.fr`.
2. Le frontend appellera `https://api.agheal.hylst.fr/` (qui pointera vers le routeur `index.php` de ton backend).
3. Le backend PHP discutera en privé avec le conteneur `mariadb-database-ogg4kwwcwcco04okwsw0oog8` sans passer par internet.
4. Tes certificats SSL/HTTPS seront générés automatiquement et gratuitement par Coolify (via Traefik/Let's Encrypt).


---------

Ce guide résume comment mettre à jour l'application et gérer l'infrastructure sur Coolify.

## 🔄 Mettre à jour le code

### 1. Frontend (React)
- Fais tes modifications en local dans `d:\0CODE\AntiGravity\AGheal`.
- Pousse sur GitHub : `git add .`, `git commit`, `git push`.
- Coolify détectera le push et relancera automatiquement un build **Nixpacks**.

### 2. Backend (API PHP)
- Modifie le code dans `D:\0CODE\AntiGravity\agheal-api`.
- Pousse sur GitHub : `git add .`, `git commit`, `git push`.
- Coolify reconstruira l'image **Docker**.

---

## 🔐 Gestion des Certificats SSL (HTTPS)

Si le site affiche "Non sécurisé" malgré l'adresse en `https` :
1. Va dans ton projet Coolify > Sélectionne l'application (Frontend ou Backend).
2. Va dans l'onglet **General**.
3. Vérifie que le champ **Domains** contient bien `https://...`.
4. Si besoin, va dans les paramètres (roue crantée) et cherche l'option **"Force HTTPS"** ou **"Generate SSL Certificate"**.
5. Attends 2-3 minutes que Let's Encrypt valide le domaine.

---

## 🗄️ Base de Données (MariaDB)

La base est isolée. Pour y accéder :
- **Interne** : Utilise le nom d'hôte interne (ex: `ogg4kwwcwcco...`) pour les variables `DB_HOST` du backend.
- **Externe** : Si tu as besoin d'utiliser DBeaver, coche temporairement "Make it publicly available" dans la config MariaDB sur Coolify.

---

## 📁 Liens Utiles
- Frontend : [https://agheal.hylst.fr](https://agheal.hylst.fr)
- Backend API : [https://api.agheal.hylst.fr](https://api.agheal.hylst.fr)
- Coolify : [https://31.97.116.175:8000](https://31.97.116.175:8000) (ou ton URL de gestion)

---

## 📚 Mémorial : Procédures Historiques de Premier Déploiement

*Cette section est conservée à titre de référence au cas où tu aurais besoin de déployer une autre application similaire depuis zéro.*

### 1. Backend PHP (API) - Création de l'image Docker

Pour packager un backend PHP (Apache) de manière sécurisée et autonome, nous avons créé un `Dockerfile` :

```dockerfile
FROM php:8.1-apache
RUN a2enmod rewrite
# Installation des dépendances système (git, zip)
RUN apt-get update && apt-get install -y git unzip libzip-dev && rm -rf /var/lib/apt/lists/*
# Extensions PHP (PDO MySQL pour MariaDB)
RUN docker-php-ext-install pdo pdo_mysql zip
# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# Config du DocumentRoot
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
# Copie du code et installation des dépendances PHP
COPY . /var/www/html/
RUN composer install --no-dev --optimize-autoloader
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80
```

**Dans Coolify :**
1. Création d'une resource "Docker" pointant sur le repo Git.
2. Build Pack choisi : **Dockerfile**.
3. Ajout des environnements (`DB_HOST`, `JWT_SECRET`, etc.). *Astuce : le `DB_HOST` a été réglé sur le nom du conteneur MariaDB interne (ex: mariadb-database-ogg4...)*.

### 2. Frontend React (Vite) - Déploiement via Nixpacks

Nixpacks est l'outil par défaut de Coolify, idéal pour les projets Node/React car il compile automatiquement le code.

**Dans Coolify :**
1. Création d'une resource pointant sur le repo Git du frontend.
2. Build Pack choisi : **Nixpacks**.
3. Environnements : `VITE_API_URL` pointant vers notre nouveau backend déployé.
4. **Commande de Build** : `npm run build`
5. **Dossier de publication (Publish Directory)** : `dist` (car c'est là que Vite exporte les fichiers statiques HTML/JS).

### 3. Gestion de la Base de Données

Pour isoler la base de données sans l'exposer sur Internet :
1. Déploiement d'un service **MariaDB** depuis les templates One-Click de Coolify.
2. Le port interne (3306) est accessible par le backend via le réseau Docker privé.
3. Pour l'import initial, l'option "Make it publicly available" a été cochée, permettant la connexion via *DBeaver*, puis décochée immédiatement après.
