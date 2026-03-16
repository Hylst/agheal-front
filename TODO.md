# Fonctionnalités à venir - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2026

Liste des améliorations et fonctionnalités prévues pour les prochaines versions.

---

## ✅ Récemment accompli (Mars 2026)

- [x] **Authentification Google OAuth 2.0** — Connexion et inscription via Google fonctionnelles (backend PHP + frontend React)
- [x] **Corrections BUG-02 à BUG-13** — Double auth, auto-insert paiements, filtre coaches, alias routes admin, filtre email, fetch() sécurisés

---

## 🔔 Notifications (Priorité haute)

- [x] **Envoi automatique de notifications par email**
  - Rappel la veille des séances inscrites
  - Rappel de renouvellement aux adhérents
  - Notification des nouvelles séances proposées
  - Alerte certificat médical (M-1)
  - Alerte expiration coach (J+1)

- [x] **Notifications Push**
  - Intégration d'un service de notifications push (VAPID / Service Worker)
  - Configuration des préférences utilisateur depuis les paramètres

---

## 📱 Application mobile (Priorité moyenne)

- [ ] **Progressive Web App (PWA)**
  - Installation sur l'écran d'accueil
  - Fonctionnement hors-ligne basique
  - Notifications push natives

---

## 📊 Statistiques et rapports (Priorité moyenne)

- [ ] **Tableau de bord statistiques**
  - Nombre d'inscriptions par séance
  - Taux de participation
  - Évolution des adhérents

- [ ] **Export des données**
  - Export CSV des adhérents
  - Export des historiques de présence
  - Rapports de paiement

---

## 💳 Gestion des paiements (Priorité haute)

- [x] **Système de suivi des règlements**
  - [x] Saisie des règlements (montant, mode, date, coach, commentaires).
  - [x] Dashboard de gestion des paiements filtrable.
  - [x] Evolution mensuelle des encaissements.
- [ ] **Intégration Stripe** (Optionnel / Futur)
  - Paiement en ligne des cotisations
  - Suivi automatique des règlements
  - Factures automatiques

---

## 📅 Améliorations du calendrier (Priorité basse)

- [ ] **Synchronisation calendrier externe**
  - Export iCal
  - Synchronisation Google Calendar
  - Synchronisation Outlook

- [ ] **Vue semaine**
  - Affichage hebdomadaire des séances
  - Glisser-déposer pour déplacer les séances

---

## 👥 Fonctionnalités sociales (Priorité basse)

- [ ] **Messagerie interne**
  - Messages entre coach et adhérent
  - Notifications de message

- [ ] **Commentaires sur les séances**
  - Retours des participants
  - Notes de satisfaction

---

## 🔧 Améliorations techniques

- [ ] **Performance**
  - Mise en cache des données
  - Optimisation des requêtes

- [ ] **Tests automatisés**
  - Tests unitaires
  - Tests d'intégration

- [ ] **Logs avancés**
  - Historique détaillé des actions
  - Interface de consultation des logs pour l'admin

---

## 💡 Suggestions à étudier

- Système de liste d'attente pour séances complètes
- Séances récurrentes automatiques
- Gestion de plusieurs organisations
- Multi-langue (français/anglais)
- **Suivi de progression Adhérent** : historique et bilan personnel des séances (annoncé dans l'InfoModal)

---

## 🛠️ Incohérences à résorber (UI/Front)

- [x] **InfoModal : Onglet manquant** : Le 5ème onglet "Roadmap et nouveautés" a été implémenté et le défilement vertical ajouté pour tous les onglets.

---

## ✅ Terminé récemment

- [x] Audit complet de la base de données et alignement avec l'API PHP (Mars 2026)
- [x] Scripts d'initialisation et de nettoyage (`init.sql`, `init_trigger.sql`, `cleanup.sql`)
- [x] Correction du SSL et des endpoints API sur Coolify
- [x] Page Informations avec contenu éditorial
- [x] Champs de communication modifiables (Admin/Coach)
- [x] Préférences de notifications dans les paramètres
- [x] Masquage du statut règlement pour coachs/admin
- [x] **Gestion de la facturation et historisation** (Mars 2026)
- [x] **Sécurité administrative et Audit Logs** (Mars 2026)
- [x] **Automatisation des rappels par email (J-7)** (Mars 2026)
- [x] Documentation complète (README, ABOUT, CHANGELOG, STRUCTURE)
- [x] **Correction des erreurs 500 (Mismatch arguments API)** (Mars 2026)
- [x] **Script de Seeding de Démo complet** (Lieux, Activités, Planning réel) (Mars 2026)
- [x] **Améliorations Accessibilité (Dialogs)** (Mars 2026)
- [x] **Gestion des certificats médicaux (M-1)** (Mars 2026)
- [x] **Automated payment status expiration (J+1)** (Mars 2026)
- [x] Proprietary Licensing & Copyright (Mars 2026)
- [x] **Notification Push (Web Push)** via VAPID et Service Worker (Mars 2026)
- [x] **Campagnes d'e-mails programmables** avec exécution CRON (Mars 2026)
- [x] **Historique Centralisé des Communications** (Mars 2026)
- [x] Consolidations SQL et fusion au sein de `init.sql` (Mars 2026)

---

*Liste maintenue par Geoffroy Streit - 2025*
