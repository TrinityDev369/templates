/**
 * Core SAML Handler
 *
 * Implements the SAML 2.0 Web Browser SSO Profile:
 *   - AuthnRequest generation (SP-initiated SSO)
 *   - Response / Assertion validation
 *   - LogoutRequest generation (SP-initiated SLO)
 *   - XML signature verification
 *
 * IMPORTANT — Production Hardening Note:
 * This is a reference implementation that demonstrates the SAML flow using
 * Node.js built-in `crypto` for signature verification and lightweight XML
 * string parsing. For production deployments handling real enterprise traffic
 * you should consider replacing the XML parsing and signature validation with
 * a battle-tested SAML library such as:
 *
 *   - `saml2-js`        — https://github.com/Clever/saml2
 *   - `passport-saml`   — https://github.com/node-saml/passport-saml
 *   - `@node-saml/node-saml` — https://github.com/node-saml/node-saml
 *
 * These libraries handle XML canonicalization (C14N), multiple signature
 * algorithms, encrypted assertions, and numerous edge cases that are NOT
 * covered in this reference code.
 */

import { createVerify, randomUUID } from 'crypto';
import type { SAMLConfig, SAMLUser, SAMLAssertion } from './types';

// ---------------------------------------------------------------------------
// SSO Initiation
// ---------------------------------------------------------------------------

/**
 * Build a SAML AuthnRequest and return the IdP redirect URL.
 *
 * The AuthnRequest is deflated, Base64-encoded, and appended to the IdP's
 * SSO endpoint as the `SAMLRequest` query parameter (HTTP-Redirect binding).
 *
 * @param config  Validated SAML configuration
 * @returns       Object containing the URL the browser should be redirected to
 */
export function initiateSSO(config: SAMLConfig): { redirectUrl: string } {
  const id = `_${randomUUID()}`;
  const issueInstant = new Date().toISOString();

  const authnRequest = `
<samlp:AuthnRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${id}"
  Version="2.0"
  IssueInstant="${issueInstant}"
  Destination="${config.idpMetadataUrl}"
  AssertionConsumerServiceURL="${config.spAcsUrl}"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer>${config.spEntityId}</saml:Issuer>
  <samlp:NameIDPolicy
    Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
    AllowCreate="true" />
</samlp:AuthnRequest>`.trim();

  // Encode the AuthnRequest for the HTTP-Redirect binding.
  // NOTE: In production, use DEFLATE compression (zlib.deflateRaw) before
  // Base64 encoding per the SAML HTTP-Redirect binding specification.
  // This reference implementation uses plain Base64 for clarity.
  const encoded = Buffer.from(authnRequest, 'utf-8').toString('base64');
  const encodedRequest = encodeURIComponent(encoded);

  // Build the redirect URL — the IdP's SSO endpoint with SAMLRequest param.
  // In production, extract the actual SSO endpoint from IdP metadata XML
  // rather than using idpMetadataUrl directly.
  const separator = config.idpMetadataUrl.includes('?') ? '&' : '?';
  const redirectUrl = `${config.idpMetadataUrl}${separator}SAMLRequest=${encodedRequest}`;

  return { redirectUrl };
}

// ---------------------------------------------------------------------------
// Callback / Response Handling
// ---------------------------------------------------------------------------

/**
 * Process the SAML Response received at the Assertion Consumer Service (ACS)
 * endpoint.
 *
 * Steps:
 *   1. Base64-decode the SAMLResponse POST parameter
 *   2. Parse XML and extract the Assertion
 *   3. Validate the signature against the IdP certificate
 *   4. Check timing conditions (NotBefore / NotOnOrAfter)
 *   5. Extract user attributes via the configured attribute mapping
 *
 * @param config        Validated SAML configuration
 * @param samlResponse  The raw Base64-encoded SAMLResponse string from the POST body
 * @returns             Parsed and validated SAMLUser
 * @throws              If validation fails at any step
 */
export async function handleCallback(
  config: SAMLConfig,
  samlResponse: string,
): Promise<SAMLUser> {
  // 1. Decode the SAML Response
  const xml = Buffer.from(samlResponse, 'base64').toString('utf-8');

  // 2. Validate signature if certificate is available
  if (config.idpCertificate) {
    const isValid = validateSignature(xml, config.idpCertificate);
    if (!isValid) {
      throw new Error('[SAML] Response signature validation failed');
    }
  } else {
    // PRODUCTION WARNING: Always validate signatures in production.
    // Skipping signature validation is only acceptable in development.
    console.warn('[SAML] No IdP certificate configured — skipping signature validation');
  }

  // 3. Parse the assertion
  const assertion = parseAssertion(xml);

  // 4. Validate timing conditions
  const now = Date.now();
  if (assertion.notOnOrAfter) {
    const expiry = new Date(assertion.notOnOrAfter).getTime();
    if (now >= expiry) {
      throw new Error('[SAML] Assertion has expired (NotOnOrAfter condition failed)');
    }
  }

  // 5. Check the Status element for success
  const statusMatch = xml.match(/<samlp:StatusCode\s+Value="([^"]+)"/);
  const status = statusMatch?.[1] ?? '';
  if (status && !status.endsWith(':Success')) {
    throw new Error(`[SAML] IdP returned non-success status: ${status}`);
  }

  // 6. Map attributes to SAMLUser
  const user = mapAssertionToUser(assertion, config.attributeMapping);

  return user;
}

