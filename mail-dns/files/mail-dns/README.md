# Trinity Mail — `mail-dns`

The tenant-side mirror of the relay's `onboard-domain.sh`. It produces a
**provider-neutral** `mail-dns.yaml` — copy-paste SPF / DKIM / DMARC / bounce records for
every domain you send from — and a **verify** script that confirms they are actually
published and aligned. No registrar/Cloudflare API calls; you paste the records at your DNS
provider (Ozean Licht's is Hostinger).

## Why an `include:`, never an IP

SPF authorizes the relay via `include:_spf.relay.trinity.agency` — **never** a hardcoded
`ip4:` literal. This is the load-bearing rule: the relay can re-IP (new node, failover,
scale-out) without a single tenant ever editing DNS. The generator refuses an IP literal,
and `verify` flags any SPF that smuggles one in.

## Usage

```bash
# 1) (optional) describe your domains
cp mail-dns/mail-dns.example.yaml mail-dns/mail-dns.yaml   # eyeball the worked example
#    …or author mail-dns/mail-dns.config.ts (export default) to drive the generator

# 2) generate the manifest
npx tsx mail-dns/generate.ts        # writes mail-dns/mail-dns.yaml

# 3) publish each record at your DNS provider (Hostinger), then check alignment
npx tsx mail-dns/verify.ts          # OK / !! per record; exit 1 if anything is off
```

### `mail-dns.config.ts` (optional)

```ts
import type { MailDnsConfig } from './types.js';

const config: MailDnsConfig = {
  domains: ['ozean-licht.com', 'kids-ascension.com'],
  relaySpfDomain: '_spf.relay.trinity.agency', // include target — NOT an IP
  relayMxHost: 'relay.trinity.agency',
  dmarcRua: 'dmarc@trinity.agency',            // central aggregate-report mailbox
  dkimSelector: 's202606',                     // public key published by `trinity-mail init`
  bounceSubdomainPrefix: 'bounce',
  spfPolicy: '~all',                           // warmup; harden to '-all' later
  dmarcPolicy: 'none',                         // ramp none → quarantine → reject
  inbound: { 'kids-ascension.com': true },     // bool for all, or a per-domain map
};
export default config;
```

## The records

| Record | Name | What / how to harden |
| --- | --- | --- |
| **SPF** | `<domain>` | `include:` the relay; `~all` during warmup → `-all` once proven |
| **DKIM** | `<selector>._domainkey.<domain>` | public key published by `trinity-mail init`; manifest carries the selector only |
| **DMARC** | `_dmarc.<domain>` | `p=none` to start; `rua=` → central mailbox; ramp to `reject` |
| **bounce SPF** | `bounce.<domain>` | own SPF so VERP Return-Path passes alignment |
| **MX** | `<domain>` | only when `inbound: true` → `10 relay.trinity.agency.` |

## What verify checks

`verify.ts` uses `node:dns/promises` (`resolveTxt` / `resolveMx`) and, per record, prints
`OK` or `!!`:

- SPF contains the relay `include:` **and no raw ip4/ip6 literal**,
- DKIM TXT present at `<selector>._domainkey.<domain>`,
- DMARC present **with a `rua=`**,
- bounce subdomain has its own relay-authorizing SPF,
- MX → relay (only for inbound-enabled domains).

Exit code is `0` only when every check passes — usable in CI / a pre-go-live gate.

## Pairs with

`mail-client` (transport) · `mail-templates` (rendering) · `mail-webhook` (delivery events,
bounces, suppression) · `mail-tresor` (env contract).
