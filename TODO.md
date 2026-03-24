# Fonctionnalités à venir - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2026

Liste des améliorations et fonctionnalités prévues pour les prochaines versions.

---

## 📱 Application mobile (Priorité haute)

- [ ] **Progressive Web App (PWA) Avancée**
  - Installation sur l'écran d'accueil
  - Fonctionnement hors-ligne étendu via Dexie.js (mise en cache des bases, synchro bi-directionnelle différée) pour faire l'appel en zone sans réseau.
  - Enrichissement des notifications web push natives (déjà intégrées, à diversifier).

---

## 📅 Améliorations du calendrier (Priorité moyenne)

- [ ] **Synchronisation calendrier externe (`.ics`)**
  - Export iCal des séances s'intégrant dynamiquement dans Google Calendar et Outlook pour les adhérents.

- [ ] **Vue semaine pour professionnels**
  - Affichage hebdomadaire des séances (drag & drop) pour déplacer les séances plus rapidement depuis l'interface d'administration.

---

## 📊 Statistiques et rapports (Priorité moyenne)

- [ ] **Tableau de bord de statistiques avancées**
  - Graphiques de taux d'occupation des séances (capacité vs. présence).
  - Évolution mensuelle / annuelle des inscriptions.
  - Statistiques sur l'assiduité d'un groupe ou d'un adhérent.

- [ ] **Exports comptables et d'activité**
  - Export CSV consolidé des adhérents (incluant dates certificats et validité abonnement).
  - Export des données financières (facturation / règlements) au format CSV pour l'expertise-comptable.

---

## 👥 Fonctionnalités supplémentaires (Priorité basse)

- [ ] **Intégration Stripe pour Paiements en Ligne** 
  - Module optionnel de paiement CB pour l'inscription d'un nouvel adhérent ou le renouvellement de cotisation.
  - Génération de factures automatisée.

- [ ] Système de liste d'attente pour séances complètes (déclenchement auto de notifications si place libérée).
- [ ] Commentaire et évaluation de fin de séance (retour sur effort / feedback à destination du coach).
- [ ] Séances récurrentes automatiques (sans devoir utiliser la duplication logicielle à l'avance).

---

## ✅ Historique des réalisations récentes (Mars 2026)

- [x] **Gestion avancée des Séances** : Fenêtre de réservation de 7 jours maximum et contrôles d'édition contextuels pour les coachs dans le calendrier public.
- [x] **Paiements** : Système de suivi des règlements (Dashboard dédié, filtre, Saisie).
- [x] **Authentification Google OAuth 2.0** : Connexion directe avec inscription automatique si inconnu.
- [x] **Sécurité (Bugs 02 à 13)** : Correction des doubles auth, suppression des inserts fantômes, sécurisation JWT des endpoints de calculs.
- [x] **Notifications** : Déploiement du moteur de campagnes et d'e-mails programmables (Push et Mail) pour rappels J-1 de séance, M-1 pour certificats médicaux et alertes de renouvellement.
- [x] **Audits DB** : Consolidation et synchronisation intégrale de l'init DB (`init.sql`, triggers `uuid` / `auto-profiling`).
- [x] InfoModal : Composant didactique mis à jour pour intégrer la Roadmap et expliciter le projet (défilement réparé).

---

*Liste maintenue par Geoffroy Streit - 2026*
