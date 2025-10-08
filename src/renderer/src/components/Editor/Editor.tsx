// src/renderer/src/components/Editor/Editor.tsx
// Purpose: Main text editor component with Tiptap integration

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '../../context/useSession';
import { createEditorConfig } from './editorConfig';
import { useDebounce } from '../../hooks/useDebounce';
import { getWordCount } from '../../utils/wordCount';
import styles from './Editor.module.css';
import 'prosemirror-view/style/prosemirror.css';

export const Editor = () => {
  const { activeSession, updateSession, addSession } = useSession();
  const [wordCount, setWordCount] = useState(0);

  // Get current session content or default to empty
  const currentContent = useMemo(() => {
    return activeSession?.content || '';
  }, [activeSession?.content]);

  // Debounced session update (1 second delay)
  const debouncedUpdateSession = useDebounce(
    useCallback((...args: unknown[]) => {
      const content = args[0] as string;
      if (activeSession) {
        updateSession({
          ...activeSession,
          content,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new session if none exists
        const newSession = {
          id: globalThis.crypto.randomUUID(),
          title: 'Untitled Session',
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          goalType: 'word' as const,
          goalValue: 500,
        };
        addSession(newSession);
      }
    }, [activeSession, updateSession, addSession]),
    1000 // 1 second delay
  );

  // Handle real-time updates (immediate word count, debounced session update)
  const handleUpdate = useCallback((content: string, text: string) => {
    // Update word count immediately (no lag)
    const count = getWordCount(text);
    setWordCount(count);

    // Debounce session update
    debouncedUpdateSession(content);
  }, [debouncedUpdateSession]);

  // Handle save action
  const handleSave = useCallback(() => {
    console.log('Save triggered');
    // Additional save logic can be added here
  }, []);

  // Handle end action
  const handleEnd = useCallback(() => {
    console.log('End session triggered');
    // Additional end session logic can be added here
  }, []);

  // Initialize Tiptap editor
  const editor = useEditor(
    createEditorConfig({
      placeholder: 'Start writing your thoughts...',
      content: currentContent,
      onUpdate: handleUpdate,
      onSave: handleSave,
      onEnd: handleEnd,
    }),
    [currentContent]
  );

  // Update editor content when active session changes (only when switching sessions)
  useEffect(() => {
    if (editor && !editor.isFocused) {
      editor.commands.setContent(currentContent, { emitUpdate: false });
    }
  }, [editor, currentContent, activeSession?.id]); // Include dependencies

  // Initialize word count from current content
  useEffect(() => {
    if (editor && currentContent) {
      const text = editor.getText();
      setWordCount(getWordCount(text));
    }
  }, [editor, currentContent]);

  // Focus editor on mount (only if no content exists)
  useEffect(() => {
    if (editor && !currentContent) {
      editor.commands.focus();
    }
  }, [editor, currentContent]);

  if (!editor) {
    return (
      <div className={styles.editor}>
        <div className={styles.editorContent}>
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      {/* Word count display */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-sm text-gray-400">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </div>
        <div className="text-xs text-gray-500">
          Cmd+S to save • Cmd+Q to end
        </div>
      </div>

      <div className={styles.editorContent}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