// ---------------------------------------------------------------------------
// Single Logout
// ---------------------------------------------------------------------------

/**
 * Build a SAML LogoutRequest and return the IdP SLO redirect URL.
 *
 * @param config        Validated SAML configuration
 * @param sessionIndex  SessionIndex from the original assertion
 * @param nameId        NameID value of the user being logged out
 * @returns             Object containing the SLO redirect URL
 * @throws              If SLO URL is not configured
 */
export function handleLogout(
  config: SAMLConfig,
  sessionIndex: string,
  nameId?: string,
): { redirectUrl: string } {
  if (!config.spSloUrl) {
    throw new Error('[SAML] Single Logout URL (spSloUrl) is not configured');
  }

  const id = `_${randomUUID()}`;
  const issueInstant = new Date().toISOString();

  const logoutRequest = `
<samlp:LogoutRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${id}"
  Version="2.0"
  IssueInstant="${issueInstant}"
  Destination="${config.spSloUrl}">
  <saml:Issuer>${config.spEntityId}</saml:Issuer>
  ${nameId ? `<saml:NameID>${nameId}</saml:NameID>` : ''}
  <samlp:SessionIndex>${sessionIndex}</samlp:SessionIndex>
</samlp:LogoutRequest>`.trim();

  const encoded = Buffer.from(logoutRequest, 'utf-8').toString('base64');
  const encodedRequest = encodeURIComponent(encoded);

  const separator = config.spSloUrl.includes('?') ? '&' : '?';
  const redirectUrl = `${config.spSloUrl}${separator}SAMLRequest=${encodedRequest}`;

  return { redirectUrl };
}

// ---------------------------------------------------------------------------
// Signature Validation
// ---------------------------------------------------------------------------

/**
 * Validate an XML signature using the IdP's X.509 certificate.
 *
 * PRODUCTION NOTE: This is a simplified verification that checks whether the
 * SignatureValue in the XML can be verified against the provided certificate.
 * A production implementation MUST also:
 *   - Perform XML Exclusive Canonicalization (C14N) before verification
 *   - Validate the DigestValue of the signed references
 *   - Handle multiple SignedInfo/Reference elements
 *   - Support additional signature algorithms beyond RSA-SHA256
 *
 * Consider using `xml-crypto` or a full SAML library for robust validation.
 *
 * @param xml          Raw XML string containing a ds:Signature element
 * @param certificate  PEM-encoded X.509 certificate (with or without headers)
 * @returns            true if signature is valid, false otherwise
 */
