/**
 * Trinity Mail — `mail-dns` record + manifest types.
 *
 * The tenant-side mirror of the relay's `onboard-domain.sh`. Where the relay script
 * emits dig-able SPF/DKIM/DMARC records for one domain, this template produces a
 * machine-readable, provider-neutral manifest for *all* of a tenant's sending domains
 * — and a verify script that checks they are actually published + aligned.
 *
 * Self-contained: no `@trinity/*` imports, no secrets. The DKIM public key is NOT
 * embedded here — it is published by `trinity-mail init`; the manifest only carries the
 * selector so the verify script knows where to look (`<selector>._domainkey.<domain>`).
 */

/** A single copy-paste DNS record. Provider-neutral: name/type/value, no API calls. */
export interface DnsRecord {
  /** Fully-qualified record name, e.g. `ozean-licht.com` or `_dmarc.ozean-licht.com`. */
  name: string;
  /** DNS record type we emit. */
  type: 'TXT' | 'MX' | 'CNAME';
  /** The record value (TXT string content, MX target, …). */
  value: string;
  /** MX preference — only set when `type === 'MX'`. */
  priority?: number;
  /** Human note explaining what this record does / how to harden it. */
  comment?: string;
}

/** The set of records for one sending domain. */
export interface DomainManifest {
  /** The sending domain, e.g. `ozean-licht.com`. */
  domain: string;
  /** DKIM selector, e.g. `s202606`. The public key is published by `trinity-mail init`. */
  dkimSelector: string;
  /** Return-Path / bounce subdomain, e.g. `bounce.ozean-licht.com`. */
  bounceSubdomain: string;
  /** Whether inbound mail (MX → relay) is enabled for this domain. */
  inbound: boolean;
  /** All records the tenant must publish for this domain. */
  records: DnsRecord[];
}

/** The full manifest serialized to `mail-dns.yaml`. */
export interface MailDnsManifest {
  /** Schema version of this manifest shape. */
  version: 1;
  /** The relay's SPF include target, e.g. `_spf.relay.trinity.agency`. NEVER an IP. */
  relaySpfDomain: string;
  /** The relay FQDN used as MX target for inbound domains, e.g. `relay.trinity.agency`. */
  relayMxHost: string;
  /** Central DMARC aggregate-report mailbox, e.g. `dmarc@trinity.agency`. */
  dmarcRua: string;
  /** Per-domain record sets. */
  domains: DomainManifest[];
}

/** Input config consumed by `generate.ts`. */
export interface MailDnsConfig {
  /** Sending domains. A tenant may send from more than one. */
  domains: string[];
  /** Relay SPF include target — the relay can re-IP without touching tenant DNS. */
  relaySpfDomain: string;
  /** Relay FQDN used as MX target when `inbound` is true. */
  relayMxHost: string;
  /** Central aggregate-report mailbox for DMARC `rua=`. */
  dmarcRua: string;
  /** DKIM selector to reference, e.g. `s202606`. */
  dkimSelector: string;
  /** Prefix for the bounce subdomain → `<prefix>.<domain>`. Default `bounce`. */
  bounceSubdomainPrefix?: string;
  /**
   * SPF qualifier policy. `~all` (softfail) during warmup; harden to `-all` (fail)
   * once deliverability is proven. Default `~all`.
   */
  spfPolicy?: '~all' | '-all';
  /** DMARC policy. Start `none`; ramp to `quarantine` → `reject`. Default `none`. */
  dmarcPolicy?: 'none' | 'quarantine' | 'reject';
  /** Whether inbound (MX) is enabled. Either one flag for all, or per-domain via map. */
  inbound?: boolean | Record<string, boolean>;
}

/** Per-record verification outcome. */
export interface VerifyResult {
  domain: string;
  /** Short label, e.g. `SPF`, `DKIM`, `DMARC`, `bounce-SPF`, `MX`. */
  check: string;
  ok: boolean;
  /** What we found (or why it failed). */
  detail: string;
}
