import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required');
}

export const sql = postgres(url, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

/**
 * Ensure schema exists. Safe to call on every boot — schema.sql uses
 * `CREATE TABLE IF NOT EXISTS`. In docker-compose the schema is applied
 * by postgres initdb; this is a fallback for local/bare-metal runs.
 */
export async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS scraper_domain_policy (
      domain              TEXT PRIMARY KEY,
      successful_tier     SMALLINT NOT NULL DEFAULT 1,
      failure_streak      SMALLINT NOT NULL DEFAULT 0,
      avg_latency_ms      INTEGER  NOT NULL DEFAULT 0,
      rate_limit_per_min  SMALLINT NOT NULL DEFAULT 30,
      last_success_at     TIMESTAMPTZ,
      last_failure_at     TIMESTAMPTZ,
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS scraper_content_cache (
      url             TEXT PRIMARY KEY,
      content_sha256  TEXT NOT NULL,
      markdown        TEXT NOT NULL,
      metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
      tier_used       SMALLINT NOT NULL,
      fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      hits            INTEGER NOT NULL DEFAULT 0
    )
  `;
}
