import { describe, expect, it } from 'vitest';
import { htmlToText } from '../lib/plaintext';

describe('htmlToText', () => {
  it('strips tags and collapses whitespace', () => {
    expect(htmlToText('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('keeps link URLs as "label (href)"', () => {
    expect(htmlToText('<a href="https://x.dev/verify">Verify</a>')).toBe('Verify (https://x.dev/verify)');
  });

  it('returns a bare URL when label equals href', () => {
    expect(htmlToText('<a href="https://x.dev">https://x.dev</a>')).toBe('https://x.dev');
  });

  it('turns block boundaries and <br> into newlines', () => {
    expect(htmlToText('<p>one</p><p>two</p>')).toBe('one\ntwo');
    expect(htmlToText('a<br>b')).toBe('a\nb');
  });

  it('decodes common entities and drops style/script', () => {
    expect(htmlToText('<style>.x{}</style><p>A &amp; B&nbsp;C</p>')).toBe('A & B C');
  });
});
