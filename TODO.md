# Fonctionnalités à venir - AGHeal

**Auteur :** Geoffroy Streit  
**Année :** 2026

Liste des améliorations et fonctionnalités prévues pour les prochaines versions.

---

## ✅ Terminé récemment (Mars 2026 — v1.9.2)

- [x] **Vulnérabilité firebase/php-jwt (CVE-2025-45769)** : Confirmée résolue — v7.0.4 déjà installée. `composer audit` clean.
- [x] **PHPUnit 13 — schema XML** : `phpunit.xml` aligné sur le bon schéma XSD (warning dépréciation éliminé).
- [x] **BaseRepositoryTest** : Classe rendue `abstract` — élimine le warning "No tests found in class".
- [x] **STRUCTURE.md** : Mis à jour avec les 8 classes Repository et le dossier `tests/`.
- [x] **README.md (API)** : Version corrigée, sections Repositories et Tests ajoutées.

## ✅ Terminé précédemment (Mars 2026 — v1.9.1)

- [x] **Refactorisation de l'API (Pattern Repository)** : Centralisation des requêtes SQL des contrôleurs principaux (`Session`, `Registration`, `Profile`, `Attendance`, `Stats`) dans des classes dédiées. Code documenté pour les débutants.
- [x] **Tests Backend** : Initialisation de l'architecture de tests unitaires (PHPUnit).
- [x] **Présences (Appel)** : Interface de pointage pour les coachs lors de la séance, ajout de walk-ins, traçabilité complète.
- [x] **Statistiques & Exports** : Dashboard 6 onglets (KPIs, Séances, Présences, Démographie, Paiements, Logs). Export CSV et JSON.
- [x] **Gestion avancée des Séances** : Fenêtre de réservation J-7, contrôles d'édition contextuels dans le planning public, masquage automatique des séances passées.
- [x] **Paiements** : Suivi des règlements (saisie, historique filtrable, dashboard dédié).
- [x] **Google OAuth 2.0** : Connexion directe avec inscription automatique.
- [x] **Communications** : Campagnes e-mail programmables, messages in-app ciblés, historique.
- [x] **Notifications Web Push** : Configuration granulaire par type d'alerte.
- [x] **Centralisation SQL** : `seed.sql` v2.0 corrigé et centralisé dans `agheal-api/mysql/`. Scripts obsolètes archivés.
- [x] **Bug Stats 403** : Corrigé (`roles` tableau vs `role` string dans le JWT).
- [x] **Badge paiement** : Correction `'regle'` → `'a_jour'` dans `Stats.tsx`.
- [x] **Documentation pédagogique** : `explications_pedagogiques_completes.md` et `conseils_gestion_database.md`.
- [x] **Audits DB** : Scripts SQL synchronisés avec l'API.

---

## 📱 Priorité haute

- [ ] **PWA hors-ligne avancée**
  - Cache local avec Dexie.js pour faire l'appel en zone sans réseau.
  - Synchro bi-directionnelle différée (conflict-resolution).
  - Enrichissement des notifications push (déjà intégrées, à diversifier : rappels ponctuels, annulations).

---

## 📅 Priorité moyenne

- [ ] **Synchronisation calendrier externe (`.ics`)**
  - Export iCal intégrable dynamiquement dans Google Calendar / Outlook.

- [ ] **Vue semaine avec drag & drop (Coach)**
  - Affichage hebdomadaire et déplacement rapide des séances.

- [ ] **Export comptable séparé**
  - Extraction des données financières filtrées par période au format compatible comptable.

---

## 👥 Priorité basse

- [ ] **Paiements en ligne (Stripe)**
  - Module optionnel : paiement CB à l'inscription ou au renouvellement de cotisation. Génération automatique de facture PDF.

- [ ] **Liste d'attente**
  - Pour les séances complètes : inscription en file d'attente + notification automatique si une place se libère.

- [ ] **Évaluation post-séance**
  - Feedback de l'adhérent après la séance (effort perçu, commentaire). Retours agrégés visibles par le coach.

- [ ] **Séances récurrentes**
  - Planification de séances à répétition automatique (hebdo, bimensuel) sans duplication manuelle.

---

*Liste maintenue par Geoffroy Streit - 2026*
