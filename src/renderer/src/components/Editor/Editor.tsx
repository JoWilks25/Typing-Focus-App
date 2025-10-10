// src/renderer/src/components/Editor/Editor.tsx
// Purpose: Main text editor component with Tiptap integration

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '../../hooks/useSession';
import { useAppState } from '../../hooks/useAppState';
import { createEditorConfig } from './editorConfig';
import { useDebounce } from '../../hooks/useDebounce';
import { SessionStats } from './SessionStats';
import { InactivityModal } from '../Modals/InactivityModal';
import { FloatingDistractionWarning } from '../Modals/FloatingDistractionWarning';
import { TreeAnimation } from '../Animation/TreeAnimation';
import { calculateWordCount } from '../../utils/wordCount';
import styles from './Editor.module.css';
import 'prosemirror-view/style/prosemirror.css';
import { CompletionModal } from '../Modals/CompletionModal';

// Local editor state interface
interface LocalEditorState {
  content: string;
  text: string;
  wordCount: number;
  characterCount: number;
  lastUpdated: number;
}

export const Editor = () => {
  const { activeSession, endSession, abandonSession, updateProgress } = useSession();
  const { setView } = useAppState();
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const contentRef = useRef('');
  const activeSessionRef = useRef(activeSession);
  const debouncedUpdateSessionRef = useRef<() => void>(() => { });

  // Redirect to session setup if no active session
  useEffect(() => {
    if (!activeSession) {
      console.log('No active session - redirecting to session setup');
      setView('session-setup');
    }
  }, [activeSession, setView]);

  // Keep refs up to date
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // State for inactivity modal
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  // State for distraction warning modal
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);

  // State for completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

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
      // Get current activeSession from ref to avoid dependency issues
      const currentActiveSession = activeSessionRef.current;
      if (currentActiveSession) {
        try {
          // Update session content via simplified API - backend only, no React state update
          await window.api.session.updateContent(currentActiveSession.id, content);
        } catch (error) {
          console.warn('Failed to save session to backend:', error);
        }
      }
      // Note: No automatic session creation - users must set up sessions via the SessionSetup modal
    }, []), // No dependencies to prevent editor recreation
    2000 // 2 second delay - only update backend after user stops typing
  );

  // Store debounced function reference
  useEffect(() => {
    debouncedUpdateSessionRef.current = debouncedUpdateSession;
  }, [debouncedUpdateSession]);

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
    debouncedUpdateSessionRef.current?.();
  }, []); // No dependencies to prevent editor recreation

  // Handle save action
  const handleSave = useCallback(() => {
    console.log('Save triggered');
    // Additional save logic can be added here
  }, []);

  // Handle end action
  const handleEnd = useCallback(async () => {
    console.log('End session triggered');

    if (activeSession) {
      try {
        // End the session with final content and word count
        const finalContent = contentRef.current;
        const finalWordCount = localState.wordCount;
        await endSession(activeSession.id, finalContent, finalWordCount);

        // Navigate to summary
        setView('session-summary');
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  }, [activeSession, localState.wordCount, endSession, setView]);

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

  // Refs for distraction warning handlers to avoid dependency issues
  const handleReturnToSessionRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const handleEndSessionAnywayRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Handle distraction warning modal actions
  const handleReturnToSession = useCallback(async () => {
    setShowDistractionWarning(false);

    // Increment distraction count if we have an active session - backend only, no React state update
    const currentSession = activeSessionRef.current;
    if (currentSession && window.api?.session) {
      try {
        await window.api.session.incrementDistraction(currentSession.id);
      } catch (error) {
        console.warn('Failed to increment distraction count:', error);
      }
    }
  }, []);

  const handleEndSessionAnyway = useCallback(async () => {
    setShowDistractionWarning(false);

    // Abandon session if we have an active session
    const currentSession = activeSessionRef.current;
    if (currentSession) {
      try {
        await abandonSession(currentSession.id);
        // Navigate to summary after abandoning
        setView('session-summary');
      } catch (error) {
        console.warn('Failed to abandon session:', error);
        // Fallback to normal end
        handleEnd();
      }
    } else {
      handleEnd();
    }
  }, [handleEnd, setView, abandonSession]);

  // Keep refs up to date
  useEffect(() => {
    handleReturnToSessionRef.current = handleReturnToSession;
    handleEndSessionAnywayRef.current = handleEndSessionAnyway;
  }, [handleReturnToSession, handleEndSessionAnyway]);

  // Completion modal handlers (commented out for now)
  const handleKeepWriting = useCallback(() => {
    setShowCompletionModal(false);
  }, []);

  const handleCompleteSession = useCallback(() => {
    setShowCompletionModal(false);
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
    [currentContent]
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

  // Listen for distraction warning events from main process
  useEffect(() => {
    if (window.api?.on) {
      const handleShowDistractionWarning = () => {
        console.debug('Editor: Showing distraction warning modal');
        setShowDistractionWarning(true);
        setCountdownSeconds(10);
      };

      const handleDismissDistractionWarning = () => {
        console.debug('Editor: Dismissing distraction warning modal');
        setShowDistractionWarning(false);
      };

      const handleUpdateCountdown = (...args: unknown[]) => {
        const seconds = args[1] as number; // args[0] is the event object, args[1] is the countdown value
        console.debug('Editor: Updating countdown to', seconds);
        setCountdownSeconds(seconds);
      };

      const handleSessionAbandoned = async () => {
        setShowDistractionWarning(false);
        // Abandon session and navigate to summary when countdown expires
        const currentSession = activeSessionRef.current;
        if (currentSession) {
          try {
            await abandonSession(currentSession.id);
            // Navigate to summary after abandoning
            setView('session-summary');
          } catch (error) {
            console.warn('Failed to abandon session:', error);
            // Still navigate to summary even if abandon fails
            setView('session-summary');
          }
        }
      };

      const handleReturn = async () => {
        await handleReturnToSessionRef.current?.();
      };

      const handleEndAnyway = async () => {
        await handleEndSessionAnywayRef.current?.();
      };

      window.api.on('show-distraction-warning', handleShowDistractionWarning);
      window.api.on('dismiss-distraction-warning', handleDismissDistractionWarning);
      window.api.on('distraction-warning:return', handleReturn);
      window.api.on('distraction-warning:end-session', handleEndAnyway);
      window.api.on('update-countdown', handleUpdateCountdown);
      window.api.on('session-abandoned', handleSessionAbandoned);

      return () => {
        if (window.api?.removeListener) {
          window.api.removeListener('show-distraction-warning', handleShowDistractionWarning);
          window.api.removeListener('dismiss-distraction-warning', handleDismissDistractionWarning);
          window.api.removeListener('distraction-warning:return', handleReturn);
          window.api.removeListener('distraction-warning:end-session', handleEndAnyway);
          window.api.removeListener('update-countdown', handleUpdateCountdown);
          window.api.removeListener('session-abandoned', handleSessionAbandoned);
        }
      };
    }
    return undefined;
  }, [setView, abandonSession]); // Include setView and abandonSession


  // Separate progress update interval (45 seconds) - independent of timer display
  useEffect(() => {
    if (!activeSession) return;
    const progressInterval = globalThis.setInterval(() => {
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
      console.log('currentProgress', currentProgress, 'newThresholds', newThresholds)
      if (currentProgress >= 33 && !newThresholds[33]) newThresholds[33] = true;
      if (currentProgress >= 67 && !newThresholds[67]) newThresholds[67] = true;
      if (currentProgress >= 100 && !newThresholds[100]) {
        newThresholds[100] = true;
        // Show completion modal when reaching 100% (only if not already shown)
        if (!hasShownCompletionModal) {
          setShowCompletionModal(true);
          setHasShownCompletionModal(true);
        }
      }

      // Use context's updateProgress function to update both React state and backend
      updateProgress(localState.wordCount, timeElapsed, newThresholds);

      console.log('Progress update via interval (React state + backend):', {
        wordCount: localState.wordCount,
        timeElapsed,
        currentProgress,
        newThresholds
      });
    }, 15000); // 15 seconds

    return () => globalThis.clearInterval(progressInterval);
  }, [activeSession, localState.wordCount, updateProgress, hasShownCompletionModal]);

  // Calculate progress for tree animation
  const treeProgress = useMemo(() => {
    if (!activeSession) {
      console.log('TreeAnimation: No active session');
      return 0;
    }

    const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;
    const progress = activeSession.goalType === 'word'
      ? Math.min((localState.wordCount / activeSession.goalValue) * 100, 100)
      : Math.min((timeElapsed / (activeSession.goalValue * 60 * 1000)) * 100, 100);

    console.debug('TreeAnimation: Progress calculated:', progress, 'Active session:', !!activeSession);
    return progress;
  }, [activeSession, localState.wordCount]);

  // Don't render editor if no active session
  if (!activeSession) {
    return null;
  }

  if (!editor) {
    return (
      <div className={styles['editor-container']}>
        <div className={`${styles['editor-content']} ${styles['editor-loading']}`}>
          <p className={styles['loading-text']}>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['editor-container']}>
      <SessionStats
        localState={localState}
        isFocused={!!editor?.isFocused}
        activeSession={activeSession}
        currentContent={contentRef.current}
      />

      <div className={styles['editor-main']}>
        <div className={`${styles['editor-content']} ${styles['editor-padding']}`}>
          <EditorContent editor={editor} />
        </div>

        <div className={styles['animation-sidebar']}>
          <TreeAnimation
            progress={treeProgress}
            isActive={!!activeSession}
          />
        </div>
      </div>

      <InactivityModal
        isVisible={showInactivityModal}
        onClose={handleResumeSession}
        onEndSession={handleEndSession}
      />

      <FloatingDistractionWarning
        isVisible={showDistractionWarning}
        secondsRemaining={countdownSeconds}
        onReturn={handleReturnToSession}
        onEndSession={handleEndSessionAnyway}
        treeProgress={treeProgress}
      />

      {activeSession && showCompletionModal && (
        <CompletionModal
          session={activeSession}
          currentContent={contentRef.current}
          currentWordCount={localState.wordCount}
          onKeepWriting={handleKeepWriting}
          onEndSession={handleCompleteSession}
        />
      )}
    </div>
  );
};
