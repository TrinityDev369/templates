/**
 * Zero-dependency Markdown renderer for chatbot assistant messages.
 *
 * Parses a markdown string into React elements without using
 * dangerouslySetInnerHTML. Handles Claude's typical output:
 * bold, italic, inline code, code blocks, lists (ordered/unordered/nested),
 * links, headings (h2/h3), horizontal rules, and paragraphs.
 *
 * Streaming-safe: incomplete markdown tokens (e.g. unclosed `**`)
 * render literally rather than breaking the UI.
 *
 * Wrapped in React.memo to avoid re-parsing unchanged content during
 * streaming updates to sibling messages.
 */

import React, { memo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarkdownProps {
  content: string;
  className?: string;
}

/** A parsed block-level token. */
type Block =
  | { type: 'code'; lang: string; body: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'hr' }
  | { type: 'ul'; items: ListItem[] }
  | { type: 'ol'; items: ListItem[] }
  | { type: 'paragraph'; text: string };

/** A list item that may contain nested sub-items. */
interface ListItem {
  text: string;
  children: ListItem[];
  ordered: boolean;
}

// ---------------------------------------------------------------------------
// Inline parser — converts inline markdown to React nodes
// ---------------------------------------------------------------------------

/**
 * Tokenize inline markdown and return an array of React nodes.
 *
 * Processing order matters to avoid conflicts:
 *   1. Inline code (backtick) — highest priority, prevents inner parsing
 *   2. Links [text](url)
 *   3. Bold **text** / __text__
 *   4. Italic *text* / _text_
 *
 * The regex uses a non-greedy approach so streaming partial tokens
 * (e.g. `**hello` without closing) fall through to literal text.
 */
function parseInline(text: string): React.ReactNode[] {
  // The combined pattern matches tokens in priority order.
  // Groups:
  //   1 = inline code content
  //   2 = link text, 3 = link url
  //   4 = bold content (** delimited)
  //   5 = bold content (__ delimited)
  //   6 = italic content (* delimited, but not **)
  //   7 = italic content (_ delimited, but not __)
  const pattern =
    /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|__(.+?)__|\*(?!\*)(.+?)\*(?!\*)|(?<![_\w])_(?!_)(.+?)_(?![_\w])/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Push any text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      // Inline code
      nodes.push(
        React.createElement('code', { key: `c${keyIdx++}` }, match[1])
      );
    } else if (match[2] !== undefined && match[3] !== undefined) {
      // Link
      nodes.push(
        React.createElement(
          'a',
          {
            key: `a${keyIdx++}`,
            href: match[3],
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          match[2]
        )
      );
    } else if (match[4] !== undefined) {
      // Bold **
      nodes.push(
        React.createElement(
          'strong',
          { key: `b${keyIdx++}` },
          ...parseInline(match[4])
        )
      );
    } else if (match[5] !== undefined) {
      // Bold __
      nodes.push(
        React.createElement(
          'strong',
          { key: `b${keyIdx++}` },
          ...parseInline(match[5])
        )
      );
    } else if (match[6] !== undefined) {
      // Italic *
      nodes.push(
        React.createElement(
          'em',
          { key: `i${keyIdx++}` },
          ...parseInline(match[6])
        )
      );
    } else if (match[7] !== undefined) {
      // Italic _
      nodes.push(
        React.createElement(
          'em',
          { key: `i${keyIdx++}` },
          ...parseInline(match[7])
        )
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Block parser — splits raw markdown into block-level tokens
// ---------------------------------------------------------------------------

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // --- Fenced code block ---
    const codeMatch = line.match(/^```(\w*)\s*$/);
    if (codeMatch) {
      const lang = codeMatch[1] || '';
      const bodyLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        bodyLines.push(lines[i]);
        i++;
      }
      // Skip closing ``` if present
      if (i < lines.length) i++;
      blocks.push({ type: 'code', lang, body: bodyLines.join('\n') });
      continue;
    }

    // --- Horizontal rule ---
    if (/^---+\s*$/.test(line) || /^\*\*\*+\s*$/.test(line) || /^___+\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // --- Heading ---
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3;
      blocks.push({ type: 'heading', level, text: headingMatch[2] });
      i++;
      continue;
    }

    // --- List (unordered or ordered) ---
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      const ordered = !!olMatch;
      const listItems: ListItem[] = [];
      // Collect all consecutive list lines (any mix of ul/ol for nesting)
      const listLines: { indent: number; text: string; ordered: boolean }[] = [];

      while (i < lines.length) {
        const ulM = lines[i].match(/^(\s*)[-*]\s+(.*)$/);
        const olM = lines[i].match(/^(\s*)\d+\.\s+(.*)$/);
        if (ulM) {
          listLines.push({ indent: ulM[1].length, text: ulM[2], ordered: false });
          i++;
        } else if (olM) {
          listLines.push({ indent: olM[1].length, text: olM[2], ordered: true });
          i++;
        } else {
          break;
        }
      }

      // Build nested structure from flat indent-based list
      function buildNested(
        items: { indent: number; text: string; ordered: boolean }[],
        startIdx: number,
        baseIndent: number
      ): { parsed: ListItem[]; nextIdx: number } {
        const result: ListItem[] = [];
        let idx = startIdx;

        while (idx < items.length) {
          const item = items[idx];
          if (item.indent < baseIndent) {
            // Dedented — return to parent
            break;
          }
          if (item.indent === baseIndent) {
            const li: ListItem = { text: item.text, children: [], ordered: item.ordered };
            idx++;
            // Check for nested children
            if (idx < items.length && items[idx].indent > baseIndent) {
              const nested = buildNested(items, idx, items[idx].indent);
              li.children = nested.parsed;
              idx = nested.nextIdx;
            }
            result.push(li);
          } else {
            // Indent greater than base but we didn't expect it — treat as child
            const nested = buildNested(items, idx, item.indent);
            if (result.length > 0) {
              result[result.length - 1].children.push(...nested.parsed);
            } else {
              result.push(...nested.parsed);
            }
            idx = nested.nextIdx;
          }
        }

        return { parsed: result, nextIdx: idx };
      }

      const baseIndent = listLines.length > 0 ? listLines[0].indent : 0;
      const { parsed } = buildNested(listLines, 0, baseIndent);

      blocks.push({ type: ordered ? 'ol' : 'ul', items: parsed });
      continue;
    }

    // --- Empty line (skip) ---
    if (line.trim() === '') {
      i++;
      continue;
    }

    // --- Paragraph (collect contiguous non-empty, non-special lines) ---
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      // Stop at block-level constructs
      if (
        l.trim() === '' ||
        /^```/.test(l) ||
        /^#{2,3}\s+/.test(l) ||
        /^---+\s*$/.test(l) ||
        /^\*\*\*+\s*$/.test(l) ||
        /^___+\s*$/.test(l) ||
        /^\s*[-*]\s+/.test(l) ||
        /^\s*\d+\.\s+/.test(l)
      ) {
        break;
      }
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n') });
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// React renderers — convert block tokens into elements
// ---------------------------------------------------------------------------

function renderListItem(item: ListItem, index: number): React.ReactElement {
  const content = parseInline(item.text);
  const children: React.ReactNode[] = [...content];

  if (item.children.length > 0) {
    // Determine sub-list type from the first child's `ordered` flag
    const subOrdered = item.children[0].ordered;
    const subTag = subOrdered ? 'ol' : 'ul';
    children.push(
      React.createElement(
        subTag,
        { key: `sub-${index}` },
        item.children.map((child, ci) => renderListItem(child, ci))
      )
    );
  }

  return React.createElement('li', { key: index }, ...children);
}

function renderBlock(block: Block, index: number): React.ReactElement {
  switch (block.type) {
    case 'code':
      return React.createElement(
        'pre',
        { key: index },
        React.createElement(
          'code',
          block.lang ? { className: `language-${block.lang}` } : undefined,
          block.body
        )
      );

    case 'heading':
      return React.createElement(
        `h${block.level}`,
        { key: index },
        ...parseInline(block.text)
      );

    case 'hr':
      return React.createElement('hr', { key: index });

    case 'ul':
      return React.createElement(
        'ul',
        { key: index },
        block.items.map((item, i) => renderListItem(item, i))
      );

    case 'ol':
      return React.createElement(
        'ol',
        { key: index },
        block.items.map((item, i) => renderListItem(item, i))
      );

    case 'paragraph': {
      // Within a paragraph, single newlines become <br>
      const segments = block.text.split('\n');
      const nodes: React.ReactNode[] = [];
      segments.forEach((seg, si) => {
        if (si > 0) {
          nodes.push(React.createElement('br', { key: `br-${index}-${si}` }));
        }
        nodes.push(...parseInline(seg));
      });
      return React.createElement('p', { key: index }, ...nodes);
    }
  }
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

export const Markdown = memo(function Markdown({
  content,
  className,
}: MarkdownProps): JSX.Element {
  const blocks = parseBlocks(content);
  const classNames = ['chatbot-markdown', className].filter(Boolean).join(' ');

  return React.createElement(
    'div',
    { className: classNames },
    blocks.map((block, i) => renderBlock(block, i))
  );
});
