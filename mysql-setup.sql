-- Опросник 5F: схема MySQL/MariaDB
-- Кодировка utf8mb4 обязательна для корректного хранения русскоязычных данных.

CREATE TABLE IF NOT EXISTS survey_results (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    external_score DECIMAL(3,2) NOT NULL,
    goal_score DECIMAL(3,2) NOT NULL,
    composition_score DECIMAL(3,2) NOT NULL,
    leader_score DECIMAL(3,2) NOT NULL,
    interaction_score DECIMAL(3,2) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_survey_results_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS survey_admins (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_survey_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
