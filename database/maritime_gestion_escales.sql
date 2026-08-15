-- ==============================================================================
-- APPLICATION DE GESTION DES ESCALES MARITIMES (PORT CALL MANAGER)
-- Base de Données MySQL / MariaDB (XAMPP / Production)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `maritime_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `maritime_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `daps`;
DROP TABLE IF EXISTS `visites_maritimes`;
DROP TABLE IF EXISTS `navires`;
DROP TABLE IF EXISTS `terminals`;
DROP TABLE IF EXISTS `ports`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Table Users
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'agent_maritime', 'capitainerie') NOT NULL DEFAULT 'agent_maritime',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table Sanctum Personal Access Tokens
CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(191) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `token` VARCHAR(64) NOT NULL UNIQUE,
  `abilities` TEXT NULL,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table Ports
CREATE TABLE `ports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `nom` VARCHAR(191) NOT NULL,
  `pays` VARCHAR(100) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `ports_code_index` (`code`),
  INDEX `ports_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table Terminals
CREATE TABLE `terminals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `port_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `nom` VARCHAR(191) NOT NULL,
  `type_terminal` ENUM('conteneurs', 'vraquier', 'petrolier', 'passagers', 'polyvalent') NOT NULL DEFAULT 'conteneurs',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`port_id`) REFERENCES `ports` (`id`) ON DELETE RESTRICT,
  INDEX `terminals_code_index` (`code`),
  INDEX `terminals_port_id_index` (`port_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table Navires
CREATE TABLE `navires` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `imo` VARCHAR(16) NOT NULL UNIQUE,
  `nom` VARCHAR(191) NOT NULL,
  `pavillon` VARCHAR(100) NOT NULL,
  `type_navire` ENUM('porte_conteneurs', 'petrolier', 'vraquier', 'gazier', 'roulier', 'remorqueur') NOT NULL DEFAULT 'porte_conteneurs',
  `longueur_m` DECIMAL(8,2) NOT NULL,
  `tirant_eau_m` DECIMAL(5,2) NOT NULL,
  `jauge_brute` INT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `navires_imo_index` (`imo`),
  INDEX `navires_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table Visites Maritimes (Escales)
CREATE TABLE `visites_maritimes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero_visite` VARCHAR(64) NOT NULL UNIQUE,
  `navire_id` BIGINT UNSIGNED NOT NULL,
  `terminal_id` BIGINT UNSIGNED NOT NULL,
  `agent_id` BIGINT UNSIGNED NOT NULL,
  `date_arrivee_estimee` DATETIME NOT NULL,
  `date_depart_estimee` DATETIME NOT NULL,
  `date_arrivee_reelle` DATETIME NULL,
  `date_depart_reelle` DATETIME NULL,
  `statut` ENUM('prevue', 'active', 'cloturee', 'annulee') NOT NULL DEFAULT 'prevue',
  `motif_annulation` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`navire_id`) REFERENCES `navires` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`terminal_id`) REFERENCES `terminals` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `visites_numero_visite_index` (`numero_visite`),
  INDEX `visites_statut_index` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table DAP (Demande d'Accès Portuaire)
CREATE TABLE `daps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero_dap` VARCHAR(64) NOT NULL UNIQUE,
  `visite_maritime_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `statut` ENUM('brouillon', 'envoye', 'accepte', 'refuse') NOT NULL DEFAULT 'brouillon',
  `date_demande` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_traitement` DATETIME NULL,
  `remarques` TEXT NULL,
  `motif_refus` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`visite_maritime_id`) REFERENCES `visites_maritimes` (`id`) ON DELETE CASCADE,
  INDEX `daps_numero_dap_index` (`numero_dap`),
  INDEX `daps_statut_index` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table Audit Logs (Traçabilité)
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(64) NOT NULL,
  `entite_type` VARCHAR(64) NOT NULL,
  `entite_id` BIGINT UNSIGNED NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `audit_logs_entite_index` (`entite_type`, `entite_id`),
  INDEX `audit_logs_action_index` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- INSERTION DES DONNÉES DE DÉMONSTRATION
-- ==============================================================================

