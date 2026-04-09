import { createHash } from 'node:crypto';
import { sql } from './db.ts';

const TTL_MS = 24 * 60 * 60 * 1000;        // 24h hard expiry
const STALE_MS = 1 * 60 * 60 * 1000;       // 1h stale-while-revalidate

export interface CacheHit {
  markdown: string;
  metadata: Record<string, unknown>;
  tier_used: number;
  age_ms: number;
  is_stale: boolean;
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export async function getCached(url: string): Promise<CacheHit | null> {
  const rows = await sql<
    Array<{
      markdown: string;
      metadata: Record<string, unknown>;
      tier_used: number;
      fetched_at: Date;
    }>
  >`
    SELECT markdown, metadata, tier_used, fetched_at
    FROM scraper_content_cache
    WHERE url = ${url}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;

  const age_ms = Date.now() - new Date(row.fetched_at).getTime();
  if (age_ms > TTL_MS) return null;

  // Fire-and-forget hit counter
  void sql`UPDATE scraper_content_cache SET hits = hits + 1 WHERE url = ${url}`;

  return {
    markdown: row.markdown,
    metadata: row.metadata,
    tier_used: row.tier_used,
    age_ms,
    is_stale: age_ms > STALE_MS,
  };
}

export async function putCached(
  url: string,
  markdown: string,
  metadata: Record<string, unknown>,
  tier_used: number
): Promise<void> {
  const hash = sha256(markdown);
  await sql`
    INSERT INTO scraper_content_cache (url, content_sha256, markdown, metadata, tier_used, fetched_at, hits)
    VALUES (${url}, ${hash}, ${markdown}, ${sql.json(metadata)}, ${tier_used}, now(), 0)
    ON CONFLICT (url) DO UPDATE
      SET content_sha256 = EXCLUDED.content_sha256,
          markdown       = EXCLUDED.markdown,
          metadata       = EXCLUDED.metadata,
          tier_used      = EXCLUDED.tier_used,
          fetched_at     = now()
  `;
}
