/**
 * SAML SSO Type Definitions
 *
 * Core interfaces for SAML authentication flow including configuration,
 * user representation, assertion parsing, and session management.
 */

// ---------------------------------------------------------------------------
// Attribute Mapping
// ---------------------------------------------------------------------------

/**
 * Maps SAML attribute names (as they arrive from the IdP) to canonical
 * user-facing field names. Keys are the target field, values are the SAML
 * attribute OID or friendly name.
 *
 * @example
 * ```ts
 * const mapping: AttributeMapping = {
 *   email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
 *   firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
 *   lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
 *   groups: 'http://schemas.xmlsoap.org/claims/Group',
 * };
 * ```
 */
export interface AttributeMapping {
  /** SAML attribute name that resolves to the user's email */
  email: string;
  /** SAML attribute name that resolves to the user's first / given name */
  firstName: string;
  /** SAML attribute name that resolves to the user's last / family name */
  lastName: string;
  /** SAML attribute name that resolves to group memberships (multi-value) */
  groups: string;
  /** Additional custom attribute mappings (target field -> SAML attribute) */
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// SAML Configuration
// ---------------------------------------------------------------------------

/**
 * Full configuration object for a SAML Service Provider (SP).
 *
 * Required fields: `idpMetadataUrl`, `spEntityId`, `spAcsUrl`.
 * Everything else has sensible defaults.
 */
export interface SAMLConfig {
  /** URL to fetch the Identity Provider's SAML metadata XML */
  idpMetadataUrl: string;

  /**
   * PEM-encoded X.509 certificate of the IdP used to verify assertion
   * signatures. When omitted, the certificate embedded in IdP metadata is
   * used (requires a metadata fetch at runtime).
   */
  idpCertificate: string;

  /** Unique entity identifier of this Service Provider (e.g. "https://app.example.com/saml") */
  spEntityId: string;

  /** Assertion Consumer Service URL — the POST endpoint that receives SAML responses */
  spAcsUrl: string;

  /** Single Logout URL (optional). If omitted, SLO is disabled. */
  spSloUrl: string;

  /** Mapping from SAML assertion attributes to user fields */
  attributeMapping: AttributeMapping;
}

// ---------------------------------------------------------------------------
// SAML User
// ---------------------------------------------------------------------------

/**
 * Canonical user record extracted from a validated SAML assertion.
 */
export interface SAMLUser {
  /** Opaque identifier — typically the NameID from the assertion */
  id: string;
  /** User's email address */
  email: string;
  /** First / given name */
  firstName: string;
  /** Last / family name */
  lastName: string;
  /** Group memberships reported by the IdP */
  groups: string[];
  /** All remaining attributes as a flat key-value map */
  attributes: Record<string, string>;
}

// ---------------------------------------------------------------------------
// SAML Assertion
// ---------------------------------------------------------------------------

/**
 * Raw parsed SAML assertion data, prior to mapping into `SAMLUser`.
 * Useful for debugging and audit logging.
 */
export interface SAMLAssertion {
  /** The NameID value from the assertion Subject */
  nameId: string;
  /** NameID format URI (e.g. "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress") */
  nameIdFormat: string;
  /** SessionIndex attribute of the AuthnStatement — needed for SLO */
  sessionIndex: string;
  /** ISO-8601 timestamp when the assertion was issued */
  issueInstant: string;
  /** ISO-8601 timestamp when the assertion expires (NotOnOrAfter) */
  notOnOrAfter: string;
  /** EntityID of the issuing IdP */
  issuer: string;
  /** All assertion attributes as key -> string[] */
  attributes: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// SAML Session
// ---------------------------------------------------------------------------

/**
 * Server-side session record stored in an encrypted cookie after successful
 * SAML authentication.
 */
export interface SAMLSession {
  /** The authenticated user */
  user: SAMLUser;
  /** SessionIndex from the SAML assertion (needed for SLO) */
  sessionIndex: string;
  /** NameID value (needed for SLO) */
  nameId: string;
  /** Unix timestamp (ms) when this session expires */
  expiresAt: number;
}
