import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';
import {
  buildManifest,
  buildDomainManifest,
  renderYaml,
  DEFAULT_CONFIG,
} from '../generate.js';
import type { MailDnsConfig, MailDnsManifest } from '../types.js';

const baseConfig: MailDnsConfig = {
  domains: ['ozean-licht.com'],
  relaySpfDomain: '_spf.relay.trinity.agency',
  relayMxHost: 'relay.trinity.agency',
  dmarcRua: 'dmarc@trinity.agency',
  dkimSelector: 's202606',
  bounceSubdomainPrefix: 'bounce',
  spfPolicy: '~all',
  dmarcPolicy: 'none',
  inbound: false,
};

function txtValues(manifest: MailDnsManifest, domain: string): string[] {
  const d = manifest.domains.find((x) => x.domain === domain)!;
  return d.records.filter((r) => r.type === 'TXT').map((r) => r.value);
}

describe('mail-dns generate', () => {
  it('SPF uses an include: of the relay SPF domain', () => {
    const m = buildManifest(baseConfig);
    const spf = txtValues(m, 'ozean-licht.com').find((v) => v.includes('v=spf1'))!;
    expect(spf).toContain('include:_spf.relay.trinity.agency');
  });

  it('contains NO ip4: literal anywhere in the rendered manifest', () => {
    const yaml = renderYaml(buildManifest(baseConfig));
    expect(yaml).not.toMatch(/ip4:/i);
    expect(yaml).not.toMatch(/ip6:/i);
    // and no raw dotted-quad in any record value
    expect(yaml).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
  });

  it('emits a DKIM record at <selector>._domainkey.<domain>', () => {
    const m = buildManifest(baseConfig);
    const d = m.domains[0]!;
    const dkim = d.records.find((r) => r.name.startsWith('s202606._domainkey.'));
    expect(dkim).toBeDefined();
    expect(dkim!.value).toContain('v=DKIM1');
    // public key is a placeholder — published by trinity-mail init, not embedded here
    expect(dkim!.value).toContain('__DKIM_PUBLIC_KEY__');
  });

  it('emits a DMARC record with a rua= reporting address', () => {
    const m = buildManifest(baseConfig);
    const dmarc = m.domains[0]!.records.find((r) => r.name === '_dmarc.ozean-licht.com');
    expect(dmarc).toBeDefined();
    expect(dmarc!.value).toMatch(/v=DMARC1/);
    expect(dmarc!.value).toContain('rua=mailto:dmarc@trinity.agency');
  });

  it('emits a bounce-subdomain SPF that also includes the relay', () => {
    const m = buildManifest(baseConfig);
    const d = m.domains[0]!;
    expect(d.bounceSubdomain).toBe('bounce.ozean-licht.com');
    const bounceSpf = d.records.find(
      (r) => r.name === 'bounce.ozean-licht.com' && r.value.includes('v=spf1'),
    );
    expect(bounceSpf).toBeDefined();
    expect(bounceSpf!.value).toContain('include:_spf.relay.trinity.agency');
  });

  it('omits MX when inbound is false, includes MX → relay when true', () => {
    const out = buildDomainManifest({ ...baseConfig, inbound: false }, 'ozean-licht.com');
    expect(out.records.some((r) => r.type === 'MX')).toBe(false);

    const inbound = buildDomainManifest({ ...baseConfig, inbound: true }, 'ozean-licht.com');
    const mx = inbound.records.find((r) => r.type === 'MX');
    expect(mx).toBeDefined();
    expect(mx!.value).toBe('relay.trinity.agency.');
    expect(mx!.priority).toBe(10);
  });

  it('supports multiple sending domains', () => {
    const m = buildManifest({ ...baseConfig, domains: ['ozean-licht.com', 'kids-ascension.com'] });
    expect(m.domains.map((d) => d.domain)).toEqual(['ozean-licht.com', 'kids-ascension.com']);
    for (const d of m.domains) {
      const spf = d.records.find((r) => r.name === d.domain && r.value.includes('v=spf1'));
      expect(spf!.value).toContain('include:_spf.relay.trinity.agency');
    }
  });

  it('supports per-domain inbound via a map', () => {
    const m = buildManifest({
      ...baseConfig,
      domains: ['ozean-licht.com', 'kids-ascension.com'],
      inbound: { 'kids-ascension.com': true },
    });
    const ol = m.domains.find((d) => d.domain === 'ozean-licht.com')!;
    const ka = m.domains.find((d) => d.domain === 'kids-ascension.com')!;
    expect(ol.records.some((r) => r.type === 'MX')).toBe(false);
    expect(ka.records.some((r) => r.type === 'MX')).toBe(true);
  });

  it('honors the -all hardening policy', () => {
    const m = buildManifest({ ...baseConfig, spfPolicy: '-all' });
    const spf = txtValues(m, 'ozean-licht.com').find((v) => v.includes('v=spf1'))!;
    expect(spf).toContain('-all');
    expect(spf).not.toContain('~all');
  });

  it('rejects an IP literal passed as the relay SPF domain', () => {
    expect(() =>
      buildManifest({ ...baseConfig, relaySpfDomain: '167.233.54.249' }),
    ).toThrow(/IP literal/i);
    expect(() =>
      buildManifest({ ...baseConfig, relaySpfDomain: 'ip4:167.233.54.249' }),
    ).toThrow();
  });

  it('rejects an empty domain list', () => {
    expect(() => buildManifest({ ...baseConfig, domains: [] })).toThrow(/at least one/i);
  });

  it('renders valid round-trippable YAML', () => {
    const m = buildManifest(baseConfig);
    const yaml = renderYaml(m);
    const parsed = parse(yaml) as MailDnsManifest;
    expect(parsed.version).toBe(1);
    expect(parsed.relaySpfDomain).toBe('_spf.relay.trinity.agency');
    expect(parsed.domains[0]!.domain).toBe('ozean-licht.com');
  });

  it('ships a sane default config for ozean-licht.com', () => {
    expect(DEFAULT_CONFIG.domains).toContain('ozean-licht.com');
    expect(DEFAULT_CONFIG.relaySpfDomain).not.toMatch(/\d{1,3}(\.\d{1,3}){3}/);
    expect(() => buildManifest(DEFAULT_CONFIG)).not.toThrow();
  });
});