-- Mot de passe par défaut pour tous les comptes : "password" (Hash bcrypt)
-- $2y$12$4v0eC4e1X9uWfS9E.O6O8.Pj5.5oZpS3C.t9C4P31K5U9Dk2F.Oqu
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`) VALUES
(1, 'Administrateur Général', 'admin@maritime.local', '$2y$12$m1dZ4yqG3iM2vV8e1vU5e.Z6L2bK7zT1hP8rO9sC5aQ4dE7wA0mY2', 'admin', 1),
(2, 'Jean Dupont (Agent Maritime)', 'agent@maritime.local', '$2y$12$m1dZ4yqG3iM2vV8e1vU5e.Z6L2bK7zT1hP8rO9sC5aQ4dE7wA0mY2', 'agent_maritime', 1),
(3, 'Officier Capitainerie', 'capitainerie@maritime.local', '$2y$12$m1dZ4yqG3iM2vV8e1vU5e.Z6L2bK7zT1hP8rO9sC5aQ4dE7wA0mY2', 'capitainerie', 1);

INSERT INTO `ports` (`id`, `code`, `nom`, `pays`, `is_active`) VALUES
(1, 'FRFOS', 'Grand Port Maritime de Marseille-Fos', 'France', 1),
(2, 'MAPTM', 'Port Tanger Med', 'Maroc', 1),
(3, 'NLRTM', 'Port de Rotterdam', 'Pays-Bas', 1),
(4, 'BEANR', 'Port d''Anvers-Bruges', 'Belgique', 1);

INSERT INTO `terminals` (`id`, `port_id`, `code`, `nom`, `type_terminal`, `is_active`) VALUES
(1, 1, 'TERM-FOS-2XL', 'Terminal Conteneurs Fos 2XL', 'conteneurs', 1),
(2, 1, 'TERM-FOS-VRAC', 'Terminal Minéralier Ouest', 'vraquier', 1),
(3, 1, 'TERM-LAVERA-PET', 'Terminal Pétrolier Lavera', 'petrolier', 1),
(4, 2, 'TERM-TC1-TM', 'Terminal Conteneurs 1 Tanger Med', 'conteneurs', 1),
(5, 2, 'TERM-RORO-TM', 'Terminal Passagers & Roulier', 'passagers', 1),
(6, 3, 'TERM-MAAS-GATE', 'Maasvlakte Gateway Terminal', 'conteneurs', 1);

INSERT INTO `navires` (`id`, `imo`, `nom`, `pavillon`, `type_navire`, `longueur_m`, `tirant_eau_m`, `jauge_brute`, `is_active`) VALUES
(1, '9893890', 'EVER APEX', 'Panama', 'porte_conteneurs', 400.00, 16.00, 235579, 1),
(2, '9839179', 'CMA CGM JACQUES SAADÉ', 'France', 'porte_conteneurs', 400.00, 15.60, 236583, 1),
(3, '9784321', 'PACIFIC ENTERPRISE', 'Liberia', 'petrolier', 333.00, 21.50, 162000, 1),
(4, '9654123', 'NORDIC VALIANT', 'Îles Marshall', 'vraquier', 292.00, 18.20, 93000, 1),
(5, '9819686', 'GASLOG WARSAW', 'Bermudes', 'gazier', 293.00, 11.80, 115000, 1);

INSERT INTO `visites_maritimes` (`id`, `numero_visite`, `navire_id`, `terminal_id`, `agent_id`, `date_arrivee_estimee`, `date_depart_estimee`, `date_arrivee_reelle`, `date_depart_reelle`, `statut`, `motif_annulation`) VALUES
(1, 'ESC-2026-001', 1, 1, 2, '2026-08-16 08:00:00', '2026-08-17 18:00:00', '2026-08-16 08:15:00', NULL, 'active', NULL),
(2, 'ESC-2026-002', 2, 1, 2, '2026-08-18 14:00:00', '2026-08-20 06:00:00', NULL, NULL, 'prevue', NULL),
(3, 'ESC-2026-003', 3, 3, 2, '2026-08-10 10:00:00', '2026-08-12 22:00:00', '2026-08-10 10:30:00', '2026-08-12 21:45:00', 'cloturee', NULL),
(4, 'ESC-2026-004', 4, 2, 2, '2026-08-15 06:00:00', '2026-08-16 12:00:00', NULL, NULL, 'annulee', 'Avarie de propulsion signalée au large de Malte');

INSERT INTO `daps` (`id`, `numero_dap`, `visite_maritime_id`, `statut`, `date_demande`, `date_traitement`, `remarques`, `motif_refus`) VALUES
(1, 'DAP-2026-001', 1, 'accepte', '2026-08-12 09:30:00', '2026-08-13 11:00:00', 'Demande prioritaire conteneurs frigorifiques', NULL),
(2, 'DAP-2026-002', 2, 'envoye', '2026-08-14 16:00:00', NULL, 'Accostage prévu quai 2XL Ouest', NULL),
(3, 'DAP-2026-003', 3, 'accepte', '2026-08-08 14:20:00', '2026-08-09 10:00:00', 'Déchargement brut pétrolier', NULL);

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entite_type`, `entite_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 2, 'CREATE', 'VisiteMaritime', 1, '{"numero_visite":"ESC-2026-001","navire":"EVER APEX","statut":"prevue"}', '127.0.0.1', '2026-08-12 09:30:00'),
(2, 2, 'CREATE', 'DAP', 1, '{"numero_dap":"DAP-2026-001","visite_id":1,"statut":"brouillon"}', '127.0.0.1', '2026-08-12 09:35:00'),
(3, 2, 'STATUS_CHANGE', 'DAP', 1, '{"statut_precedent":"brouillon","nouveau_statut":"envoye"}', '127.0.0.1', '2026-08-12 10:00:00'),
(4, 3, 'STATUS_CHANGE', 'DAP', 1, '{"statut_precedent":"envoye","nouveau_statut":"accepte"}', '127.0.0.1', '2026-08-13 11:00:00'),
(5, 2, 'STATUS_CHANGE', 'VisiteMaritime', 1, '{"statut_precedent":"prevue","nouveau_statut":"active","date_arrivee_reelle":"2026-08-16 08:15:00"}', '127.0.0.1', '2026-08-16 08:15:00');
