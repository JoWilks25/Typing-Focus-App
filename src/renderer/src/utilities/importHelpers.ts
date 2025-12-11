import type { EditorJson } from '@shared/tiptapTypes';

export const stripExtension = (filePath: string): string => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.dt.json')) {
    return filePath.slice(0, -8);
  }
  const lastDot = filePath.lastIndexOf('.');
  return lastDot === -1 ? filePath : filePath.slice(0, lastDot);
};

export const normalizeNewlines = (text: string): string => text.replace(/\r\n/g, '\n');

const parseInline = (text: string): EditorJson[] => {
  const nodes: EditorJson[] = [];
  let remaining = text;
  const tokenRegex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/;

  while (remaining.length) {
    const match = remaining.match(tokenRegex);
    if (!match || match.index === undefined) {
      nodes.push({ type: 'text', text: remaining });
      break;
    }

    const [token] = match;
    const before = remaining.slice(0, match.index);
    if (before) {
      nodes.push({ type: 'text', text: before });
    }

    const isBold = token.startsWith('**');
    const isInlineCode = token.startsWith('`');
    const cleanText = isBold
      ? token.slice(2, -2)
      : isInlineCode
        ? token.slice(1, -1)
        : token.slice(1, -1);

    const marks =
      isInlineCode
        ? [{ type: 'code' }]
        : isBold
          ? [{ type: 'bold' }]
          : [{ type: 'italic' }];

    nodes.push({
      type: 'text',
      text: cleanText,
      marks,
    });

    remaining = remaining.slice(match.index + token.length);
  }

  return nodes.length ? nodes : [{ type: 'text', text }];
};

const toParagraph = (text: string): EditorJson => ({
  type: 'paragraph',
  content: parseInline(text.trim()),
});

export const convertTextToDoc = (raw: string): EditorJson => {
  const normalized = normalizeNewlines(raw);
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(toParagraph);

  return {
    type: 'doc',
    content: paragraphs.length ? paragraphs : [toParagraph(normalized.trim())],
  };
};

export const convertMarkdownToDoc = (raw: string): EditorJson => {
  const lines = normalizeNewlines(raw).split('\n');
  const content: EditorJson[] = [];
  let i = 0;

  while (i < lines.length) {
    const current = lines[i];
    const trimmed = current.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) {
        i += 1; // skip closing ```
      }
      content.push({
        type: 'codeBlock',
        content: [{ type: 'text', text: codeLines.join('\n') }],
      });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      content.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: parseInline(headingMatch[2].trim()),
      });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: EditorJson[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, '');
        items.push({
          type: 'listItem',
          content: [toParagraph(itemText)],
        });
        i += 1;
      }
      content.push({ type: 'bulletList', content: items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: EditorJson[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
        items.push({
          type: 'listItem',
          content: [toParagraph(itemText)],
        });
        i += 1;
      }
      content.push({ type: 'orderedList', content: items });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```')
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    const paragraphText = paraLines.join(' ');
    content.push(toParagraph(paragraphText));
  }

  return {
    type: 'doc',
    content: content.length ? content : [toParagraph(raw.trim())],
  };
};

const extractTextFromDoc = (node: EditorJson): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  const content = (node as any).content;
  const text = (node as any).text ? String((node as any).text) : '';
  if (Array.isArray(content)) {
    return [text, content.map((child: EditorJson) => extractTextFromDoc(child)).join(' ')]
      .filter(Boolean)
      .join(' ')
      .trim();
  }
  return text.trim();
};

export const countWordsFromDoc = (doc: EditorJson): number => {
  const text = extractTextFromDoc(doc);
  return text.trim().split(/\s+/).filter(Boolean).length;
};
