# Document de Reprise - Projet AGHeal

## 1. Présentation Générale
**AGHeal** est une plateforme centralisée (Application Web / PWA) destinée à la gestion des activités sportives orientées santé et bien-être. Elle vise à remplacer les outils disparates (fichiers Excel, groupes WhatsApp, e-mails de relance) en offrant un espace sécurisé et unifié pour les adhérents, les coachs et les administrateurs.

## 2. Architecture Technique
Le projet est séparé en deux blocs distincts afin d'assurer l'indépendance du client et du serveur.

### 2.1 Backend (API REST)
- **Localisation :** Dépôt / Dossier `agheal-api`
- **Technologie :** PHP natif (8+), utilisant PDO pour les requêtes à la base de données (sans framework MVC lourd).
- **Base de données :** MySQL / MariaDB.
- **Authentification :** JWT (JSON Web Tokens via la librairie `Firebase\JWT`).
- **Fonctionnalités & Structure :**
  - **Points d'entrée (Endpoints) :** Les routes ciblent les contrôleurs (ex: `ClientController.php`, `SessionController.php`, `CommunicationController.php`).
  - **Sécurité :** Les routes vérifient le token de l'utilisateur et son rôle (Admin, Coach, Adhérent) pour bloquer ou non l'accès aux données.
  - **Migrations & Seeds :** Présence de fichiers `init.sql`, `migration_communications.sql`, `seed_demo_data.sql` pour rapidement instancier la base.

### 2.2 Frontend (Application Client PWA)
- **Localisation :** Dépôt / Dossier `AGheal`
- **Technologie :** React 18, TypeScript, Vite.
- **UI / UX :** Tailwind CSS, composants Shadcn UI, icônes Lucide-React.
- **PWA (Progressive Web App) :** Utilisation de `vite-plugin-pwa` pour permettre l'installation hors-ligne sur terminaux mobiles et ordinateurs.
- **Fonctionnalités clés :**
  - Tableaux de bord (Dashboards) dynamiques et personnalisés selon le rôle détecté.
  - Planning visuel interactif.
  - Formulaires avancés et modales détaillées (ex: Modale "À propos" avec contenus conditionnels selon droits).
  - Gestion des requêtes via un client API dédié (`@/integrations/api/client.ts`) gérant le token JWT.

## 3. Le Modèle de Données (Concepts Métiers)
- **Utilisateurs / Clients :** Possèdent obligatoirement un rôle (`admin`, `coach`, `adherent`). Ils gèrent leur profil, coordonnées, et informations de santé confidentielles.
- **Séances / Cours :** Liées à un type d'activité (Yoga, Musculation, etc.) défini par l'administrateur, et rattachées à un _Lieu_. Elles embarquent des limites de jauges (strictes bloquantes, ou indicatives) et préviennent du matériel nécessaire.
- **Inscriptions / Présences :** Connexion Client-Séance. Le coach peut utiliser l'interface en direct durant son cours pour acter ("pointer") des présences des inscrits sur la feuille d'appel générée.
- **Communications :** Remplacent WhatsApp. Elles peuvent cibler l'intégralité du fichier client "Global", un "Groupe" précis, ou un "Specific" client. Les communications possèdent un booléen `is_urgent` qui conditionne un affichage critique (bannière rouge).

## 4. Spécificités des Rôles

### L'Administrateur
- Hub de "Tour de Contrôle". Un Admin peut tout faire, sans blocage.
- Capacité unique d'élever les privilèges d'un profil Adhérent en Coach ou en Admin, d'un simple clic (sans possibilité heureusement de s'auto-rétrograder par erreur).
- Gestion de trésorerie (Abonnements / Facturation) : l'admin applique un état "en défaut" de paiement aux adhérents pour les alerter avec bienveillance sur leur tableau de bord.
- Détermine la taxonomie principale (Lieux de cours, couleurs des Types de sports au calendrier).

### Le Coach
- Ses droits lui permettent avant tout d'organiser (séances récurrentes) et de diriger les cours.
- Accès souverain (secret médical) aux alertes Santé des inscrits modélisées par une icône stéthoscope (🩺). Utile pour vérifier blessures et certificats expirés.
- Canal de communication privilégié via le système de messages internes à destination de ses élèves.

### L'Adhérent
- Inscription facile depuis le calendrier.
- Renseigne discrètement ou non ses contraintes de santé via un module spécial (vu que par les profs).
- Destinataire (Dashboard et notifications/mailings) d'informations globales du club, ou privées.

## 5. État des Lieux et Derniers Développements (Mars 2026)
- **Communications :** Refonte massive achevée, permettant les envois ciblés, multi-groupes, et résolvant des bugs de parsing JSON liés à `is_urgent` côté PHP (`CommunicationController.php`).
- **Interfaces :** Les descriptions applicatives, textes d'aide, tutoriels intégrés dans les modales (`InfoModal.tsx`) ont été étérés au maximum pour expliciter précisément comment utiliser les outils afin de bannir le duo Mail/WhatsApp.
- La sécurité côté front inclut le fait de ne jamais exposer les menus inaccessibles dans le DOM ni dans la sidebar pour l'adhérent.

## 6. Pour préparer et poursuivre le Développement

### Démarrage de l'API (Backend)
1. Créer une base de données MySQL vide.
2. Importer `mysql/init.sql` puis, dans l'ordre, les migrations additionnelles (`migration_communications.sql`, etc.).
3. Jouer le `seed_demo_data.sql` pour disposer d'utilisateurs de test.
4. Dans vos fichiers de connexion PDO ou dans le `.env` de l'API (s'il l'est configuré), ciblez vos credentials MySQL, et assurez-vous de configurer un `JWT_SECRET`.
5. Exécutez votre serveur local PHP configuré pour servir `agheal-api`.

### Démarrage du Client (Frontend)
1. Se positionner dans le dossier `AGheal`.
2. Lancer `npm install` (ou vos commandes Vite habituelles).
3. Assurez-vous d'avoir un `.env.local` pour cibler vers le chemin local de votre API fraîchement servie :
   ```env
   VITE_API_URL="http://localhost/path/to/agheal-api/api"
   ```
4. Lancez `npm run dev`.

### Points de vigilance (Handover)
- **Le JWT :** Tout appel backend doit impérativement passer par le client api front (`useAuth` / `api.ts`), sans quoi vous récolterez des 401.
- **L'Hydratation TSX :** Les composants UI sont pour la plupart issus de la bibliothèque Shadcn, si un composant manque, utilisez la CLI shadcn pour l'ajouter (`npx shadcn-ui@latest add [nom]`).
- **Dates :** AGheal brasse beaucoup de dates (plannings, anniversaires, certificats), privilégiez les utilitaires `date-fns` intégrés.
- **Vigilance PWA :** Les Service Workers mis en cache via VitePWA peuvent parfois masquer vos derniers changements, n'hésitez pas à lancer vos devs en fenêtre de navigation privée ou forcer le reset du cache navigateur.
