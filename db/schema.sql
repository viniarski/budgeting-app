-- Neon/Postgres schema aligned with the current app model.
-- App model: Budget (name/period/date range), Category (name/colour/icon/allocated),
-- Expense (amount/description/date/category), and per-user ownership.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'termly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date)
);

-- Category definitions (shared defaults + optional user custom categories).
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    colour TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)
);

-- Per-budget allocation values for categories.
CREATE TABLE budget_categories (
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    allocated NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (allocated >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (budget_id, category_id)
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL DEFAULT '',
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_budget_categories_budget_id ON budget_categories(budget_id);
CREATE INDEX idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- Snapshot store used by the current app for hybrid DB + localStorage sync.
CREATE TABLE app_states (
    id TEXT PRIMARY KEY,
    state JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- KPI ANALYTICS SCHEMA
-- ============================================================

CREATE SCHEMA IF NOT EXISTS "KPIs";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

SET search_path TO "KPIs", public;

CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    anonymous_id    TEXT NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    referrer        TEXT,
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    device_type     TEXT,
    browser         TEXT,
    os              TEXT,
    country         TEXT,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    duration_secs   INT GENERATED ALWAYS AS (
                        EXTRACT(EPOCH FROM (ended_at - started_at))::INT
                    ) STORED
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id      ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_anonymous_id ON sessions(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at   ON sessions(started_at DESC);

CREATE TABLE IF NOT EXISTS page_views (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES public.users(id) ON DELETE SET NULL,
    anonymous_id        TEXT NOT NULL,
    page_url            TEXT NOT NULL,
    page_path           TEXT NOT NULL,
    page_title          TEXT,
    referrer_url        TEXT,
    entered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exited_at           TIMESTAMPTZ,
    time_on_page_secs   INT GENERATED ALWAYS AS (
                            EXTRACT(EPOCH FROM (exited_at - entered_at))::INT
                        ) STORED,
    scroll_depth_pct    SMALLINT CHECK (scroll_depth_pct BETWEEN 0 AND 100),
    is_bounce           BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id    ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path  ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_entered_at ON page_views(entered_at DESC);

CREATE TABLE IF NOT EXISTS events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    anonymous_id    TEXT NOT NULL,
    event_type      TEXT NOT NULL,
    page_url        TEXT NOT NULL,
    page_path       TEXT NOT NULL,
    element_id      TEXT,
    element_class   TEXT,
    element_text    TEXT,
    element_href    TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id    ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_page_path  ON events(page_path);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_metadata   ON events USING GIN (metadata);

CREATE TABLE IF NOT EXISTS element_impressions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    anonymous_id    TEXT NOT NULL,
    page_view_id    UUID REFERENCES page_views(id) ON DELETE SET NULL,
    page_url        TEXT NOT NULL,
    page_path       TEXT NOT NULL,
    element_id      TEXT,
    element_class   TEXT,
    element_text    TEXT,
    element_href    TEXT,
    placement       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impressions_session_id ON element_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_impressions_page_path  ON element_impressions(page_path);
CREATE INDEX IF NOT EXISTS idx_impressions_created_at ON element_impressions(created_at DESC);

CREATE TABLE IF NOT EXISTS element_clicks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    anonymous_id    TEXT NOT NULL,
    page_view_id    UUID REFERENCES page_views(id) ON DELETE SET NULL,
    page_url        TEXT NOT NULL,
    page_path       TEXT NOT NULL,
    element_id      TEXT,
    element_class   TEXT,
    element_text    TEXT,
    element_href    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clicks_session_id ON element_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_clicks_page_path  ON element_clicks(page_path);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON element_clicks(created_at DESC);

CREATE OR REPLACE VIEW kpi_daily_unique_visitors AS
SELECT
    DATE(started_at) AS day,
    COUNT(DISTINCT COALESCE(user_id::text, anonymous_id))::INT AS unique_visitors
FROM sessions
GROUP BY DATE(started_at);

CREATE OR REPLACE VIEW kpi_page_performance AS
SELECT
    page_path,
    COUNT(*)::INT AS views,
    COUNT(DISTINCT anonymous_id)::INT AS unique_visitors,
    AVG(time_on_page_secs)::NUMERIC(10,2) AS avg_time_on_page_secs,
    (AVG(CASE WHEN is_bounce THEN 1 ELSE 0 END) * 100)::NUMERIC(10,2) AS bounce_rate_pct
FROM page_views
GROUP BY page_path;

CREATE OR REPLACE VIEW kpi_click_through_rates AS
SELECT
    i.page_path,
    COALESCE(i.element_id, i.element_text, 'unknown') AS element_key,
    COUNT(i.id)::INT AS impressions,
    COUNT(c.id)::INT AS clicks,
    CASE
        WHEN COUNT(i.id) = 0 THEN 0
        ELSE ROUND((COUNT(c.id)::NUMERIC / COUNT(i.id)::NUMERIC) * 100, 2)
    END AS ctr_pct
FROM element_impressions i
LEFT JOIN element_clicks c
  ON c.page_path = i.page_path
 AND COALESCE(c.element_id, c.element_text, 'unknown') = COALESCE(i.element_id, i.element_text, 'unknown')
GROUP BY i.page_path, COALESCE(i.element_id, i.element_text, 'unknown');

SET search_path TO public;
