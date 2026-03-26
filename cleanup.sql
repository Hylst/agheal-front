-- cleanup.sql (À EXÉCUTER AVEC L'UTILISATEUR 'root' DANS HEIDISQL)
-- ⚠️ Ce script nettoie complètement la base 'agheal'

USE `agheal`;

SET foreign_key_checks = 0;

-- Suppression de toutes les vues
DROP VIEW IF EXISTS `v_profiles_with_roles`;
DROP VIEW IF EXISTS `v_sessions_full`;

-- Suppression de toutes les tables (13 tables du schéma AGHeal)
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `user_groups`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `session_types`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS `logs`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `app_info`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `users`;

-- Suppression de la fonction et du trigger
DROP FUNCTION IF EXISTS `uuid_v4`;
DROP TRIGGER IF EXISTS `after_user_insert`;

SET foreign_key_checks = 1;

-- ✅ Base nettoyée ! Exécute maintenant init.sql puis init_trigger.sql
