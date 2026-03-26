# Guide d'utilisation - AGHeal

**Auteur :** Geoffroy Streit  
**Version :** 1.9.1 — Mars 2026

Ce guide explique le fonctionnement de l'application AGHeal, destiné aux coachs, administrateurs et adhérents.

---

## 📱 Accéder à l'application

1. Ouvrez votre navigateur (Chrome, Safari, Firefox…)
2. Rendez-vous sur **https://agheal.hylst.fr** (en production) ou **http://localhost:5173** (en local)
3. Connectez-vous avec :
   - **Email + mot de passe**
   - **Compte Google** — connexion en un clic (inscription automatique si premier accès)

### Mot de passe oublié ?
1. Cliquez sur **"Mot de passe oublié ?"** sur la page de connexion
2. Entrez votre email
3. Consultez votre boîte mail → cliquez sur le lien reçu
4. Définissez un nouveau mot de passe

---

## 🏠 Le Tableau de bord (Dashboard)

Après connexion, vous arrivez sur le **Tableau de bord**. Son contenu varie selon votre rôle.

### Tuiles disponibles selon le rôle

| Tuile | Coach/Admin | Adhérent |
|-------|-------------|----------|
| Séances | ✅ | ✅ |
| Mon Profil | ✅ | ✅ |
| Historique | ✅ | ✅ |
| Informations | ✅ | ✅ |
| Planification | ✅ | ❌ |
| Planning Coach | ✅ | ❌ |
| Clients | ✅ | ❌ |
| Activités | ✅ | ❌ |
| Lieux | ✅ | ❌ |
| Groupes | ✅ | ❌ |
| Règlements | ✅ | ❌ |
| Statistiques | ✅ | ❌ |
| Alerte règlement | ✅ (si en attente) | ❌ |

---

## 📅 Gérer les Séances (Coach)

### Créer une séance

1. Cliquez sur **"Planification"** → **"Nouvelle séance"**
2. Remplissez : type d'activité, titre, lieu, date, heure début/fin, capacité min/max
3. **Duplication** : activez l'option pour créer la même séance sur 1 à 12 semaines
4. Cliquez sur **"Créer la séance"**

### Modifier/Supprimer depuis le planning public

Sur la page **Séances** (planning public), en tant que coach, une séance ouverte en modal affiche des boutons **Modifier** et **Supprimer** directement accessibles — sans devoir repasser par le Planning Coach.

### Fenêtre d'inscription J-7

Les adhérents ne peuvent s'inscrire qu'aux séances **dans les 7 prochains jours**. Les séances plus lointaines sont visibles mais en lecture seule. Les séances passées sont **automatiquement masquées** du planning.

---

## ✅ Faire l'appel (Présences)

1. Dans **Planning Coach** ou **Séances**, cliquez sur une séance
2. Ouvrez l'onglet **"Présences"**
3. **Cochez** chaque adhérent présent → l'heure d'arrivée est enregistrée automatiquement
4. **Adhérent de dernière minute (walk-in) ?** → utilisez la barre de recherche "Rechercher un adhérent non-inscrit…" pour l'ajouter directement à la séance
5. Cliquez **"Sauvegarder l'appel"** → un log est créé automatiquement (nom coach, inscrits, présents, walk-ins)

---

## 📊 Statistiques & Historique (Coach / Admin)

Accessible via la tuile **"Statistiques"** sur le tableau de bord.

### Les 6 onglets

| Onglet | Contenu |
|--------|---------|
| **Vue d'ensemble** | KPIs globaux (membres, séances passées, taux présence, total règlements) |
| **Séances** | Historique détaillé. Clic sur une séance → liste des inscrits et présents |
| **Présences** | Taux par type, évolution mensuelle, Top 10 adhérents assidus |
| **Adhérents** | Pyramide des âges, groupes, statuts paiements, validité certificats |
| **Paiements** | CA mensuel, répartition par méthode (espèce/chèque/virement) |
| **Logs** | Liste brute des appels sauvegardés. Téléchargement JSON par log |

### Exporter en CSV

Cliquez sur **"Exporter (CSV)"** → fichier Excel-compatible (UTF-8 avec BOM) avec tout l'historique des séances et présences.

### Télécharger un log JSON

Dans l'onglet **Logs**, cliquez sur l'icône de téléchargement d'une entrée pour obtenir le fichier JSON de cet appel.

---

## 👥 Gérer les Clients (Adhérents)

1. Cliquez sur **"Clients"** dans le tableau de bord
2. Recherchez, filtrez par groupe, triez alphabétiquement

### Ce que vous pouvez modifier dans la fiche client

| Champ | Visible par l'adhérent ? |
|-------|--------------------------|
| Date de renouvellement | ✅ (lecture seule) |
| Statut de règlement | ✅ (lecture seule) |
| Date certificat médical | ✅ (lecture seule) |
| Remarques coach | ❌ privé |
| Groupes | ❌ non affiché |

