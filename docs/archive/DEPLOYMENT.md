# Guide de Déploiement AGHeal sur Docker/Coolify

Ce guide détaille comment déployer l'application AGHeal sur un VPS avec Docker et Coolify.

**Auteur :** Geoffroy Streit  
**Date :** 2025

---

## Table des matières

1. [Prérequis](#prérequis)
2. [Architecture de l'application](#architecture-de-lapplication)
3. [Préparation du serveur](#préparation-du-serveur)
4. [Configuration de Supabase](#configuration-de-supabase)
5. [Déploiement avec Coolify](#déploiement-avec-coolify)
6. [Configuration des emails](#configuration-des-emails)
7. [Authentification Google OAuth](#authentification-google-oauth)
8. [Réinitialisation de mot de passe](#réinitialisation-de-mot-de-passe)
9. [Sécurité](#sécurité)
10. [Migration des données](#migration-des-données)
11. [Cron Jobs pour les rappels](#cron-jobs-pour-les-rappels)
12. [Dépannage](#dépannage)

---

## Prérequis

### Serveur VPS
- Ubuntu 22.04 LTS ou supérieur
- Minimum 2 Go RAM, 2 vCPU
- 20 Go de stockage SSD
- Accès root ou sudo

### Logiciels requis
- Docker et Docker Compose
- Coolify installé (ou installation manuelle)
- Git
- Node.js 18+ (pour le build local si nécessaire)

### Services externes
- Compte [Supabase](https://supabase.com) (gratuit ou payant)
- Compte [Resend](https://resend.com) pour l'envoi d'emails
- (Optionnel) Compte Google Cloud pour OAuth
- Nom de domaine avec accès DNS

---

## Architecture de l'application

```
┌─────────────────────────────────────────────────────────────┐
│                        Utilisateur                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Votre domaine (HTTPS)                    │
│                    ex: app.agheal.fr                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Coolify / Docker                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Container Frontend (React)             │    │
│  │              Port 80/443 → Nginx                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Cloud                            │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│  │   PostgreSQL  │ │     Auth      │ │ Edge Functions│      │
│  │   (Database)  │ │   (Connexion) │ │    (Emails)   │      │
│  └───────────────┘ └───────────────┘ └───────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Préparation du serveur

### 1. Installer Docker

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Vérifier l'installation
docker --version
```

### 2. Installer Coolify

```bash
# Installation automatique de Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Accéder à Coolify via https://votre-ip:8000
```

---

## Configuration de Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **Anon Key** : Clé publique pour le frontend
   - **Service Role Key** : Clé privée pour les Edge Functions

### 2. Importer le schéma de base de données

Exécuter le SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'adherent');

-- Table des profils
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  age INTEGER,
  remarks_health TEXT,
  additional_info TEXT,
  coach_remarks TEXT,
  avatar_base64 TEXT,
  organization TEXT,
  payment_status TEXT DEFAULT 'en_attente',
  renewal_date DATE,
  statut_compte TEXT DEFAULT 'actif',
  notify_session_reminder_email BOOLEAN DEFAULT true,
  notify_session_reminder_push BOOLEAN DEFAULT false,
  notify_new_sessions_email BOOLEAN DEFAULT true,
  notify_new_sessions_push BOOLEAN DEFAULT false,
  notify_scheduled_sessions_email BOOLEAN DEFAULT true,
  notify_scheduled_sessions_push BOOLEAN DEFAULT false,
  notify_renewal_reminder_email BOOLEAN DEFAULT true,
  notify_renewal_reminder_push BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des rôles utilisateur
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Table des types de séances
CREATE TABLE public.session_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  default_location_id BIGINT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des lieux
CREATE TABLE public.locations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des séances
CREATE TABLE public.sessions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type_id BIGINT REFERENCES public.session_types(id),
  location_id BIGINT REFERENCES public.locations(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  min_people INTEGER DEFAULT 1,
  max_people INTEGER DEFAULT 20,
  equipment_location TEXT,
  equipment_coach TEXT,
  equipment_clients TEXT,
  status TEXT DEFAULT 'published',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des inscriptions
CREATE TABLE public.registrations (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Table des groupes
CREATE TABLE public.groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  details TEXT,
  remarks TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des assignations utilisateur-groupe
CREATE TABLE public.user_groups (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Table des informations de l'application
CREATE TABLE public.app_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  informations_complementaires TEXT,
  precisions TEXT,
  communication_speciale TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des logs
CREATE TABLE public.logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fonction pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger pour créer le profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'adherent');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Insérer une ligne par défaut dans app_info
INSERT INTO public.app_info (id) VALUES (1) ON CONFLICT DO NOTHING;
```

### 3. Configurer les politiques RLS

Consulter le fichier `supabase/migrations/` pour les politiques RLS détaillées.

---

## Déploiement avec Coolify

### 1. Créer le Dockerfile

Créer un fichier `Dockerfile` à la racine du projet :

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variables d'environnement pour le build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Créer la configuration Nginx

Créer un fichier `nginx.conf` :

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        # Compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing - toutes les routes vers index.html
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### 3. Configurer dans Coolify

1. Créer un nouveau projet dans Coolify
2. Ajouter une nouvelle ressource → Docker
3. Connecter votre dépôt Git
4. Configurer les variables d'environnement :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJ...
```

5. Configurer le domaine et SSL (Let's Encrypt)

---

## Configuration des emails

### 1. Créer un compte Resend

1. Aller sur [resend.com](https://resend.com)
2. S'inscrire gratuitement (100 emails/jour)
3. Créer une API Key

### 2. Configurer le domaine d'envoi

Pour envoyer depuis votre propre domaine (ex: `noreply@agheal.fr`) :

1. Dans Resend → Domains → Add Domain
2. Ajouter les enregistrements DNS suivants :

```
Type    Nom                      Valeur
SPF     @                        v=spf1 include:_spf.resend.com ~all
DKIM    resend._domainkey        (valeur fournie par Resend)
DMARC   _dmarc                   v=DMARC1; p=none;
```

3. Attendre la validation (quelques minutes à quelques heures)

### 3. Configurer le secret dans Supabase

Dans Supabase Dashboard → Settings → Secrets :

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## Authentification Google OAuth

### 1. Créer un projet Google Cloud

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer l'API Google+ et Google Identity

### 2. Configurer OAuth

1. APIs & Services → Credentials
2. Create Credentials → OAuth Client ID
3. Type : Application Web
4. Origines JavaScript autorisées :
   ```
   https://votre-domaine.fr
   https://votre-projet.supabase.co
   ```
5. URI de redirection autorisés :
   ```
   https://votre-projet.supabase.co/auth/v1/callback
   ```

### 3. Configurer dans Supabase

1. Authentication → Providers → Google
2. Activer Google
3. Entrer le Client ID et Client Secret
4. Configurer l'URL de redirection :
   ```
   https://votre-domaine.fr
   ```

---

## Réinitialisation de mot de passe

### 1. Configurer les templates d'email

Dans Supabase → Authentication → Email Templates :

**Reset Password :**
```html
<h2>Réinitialisation de mot de passe AGHeal</h2>
<p>Bonjour,</p>
<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
<p>Ce lien expire dans 24 heures.</p>
<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
<p>L'équipe AGHeal</p>
```

### 2. Configurer l'URL de redirection

Dans Supabase → Authentication → URL Configuration :

- Site URL : `https://votre-domaine.fr`
- Redirect URLs : `https://votre-domaine.fr/reset-password`

### 3. Implémenter la page de réinitialisation

L'application doit avoir une route `/reset-password` qui :
1. Récupère le token de l'URL
2. Permet à l'utilisateur de définir un nouveau mot de passe
3. Utilise `supabase.auth.updateUser({ password })` pour mettre à jour

---

## Sécurité

### 1. Variables d'environnement

**Ne JAMAIS** exposer ces clés côté client :
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

Ces clés doivent uniquement être utilisées dans les Edge Functions.

### 2. Headers de sécurité

Ajouter dans Nginx ou Coolify :

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
```

### 3. Rate Limiting

Configurer dans Supabase → Auth → Rate Limits :
- Maximum sign-ups per hour : 50
- Maximum sign-ins per hour : 100

### 4. Politiques RLS

Vérifier que TOUTES les tables ont des politiques RLS appropriées.

---

## Migration des données

### 1. Exporter depuis Lovable Cloud

```bash
# Via l'API Supabase ou l'interface Supabase
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### 2. Importer vers le nouveau projet

```bash
psql -h db.nouveau-projet.supabase.co -U postgres -d postgres < backup.sql
```

### 3. Vérifier les données

```sql
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM registrations;
```

---

## Cron Jobs pour les rappels

### 1. Activer pg_cron dans Supabase

Dans SQL Editor :

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Configurer le job de rappel

```sql
SELECT cron.schedule(
  'session-reminders-7am',
  '0 7 * * *',  -- Tous les jours à 7h00
  $$
  SELECT net.http_post(
    url := 'https://votre-projet.supabase.co/functions/v1/send-session-reminders',
    headers := '{"Authorization": "Bearer VOTRE_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

### 3. Vérifier les jobs

```sql
SELECT * FROM cron.job;
```

---

## Dépannage

### Problèmes courants

**Les emails ne partent pas :**
1. Vérifier la clé RESEND_API_KEY
2. Vérifier que le domaine est validé dans Resend
3. Consulter les logs des Edge Functions dans Supabase

**Erreur d'authentification :**
1. Vérifier les URLs de redirection
2. Vérifier les clés Supabase
3. Consulter les logs Auth dans Supabase

**La page reste blanche :**
1. Vérifier les variables d'environnement
2. Inspecter la console navigateur
3. Vérifier les logs Docker/Coolify

### Commandes utiles

```bash
# Voir les logs du container
docker logs -f nom-container

# Reconstruire l'image
docker build -t agheal .

# Redémarrer le container
docker restart nom-container

# Vérifier l'état
docker ps
```

---

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Resend](https://resend.com/docs)
- [Documentation Coolify](https://coolify.io/docs)
- [Documentation Docker](https://docs.docker.com)

---

*Guide rédigé par Geoffroy Streit - 2025*
