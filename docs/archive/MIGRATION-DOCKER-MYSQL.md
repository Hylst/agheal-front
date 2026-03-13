# Guide de Déploiement AGHeal sur Docker/Coolify avec MySQL

> **Déploiement containerisé sur VPS Hostinger avec Coolify**  
> Migration complète sans dépendance Supabase  
> Auteur : Geoffroy Streit | 2025

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture cible](#architecture-cible)
3. [Prérequis](#prérequis)
4. [Préparation du VPS](#préparation-du-vps)
5. [Installation de Coolify](#installation-de-coolify)
6. [Configuration des containers](#configuration-des-containers)
7. [Déploiement de l'application](#déploiement-de-lapplication)
8. [Base de données MySQL](#base-de-données-mysql)
9. [Backend API](#backend-api)
10. [Configuration SSL/HTTPS](#configuration-sslhttps)
11. [Variables d'environnement](#variables-denvironnement)
12. [Cron jobs et tâches planifiées](#cron-jobs-et-tâches-planifiées)
13. [Sauvegarde et restauration](#sauvegarde-et-restauration)
14. [Monitoring et logs](#monitoring-et-logs)
15. [Troubleshooting](#troubleshooting)
16. [Checklist de déploiement](#checklist-de-déploiement)

---

## Vue d'ensemble

### Comparaison des architectures

| Aspect | Supabase/Lovable Cloud | Docker/Coolify + MySQL |
|--------|------------------------|------------------------|
| **Base de données** | PostgreSQL managé | MySQL auto-hébergé |
| **Authentification** | Supabase Auth | JWT custom |
| **API** | Auto-générée (PostgREST) | API custom (PHP/Node) |
| **Edge Functions** | Deno/TypeScript | Scripts PHP ou Node.js |
| **Hébergement** | Cloud Supabase | VPS Hostinger |
| **Coût mensuel** | Variable (selon usage) | Fixe (~5-15€/mois) |
| **Contrôle** | Limité | Total |
| **Maintenance** | Minimale | Requise |

### Avantages du Docker/Coolify

- ✅ Contrôle total sur l'infrastructure
- ✅ Coût prévisible et fixe
- ✅ Pas de dépendance à un service tiers
- ✅ Données hébergées en France/Europe
- ✅ Personnalisation complète
- ✅ Scalabilité horizontale possible

### Inconvénients

- ⚠️ Maintenance serveur requise
- ⚠️ Configuration initiale plus complexe
- ⚠️ Sauvegardes à gérer manuellement
- ⚠️ Monitoring à mettre en place

---

## Architecture cible

### Schéma de l'infrastructure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VPS HOSTINGER                                   │
│                        (Ubuntu 22.04 LTS)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        COOLIFY                                   │   │
│  │              (Orchestrateur de containers)                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     TRAEFIK (Reverse Proxy)                      │   │
│  │                 - Routage des requêtes                           │   │
│  │                 - Terminaison SSL/TLS                            │   │
│  │                 - Load balancing                                 │   │
│  └────────────────────────┬────────────────────────────────────────┘   │
│                           │                                             │
│           ┌───────────────┼───────────────┐                            │
│           ▼               ▼               ▼                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │  FRONTEND   │  │   BACKEND   │  │   MYSQL     │                     │
│  │   (NGINX)   │  │  (PHP/Node) │  │    8.0      │                     │
│  │             │  │             │  │             │                     │
│  │  React App  │  │  REST API   │  │  Database   │                     │
│  │  (Build)    │  │  + Auth     │  │  + Data     │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
│    Port 80          Port 8080        Port 3306                         │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    VOLUMES PERSISTANTS                          │   │
│  │  /data/mysql   /data/uploads   /data/backups   /data/logs       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS (443)
                                ▼
                    ┌─────────────────────┐
                    │     INTERNET        │
                    │   agheal.fr         │
                    │   api.agheal.fr     │
                    └─────────────────────┘
```

### Flux de requêtes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUX DE REQUÊTES                                │
└─────────────────────────────────────────────────────────────────────────┘

   Utilisateur
       │
       │ HTTPS
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Traefik    │────▶│   NGINX      │────▶│   React App  │
│   (443)      │     │   (Frontend) │     │   (Static)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       │ api.agheal.fr/*
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Backend    │────▶│   PHP/Node   │────▶│   MySQL      │
│   API        │     │   + JWT      │     │   Database   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Prérequis

### Spécifications VPS recommandées

| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| **RAM** | 2 GB | 4 GB |
| **CPU** | 1 vCPU | 2 vCPU |
| **Stockage** | 20 GB SSD | 40 GB SSD |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Bande passante** | 1 TB/mois | Illimitée |

### Offres Hostinger recommandées

| Plan | Prix/mois | RAM | CPU | Stockage |
|------|-----------|-----|-----|----------|
| **KVM 1** | ~5€ | 4 GB | 2 vCPU | 50 GB |
| **KVM 2** | ~9€ | 8 GB | 4 vCPU | 100 GB |

### Domaine et DNS

Vous aurez besoin de :
- Un nom de domaine (ex: `agheal.fr`)
- Accès aux enregistrements DNS

Enregistrements DNS requis :
```
Type    Nom              Valeur
A       agheal.fr        <IP_VPS>
A       www              <IP_VPS>
A       api              <IP_VPS>
```

---

## Préparation du VPS

### Connexion initiale

```bash
# Connexion SSH au VPS
ssh root@<IP_VPS>

# Ou avec une clé SSH
ssh -i ~/.ssh/id_rsa root@<IP_VPS>
```

### Mise à jour du système

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer les paquets essentiels
apt install -y curl wget git unzip htop

# Configurer le timezone
timedatectl set-timezone Europe/Paris
```

### Configuration du firewall

```bash
# Installer et configurer UFW
apt install -y ufw

# Règles de base
ufw default deny incoming
ufw default allow outgoing

# Autoriser SSH, HTTP et HTTPS
ufw allow ssh
ufw allow http
ufw allow https

# Activer le firewall
ufw enable

# Vérifier le statut
ufw status
```

### Création d'un utilisateur non-root

```bash
# Créer un utilisateur
adduser agheal

# Ajouter aux groupes sudo et docker
usermod -aG sudo agheal

# Se connecter avec le nouvel utilisateur
su - agheal
```

---

## Installation de Coolify

### Installation automatique

```bash
# Script d'installation officiel Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### Vérification de l'installation

```bash
# Vérifier que Docker est installé
docker --version

# Vérifier que Docker Compose est installé
docker compose version

# Vérifier le statut de Coolify
docker ps | grep coolify
```

### Accès à l'interface Coolify

1. Ouvrir `http://<IP_VPS>:8000` dans un navigateur
2. Créer le compte administrateur
3. Configurer les paramètres de base

### Configuration initiale Coolify

1. **Settings > General**
   - Instance URL : `https://coolify.agheal.fr`
   - Timezone : `Europe/Paris`

2. **Settings > Server**
   - Vérifier la connexion au serveur local
   - Configurer les limites de ressources

3. **Settings > Wildcard Domain** (optionnel)
   - Domain : `*.agheal.fr`

---

## Configuration des containers

### Structure des fichiers Docker

```
agheal-docker/
├── docker-compose.yml          # Orchestration des services
├── frontend/
│   ├── Dockerfile              # Build React
│   ├── nginx.conf              # Configuration NGINX
│   └── .env                    # Variables frontend
├── backend/
│   ├── Dockerfile              # Build PHP/Node
│   ├── src/                    # Code source API
│   └── .env                    # Variables backend
├── mysql/
│   ├── init.sql                # Script d'initialisation
│   └── my.cnf                  # Configuration MySQL
└── scripts/
    ├── backup.sh               # Script de sauvegarde
    └── deploy.sh               # Script de déploiement
```

### docker-compose.yml

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ============================================
  # FRONTEND - React App servie par NGINX
  # ============================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: agheal-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.agheal.fr
    depends_on:
      - backend
    networks:
      - agheal-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`agheal.fr`) || Host(`www.agheal.fr`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  # ============================================
  # BACKEND - API PHP
  # ============================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: agheal-backend
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=agheal
      - DB_USER=agheal_user
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - MAIL_HOST=${MAIL_HOST}
      - MAIL_PORT=${MAIL_PORT}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - FRONTEND_URL=https://agheal.fr
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./backend/logs:/var/log/apache2
      - ./data/uploads:/var/www/html/uploads
    networks:
      - agheal-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.agheal.fr`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

  # ============================================
  # MYSQL - Base de données
  # ============================================
  mysql:
    image: mysql:8.0
    container_name: agheal-mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=agheal
      - MYSQL_USER=agheal_user
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
      - ./mysql/my.cnf:/etc/mysql/conf.d/custom.cnf:ro
    ports:
      - "3306:3306"
    networks:
      - agheal-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: --default-authentication-plugin=mysql_native_password

  # ============================================
  # PHPMYADMIN - Administration DB (optionnel)
  # ============================================
  phpmyadmin:
    image: phpmyadmin:latest
    container_name: agheal-phpmyadmin
    restart: unless-stopped
    environment:
      - PMA_HOST=mysql
      - PMA_USER=root
      - PMA_PASSWORD=${MYSQL_ROOT_PASSWORD}
    ports:
      - "8081:80"
    depends_on:
      - mysql
    networks:
      - agheal-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.phpmyadmin.rule=Host(`db.agheal.fr`)"
      - "traefik.http.routers.phpmyadmin.entrypoints=websecure"
      - "traefik.http.routers.phpmyadmin.tls.certresolver=letsencrypt"
      # Authentification basique recommandée
      - "traefik.http.routers.phpmyadmin.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$xyz..."

  # ============================================
  # CRON - Tâches planifiées
  # ============================================
  cron:
    build:
      context: ./backend
      dockerfile: Dockerfile.cron
    container_name: agheal-cron
    restart: unless-stopped
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=agheal
      - DB_USER=agheal_user
      - DB_PASSWORD=${DB_PASSWORD}
      - MAIL_HOST=${MAIL_HOST}
      - MAIL_PORT=${MAIL_PORT}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
    depends_on:
      - mysql
      - backend
    networks:
      - agheal-network

# ============================================
# VOLUMES
# ============================================
volumes:
  mysql_data:
    driver: local

# ============================================
# NETWORKS
# ============================================
networks:
  agheal-network:
    driver: bridge
```

### Dockerfile Frontend

```dockerfile
# frontend/Dockerfile

# ========== STAGE 1: Build ==========
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Variables d'environnement pour le build
ARG VITE_API_URL=https://api.agheal.fr
ENV VITE_API_URL=${VITE_API_URL}

# Build de production
RUN npm run build

# ========== STAGE 2: Production ==========
FROM nginx:alpine

# Copier la configuration NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer NGINX
CMD ["nginx", "-g", "daemon off;"]
```

### Configuration NGINX Frontend

```nginx
# frontend/nginx.conf

server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Désactiver les logs pour les fichiers statiques
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
```

### Dockerfile Backend (PHP)

```dockerfile
# backend/Dockerfile

FROM php:8.2-apache

# Installer les extensions PHP requises
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    cron \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        mysqli \
        gd \
        zip \
    && a2enmod rewrite headers

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copier la configuration PHP
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Copier le code source
WORKDIR /var/www/html
COPY . .

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Exposer le port 80
EXPOSE 80

# Démarrer Apache
CMD ["apache2-foreground"]
```

### Dockerfile Cron

```dockerfile
# backend/Dockerfile.cron

FROM php:8.2-cli

# Installer les extensions PHP requises
RUN apt-get update && apt-get install -y \
    libpng-dev \
    cron \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copier le code source
WORKDIR /app
COPY . .

# Installer les dépendances
RUN composer install --no-dev --optimize-autoloader

# Copier la configuration cron
COPY crontab /etc/cron.d/agheal-cron
RUN chmod 0644 /etc/cron.d/agheal-cron \
    && crontab /etc/cron.d/agheal-cron

# Créer le fichier de log
RUN touch /var/log/cron.log

# Démarrer cron
CMD ["cron", "-f"]
```

### Fichier crontab

```cron
# backend/crontab

# Rappels de séance à 7h00
0 7 * * * cd /app && /usr/local/bin/php cron/send-reminders.php >> /var/log/cron.log 2>&1

# Nettoyage des tokens expirés à minuit
0 0 * * * cd /app && /usr/local/bin/php cron/cleanup-tokens.php >> /var/log/cron.log 2>&1

# Sauvegarde quotidienne à 3h00
0 3 * * * /app/scripts/backup.sh >> /var/log/cron.log 2>&1
```

### Configuration MySQL

```ini
# mysql/my.cnf

[mysqld]
# Charset
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Performance
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2

# Connexions
max_connections = 100
wait_timeout = 600
interactive_timeout = 600

# Logs
slow_query_log = 1
slow_query_log_file = /var/lib/mysql/slow.log
long_query_time = 2

# Sécurité
local_infile = 0

[mysql]
default-character-set = utf8mb4

[client]
default-character-set = utf8mb4
```

---

## Déploiement de l'application

### Option A : Déploiement via Coolify

1. **Créer un nouveau projet dans Coolify**
   - Dashboard > New Project > `AGHeal Production`

2. **Ajouter les sources**
   - Source > GitHub > Connecter le repository
   - Ou : Source > Docker Compose

3. **Configurer les services**
   - Pour chaque service, définir les variables d'environnement
   - Configurer les domaines et certificats SSL

4. **Déployer**
   - Cliquer sur "Deploy"
   - Surveiller les logs de build

### Option B : Déploiement manuel

```bash
# Cloner le repository
cd /opt
git clone https://github.com/votre-repo/agheal-docker.git
cd agheal-docker

# Copier et éditer les variables d'environnement
cp .env.example .env
nano .env

# Construire les images
docker compose build

# Démarrer les services
docker compose up -d

# Vérifier le statut
docker compose ps

# Voir les logs
docker compose logs -f
```

### Variables d'environnement (.env)

```bash
# .env

# ===== DATABASE =====
MYSQL_ROOT_PASSWORD=un_mot_de_passe_tres_securise_pour_root
DB_PASSWORD=un_autre_mot_de_passe_pour_agheal

# ===== JWT =====
JWT_SECRET=cle_secrete_jwt_minimum_32_caracteres_aleatoires

# ===== EMAIL =====
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM_ADDRESS=noreply@agheal.fr
MAIL_FROM_NAME=AGHeal

# ===== GOOGLE OAUTH (optionnel) =====
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://api.agheal.fr/auth/google/callback

# ===== DOMAINES =====
FRONTEND_URL=https://agheal.fr
API_URL=https://api.agheal.fr
```

---

## Base de données MySQL

### Script d'initialisation

Le fichier `mysql/init.sql` contient le schéma complet de la base de données. Voir le fichier `MIGRATION-LOCAL.md` pour le script SQL détaillé.

### Migration des données depuis Supabase

#### Étape 1 : Export depuis Supabase

```bash
# Connexion à la base Supabase (remplacer par vos valeurs)
PGPASSWORD=your_password pg_dump \
  -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f agheal_backup.dump

# Ou export CSV par table
psql -h db.xxxxx.supabase.co -U postgres -d postgres -c "\COPY profiles TO 'profiles.csv' WITH CSV HEADER"
psql -h db.xxxxx.supabase.co -U postgres -d postgres -c "\COPY sessions TO 'sessions.csv' WITH CSV HEADER"
# ... répéter pour chaque table
```

#### Étape 2 : Conversion PostgreSQL → MySQL

Certains types nécessitent une conversion :

```python
# convert_data.py
import csv
import uuid

def convert_boolean(value):
    if value.lower() in ['t', 'true', '1']:
        return '1'
    return '0'

def convert_timestamp(value):
    # PostgreSQL: 2024-01-15 10:30:00+00
    # MySQL: 2024-01-15 10:30:00
    if '+' in value:
        return value.split('+')[0]
    return value

# Exemple de conversion pour profiles.csv
with open('profiles.csv', 'r') as infile, open('profiles_mysql.csv', 'w', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for row in reader:
        row['notify_session_reminder_email'] = convert_boolean(row.get('notify_session_reminder_email', 'true'))
        row['created_at'] = convert_timestamp(row.get('created_at', ''))
        writer.writerow(row)
```

#### Étape 3 : Import dans MySQL

```bash
# Se connecter au container MySQL
docker exec -it agheal-mysql mysql -u root -p agheal

# Importer les données
LOAD DATA LOCAL INFILE '/data/profiles_mysql.csv'
INTO TABLE profiles
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

### Sauvegarde automatique

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_USER="root"
MYSQL_PASSWORD="${MYSQL_ROOT_PASSWORD}"
DATABASE="agheal"

# Créer le répertoire si nécessaire
mkdir -p $BACKUP_DIR

# Dump de la base
docker exec agheal-mysql mysqldump \
  -u $MYSQL_USER \
  -p$MYSQL_PASSWORD \
  --single-transaction \
  --routines \
  --triggers \
  $DATABASE > $BACKUP_DIR/agheal_$DATE.sql

# Compresser
gzip $BACKUP_DIR/agheal_$DATE.sql

# Supprimer les backups de plus de 30 jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: agheal_$DATE.sql.gz"
```

---

## Configuration SSL/HTTPS

### Avec Traefik (intégré à Coolify)

Coolify utilise Traefik pour gérer les certificats SSL automatiquement via Let's Encrypt.

```yaml
# Dans docker-compose.yml, les labels Traefik configurent déjà le SSL
labels:
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

### Configuration manuelle (sans Coolify)

```bash
# Installer Certbot
apt install certbot

# Obtenir les certificats
certbot certonly --standalone -d agheal.fr -d www.agheal.fr -d api.agheal.fr

# Les certificats sont dans /etc/letsencrypt/live/agheal.fr/

# Renouvellement automatique (déjà configuré par Certbot)
certbot renew --dry-run
```

---

## Monitoring et logs

### Accès aux logs

```bash
# Logs de tous les services
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f mysql

# Logs MySQL slow queries
docker exec -it agheal-mysql tail -f /var/lib/mysql/slow.log
```

### Monitoring avec Coolify

Coolify fournit un dashboard de monitoring intégré :
- Utilisation CPU/RAM par container
- Statistiques réseau
- Alertes configurables

### Monitoring externe (optionnel)

```yaml
# Ajouter à docker-compose.yml

services:
  # ... autres services ...

  # Monitoring Prometheus + Grafana
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
```

---

## Troubleshooting

### Problèmes courants

#### Container qui ne démarre pas

```bash
# Vérifier les logs
docker compose logs <service_name>

# Vérifier l'état
docker compose ps

# Reconstruire le container
docker compose build --no-cache <service_name>
docker compose up -d <service_name>
```

#### Erreur de connexion MySQL

```bash
# Vérifier que MySQL est prêt
docker exec -it agheal-mysql mysqladmin ping -h localhost -u root -p

# Vérifier les permissions
docker exec -it agheal-mysql mysql -u root -p -e "SELECT user, host FROM mysql.user;"
```

#### Problèmes CORS

Vérifier que le backend autorise l'origine du frontend :

```php
// Dans le code PHP
header('Access-Control-Allow-Origin: https://agheal.fr');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

#### Certificat SSL invalide

```bash
# Forcer le renouvellement
docker compose down
certbot renew --force-renewal
docker compose up -d
```

### Commandes utiles

```bash
# Redémarrer tous les services
docker compose restart

# Arrêter tous les services
docker compose down

# Supprimer tous les volumes (ATTENTION: supprime les données)
docker compose down -v

# Nettoyer les images non utilisées
docker system prune -a

# Voir l'espace disque utilisé par Docker
docker system df

# Entrer dans un container
docker exec -it agheal-backend /bin/bash
docker exec -it agheal-mysql /bin/bash
```

---

## Checklist de déploiement

### Préparation
- [ ] VPS commandé et accessible
- [ ] Domaine configuré avec DNS pointant vers le VPS
- [ ] Accès SSH fonctionnel

### Installation
- [ ] Système mis à jour
- [ ] Docker et Docker Compose installés
- [ ] Coolify installé et accessible
- [ ] Firewall configuré (UFW)

### Configuration
- [ ] Variables d'environnement définies (.env)
- [ ] Fichiers Docker créés (Dockerfile, docker-compose.yml, nginx.conf)
- [ ] Script d'initialisation MySQL prêt

### Base de données
- [ ] MySQL démarré et accessible
- [ ] Schéma de base de données créé
- [ ] Données migrées depuis Supabase (si applicable)
- [ ] Sauvegardes automatiques configurées

### Application
- [ ] Frontend buildé et déployé
- [ ] Backend API fonctionnel
- [ ] Authentification testée
- [ ] CRUD sur toutes les entités testé

### Production
- [ ] Certificats SSL installés (HTTPS)
- [ ] CORS configuré correctement
- [ ] Cron jobs configurés
- [ ] Monitoring en place
- [ ] Documentation des procédures de maintenance

### Tests finaux
- [ ] Inscription/Connexion utilisateur
- [ ] Création de séance (coach)
- [ ] Inscription à une séance (adhérent)
- [ ] Envoi d'email de contact
- [ ] Réinitialisation de mot de passe
- [ ] Google OAuth (si configuré)

---

## Estimation des coûts

| Service | Coût mensuel |
|---------|--------------|
| VPS Hostinger KVM 1 | ~5€ |
| Domaine .fr | ~10€/an (~1€/mois) |
| Email (Resend free tier) | 0€ |
| **Total** | **~6€/mois** |

Comparé à Supabase Pro (~25$/mois) + hébergement frontend, cette solution représente une économie significative.

---

## Ressources

- [Documentation Coolify](https://coolify.io/docs)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Traefik](https://doc.traefik.io/traefik/)
- [Guide MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/)
- [Hostinger VPS](https://www.hostinger.fr/serveur-vps)

---

*Guide de déploiement AGHeal Docker/Coolify - Geoffroy Streit - 2025*
