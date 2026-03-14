# Guide d'utilisation - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2025

Ce guide explique en détail le fonctionnement de l'application AGHeal, destiné aux coachs et à l'administrateur.

---

## 📱 Accéder à l'application

1. Ouvrez votre navigateur (Chrome, Safari, Firefox...)
2. Rendez-vous sur l'adresse de l'application
3. Connectez-vous avec :
   - **Email + mot de passe**
   - **Compte Google** (bouton "Continuer avec Google")

### Mot de passe oublié ?

1. Sur la page de connexion, cliquez sur **"Mot de passe oublié ?"**
2. Entrez votre adresse email
3. Consultez votre boîte mail et cliquez sur le lien reçu
4. Définissez un nouveau mot de passe

---

## 🏠 Le Tableau de bord (Dashboard)

Après connexion, vous arrivez sur le **Tableau de bord**. C'est la page centrale de l'application.

### Ce que vous voyez en tant que Coach/Admin :

| Section | Description |
|---------|-------------|
| **Séances** | Voir toutes les séances programmées |
| **Mon Profil** | Modifier vos informations personnelles |
| **Historique** | Voir les séances passées |
| **Planning Coach** | Vue d'ensemble de vos séances |
| **Activités** | Créer et gérer les types d'activités |
| **Planification** | Créer de nouvelles séances |
| **Clients** | Gérer les fiches des adhérents |
| **Lieux** | Gérer les emplacements des séances |
| **Alertes** | Indicateur orange si règlement en attente |
| **Profil** | Consulter ses infos administratives |
| **Informations** | Page d'information publique |

---

## 📅 Créer une séance (Planification)

### Étape par étape :

