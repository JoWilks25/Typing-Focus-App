import type { EditorJson } from '@shared/tiptapTypes';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Extract plain text from TipTap JSON
 */
function extractTextFromJson(json: EditorJson): string {
  const extractText = (node: EditorJson): string => {
    if (node.text) {
      return node.text;
    }
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }
    return '';
  };
  return extractText(json).trim();
}

/**
 * Convert TipTap JSON to DOCX Buffer
 */
export async function convertJsonToDocx(json: EditorJson): Promise<Buffer> {
  const convertNode = (node: EditorJson): any[] => {
    const result: any[] = [];

    if (node.type === 'paragraph') {
      const runs: TextRun[] = [];

      if (node.content) {
        for (const child of node.content) {
          if (child.type === 'text') {
            const textRun = new TextRun({
              text: child.text || '',
              bold: child.marks?.some(m => m.type === 'bold'),
              italics: child.marks?.some(m => m.type === 'italic'),
              underline: child.marks?.some(m => m.type === 'underline'),
            });
            runs.push(textRun);
          }
        }
      }

      result.push(new Paragraph({ children: runs }));
    } else if (node.type === 'heading') {
      const level = node.attrs?.level || 1;
      const text = extractTextFromJson(node);
      const headingLevels = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
        HeadingLevel.HEADING_5,
        HeadingLevel.HEADING_6,
      ];

      result.push(
        new Paragraph({
          text,
          heading: headingLevels[Math.min(level - 1, 5)],
        })
      );
    } else if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        result.push(...convertNode(child));
      }
    }

    return result;
  };

  const children: any[] = [];
  if (json.content) {
    for (const node of json.content) {
      children.push(...convertNode(node));
    }
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}