/**
 * Trinity Mail — `mail-dns` (public surface).
 *
 * Installed by `npx @trinity369/use mail-dns` into `./mail-dns`. Self-contained;
 * the tenant-side mirror of the relay's `onboard-domain.sh`. Produces a provider-neutral
 * `mail-dns.yaml` of SPF/DKIM/DMARC/bounce records and verifies they are published + aligned.
 *
 * Pairs with mail-client (transport), mail-templates (rendering), mail-webhook (events),
 * and mail-tresor (env contract).
 */
export {
  DEFAULT_CONFIG,
  buildManifest,
  buildDomainManifest,
  renderYaml,
  main as generate,
} from './generate.js';

export {
  verifyManifest,
  verifyDomain,
  loadManifest,
  main as verify,
} from './verify.js';

export type {
  DnsRecord,
  DomainManifest,
  MailDnsManifest,
  MailDnsConfig,
  VerifyResult,
} from './types.js';
