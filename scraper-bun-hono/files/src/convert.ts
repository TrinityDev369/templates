import { NodeHtmlMarkdown } from 'node-html-markdown';

const nhm = new NodeHtmlMarkdown({
  keepDataImages: false,
  useLinkReferenceDefinitions: false,
});

export interface ConvertResult {
  markdown: string;
  title: string | null;
}

export function htmlToMarkdown(html: string): ConvertResult {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const markdown = nhm.translate(html);
  return { markdown, title };
}
