// src/renderer/src/components/Editor/Editor.tsx
// Purpose: Main text editor component with Tiptap integration

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '../../hooks/useSession';
import { createEditorConfig } from './editorConfig';
import { useDebounce } from '../../hooks/useDebounce';
import { SessionStats } from './SessionStats';
import { InactivityModal } from '../Modals/InactivityModal';
import { calculateWordCount } from '../../utils/wordCount';
import styles from './Editor.module.css';
import 'prosemirror-view/style/prosemirror.css';

// Local editor state interface
interface LocalEditorState {
  content: string;
  text: string;
  wordCount: number;
  characterCount: number;
  lastUpdated: number;
}

export const Editor = () => {
  const { activeSession, addSession, updateSession } = useSession();
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const contentRef = useRef('');

  // State for inactivity modal
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  // Local state for immediate UI updates
  const [localState, setLocalState] = useState<LocalEditorState>({
    content: '',
    text: '',
    wordCount: 0,
    characterCount: 0,
    lastUpdated: Date.now()
  });

  // Get current session content or default to empty
  const currentContent = useMemo(() => {
    return activeSession?.content || '';
  }, [activeSession?.content]);

  // Debounced session update (2 second delay to avoid typing interference)
  const debouncedUpdateSession = useDebounce(
    useCallback(async () => {
      const content = contentRef.current;
      if (activeSession) {
        try {
          // Update session content via simplified API
          const updatedSession = await window.api.session.updateContent(activeSession.id, content);
          updateSession(updatedSession);
        } catch (error) {
          console.warn('Failed to save session to backend:', error);
        }
      } else {
        // Create new session if none exists
        const newSession = {
          id: globalThis.crypto.randomUUID(),
          name: 'Untitled Session',
          title: 'Untitled Session',
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          goalType: 'word' as const,
          goalValue: 500,
          startTime: Date.now(),
          status: 'active' as const,
        };
        addSession(newSession);
      }
    }, [activeSession, addSession, updateSession]),
    2000 // 2 second delay - only update backend after user stops typing
  );

  const handleEditorBlur = useCallback((event: React.FocusEvent) => {
    // Log blur events for debugging with detailed information
    console.log('Editor blur event:', {
      relatedTarget: event.relatedTarget,
      stack: new Error().stack, // This will show what called the blur
      timestamp: new Date().toISOString()
    });
  }, []);

  // Handle real-time updates (immediate local state, debounced backend)
  const handleUpdate = useCallback((content: string, text: string) => {
    const wordCount = calculateWordCount(text);
    const characterCount = text.length;

    // Update local state immediately for instant UI feedback
    setLocalState({
      content,
      text,
      wordCount,
      characterCount,
      lastUpdated: Date.now()
    });

    // Store content in ref for backend updates (no React state change)
    contentRef.current = content;

    // Record typing activity immediately (no debouncing for inactivity detection)
    if (window.api?.activity?.recordTyping) {
      window.api.activity.recordTyping().catch((error) => {
        console.warn('Failed to record typing activity:', error);
      });
    }

    // Trigger backend update after user stops typing
    debouncedUpdateSession();
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

  // Handle inactivity modal actions
  const handleResumeSession = useCallback(() => {
    setShowInactivityModal(false);
    // Reset inactivity timer when resuming
    if (window.api?.activity?.recordTyping) {
      window.api.activity.recordTyping().catch((error) => {
        console.warn('Failed to record typing activity on resume:', error);
      });
    }
  }, []);

  const handleEndSession = useCallback(() => {
    setShowInactivityModal(false);
    handleEnd();
  }, [handleEnd]);

  // Initialize Tiptap editor
  const editor = useEditor(
    createEditorConfig({
      placeholder: 'Start writing your thoughts...',
      content: currentContent,
      onUpdate: handleUpdate,
      onSave: handleSave,
      onEnd: handleEnd,
      onBlur: handleEditorBlur,
    }),
    [currentContent, handleUpdate, handleSave, handleEnd, handleEditorBlur]
  );

  // Store editor reference for blur handler
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Update editor content when active session changes (only when switching sessions)
  useEffect(() => {
    if (editor && !editor.isFocused && activeSession?.id) {
      // Only update content when switching to a different session
      const editorContent = editor.getHTML();
      if (editorContent !== currentContent) {
        editor.commands.setContent(currentContent, { emitUpdate: false });
      }
    }
  }, [editor, currentContent, activeSession?.id]);

  // Initialize local state when session changes
  useEffect(() => {
    if (activeSession?.content && activeSession.content !== localState.content) {
      const text = activeSession.content.replace(/<[^>]*>/g, ''); // Strip HTML tags
      setLocalState({
        content: activeSession.content,
        text,
        wordCount: calculateWordCount(text),
        characterCount: text.length,
        lastUpdated: Date.now()
      });
    }
  }, [activeSession?.content, localState.content]);

  // Focus editor on mount (only if no content exists)
  useEffect(() => {
    if (editor && !currentContent) {
      editor.commands.focus();
    }
  }, [editor, currentContent]);

  // Listen for inactivity modal events from main process
  useEffect(() => {
    if (window.api?.on) {
      const handleShowInactivityModal = () => {
        setShowInactivityModal(true);
      };

      window.api.on('show-inactivity-modal', handleShowInactivityModal);

      return () => {
        if (window.api?.removeListener) {
          window.api.removeListener('show-inactivity-modal', handleShowInactivityModal);
        }
      };
    }
    return undefined;
  }, []);


  // Separate progress update interval (45 seconds) - independent of timer display
  useEffect(() => {
    if (!activeSession) return;

    const progressInterval = globalThis.setInterval(() => {
      if (localState.wordCount > 0) {
        const progressThresholds = activeSession.progressThresholds || { 33: false, 67: false, 100: false };
        // Calculate time elapsed for progress tracking
        const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;

        // Calculate current progress to check for threshold crossings
        const goalValue = activeSession.goalValue || 500;
        const goalType = activeSession.goalType || 'word';
        const currentProgress = goalType === 'word'
          ? Math.min(100, Math.floor((localState.wordCount / goalValue) * 100))
          : Math.min(100, Math.floor((timeElapsed / (goalValue * 60 * 1000)) * 100));

        // Update thresholds if progress has crossed them
        const newThresholds = { ...progressThresholds };
        if (currentProgress >= 33 && !newThresholds[33]) newThresholds[33] = true;
        if (currentProgress >= 67 && !newThresholds[67]) newThresholds[67] = true;
        if (currentProgress >= 100 && !newThresholds[100]) newThresholds[100] = true;

        // Update progress via simplified API
        window.api.session.updateProgress(activeSession.id, localState.wordCount, timeElapsed, newThresholds)
          .catch((error) => {
            console.warn('Failed to update progress:', error);
          });

        console.log('Progress update via interval (backend only):', {
          wordCount: localState.wordCount,
          timeElapsed,
          currentProgress,
          newThresholds
        });
      }
    }, 45000); // 45 seconds

    return () => globalThis.clearInterval(progressInterval);
  }, [activeSession, localState.wordCount]);

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
      <SessionStats
        localState={localState}
        isFocused={!!editor?.isFocused}
        activeSession={activeSession}
      />

      <div className={styles.editorContent}>
        <EditorContent editor={editor} />
      </div>

      <InactivityModal
        isVisible={showInactivityModal}
        onClose={handleResumeSession}
        onEndSession={handleEndSession}
      />
    </div>
  );
};
