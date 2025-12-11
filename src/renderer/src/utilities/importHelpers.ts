import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { marked } from 'marked';
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

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const convertHtmlToDoc = (html: string): EditorJson => {
  const editor = new Editor({
    extensions: [StarterKit, TextAlign],
    content: html || '',
  });
  const json = editor.getJSON();
  editor.destroy();
  return json;
};

export const convertTextToDoc = (raw: string): EditorJson => {
  const normalized = normalizeNewlines(raw).trim();
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  const html = paragraphs.length
    ? paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')
    : `<p>${escapeHtml(normalized)}</p>`;

  return convertHtmlToDoc(html);
};

export const convertMarkdownToDoc = (raw: string): EditorJson => {
  const normalized = normalizeNewlines(raw);
  const html = marked.parse(normalized, { async: false });
  const htmlString = typeof html === 'string' ? html : '';
  return convertHtmlToDoc(htmlString);
};

export const convertDocxToDoc = (html: string): EditorJson => {
  return convertHtmlToDoc(html || '');
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
