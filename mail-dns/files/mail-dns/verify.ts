/**
 * Trinity Mail — `mail-dns` verify script.
 *
 * The tenant-side mirror of `onboard-domain.sh --verify`. Resolves each domain's live
 * DNS via `node:dns/promises` and checks the records are published + aligned:
 *   - SPF contains the relay `include:` (and NOT a raw ip4 literal),
 *   - DKIM TXT present at `<selector>._domainkey.<domain>`,
 *   - DMARC present with a `rua=`,
 *   - bounce subdomain has its own SPF,
 *   - MX → relay when inbound is enabled.
 *
 * Prints `OK` / `!!` per record. Exit 0 when every check passes, 1 otherwise.
 *
 * CLI:  npx tsx mail-dns/verify.ts            # reads mail-dns.yaml next to this file
 *       npx tsx mail-dns/verify.ts ./path/to/mail-dns.yaml
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveTxt, resolveMx } from 'node:dns/promises';
import { parse } from 'yaml';
import type { MailDnsManifest, VerifyResult } from './types.js';

/** node:dns returns TXT as string[][] (chunked); join each record back together. */
async function txtRecords(name: string): Promise<string[]> {
  try {
    const chunks = await resolveTxt(name);
    return chunks.map((parts) => parts.join(''));
  } catch {
    return [];
  }
}

function findSpf(records: string[]): string | undefined {
  return records.find((r) => /v=spf1/i.test(r));
}

function findDmarc(records: string[]): string | undefined {
  return records.find((r) => /v=DMARC1/i.test(r));
}

function findDkim(records: string[]): string | undefined {
  return records.find((r) => /v=DKIM1/i.test(r) || /(^|;)\s*p=/.test(r));
}

/** Verify one domain against its manifest entry. */
export async function verifyDomain(
  manifest: MailDnsManifest,
  domain: string,
  selector: string,
  bounceSubdomain: string,
  inbound: boolean,
): Promise<VerifyResult[]> {
  const out: VerifyResult[] = [];
  const includeToken = `include:${manifest.relaySpfDomain}`;

  // ── SPF ──
  const spf = findSpf(await txtRecords(domain));
  if (!spf) {
    out.push({ domain, check: 'SPF', ok: false, detail: 'no v=spf1 TXT found' });
  } else if (/\bip4:/i.test(spf) || /\bip6:/i.test(spf)) {
    out.push({
      domain,
      check: 'SPF',
      ok: false,
      detail: `contains a raw ip literal (use include: instead): ${spf}`,
    });
  } else if (!spf.includes(includeToken)) {
    out.push({ domain, check: 'SPF', ok: false, detail: `missing ${includeToken}: ${spf}` });
  } else {
    const hard = /-all\b/.test(spf);
    out.push({
      domain,
      check: 'SPF',
      ok: true,
      detail: `${includeToken} present${hard ? ' (-all hardened)' : ' (~all warmup)'}`,
    });
  }

  // ── DKIM ──
  const dkimName = `${selector}._domainkey.${domain}`;
  const dkim = findDkim(await txtRecords(dkimName));
  out.push(
    dkim
      ? { domain, check: 'DKIM', ok: true, detail: `${dkimName} present (${dkim.length} chars)` }
      : { domain, check: 'DKIM', ok: false, detail: `no key at ${dkimName}` },
  );

  // ── DMARC ──
  const dmarc = findDmarc(await txtRecords(`_dmarc.${domain}`));
  if (!dmarc) {
    out.push({ domain, check: 'DMARC', ok: false, detail: `no _dmarc.${domain} TXT found` });
  } else if (!/rua=/i.test(dmarc)) {
    out.push({ domain, check: 'DMARC', ok: false, detail: `present but no rua=: ${dmarc}` });
  } else {
    out.push({ domain, check: 'DMARC', ok: true, detail: dmarc });
  }

  // ── Bounce subdomain SPF ──
  const bSpf = findSpf(await txtRecords(bounceSubdomain));
  if (!bSpf) {
    out.push({
      domain,
      check: 'bounce-SPF',
      ok: false,
      detail: `no v=spf1 TXT at ${bounceSubdomain}`,
    });
  } else if (!bSpf.includes(includeToken)) {
    out.push({
      domain,
      check: 'bounce-SPF',
      ok: false,
      detail: `${bounceSubdomain} SPF missing ${includeToken}`,
    });
  } else {
    out.push({ domain, check: 'bounce-SPF', ok: true, detail: `${bounceSubdomain} authorizes relay` });
  }

  // ── MX (only when inbound) ──
  if (inbound) {
    const want = manifest.relayMxHost.replace(/\.$/, '');
    try {
      const mx = await resolveMx(domain);
      const match = mx.find((m) => m.exchange.replace(/\.$/, '') === want);
      out.push(
        match
          ? { domain, check: 'MX', ok: true, detail: `${want} (pref ${match.priority})` }
          : {
              domain,
              check: 'MX',
              ok: false,
              detail: `no MX → ${want} (found: ${mx.map((m) => m.exchange).join(', ') || 'none'})`,
            },
      );
    } catch {
      out.push({ domain, check: 'MX', ok: false, detail: `no MX records for ${domain}` });
    }
  }

  return out;
}

/** Verify every domain in a manifest. */
export async function verifyManifest(manifest: MailDnsManifest): Promise<VerifyResult[]> {
  const all: VerifyResult[] = [];
  for (const d of manifest.domains) {
    const results = await verifyDomain(
      manifest,
      d.domain,
      d.dkimSelector,
      d.bounceSubdomain,
      d.inbound,
    );
    all.push(...results);
  }
  return all;
}

/** Load + parse a mail-dns.yaml manifest. */
export function loadManifest(path: string): MailDnsManifest {
  const raw = readFileSync(path, 'utf8');
  const parsed = parse(raw) as MailDnsManifest;
  if (!parsed || !Array.isArray(parsed.domains)) {
    throw new Error(`mail-dns: ${path} is not a valid manifest (missing domains[])`);
  }
  return parsed;
}

/** CLI entry: load manifest, verify, print OK/!! per record, set exit code. */
export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const path = argv[0] ? resolve(process.cwd(), argv[0]) : resolve(here, 'mail-dns.yaml');
  const manifest = loadManifest(path);

  const results = await verifyManifest(manifest);
  let failures = 0;
  let currentDomain = '';
  for (const r of results) {
    if (r.domain !== currentDomain) {
      currentDomain = r.domain;
      // eslint-disable-next-line no-console
      console.log(`\n== ${r.domain} ==`);
    }
    if (!r.ok) failures++;
    const mark = r.ok ? 'OK' : '!!';
    // eslint-disable-next-line no-console
    console.log(`  ${mark}  ${r.check.padEnd(11)} ${r.detail}`);
  }
  // eslint-disable-next-line no-console
  console.log(
    `\n${failures === 0 ? 'OK' : '!!'}  ${results.length - failures}/${results.length} checks passed.`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
