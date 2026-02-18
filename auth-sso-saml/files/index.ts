/**
 * SAML SSO Module
 *
 * Enterprise SAML Single Sign-On integration for Next.js applications.
 *
 * @example
 * ```ts
 * import {
 *   createSAMLConfig,
 *   initiateSSO,
 *   handleCallback,
 *   withSAML,
 *   requireSAML,
 * } from '@/modules/auth-sso-saml';
 *
 * // 1. Create config (reads env vars automatically)
 * const config = createSAMLConfig();
 *
 * // 2. Protect routes with middleware
 * export default withSAML(config);
 *
 * // 3. Or wrap individual API handlers
 * export const GET = requireSAML(config, async (req, session) => { ... });
 * ```
 */

// Types
export type {
  SAMLConfig,
  SAMLUser,
  SAMLAssertion,
  SAMLSession,
  AttributeMapping,
} from './types';

// Configuration
export {
  createSAMLConfig,
  generateSPMetadata,
  DEFAULT_ATTRIBUTE_MAPPINGS,
} from './saml-config';

// Core SAML handlers
export {
  initiateSSO,
  handleCallback,
  handleLogout,
  validateSignature,
} from './saml-handler';

// Next.js middleware integration
export {
  withSAML,
  requireSAML,
} from './middleware';
