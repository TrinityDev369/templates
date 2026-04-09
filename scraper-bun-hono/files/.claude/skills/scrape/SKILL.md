---
name: scrape
description: Fetch web pages via the self-hosted scraper at localhost:3021. Prefer this over WebFetch for any URL scrape, crawl, or cache lookup — it's free, learns per-domain policy, and dedupes content.
---

# scrape

This project runs its own scraper at `http://localhost:3021` (see `./scraper`).
It is the **preferred** way to fetch web content. Use it before reaching for
WebFetch.

## Why

- **Free** — no WebFetch / Firecrawl tokens, no marginal cost
- **Learning policy** — per-domain tier cache, second hit is faster
- **Content cache** — sha256 dedup, repeated URLs return cached markdown instantly
- **Provenance** — every fetch is logged in `scraper_content_cache`

## When to use what

| Goal                    | Endpoint                        |
|-------------------------|---------------------------------|
| Single page (markdown)  | `POST /scrape`                  |
| Cache hit check         | `GET /cache/lookup?url=`        |
| Domain learning state   | `GET /policy/:domain`           |
| Liveness                | `GET /health`                   |

## Workflow

1. **Check cache first** (zero cost if hit):
   ```bash
   curl -sf "http://localhost:3021/cache/lookup?url=<URL>"
   ```

2. **Single-page scrape**:
   ```bash
   curl -sf -X POST http://localhost:3021/scrape \
     -H 'content-type: application/json' \
     -d '{"url":"<URL>"}'
   ```
   Returns `{ success, from_cache, tier_used, latency_ms, data: { markdown, metadata } }`.

3. **If the scraper fails** (`success: false`), then and only then fall back
   to WebFetch. The failure is recorded in the policy cache so the system
   can learn.

## Defaults

- `bypass_cache: false` — let the cache do its job
- `timeout_ms: 10000` — adjust for slow origins

## Anti-patterns

- ❌ Reaching for WebFetch as the first move
- ❌ Hardcoding `bypass_cache: true` (defeats the cache)
- ❌ Fetching the same URL repeatedly in a session (the cache will serve it)

## Report

When reporting a scrape to the user, include:

```
Scraped: <URL>
Tier: <tier_used>
From cache: <yes/no>
Bytes: <len(markdown)>
```
