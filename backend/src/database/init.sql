-- FinançasPRO — Database Initialization Script
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS financaspro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE financaspro;

-- =============================================
-- USERS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id          CHAR(36) BINARY NOT NULL PRIMARY KEY DEFAULT (UUID()),
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    avatar_url  VARCHAR(255)    NULL,
    currency    VARCHAR(3)      NOT NULL DEFAULT 'BRL',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- =============================================
-- INCOMES (Salário, Extra, Outros)
-- =============================================
CREATE TABLE IF NOT EXISTS incomes (
    id              CHAR(36) BINARY NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id         CHAR(36) BINARY NOT NULL,
    type            ENUM('salary','extra','other') NOT NULL DEFAULT 'other',
    description     VARCHAR(200)    NOT NULL,
    amount          DECIMAL(15,2)   NOT NULL,
    currency        ENUM('BRL','USD','EUR') NOT NULL DEFAULT 'BRL',
    exchange_rate   DECIMAL(10,4)   NOT NULL DEFAULT 1.0000 COMMENT 'Taxa de conversão para BRL',
    amount_brl      DECIMAL(15,2)   NOT NULL COMMENT 'Valor convertido em BRL',
    month           TINYINT         NOT NULL COMMENT '1-12',
    year            SMALLINT        NOT NULL,
    is_recurring    BOOLEAN         NOT NULL DEFAULT FALSE COMMENT 'Se TRUE, se repete todo mês',
    received        BOOLEAN         NOT NULL DEFAULT FALSE COMMENT 'Se já foi recebido',
    received_at     DATE            NULL,
    notes           TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_incomes_user_month (user_id, month, year)
) ENGINE=InnoDB;

-- =============================================
-- EXPENSE CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS expense_categories (
    id          CHAR(36) BINARY NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id     CHAR(36) BINARY NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    color       VARCHAR(7)      NOT NULL DEFAULT '#6366f1',
    icon        VARCHAR(50)     NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- EXPENSES (Dívidas recorrentes e parceladas)
-- =============================================
CREATE TABLE IF NOT EXISTS expenses (
    id                  CHAR(36) BINARY NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id             CHAR(36) BINARY NOT NULL,
    category_id         CHAR(36) BINARY NULL,
    description         VARCHAR(200)    NOT NULL,
    amount              DECIMAL(15,2)   NOT NULL,
    currency            ENUM('BRL','USD','EUR') NOT NULL DEFAULT 'BRL',
    exchange_rate       DECIMAL(10,4)   NOT NULL DEFAULT 1.0000,
    amount_brl          DECIMAL(15,2)   NOT NULL,
    due_day             TINYINT         NULL COMMENT 'Dia do vencimento (1-31)',
    month               TINYINT         NOT NULL,
    year                SMALLINT        NOT NULL,
    is_recurring        BOOLEAN         NOT NULL DEFAULT FALSE,
    is_installment      BOOLEAN         NOT NULL DEFAULT FALSE,
    installment_group_id CHAR(36) BINARY NULL COMMENT 'UUID do grupo de parcelas',
    total_installments  TINYINT         NULL,
    current_installment TINYINT         NULL,
    paid                BOOLEAN         NOT NULL DEFAULT FALSE,
    paid_at             DATE            NULL,
    notes               TEXT            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
    INDEX idx_expenses_user_month (user_id, month, year),
    INDEX idx_expenses_installment_group (installment_group_id)
) ENGINE=InnoDB;

-- =============================================
-- INVESTMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS investments (
    id              CHAR(36) BINARY NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id         CHAR(36) BINARY NOT NULL,
    name            VARCHAR(200)    NOT NULL COMMENT 'Nome do ativo/investimento',
    type            ENUM('stocks','crypto','fixed_income','savings','real_estate','other') NOT NULL DEFAULT 'other',
    ticker          VARCHAR(20)     NULL,
    amount_invested DECIMAL(15,2)   NOT NULL COMMENT 'Valor aportado no mês',
    current_value   DECIMAL(15,2)   NULL COMMENT 'Valor atual (atualizado manualmente)',
    currency        ENUM('BRL','USD','EUR') NOT NULL DEFAULT 'BRL',
    exchange_rate   DECIMAL(10,4)   NOT NULL DEFAULT 1.0000,
    amount_brl      DECIMAL(15,2)   NOT NULL,
    month           TINYINT         NOT NULL,
    year            SMALLINT        NOT NULL,
    notes           TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_investments_user_month (user_id, month, year)
) ENGINE=InnoDB;

-- =============================================
-- MONTHLY SUMMARY (Cache calculado)
-- =============================================
CREATE TABLE IF NOT EXISTS monthly_summaries (
    id                  CHAR(36) BINARY NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id             CHAR(36) BINARY NOT NULL,
    month               TINYINT         NOT NULL,
    year                SMALLINT        NOT NULL,
    total_income_brl    DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    total_expenses_brl  DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    total_investments_brl DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    balance_brl         DECIMAL(15,2)   NOT NULL DEFAULT 0.00 COMMENT 'income - expenses - investments',
    calculated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_summary_user_month (user_id, month, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- WEBHOOK LOGS (para integração n8n)
-- =============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id              CHAR(36) BINARY NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id         CHAR(36) BINARY NOT NULL,
    event_type      VARCHAR(100)    NOT NULL,
    payload         JSON            NOT NULL,
    status          ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
    sent_at         TIMESTAMP       NULL,
    error           TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- SEED — Categorias padrão (inseridas após criar usuário)
-- =============================================
-- (As categorias padrão são inseridas via trigger ou código ao registrar novo usuário)
