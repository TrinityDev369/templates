-- scraper schema — policy learning cache + content cache
-- Applied automatically by docker-entrypoint-initdb.d on first postgres boot,
-- or manually: psql $DATABASE_URL -f schema.sql

CREATE TABLE IF NOT EXISTS scraper_domain_policy (
  domain              TEXT PRIMARY KEY,
  successful_tier     SMALLINT NOT NULL DEFAULT 1,   -- 1=TLS fetch, 2=browser, 3=proxy ...
  failure_streak      SMALLINT NOT NULL DEFAULT 0,
  avg_latency_ms      INTEGER  NOT NULL DEFAULT 0,
  rate_limit_per_min  SMALLINT NOT NULL DEFAULT 30,
  last_success_at     TIMESTAMPTZ,
  last_failure_at     TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scraper_content_cache (
  url             TEXT PRIMARY KEY,
  content_sha256  TEXT NOT NULL,
  markdown        TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  tier_used       SMALLINT NOT NULL,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  hits            INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scraper_cache_sha
  ON scraper_content_cache (content_sha256);

CREATE INDEX IF NOT EXISTS idx_scraper_cache_fetched
  ON scraper_content_cache (fetched_at DESC);
