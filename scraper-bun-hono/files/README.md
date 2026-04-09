# scraper — Bun + Hono starter

Self-hosted web scraper. Single-process, single-Postgres, runs comfortably on a
single Hetzner AX42 (or any box with Docker). Ships with:

- **Hono** HTTP API on port `3021`
- **Postgres** content cache (sha256 dedup, 24h TTL, stale-while-revalidate)
- **Per-domain policy** cache that learns the cheapest successful tier
- **Tier 1 fetch** (undici + realistic Chrome headers + bot-wall detection)
- **HTML → Markdown** via `node-html-markdown`
- **Bundled Claude skill** at `.claude/skills/scrape/SKILL.md` so agents in your
  project prefer this scraper over WebFetch

## Quickstart

```bash
cp env.example .env
docker compose up -d           # postgres + scraper on :3021
curl -X POST http://localhost:3021/scrape \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com"}'
```

Local dev without Docker (needs a running Postgres):

```bash
bun install
bun run dev
```

## API

### `POST /scrape`

```json
{ "url": "https://example.com", "bypass_cache": false, "timeout_ms": 10000 }
```

Response:

```json
{
  "success": true,
  "from_cache": false,
  "tier_used": 1,
  "latency_ms": 245,
  "data": {
    "markdown": "# Example Domain\n\n...",
    "metadata": { "title": "Example Domain", "source_url": "...", "domain": "example.com" }
  }
}
```

### `GET /cache/lookup?url=...`

Probe the content cache without triggering a fetch.

### `GET /policy/:domain`

Inspect what the scraper has learned about a domain.

### `GET /health`

Liveness + db check.

## How it works

```
POST /scrape
   │
   ├─ Tier 0: content cache (Postgres) ──► hit? return markdown
   │
   ├─ Tier 1: undici fetch + Chrome headers ──► ok? convert → cache → return
   │
   └─ failure: recordFailure(domain), return 502
```

Every successful fetch updates `scraper_domain_policy` so future requests for
the same domain start at the known-good tier. Every failure bumps
`failure_streak` so the system can learn which domains need stronger tiers.

## Growing this starter

This is deliberately minimal — one service, one tier. The real shape it wants
to grow into is a **4-tier escalation cascade**:

| Tier | Tech                              | Cost            | Coverage |
|-----:|-----------------------------------|-----------------|----------|
|    0 | Content cache (Postgres)          | €0              | —        |
|    1 | Undici + Chrome headers           | €0              | ~60%     |
|    1+| `cycletls` (JA3/JA4 spoofing)     | €0              | ~70%     |
|    2 | Patchright stealth browser        | €0 (CPU)        | ~85%     |
|    3 | IPv6 `/64` rotation (Hetzner)     | €0              | ~95%     |
|    3 | Residential proxy (e.g. IPRoyal)  | ~$1.75/GB       | ~95%     |
|    4 | CAPTCHA solving (e.g. 2Captcha)   | ~€0.001/solve   | ~98%     |
|    5 | Firecrawl fallback                | ~€0.002/req     | ~99%     |

**Next steps in rough order:**

1. **Swap undici for `cycletls`** — Chrome JA3 fingerprint, beats naive bot
   walls for near-zero effort.
2. **Add a Playwright sidecar** (Node service on port `3022`) running
   [patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright) for JS-rendered
   pages. Cascade: Tier 1 fails → POST to sidecar → return markdown.
3. **Turn `successful_tier` into a real dispatcher** — on each scrape, read the
   policy row and *start* at the last-known-good tier. Escalate on failure,
   downgrade on repeated Tier-1 wins.
4. **IPv6 /64 rotation** (Hetzner AX42): your server has a routed `/64`, which
   is 2^64 source addresses. Enable `net.ipv6.ip_nonlocal_bind`, bind a random
   address per request, rotate on burn. Zero marginal cost, beats most
   IP-reputation blocks.
5. **Residential proxy fallback** — for domains where even IPv6 rotation fails,
   route through IPRoyal. Track bandwidth per domain in the policy row.
6. **robots.txt + per-domain rate limiter** — token bucket in Postgres, capped
   by `scraper_domain_policy.rate_limit_per_min`.
7. **Job queue** — add `scraper_jobs` (status, priority, webhook_url) and a
   worker process using `SELECT FOR UPDATE SKIP LOCKED` for atomic claims.
   Exposes `POST /batch` and `POST /crawl`.
8. **Firecrawl fallback** — last resort only, and never write the win back to
   `successful_tier` (that would poison the policy).

Each step is additive — you can stop at any tier that's "good enough" for your
targets.

## Claude skill

`.claude/skills/scrape/SKILL.md` is a project-level
[Claude Code skill](https://docs.claude.com/en/docs/claude-code/skills) that
teaches agents in this repo to prefer the local scraper over WebFetch. It's
picked up automatically if you use Claude Code with this project as the working
directory.

## License

MIT