---

## 💳 Gestion des Règlements (Coach & Admin)

Depuis la tuile **"Règlements"** :

1. **Saisir un paiement** : montant, date, mode (espèces/chèque/virement), coach destinataire, commentaire
2. **Historique** : vue complète avec filtres multicritères
3. **Dashboard** : graphiques d'évolution mensuelle et répartition par mode
4. **Passage "À jour"** : met à jour `payment_status` du client et historise la transaction

> La suppression d'un règlement est réservée aux Administrateurs.

---

## 📍 Gérer les Lieux & Activités

### Créer un lieu
1. Aller dans **"Lieux"** → **"Nouveau lieu"** → remplir le nom, l'adresse, les notes → Enregistrer

### Créer une activité (type de séance)
1. Aller dans **"Activités"** → **"Nouvelle activité"** → nom, description, lieu par défaut → Enregistrer  
2. Ce lieu sera pré-rempli automatiquement lors de la création d'une séance de ce type.

> La suppression d'un lieu ou d'une activité met à `NULL` leur référence dans les séances existantes — l'historique est conservé.

---

## 👨‍👩‍👧‍👦 Gérer les Groupes

1. **Créer un groupe** : "Groupes" → "Nouveau groupe" → nom + description → Enregistrer
2. **Assigner un adhérent** : Ouvrir la fiche client → sélectionner jusqu'à **3 groupes** → Enregistrer

Les groupes permettent de filtrer les clients et de cibler les communications in-app.

---

## 🗣️ Informations & Communications

L'onglet **Informations** donne accès à un panneau central (5 onglets) :

| Onglet | Contenu |
|--------|---------|
| L'Application | Genèse et mission d'AGHeal |
| Guide Adhérent | Comment s'inscrire, consulter le planning |
| Guide Coach/Admin | Comment gérer les séances, clients, stats |
| Roadmap | Fonctionnalités prévues |
| Nouveautés (Coach/Admin) | Communications in-app + e-mails programmables |

### Pour les Coachs/Admin — Créer une communication

- **"Dans l'application"** : message ciblé (tous/groupe/individu). Si "urgent" → affiché en rouge sur le dashboard des destinataires.
- **"E-mails programmables"** : campagne HTML ou texte avec date/heure d'envoi différé.
- **"Historique"** : trace immuable de tous les messages envoyés.

---

## 🔔 Notifications automatiques

| Type | Canal | Déclenchement |
|------|-------|---------------|
| Rappel séance | Email + Push | J-1 avant la séance |
| Rappel certificat | Email + Push | M-1 avant expiration |
| Rappel abonnement | Email + Push | J-7 avant échéance |
| Alerte expiration | Email coach + Push | J+1 après échéance |

**Configurer vos préférences** : icône ⚙️ (Paramètres) → section Notifications → activer/désactiver Email et/ou Push individuellement.

---

## 🔐 Niveaux d'accès

| Rôle | Ce qu'il peut faire |
|------|---------------------|
| **Adhérent** | S'inscrire aux séances, voir son profil, son historique, les informations |
| **Coach** | + Gérer séances, présences, clients, lieux, groupes, paiements, stats |
| **Admin** | + Gérer les rôles, bloquer des comptes, supervision complète |

> Un utilisateur peut avoir plusieurs rôles simultanément (ex : coach + adhérent).

### Données protégées
- Les **remarques coach** ne sont jamais visibles par les adhérents
- Le **statut de règlement** est en lecture seule pour les adhérents
- Un admin ne peut pas **se bloquer lui-même** ni **se retirer ses propres droits**

---

## ❓ Questions fréquentes

**Je ne vois pas une séance dans le planning ?**  
→ La séance est peut-être passée (masquée automatiquement), en brouillon, ou annulée.

**Un adhérent ne peut pas s'inscrire ?**  
→ Vérifier : statut compte (bloqué ?), capacité maximale atteinte ?, séance publiée ?, séance dans les 7 prochains jours ?

**Comment annuler une séance ?**  
→ Modifier la séance → changer le statut en "Annulée".

**Comment voir les séances passées ?**  
→ Page **Historique** (pour l'adhérent) ou onglet **Séances** du dashboard Statistiques (coach/admin).

---

## 📞 Besoin d'aide ?

| Contact | Pour quoi ? |
|---------|-------------|
| **Geoffroy Streit** | Questions techniques / développement |
| **Amandine** — amandine.motsch@agheal.fr | Questions sur les séances |
| **Guillaume** — guillaume.trautmann@agheal.fr | Questions sur les séances |

---

*Guide rédigé par Geoffroy Streit — Mars 2026*
