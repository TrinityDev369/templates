/**
 * Trinity Mail — HTML → plain-text fallback.
 *
 * A multipart/alternative text part improves deliverability and accessibility.
 * Dependency-free on purpose. React Email templates (mail-templates) can supply
 * their own higher-fidelity text; this is the safety net when `text` is omitted.
 */

const BLOCK = /<\/(p|div|h[1-6]|li|tr|table|section|article|header|footer|blockquote)>/gi;
const BREAK = /<br\s*\/?>/gi;

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

/** Convert an HTML email body to a readable plain-text alternative. */
export function htmlToText(html: string): string {
  let out = html;

  // Links: keep "label (href)" so the URL survives in plain text.
  out = out.replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, '').trim();
      return text && text !== href ? `${text} (${href})` : href;
    },
  );

  out = out.replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, '');
  out = out.replace(BREAK, '\n');
  out = out.replace(BLOCK, '\n');
  out = out.replace(/<[^>]+>/g, ''); // strip remaining tags

  out = out.replace(/&#(\d+);/g, (_m, code: string) => String.fromCodePoint(Number(code)));
  for (const [entity, char] of Object.entries(ENTITIES)) {
    out = out.split(entity).join(char);
  }

  return out
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