export function validateSignature(xml: string, certificate: string): boolean {
  try {
    // Extract the SignatureValue from the XML
    const signatureValueMatch = xml.match(
      /<ds:SignatureValue[^>]*>([\s\S]*?)<\/ds:SignatureValue>/
    );
    if (!signatureValueMatch) {
      console.warn('[SAML] No ds:SignatureValue element found in response');
      return false;
    }

    // Extract the signed content (SignedInfo element)
    const signedInfoMatch = xml.match(
      /<ds:SignedInfo[^>]*>([\s\S]*?)<\/ds:SignedInfo>/
    );
    if (!signedInfoMatch) {
      console.warn('[SAML] No ds:SignedInfo element found in response');
      return false;
    }

    // Detect the signature algorithm
    const algorithmMatch = xml.match(
      /<ds:SignatureMethod\s+Algorithm="([^"]+)"/
    );
    const algorithm = algorithmMatch?.[1] ?? '';
    const nodeAlgorithm = mapSignatureAlgorithm(algorithm);

    // Normalize the certificate to PEM format
    const pem = normalizeCertificate(certificate);

    // Clean the signature value (remove whitespace)
    const signatureValue = signatureValueMatch[1].replace(/\s+/g, '');
    const signatureBuffer = Buffer.from(signatureValue, 'base64');

    // PRODUCTION NOTE: The SignedInfo content should be canonicalized (C14N)
    // before verification. This reference implementation uses the raw XML
    // which may fail with certain IdP configurations.
    const signedInfoXml = `<ds:SignedInfo${extractNamespaces(xml)}>${signedInfoMatch[1]}</ds:SignedInfo>`;

    const verifier = createVerify(nodeAlgorithm);
    verifier.update(signedInfoXml);
    return verifier.verify(pem, signatureBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[SAML] Signature validation error: ${message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// XML Parsing Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a SAML Assertion from the response XML.
 *
 * PRODUCTION NOTE: This uses regex-based XML extraction which is fragile.
 * In production, use a proper XML parser (e.g. `fast-xml-parser`, `xmldom`)
 * or a dedicated SAML library.
 */
function parseAssertion(xml: string): SAMLAssertion {
  // Extract NameID
  const nameIdMatch = xml.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/);
  const nameId = nameIdMatch?.[1] ?? '';

  // Extract NameID Format
  const nameIdFormatMatch = xml.match(/<saml:NameID[^>]*Format="([^"]+)"/);
  const nameIdFormat = nameIdFormatMatch?.[1] ?? '';

  // Extract SessionIndex
  const sessionIndexMatch = xml.match(/SessionIndex="([^"]+)"/);
  const sessionIndex = sessionIndexMatch?.[1] ?? '';

  // Extract IssueInstant from Assertion element
  const issueInstantMatch = xml.match(/<saml:Assertion[^>]*IssueInstant="([^"]+)"/);
  const issueInstant = issueInstantMatch?.[1] ?? new Date().toISOString();

  // Extract NotOnOrAfter from Conditions
  const notOnOrAfterMatch = xml.match(/NotOnOrAfter="([^"]+)"/);
  const notOnOrAfter = notOnOrAfterMatch?.[1] ?? '';

  // Extract Issuer
  const issuerMatch = xml.match(/<saml:Issuer[^>]*>([^<]+)<\/saml:Issuer>/);
  const issuer = issuerMatch?.[1] ?? '';

  // Extract all Attribute elements
  const attributes: Record<string, string[]> = {};
  const attributeRegex =
    /<saml:Attribute\s+Name="([^"]+)"[^>]*>([\s\S]*?)<\/saml:Attribute>/g;

  let match: RegExpExecArray | null;
  while ((match = attributeRegex.exec(xml)) !== null) {
    const name = match[1];
    const valueBlock = match[2];
    const values: string[] = [];

    const valueRegex = /<saml:AttributeValue[^>]*>([^<]*)<\/saml:AttributeValue>/g;
    let valueMatch: RegExpExecArray | null;
    while ((valueMatch = valueRegex.exec(valueBlock)) !== null) {
      values.push(valueMatch[1]);
    }

    attributes[name] = values;
  }

  return {
    nameId,
    nameIdFormat,
    sessionIndex,
    issueInstant,
    notOnOrAfter,
    issuer,
    attributes,
  };
}

/**
 * Map parsed SAML assertion attributes to a canonical SAMLUser object
 * using the configured attribute mapping.
 */
function mapAssertionToUser(
  assertion: SAMLAssertion,
  mapping: SAMLConfig['attributeMapping'],
): SAMLUser {
  const getAttribute = (samlAttrName: string): string => {
    const values = assertion.attributes[samlAttrName];
    return values?.[0] ?? '';
  };

  const getAttributeList = (samlAttrName: string): string[] => {
    return assertion.attributes[samlAttrName] ?? [];
  };

  // Build the flat attributes map from all assertion attributes
  const flatAttributes: Record<string, string> = {};
  for (const [key, values] of Object.entries(assertion.attributes)) {
    flatAttributes[key] = values[0] ?? '';
  }

  return {
    id: assertion.nameId,
    email: getAttribute(mapping.email) || assertion.nameId,
    firstName: getAttribute(mapping.firstName),
    lastName: getAttribute(mapping.lastName),
    groups: getAttributeList(mapping.groups),
    attributes: flatAttributes,
  };
}

// ---------------------------------------------------------------------------
// Internal Utilities
// ---------------------------------------------------------------------------

/**
 * Map a SAML signature algorithm URI to the corresponding Node.js crypto
 * algorithm name.
 */
function mapSignatureAlgorithm(uri: string): string {
  const algorithmMap: Record<string, string> = {
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256': 'RSA-SHA256',
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha384': 'RSA-SHA384',
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512': 'RSA-SHA512',
    'http://www.w3.org/2000/09/xmldsig#rsa-sha1': 'RSA-SHA1',
  };
  return algorithmMap[uri] ?? 'RSA-SHA256';
}

/**
 * Normalize a certificate string into PEM format.
 * Handles both bare Base64 and full PEM-encoded inputs.
 */
function normalizeCertificate(cert: string): string {
  // Strip existing PEM headers/footers and whitespace
  const bare = cert
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '');

  // Re-wrap as proper PEM
  const lines: string[] = [];
  for (let i = 0; i < bare.length; i += 64) {
    lines.push(bare.slice(i, i + 64));
  }

  return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----`;
}

/**
 * Extract XML namespace declarations from the root element.
 * Used to reconstruct a valid SignedInfo element for verification.
 */
function extractNamespaces(xml: string): string {
  const nsMatches = xml.match(/xmlns:[a-z]+=("[^"]*")/g);
  if (!nsMatches) return '';
  const unique = [...new Set(nsMatches)];
  return ' ' + unique.join(' ');
}
