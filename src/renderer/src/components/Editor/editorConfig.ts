// src/renderer/src/components/Editor/editorConfig.ts
// Purpose: Tiptap editor configuration for plain text editing

import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HardBreak from '@tiptap/extension-hard-break';
import { FocusEvent } from 'react';

export interface EditorConfigOptions {
  placeholder?: string;
  content?: string;
  onUpdate?: (content: string, text: string) => void;
  onEnd?: () => void;
  onFocus?: () => void;
  onBlur?: (event: FocusEvent) => void;
  editable?: boolean;
}

export const createEditorConfig = (options: EditorConfigOptions = {}) => {
  const { placeholder = 'Start writing...', content = '', onUpdate, onEnd, onFocus, onBlur, editable = true } = options;

  return {
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none',
        'data-placeholder': placeholder,
        style: 'outline: none !important; box-shadow: none !important; border: none !important;',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onUpdate?.(html, text);
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: ({ event }) => {
      onBlur?.(event);
    },
    onKeyDown: ({ event }) => {
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
