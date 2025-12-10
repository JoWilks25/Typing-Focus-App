import type { EditorJson } from '@shared/tiptapTypes';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TurndownService from 'turndown';

/**
 * Convert TipTap JSON to HTML, then to Markdown
 */
export async function convertJsonToMarkdown(json: EditorJson): Promise<string> {
  // Create a temporary editor instance to get HTML
  const editor = new Editor({
    extensions: [StarterKit, TextAlign],
    content: json,
  });

  const html = editor.getHTML();
  editor.destroy();

  // Convert HTML to Markdown
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  return turndownService.turndown(html);
}

/**
 * Convert TipTap JSON to HTML
 */
export async function convertJsonToHtml(json: EditorJson): Promise<string> {
  // Create a temporary editor instance to get HTML
  const editor = new Editor({
    extensions: [StarterKit, TextAlign],
    content: json,
  });

  const html = editor.getHTML();
  editor.destroy();

  return html;
}

/**
 * Convert TipTap JSON to plain text
 */
export async function convertJsonToText(json: EditorJson): Promise<string> {
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