1. Cliquez sur **"Planification"** dans le tableau de bord
2. Remplissez le formulaire :
   - **Type d'activité** : Choisissez parmi les activités créées
   - **Titre** : Nom de la séance
   - **Description** : Détails (se remplit automatiquement selon l'activité)
   - **Lieu** : Où se déroule la séance
   - **Date** : Jour de la séance
   - **Heure de début et fin**
   - **Nombre de participants** : Minimum et maximum
   - **Équipements** : Ce qu'il faut apporter

3. **Option de duplication** : Dupliquez la séance sur 1 à 12 semaines
4. Cliquez sur **"Créer la séance"**

### 💡 Astuce
Créez d'abord vos **Activités** et **Lieux** pour gagner du temps !

---

## 🏃 Gérer les Activités

Les **Activités** sont des modèles de séances réutilisables.

### Créer une activité :

1. Allez dans **"Activités"**
2. Cliquez sur **"Nouvelle activité"**
3. Remplissez :
   - **Nom** : Ex: "Musculation Santé", "Marche Nordique"
   - **Description** : Explication de l'activité
   - **Lieu par défaut** : Optionnel, sera pré-rempli
4. Enregistrez

---

## 📍 Gérer les Lieux

### Créer un lieu :

1. Allez dans **"Lieux"**
2. Cliquez sur **"Nouveau lieu"**
3. Remplissez le nom, l'adresse et éventuellement des notes
4. Enregistrez

## 🗣️ Informations et Communications

L'onglet **Informations** prend la forme d'un panneau central qui permet de :
1. Lire à propos de la genèse de l'application
2. Accéder aux guides d'utilisation selon les droits (Adhérent, Coach, Admin)
3. Lire les communications :
   - Les coachs et admins peuvent écrire des messages cibles à tous, à un groupe ou un individu spécifiquement.
   - Si la communication est taggée "urgente", elle sera affichée en rouge sur le tableau de bord des destinataires.

---

## 👥 Gérer les Clients (Adhérents)

### Accéder aux fiches clients :

1. Cliquez sur **"Clients"** dans le tableau de bord
2. Vous voyez la liste de tous les adhérents

### Ce que vous pouvez faire :

| Action | Description |
|--------|-------------|
| **Voir le profil** | Cliquez sur un adhérent |
| **Modifier** | Statut règlement, date renouvellement, certificat médical, remarques |
| **Groupes** | Assigner jusqu'à 3 groupes |
| **Bloquer** | L'adhérent ne peut plus s'inscrire |
| **Supprimer** | Action définitive |

### 📝 Remarques Coach
Ce champ est **privé** : l'adhérent ne le voit pas. Utilisez-le pour :
- Précautions à prendre
- Équipements spéciaux
- Rappels personnels

---

### 💳 Gestion des règlements & Abonnements
L'application simplifie le suivi administratif pour les coachs et les adhérents.

| Acteur | Ce qu'il peut voir / faire |
|--------|----------------------------|
| **Adhérent** | Voit son statut (À jour / En attente) et sa date de renouvellement sur son profil. |
| **Coach** | Met à jour le statut et la date de renouvellement. Chaque passage "À jour" est historisé. |
| **Alertes** | Un bandeau orange apparaît sur le Dashboard si un règlement est en attente. |
| **Emails** | Un rappel automatique est envoyé 7 jours avant l'échéance de l'abonnement. |
| **Expiration** | Si la date est dépassée, le statut passe à "En attente" et le coach est alerté par e-mail. |

### 🩺 Certificats Médicaux
Le suivi des certificats est automatisé pour garantir la sécurité des pratiquants :
- **Coach** : Renseigne la date d'expiration dans la fiche client.
- **Adhérent** : Consulte sa date d'échéance directement sur son profil.
- **Rappel** : Un email est envoyé 1 mois avant la date d'expiration à l'adhérent.

### 🔐 Sécurité Administrative
Pour éviter toute erreur critique :
- **Auto-blocage** : Un administrateur ne peut pas se bloquer lui-même ni se retirer son propre rôle d'admin.
- **Confirmation obligatoire** : Toute attribution d'un rôle "Coach" ou "Admin" nécessite une confirmation explicite.
- **Journalisation** : Toutes les modifications de rôles ou de statuts sont enregistrées dans un journal d'audit (logs).

---

## 👨‍👩‍👧‍👦 Gérer les Groupes

### Créer un groupe :

1. Allez dans **"Groupes"**
2. Cliquez sur **"Nouveau groupe"**
3. Donnez un nom et une description
4. Enregistrez

### Assigner un adhérent :

1. Allez dans **"Clients"**
2. Ouvrez la fiche d'un adhérent
3. Sélectionnez jusqu'à 3 groupes
4. Enregistrez

---

## 🔔 Notifications automatiques

### Rappels de séances

Les adhérents reçoivent automatiquement un email la veille de leurs séances inscrites.

### Paramètres (icône ⚙️) :

| Option | Description |
|--------|-------------|
| **Rappel séances** | Email/push la veille des séances |
| **Rappel renouvellement** | Notification automatique aux adhérents pour l'abonnement |
| **Rappel Certificat** | Alerte 1 mois avant l'expiration du certificat médical |
| **Alerte Expiration** | (Coach) Prévenir par mail si un abonnement expire |

---

## ✉️ Formulaire de contact

Sur la page **Informations**, un formulaire de contact permet aux utilisateurs d'envoyer un message aux coachs.

Les messages sont envoyés par email à l'équipe AGHeal.

---

## ℹ️ Page Informations

Cette page présente AGHeal à tous les utilisateurs.

### Pour les Coachs/Admin uniquement :

Vous pouvez modifier 3 champs de communication :

1. **Informations complémentaires** : Infos générales
2. **Précisions** : Détails supplémentaires
3. **Communication spéciale** : Messages urgents ou temporaires

---

## 📊 Fonctionnement des inscriptions

### Comment un adhérent s'inscrit :

1. Connexion à l'application
2. Aller dans **"Séances"**
3. Choisir une séance et cliquer sur **"S'inscrire"**

### Règles automatiques :

| Règle | Effet |
|-------|-------|
| Adhérent bloqué | ❌ Inscription impossible |
| Séance complète | ❌ Plus de places |
| Séance non publiée | ❌ Non visible |

---

## 🔐 Sécurité et accès

### Les 3 niveaux d'accès :

| Rôle | Permissions |
|------|-------------|
| **Adhérent** | S'inscrire aux séances, voir son profil, voir les infos |
| **Coach** | + Gérer séances, clients, groupes, lieux |
| **Admin** | + Gérer les rôles, voir les logs |

### Données protégées :

- Les **remarques coach** ne sont jamais visibles par les adhérents
- Le **statut de règlement** est en lecture seule pour les adhérents
- Chaque utilisateur ne voit que ses propres données personnelles

---

## ❓ Questions fréquentes

### Je ne vois pas un adhérent dans la liste ?
Vérifiez que l'adhérent a bien créé son compte et complété son profil.

### Un adhérent ne peut pas s'inscrire ?
Vérifiez :
1. Son statut de compte (actif ou bloqué ?)
2. La séance est-elle publiée ?
3. La séance est-elle complète ?

### Comment annuler une séance ?
Modifiez la séance et changez son statut en "Annulée".

---

## 📞 Besoin d'aide ?

### Questions techniques
Contactez **Geoffroy Streit** (Auteur de l'application)

### Questions sur les séances
- **Amandine** : amandine.motsch@agheal.fr
- **Guillaume** : guillaume.trautmann@agheal.fr

---

*Guide rédigé par Geoffroy Streit - 2025*
