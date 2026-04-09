import { request } from 'undici';

/**
 * Tier 1 — plain HTTP fetch with realistic Chrome headers.
 *
 * This is the cheapest tier: no browser, no proxy, no JS execution.
 * Covers roughly 60% of real-world targets. When it fails (bot wall, JS-only
 * content, CAPTCHA), the cascade should escalate to Tier 2 (headless browser).
 *
 * Production versions often layer TLS fingerprint spoofing on top (e.g.
 * `cycletls` for Chrome JA3/JA4). This starter uses plain undici to keep the
 * dependency tree small — swap in `cycletls` when you outgrow it.
 */

const CHROME_HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  'upgrade-insecure-requests': '1',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
};

const BOT_WALL_RX = /cloudflare|just a moment|access denied|attention required|captcha/i;

export interface FetchResult {
  ok: boolean;
  status: number;
  html: string;
  latency_ms: number;
  reason?: string;
}

export async function tier1Fetch(url: string, timeout_ms = 10_000): Promise<FetchResult> {
  const started = Date.now();
  try {
    const res = await request(url, {
      method: 'GET',
      headers: CHROME_HEADERS,
      headersTimeout: timeout_ms,
      bodyTimeout: timeout_ms,
      maxRedirections: 5,
    });
    const html = await res.body.text();
    const latency_ms = Date.now() - started;

    if (res.statusCode >= 400) {
      return { ok: false, status: res.statusCode, html, latency_ms, reason: `http ${res.statusCode}` };
    }
    // Cheap bot-wall detection: tiny body + bot keywords
    if (html.length < 10_000 && BOT_WALL_RX.test(html)) {
      return { ok: false, status: res.statusCode, html, latency_ms, reason: 'bot_wall' };
    }
    return { ok: true, status: res.statusCode, html, latency_ms };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      html: '',
      latency_ms: Date.now() - started,
      reason: err instanceof Error ? err.message : 'fetch_error',
    };
  }
}
