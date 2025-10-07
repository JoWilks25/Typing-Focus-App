// src/renderer/src/components/Editor/editorConfig.ts
// Purpose: Tiptap editor configuration for plain text editing

import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HardBreak from '@tiptap/extension-hard-break';

export interface EditorConfigOptions {
  placeholder?: string;
  content?: string;
  onUpdate?: (content: string, text: string) => void;
  onSave?: () => void;
  onEnd?: () => void;
}

export const createEditorConfig = (options: EditorConfigOptions = {}) => {
  const { placeholder = 'Start writing...', content = '', onUpdate, onSave, onEnd } = options;

  return {
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onUpdate?.(html, text);
    },
    onKeyDown: ({ event }) => {
      // Cmd+S for save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        onSave?.();
        return true;
      }
      
      // Cmd+Q for end
      if ((event.metaKey || event.ctrlKey) && event.key === 'q') {
        event.preventDefault();
        onEnd?.();
        return true;
      }
      
      return false;
    },
    // Ensure proper cursor behavior
    parseOptions: {
      preserveWhitespace: 'full' as const,
    },
    // Disable automatic focus management that might interfere
    autofocus: false,
  };
};

export type EditorInstance = Editor;
