import { sql } from './db.ts';

/**
 * Per-domain learning cache. This starter ships with a single real tier (Tier 1
 * TLS fetch), so the policy mostly tracks success/failure streaks and latency.
 * When you add Tier 2 (browser), Tier 3 (proxy), etc., the cascade dispatcher
 * will read `successful_tier` to skip straight to the known-good level.
 */
export interface Policy {
  domain: string;
  successful_tier: number;
  failure_streak: number;
  avg_latency_ms: number;
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

export async function readPolicy(domain: string): Promise<Policy | null> {
  const rows = await sql<Policy[]>`
    SELECT domain, successful_tier, failure_streak, avg_latency_ms
    FROM scraper_domain_policy
    WHERE domain = ${domain}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function recordSuccess(
  domain: string,
  tier: number,
  latency_ms: number
): Promise<void> {
  await sql`
    INSERT INTO scraper_domain_policy
      (domain, successful_tier, failure_streak, avg_latency_ms, last_success_at, updated_at)
    VALUES (${domain}, ${tier}, 0, ${latency_ms}, now(), now())
    ON CONFLICT (domain) DO UPDATE SET
      successful_tier = ${tier},
      failure_streak  = 0,
      avg_latency_ms  = (scraper_domain_policy.avg_latency_ms + ${latency_ms}) / 2,
      last_success_at = now(),
      updated_at      = now()
  `;
}

export async function recordFailure(domain: string): Promise<void> {
  await sql`
    INSERT INTO scraper_domain_policy
      (domain, successful_tier, failure_streak, last_failure_at, updated_at)
    VALUES (${domain}, 1, 1, now(), now())
    ON CONFLICT (domain) DO UPDATE SET
      failure_streak  = scraper_domain_policy.failure_streak + 1,
      last_failure_at = now(),
      updated_at      = now()
  `;
}
