/**
 * Self-hosted scraper — Hono server entry.
 *
 * Endpoints:
 *   GET  /health                — liveness + basic stats
 *   POST /scrape { url }        — fetch, convert to markdown, cache, return
 *   GET  /cache/lookup?url=     — cache probe (no fetch)
 *   GET  /policy/:domain        — learned policy for a domain
 */
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { ensureSchema, sql } from './db.ts';
import { getCached, putCached } from './cache.ts';
import { domainOf, readPolicy, recordFailure, recordSuccess } from './policy.ts';
import { tier1Fetch } from './tier1-fetch.ts';
import { htmlToMarkdown } from './convert.ts';

await ensureSchema();

const app = new Hono();
app.use('*', logger());

app.get('/health', async (c) => {
  let db_ok = false;
  try {
    await sql`SELECT 1`;
    db_ok = true;
  } catch {
    db_ok = false;
  }
  return c.json({
    ok: true,
    service: 'scraper',
    version: '0.1.0',
    db_ok,
  });
});

app.post('/scrape', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    url?: string;
    bypass_cache?: boolean;
    timeout_ms?: number;
  };
  const url = body.url;
  if (!url || typeof url !== 'string') {
    return c.json({ success: false, error: 'url is required' }, 400);
  }

  // Tier 0 — content cache
  if (!body.bypass_cache) {
    const hit = await getCached(url);
    if (hit) {
      return c.json({
        success: true,
        from_cache: true,
        tier_used: 0,
        latency_ms: 0,
        data: { markdown: hit.markdown, metadata: hit.metadata },
      });
    }
  }

  const domain = domainOf(url);

  // Tier 1 — TLS fetch
  const result = await tier1Fetch(url, body.timeout_ms ?? 10_000);
  if (!result.ok) {
    await recordFailure(domain);
    return c.json(
      {
        success: false,
        tier_used: 1,
        latency_ms: result.latency_ms,
        error: result.reason ?? 'tier1_failed',
      },
      502
    );
  }

  const { markdown, title } = htmlToMarkdown(result.html);
  const metadata = { title, source_url: url, domain };

  await putCached(url, markdown, metadata, 1);
  await recordSuccess(domain, 1, result.latency_ms);

  return c.json({
    success: true,
    from_cache: false,
    tier_used: 1,
    latency_ms: result.latency_ms,
    data: { markdown, metadata },
  });
});

app.get('/cache/lookup', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.json({ error: 'url is required' }, 400);
  const hit = await getCached(url);
  return c.json({ hit: !!hit, data: hit });
});

app.get('/policy/:domain', async (c) => {
  const policy = await readPolicy(c.req.param('domain'));
  return c.json({ policy });
});

app.notFound((c) => c.json({ error: 'not found' }, 404));
app.onError((err, c) => {
  console.error('[scraper] error', err);
  return c.json({ error: err.message }, 500);
});

const port = Number(process.env.SCRAPER_PORT ?? 3021);
console.log(`[scraper] listening on :${port}`);

export default { fetch: app.fetch, port };
