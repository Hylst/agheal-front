# Conseils de Gestion de la Base de Données AGHeal

> Guide pratique pour sauvegarder, restaurer et maintenir la base de données MySQL du projet AGHeal

---

## Table des matières
1. [Structure des fichiers SQL](#1-structure-des-fichiers-sql)
2. [Reconstruire la BDD from zéro](#2-reconstruire-la-bdd-from-zéro)
3. [Sauvegardes — stratégie recommandée](#3-sauvegardes--stratégie-recommandée)
4. [Export / Import avec HeidiSQL (gratuit)](#4-export--import-avec-heidisql-gratuit)
5. [Export / Import en ligne de commande](#5-export--import-en-ligne-de-commande)
6. [Perte de données : que faire ?](#6-perte-de-données--que-faire-)
7. [Corruption de la base de données](#7-corruption-de-la-base-de-données)
8. [Hébergement de production (agheal.hylst.fr)](#8-hébergement-de-production-aghealhylstfr)

---

## 1. Structure des fichiers SQL

Tous les scripts SQL sont centralisés dans `agheal-api/mysql/`.

| Fichier | Rôle | Quand l'exécuter |
|---|---|---|
| `init.sql` | Crée toutes les tables, vues, index et contraintes | **1er — Installation from scratch** |
| `init_trigger.sql` | Crée le trigger `after_user_insert` (création auto du profil) | **2e — Juste après init.sql** |
| `migrate_attendance.sql` | Ajoute les colonnes attendance (already run on existing DB) | Sur BDD existante avant le seed |
| `seed.sql` *(dans `AGheal/`)* | Insère des données de test réalistes | Après init + trigger, pour tester |

> [!IMPORTANT]
> Le fichier `AGheal/seed.sql` est le **seul fichier de données de test à utiliser**. L'ancien `seed_demo_data.sql` est archivé dans `AGheal/docs/archive/`.

---

## 2. Reconstruire la BDD from zéro

Si on perd tout et doit tout reconstruire (nouveau serveur, crash total) :

```sql
-- Étape 0 : Créer la base
CREATE DATABASE IF NOT EXISTS `agheal`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `agheal`;
```

**Ordre d'exécution dans HeidiSQL :**

1. `agheal-api/mysql/init.sql` → crée le schéma complet
2. `agheal-api/mysql/init_trigger.sql` → crée le trigger de profil auto
3. *(Optionnel)* `AGheal/seed.sql` → injecte des données de test

> [!NOTE]
> `migrate_attendance.sql` est inutile dans ce cas : les colonnes `attended` et `limit_registration_7_days` sont déjà dans `init.sql`.

---

## 3. Sauvegardes — stratégie recommandée

### ✅ Règle d'or : Sauvegarde 3-2-1

| Copie | Où | Fréquence |
|---|---|---|
| 1 sauvegarde locale | Dossier sur PC (ex. `D:\Backups\agheal\`) | Quotidienne |
| 1 sauvegarde distante | Google Drive, OneDrive ou clé USB externe | Hebdomadaire |
| 1 sauvegarde chez l'hébergeur | Panneau d'hébergement | Mensuelle / avant toute mise à jour majeure |

### 📅 Cadence recommandée

- **En développement actif** : avant chaque déploiement en production
- **En production stable** : au minimum 1 fois par semaine
- **Avant toute migration SQL** : export complet + vérification

---

## 4. Export / Import avec HeidiSQL (gratuit)

HeidiSQL est l'outil parfait pour des sauvegardes manuelles.

### Export (sauvegarde)

1. Ouvrir HeidiSQL → connecté à la base `agheal`
2. Clic droit sur `agheal` dans l'arbre de gauche
3. **Exporter la base de données → SQL**
4. Options recommandées :
   - ☑ Inclure `CREATE DATABASE`
   - ☑ Inclure `DROP TABLE IF EXISTS`
   - ☑ Données (INSERT statements)
   - ☑ Utiliser `INSERT IGNORE` ou `REPLACE`
5. Sauvegarder le fichier : `agheal_backup_AAAA-MM-JJ.sql`

### Import (restauration)

1. Ouvrir HeidiSQL → connecté au serveur MySQL
2. Créer la base si elle n'existe pas : `CREATE DATABASE agheal;`
3. Sélectionner la base `agheal`
4. Menu **Fichier → Exécuter un fichier SQL**
5. Sélectionner votre fichier backup `.sql`
6. Exécuter

> [!WARNING]
> Si restauration sur une base existante, les tables seront **supprimées et recréées** si `DROP TABLE IF EXISTS` est activé. Les données en production seront perdues si confusions de serveur.

---

## 5. Export / Import en ligne de commande

Pour utilisateurs avancés ou pour automatiser.

### Export via mysqldump

```bash
# Exporter toute la base (à faire depuis WAMP ou le terminal de l'hébergeur)
mysqldump -u root -p agheal > agheal_backup_2026-03-26.sql

# Exporter seulement le schéma (sans les données)
mysqldump -u root -p --no-data agheal > agheal_schema_only.sql

# Exporter seulement les données (sans le schéma)
mysqldump -u root -p --no-create-info agheal > agheal_data_only.sql
```

### Import via mysql

```bash
# Restaurer une base complète
mysql -u root -p agheal < agheal_backup_2026-03-26.sql
```

### Automatiser avec un script PowerShell (Windows / WAMP)

Création d'un fichier `backup_agheal.ps1` :

```powershell
$date = Get-Date -Format "yyyy-MM-dd"
$backupDir = "D:\Backups\agheal"
New-Item -ItemType Directory -Force $backupDir | Out-Null
& "C:\wamp64\bin\mysql\mysql8.0.xx\bin\mysqldump.exe" `
    -u root agheal > "$backupDir\agheal_$date.sql"
Write-Host "Sauvegarde OK : agheal_$date.sql"
```

*(Adapter le chemin vers `mysqldump.exe` selon la version de WAMP)*

---

## 6. Perte de données : que faire ?

### Scénario 1 : Suppression accidentelle de quelques lignes

Si on a une sauvegarde récente :
1. Identifier les lignes perdues (via les logs ou la mémoire)
2. Ouvrir la sauvegarde et extraire uniquement les INSERT concernés
3. Les réexécuter dans HeidiSQL

### Scénario 2 : Table corrompue ou supprimée

1. Ne pas paniquer et ne pas interagir avec la base
2. Arrêter l'API (pour éviter d'aggraver)
3. Restaurer la dernière sauvegarde complète

### Scénario 3 : Crash total du serveur

1. Réinstaller MariaDB sur serveur
2. Recréer la base : `CREATE DATABASE agheal;`
3. Exécuter `init.sql` → `init_trigger.sql`
4. Restaurer votre backup de données : `agheal_backup_AAAA-MM-JJ.sql`

> [!TIP]
> Les logs MySQL (fichier `mysql_error.log` dans le dossier de données du serveur de base de données) peuvent aider à diagnostiquer la cause d'un crash.

---

## 7. Corruption de la base de données

Signes : requêtes qui plantent, erreurs `Table 'xxx' is marked as crashed`.

### Réparation via MariaDB (MyISAM uniquement)

```sql
REPAIR TABLE nom_de_la_table;
```

### Réparation via ligne de commande

```bash
mysqlcheck -u root -p --repair agheal
```

> [!NOTE]
> AGHeal utilise **InnoDB** (pas MyISAM). InnoDB est plus robuste aux crashs. En cas de corruption InnoDB grave, la restauration depuis sauvegarde est la méthode la plus fiable.

---

## 8. Hébergement de production (agheal.hylst.fr)

### Accès à PhpMyAdmin chez hostinger

1. Connexion au cPanel de l'hébergeur (hostinger)
2. Ouvrir **phpMyAdmin**
3. Sélectionner la base `agheal` 
4. Onglet **Exporter** → format SQL → Télécharger

### Sauvegarde automatique chez hostinger

hostinger propose des **sauvegardes automatiques quotidiennes** conservées 14 jours. Pour les consulter :
- cPanel → **JetBackup** → Bases de données → Sélectionner la date souhaitée

> [!IMPORTANT]
> Même si l'hébergeur fait des backups automatiques, **ne jamais se fier uniquement à eux**. Faire ses propres exports réguliers dans un dossier Git privé ou Google Drive.

### Déployer une mise à jour de schéma en production

1. **Exporter un backup complet** avant toute modification
2. Tester le script SQL en local (base de développement WAMP)
3. Le valider dans HeidiSQL local sans erreurs
4. Le déployer via phpMyAdmin en production
5. Tester l'application immédiatement après

---

*Document créé le 26/03/2026 — Projet AGHeal*
