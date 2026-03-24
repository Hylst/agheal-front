# AGHeal - Document de Reprise et d'Architecture

Ce document centralise l'architecture technique, les règles métier et l'état actuel du projet pour permettre une reprise de développement fluide par un nouvel intervenant ou une IA.

## 1. Présentation Générale
**AGHeal** est une plateforme centralisée (Application Web / PWA) de gestion des activités sportives orientées santé et bien-être. Elle remplace les outils disparates (Excel, WhatsApp, e-mails de relance) par un espace sécurisé unifiant adhérents, coachs et administrateurs.

## 2. Architecture Technique
Le projet est séparé en deux blocs distincts (Client / Serveur).

### 2.1 Backend (API REST)
- **Localisation :** Dossier `agheal-api` (`C:\wamp64\www\agheal-api\`)
- **Technologie :** PHP natif (8+), via PDO pour MySQL. Pas de framework lourd.
- **Authentification :** JWT (`Firebase\JWT`).
- **Points Clés :** 
  - Routes sécurisées par token et par rôle d'accès.
  - Requêtes préparées (`Database.php`).
  - Scripts SQL fournis pour initialiser la DB, la peupler (`seed_demo_data.sql`) ou la nettoyer.

### 2.2 Frontend (Application Client PWA)
- **Localisation :** Dossier `AGheal`
- **Technologie :** React 18, TypeScript, Vite.
- **UI / UX :** Tailwind CSS, Shadcn UI, Lucide-React. Design "Premium Dark / Glassmorphism".
- **Points Clés :** 
  - Application PWA (via `vite-plugin-pwa`).
  - Appels de l'API via client dédié gérant le token JWT automatiquement (`@/integrations/api/client.ts`).
  - Interface dynamique gérée par les droits de rôles (menus inaccessibles masqués).

## 3. Modèle de Données et Concepts Métiers
- **Utilisateurs / Clients :** Possèdent un rôle (Admin, Coach, Adhérent). 
- **Séances / Cours :** Liées à une Activité et un Lieu. Capacités min/max.
- **Inscriptions ("Présences") :** Liste d'appel. Gérée en direct par le coach ou l'adhérent s'inscrivant depuis le planning.
- **Communications :** Remplaçant de WhatsApp. Messages In-App (urgents ou non) et campagnes d'e-mails programmées.

## 4. Spécificités des Rôles
- **L'Administrateur :** Hub total. Peut élever les droits d'un adhérent en coach. Modifie la taxonomie globale. Gère la sécurité et les recouvrements.
- **Le Coach :** Organise, crée ses séances récurrentes. Fait l'appel. Peut voir le "Secret Médical" des inscrits (icône 🩺).
- **L'Adhérent :** Réserve via le calendrier (sous 7 jours). Consulte ses rappels et remplit ses indications de santé.

## 5. État des Lieux et Derniers Développements (Mars 2026)
### 🗓️ Gestion des Séances (Dernier module travaillé)
- **Planning Public (`/sessions`)** :
  - **Fenêtre d'inscriptions** : Ouverture des inscriptions à J-7 uniquement, pour éviter les réservations abusives à long terme.
  - **Gestion Rapide** : Les Coachs/Admin disposent de boutons "Modifier" et "Supprimer" directement dans la modale d'aperçu d'une séance sur le calendrier public.
- **Planification (`/coach/sessions`)** : Formulaire puissant de création avec duplication automatisée (1 à 12 semaines).

### 💳 Paiements, Communications & Auth
- **Règlements** : Système complet intégré (saisie des montants, types de paiements, dashboard analytique des revenus).
- **Automatisations** : Envois d'emails à J-7 pour les abonnements, J-30 pour les certificats médicaux, push notifications Web.
- **Authentification** : Connexion Google OAuth 2.0 en un clic (avec inscription automatique associée).

## 6. Prochaines Étapes Suggérées (Roadmap)
1. **Statistiques Avancées** : Ajouter un tableau de bord analytique sur les taux de présence par activité et d'occupation des séances.
2. **PWA et Mode Hors Ligne** : Poursuivre la synchronisation offline renforcée (ex: Dexie.js / localForage) pour permettre aux Coachs de faire l'appel en zone blanche (sans réseau).
3. **Synchronisation Calendriers** : Intégrer un système d'export iCal des séances prévues par les adhérents, synchronisable avec Google Calendar / Outlook.

## 7. Pour démarrer l'environnement 
- Lancer Apache/MySQL via WAMP pour que l'API réponde sur `localhost:8081`. 
- Dans `/AGheal/`, lancer `npm run dev` pour le front sur `localhost:5173`.
- **Attention à l'hydratation des composants** : si un composant UI manque, utiliser la CLI Shadcn (`npx shadcn-ui@latest add [composant]`).
- Les dates sont au cœur de l'app (plannings, anniversaires, certificats), utiliser `date-fns` avec la localisation `fr`.
- **Note PWA :** Les Service Workers mis en cache via `vite-plugin-pwa` peuvent masquer vos derniers changements. Forcer le vidage du cache du navigateur (`Ctrl+F5`) en développement.
