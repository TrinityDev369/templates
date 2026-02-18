/**
 * SAML Configuration Management
 *
 * Builds, validates, and manages SAML Service Provider configuration.
 * Reads secrets from environment variables — never hardcode credentials.
 *
 * Environment variables:
 *   SP_ENTITY_ID      — Unique entity ID of this SP (required)
 *   IDP_METADATA_URL  — URL to fetch IdP SAML metadata (required)
 *   IDP_CERTIFICATE   — PEM-encoded IdP X.509 certificate
 *   SP_ACS_URL        — Assertion Consumer Service URL (required)
 *   SP_SLO_URL        — Single Logout URL (optional)
 */

import type { SAMLConfig, AttributeMapping } from './types';

// ---------------------------------------------------------------------------
// Default Attribute Mappings for Common Identity Providers
// ---------------------------------------------------------------------------

/**
 * Pre-built attribute mappings for popular enterprise IdPs.
 *
 * Usage:
 * ```ts
 * const config = createSAMLConfig({
 *   attributeMapping: DEFAULT_ATTRIBUTE_MAPPINGS.azureAD,
 * });
 * ```
 */
export const DEFAULT_ATTRIBUTE_MAPPINGS: Record<string, AttributeMapping> = {
  /**
   * Okta — uses standard SAML attribute URIs by default.
   * https://developer.okta.com/docs/concepts/saml/
   */
  okta: {
    email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    groups: 'http://schemas.xmlsoap.org/claims/Group',
  },

  /**
   * Azure AD (Entra ID) — uses Microsoft-specific claim URIs.
   * https://learn.microsoft.com/en-us/entra/identity-platform/reference-saml-tokens
   */
  azureAD: {
    email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
  },

  /**
   * Google Workspace — uses simplified attribute names in SAML assertions.
   * https://support.google.com/a/answer/6087519
   */
  googleWorkspace: {
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    groups: 'groups',
  },
};

// ---------------------------------------------------------------------------
// Configuration Builder
// ---------------------------------------------------------------------------

/** Default attribute mapping when none is specified (Okta-compatible). */
const DEFAULT_MAPPING: AttributeMapping = DEFAULT_ATTRIBUTE_MAPPINGS.okta;

/**
 * Create a validated SAML configuration by merging provided options with
 * environment variable defaults.
 *
 * Required env vars: SP_ENTITY_ID, IDP_METADATA_URL, SP_ACS_URL
 *
 * @param options  Partial overrides — any field not supplied is read from env
 * @returns        Complete, validated SAMLConfig
 * @throws         If required fields are missing after merging env + options
 */
export function createSAMLConfig(options: Partial<SAMLConfig> = {}): SAMLConfig {
  const config: SAMLConfig = {
    idpMetadataUrl: options.idpMetadataUrl ?? process.env.IDP_METADATA_URL ?? '',
    idpCertificate: options.idpCertificate ?? process.env.IDP_CERTIFICATE ?? '',
    spEntityId: options.spEntityId ?? process.env.SP_ENTITY_ID ?? '',
    spAcsUrl: options.spAcsUrl ?? process.env.SP_ACS_URL ?? '',
    spSloUrl: options.spSloUrl ?? process.env.SP_SLO_URL ?? '',
    attributeMapping: options.attributeMapping ?? DEFAULT_MAPPING,
  };

  // Validate required fields
  const missing: string[] = [];
  if (!config.spEntityId) missing.push('spEntityId (or SP_ENTITY_ID env var)');
  if (!config.idpMetadataUrl) missing.push('idpMetadataUrl (or IDP_METADATA_URL env var)');
  if (!config.spAcsUrl) missing.push('spAcsUrl (or SP_ACS_URL env var)');

  if (missing.length > 0) {
    throw new Error(
      `[SAML] Missing required configuration:\n  - ${missing.join('\n  - ')}\n` +
      'Set the corresponding environment variables or pass them to createSAMLConfig().'
    );
  }

  return config;
}

// ---------------------------------------------------------------------------
// SP Metadata Generation
// ---------------------------------------------------------------------------

/**
 * Generate SAML Service Provider metadata XML.
 *
 * This XML document is typically served at a well-known endpoint
 * (e.g. `/api/saml/metadata`) so the IdP can configure the trust
 * relationship automatically.
 *
 * @param config  Validated SAML configuration
 * @returns       XML string suitable for serving as `application/xml`
 */
export function generateSPMetadata(config: SAMLConfig): string {
  const sloDescriptor = config.spSloUrl
    ? `
    <md:SingleLogoutService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
      Location="${escapeXml(config.spSloUrl)}" />`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor
  xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${escapeXml(config.spEntityId)}">
  <md:SPSSODescriptor
    AuthnRequestsSigned="true"
    WantAssertionsSigned="true"
    protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${escapeXml(config.spAcsUrl)}"
      index="0"
      isDefault="true" />${sloDescriptor}
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escape special XML characters to prevent injection in generated metadata.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
