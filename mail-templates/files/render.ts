/**
 * renderEmail — turn a React Email component into a multipart-ready pair.
 *
 * Renders TWICE: once to HTML, once to a plain-text alternative. The result is
 * exactly the shape `mail-client.send({ html, text })` consumes — every send
 * carries BOTH parts (plaintext-multipart is required for deliverability and
 * accessibility).
 *
 * Uses `render` from `@react-email/components` (the umbrella package re-exports
 * the renderer, so there is one peer dependency, not two).
 */
import * as React from 'react';
import { render } from '@react-email/components';

export interface RenderedEmail {
  /** Full HTML body (with doctype). */
  html: string;
  /** Plain-text alternative derived from the same component. */
  text: string;
}

/**
 * Render a React Email element to `{ html, text }`.
 *
 * @param component A React element (e.g. `<VerifyEmail ... />`).
 */
export async function renderEmail(
  component: React.ReactElement,
): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([
    render(component, { pretty: false }),
    render(component, { plainText: true }),
  ]);
  return { html, text };
}
