// src/renderer/src/components/Editor/Editor.tsx
// Purpose: Main text editor component with Tiptap integration

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HardBreak from '@tiptap/extension-hard-break';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '../../hooks/useSession';
import { useAppState } from '../../hooks/useAppState';
import { useDebounce } from '../../hooks/useDebounce';
import { SessionStats } from './SessionStats';
import { EditorTitle } from './EditorTitle';
import { InactivityModal } from '../Modals/InactivityModal';
import { FloatingDistractionWarning } from '../Modals/FloatingDistractionWarning';
import { SessionSetupModal } from '../Modals/SessionSetupModal';
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
  const { activeSession, endSession, abandonSession, markSessionIncomplete, updateProgress, pauseSession, resumeSession, updateSession } = useSession();
  const { setView } = useAppState();
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const contentRef = useRef('');
  const activeSessionRef = useRef(activeSession);
  const debouncedUpdateSessionRef = useRef<() => void>(() => { });


  // Keep refs up to date
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // State for inactivity modal
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  // State for distraction warning modal
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const [isHandlingSessionIncomplete, setIsHandlingSessionIncomplete] = useState(false);

  // State for completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);

  // State for session setup modal
  const [showSessionSetupModal, setShowSessionSetupModal] = useState(false);

  // Close modal when session becomes active
  useEffect(() => {
    if (activeSession && showSessionSetupModal) {
      setShowSessionSetupModal(false);
    }
  }, [activeSession, showSessionSetupModal]);

  // Listen for session setup trigger from other components
  useEffect(() => {
    const handleTriggerSessionSetup = () => {
      setShowSessionSetupModal(true);
    };

    window.addEventListener('trigger-session-setup', handleTriggerSessionSetup);
    return () => window.removeEventListener('trigger-session-setup', handleTriggerSessionSetup);
  }, []);

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
          const updatedSession = await window.api.session.updateContent(currentActiveSession.id, content);

          // Update the activeSessionRef with the updated content to keep it in sync
          activeSessionRef.current = updatedSession;

          // Update the React state so currentContent gets the updated content
          updateSession(updatedSession);
        } catch (error) {
          // Failed to save session to backend
        }
      }
      // Note: No automatic session creation - users must set up sessions via the SessionSetup modal
    }, [updateSession]), // Include updateSession dependency
    2000 // 2 second delay - only update backend after user stops typing (file saves every 10s)
  );

  // Store debounced function reference
  useEffect(() => {
    debouncedUpdateSessionRef.current = debouncedUpdateSession;
  }, [debouncedUpdateSession]);

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
      window.api.activity.recordTyping().catch(() => {
        // Failed to record typing activity
      });
    }

    // Trigger backend update after user stops typing
    debouncedUpdateSessionRef.current?.();
  }, []); // No dependencies to prevent editor recreation


  // Handle end action
  const handleEnd = useCallback(async () => {
    if (activeSession) {
      try {
        const finalContent = contentRef.current;
        const finalWordCount = localState.wordCount;
        await endSession(activeSession.id, finalContent, finalWordCount);

        // TODO: Add toast notification here

        setView('session-summary');
      } catch (error) {
        // Failed to end session
      }
    }
  }, [activeSession, localState.wordCount, endSession, setView]);

  // Handle inactivity modal actions
  const handleResumeSession = useCallback(async () => {
    setShowInactivityModal(false);

    // Resume the session to stop accumulating pause time
    if (activeSession) {
      await resumeSession(activeSession.id);
    }

    // Reset inactivity timer when resuming
    if (window.api?.activity?.recordTyping) {
      window.api.activity.recordTyping().catch(() => {
        // Failed to record typing activity on resume
      });
    }
  }, [activeSession, resumeSession]);

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
        // Failed to increment distraction count
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
        // Failed to abandon session - fallback to normal end
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

  // Session setup modal handlers
  const handleOpenSessionSetup = useCallback(() => {
    setShowSessionSetupModal(true);
  }, []);

  const handleCloseSessionSetup = useCallback(() => {
    setShowSessionSetupModal(false);
  }, []);

  // Initialize Tiptap editor with basic extensions (always required for schema)
  const editor = useEditor(
    {
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
      ],
      content: activeSession ? currentContent : '',
      editable: !!activeSession,
      editorProps: {
        attributes: {
          class: 'prose prose-invert max-w-none',
          'data-placeholder': 'Start writing your thoughts...',
          style: 'outline: none !important; box-shadow: none !important; border: none !important;',
        },
      },
      onUpdate: activeSession ? ({ editor }) => {
        const html = editor.getHTML();
        const text = editor.getText();
        handleUpdate(html, text);
      } : undefined,
      parseOptions: {
        preserveWhitespace: 'full' as const,
      },
      autofocus: false,
    },
    [activeSession?.id]
  );

  // Store editor reference for blur handler
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Update editor content when active session changes
  useEffect(() => {
    if (!editor || !activeSession?.id) return;

    const editorContent = editor.getHTML();
    const isEditorFocused = editor.isFocused;
    const isContentCleared = editorContent.length < contentRef.current.length - 10;

    // When editor is focused, only restore content if it was unexpectedly cleared
    // Skip all other updates to prevent focus loss during typing/autosave
    if (isEditorFocused) {
      if (isContentCleared) {
        editor.commands.setContent(contentRef.current, { emitUpdate: false });
        // Restore focus after DOM updates complete
        setTimeout(() => editor.commands.focus('end'), 0);
      }
      return;
    }

    // Editor is not focused - safe to sync content

    // Priority 1: Restore if content was cleared unexpectedly
    if (isContentCleared) {
      editor.commands.setContent(contentRef.current, { emitUpdate: false });
      return;
    }

    // Priority 2: Sync with session content only if it's longer
    // BUT: Skip if editor content matches what we have in contentRef (user is typing)
    const contentMatchesRef = Math.abs(editorContent.length - contentRef.current.length) < 10;
    if (!contentMatchesRef && editorContent !== currentContent && currentContent.length > editorContent.length) {
      editor.commands.setContent(currentContent, { emitUpdate: false });
    }

    // Priority 3: Restore if editor is empty but we have saved content
    if (editorContent.length <= 7 && contentRef.current.length > 7) {
      editor.commands.setContent(contentRef.current, { emitUpdate: false });
    }
  }, [editor, currentContent, activeSession?.id, showDistractionWarning, showInactivityModal]);

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
        // Don't show distraction warning if completion modal is already visible
        if (showCompletionModal) {
          return;
        }

        setShowDistractionWarning(true);
        setCountdownSeconds(10);
      };

      const handleDismissDistractionWarning = () => {
        setShowDistractionWarning(false);
      };

      const handleUpdateCountdown = (...args: unknown[]) => {
        const seconds = args[1] as number; // args[0] is the event object, args[1] is the countdown value
        setCountdownSeconds(seconds);
      };

      const handleSessionIncomplete = async () => {
        // Prevent multiple simultaneous calls
        if (isHandlingSessionIncomplete) {
          return;
        }

        setIsHandlingSessionIncomplete(true);
        setShowDistractionWarning(false);

        // Mark session as incomplete and navigate to summary when countdown expires
        const currentSession = activeSessionRef.current;
        if (currentSession) {
          try {
            // Save current content before marking as incomplete
            const currentContent = contentRef.current;

            // Update session with current content before marking incomplete
            await window.api.session.updateContent(currentSession.id, currentContent);

            // Small delay to ensure content is properly saved
            await new Promise(resolve => setTimeout(resolve, 100));

            // Now mark as incomplete with the saved content
            // This will clear the active session and return editor to "no active session" state
            await markSessionIncomplete(currentSession.id);

            // Navigate to summary after marking incomplete
            setView('session-summary');
          } catch (error) {
            // Failed to mark session as incomplete - still navigate to summary
            setView('session-summary');
          } finally {
            setIsHandlingSessionIncomplete(false);
          }
        } else {
          setIsHandlingSessionIncomplete(false);
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
      window.api.on('session-incomplete', handleSessionIncomplete);

      return () => {
        if (window.api?.removeListener) {
          window.api.removeListener('show-distraction-warning', handleShowDistractionWarning);
          window.api.removeListener('dismiss-distraction-warning', handleDismissDistractionWarning);
          window.api.removeListener('distraction-warning:return', handleReturn);
          window.api.removeListener('distraction-warning:end-session', handleEndAnyway);
          window.api.removeListener('update-countdown', handleUpdateCountdown);
          window.api.removeListener('session-incomplete', handleSessionIncomplete);
        }
      };
    }
    return undefined;
  }, [setView, abandonSession, markSessionIncomplete, showCompletionModal, activeSession?.id, editor, isHandlingSessionIncomplete]);

  const updateProgressInBackground = useCallback(() => {
    if (!activeSession) return;
    // Calculate time elapsed for progress tracking
    const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;

    // Calculate current progress percentage
    const goalValue = activeSession.goalValue || 500;
    const goalType = activeSession.goalType || 'word';
    const currentProgress = goalType === 'word'
      ? Math.min(100, Math.floor((localState.wordCount / goalValue) * 100))
      : Math.min(100, Math.floor((timeElapsed / (goalValue * 60 * 1000)) * 100));

    // Use context's updateProgress function to update both React state and backend
    updateProgress(localState.wordCount, timeElapsed, currentProgress);
  }, [activeSession, localState.wordCount, updateProgress])

  // Separate progress update interval (5 seconds) - independent of timer display
  useEffect(() => {
    if (!activeSession) return;
    const progressInterval = globalThis.setInterval(() => {
      // Don't update state if inactivity modal currently shown
      if (showInactivityModal) return;

      updateProgressInBackground()
    }, 5000); // 5 seconds

    return () => globalThis.clearInterval(progressInterval);
  }, [activeSession, updateProgressInBackground, showInactivityModal, showDistractionWarning, editor]);

  // Pause session when inactivity modal shows
  useEffect(() => {
    if (showInactivityModal && activeSession) {
      pauseSession(activeSession.id).catch(() => {
        // Failed to pause session
      });
    }
  }, [showInactivityModal, activeSession, pauseSession]);

  // Calculate progress for tree animation
  const treeProgress = useMemo(() => {
    if (!activeSession) {
      return 0;
    }

    const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;

    // Calculate new words for progress (excluding initial content)
    const initialWordCount = activeSession.initialWordCount || 0;
    const newWords = initialWordCount > 0 ? Math.max(0, localState.wordCount - initialWordCount) : localState.wordCount;

    const progress = activeSession.goalType === 'word'
      ? Math.min((newWords / activeSession.goalValue) * 100, 100)
      : Math.min((timeElapsed / (activeSession.goalValue * 60 * 1000)) * 100, 100);

    return progress;
  }, [activeSession, localState.wordCount]);

  // Show completion modal immediately when word goal is reached
  useEffect(() => {
    if (!activeSession || hasTriggeredCompletion) return;

    const goalValue = activeSession.goalValue || 500;

    // Calculate new words written (excluding initial content from loaded files)
    const initialWordCount = activeSession.initialWordCount || 0;
    const newWords = initialWordCount > 0
      ? Math.max(0, localState.wordCount - initialWordCount)
      : localState.wordCount;

    if (newWords >= goalValue) {
      setShowCompletionModal(true);
      setHasTriggeredCompletion(true);
      // Dismiss distraction warning if it's showing when goal is reached
      setShowDistractionWarning(false);
    }
  }, [activeSession, localState.wordCount, hasTriggeredCompletion]);

  // Reset completion modal trigger when session changes
  useEffect(() => {
    setHasTriggeredCompletion(false);
    setShowCompletionModal(false);
  }, [activeSession?.id]);

  // Close session setup modal when a session is successfully created
  useEffect(() => {
    if (activeSession && showSessionSetupModal) {
      setShowSessionSetupModal(false);
    }
  }, [activeSession, showSessionSetupModal]);

  // Show disabled editor state when no active session
  if (!activeSession) {
    return (
      <div className={styles['editor-container']}>
        <EditorTitle
          title="No Active Session"
          name=""
        />

        <SessionStats
          localState={{
            content: '',
            text: '',
            wordCount: 0,
            characterCount: 0,
            lastUpdated: Date.now()
          }}
          isFocused={false}
          activeSession={null}
          currentContent=""
          showInactivityModal={false}
        />

        <div className={styles['editor-main']}>
          <div className={`${styles['editor-content']} ${styles['editor-padding']} ${styles['editor-disabled']}`}>
            <div className={styles['disabled-editor-content']}>
              <div className={styles['disabled-message']}>
                <h2>Ready to Start Writing?</h2>
                <p>Begin your writing journey by starting a new session.</p>
              </div>
              <button
                className={styles['start-session-button']}
                onClick={handleOpenSessionSetup}
              >
                Start New Writing Session
              </button>
            </div>
          </div>

          <div className={styles['animation-sidebar']}>
            <TreeAnimation
              progress={0}
              isActive={false}
            />
          </div>
        </div>

        <SessionSetupModal
          isVisible={showSessionSetupModal}
          onClose={handleCloseSessionSetup}
        />
      </div>
    );
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
      <EditorTitle
        title={activeSession.title}
        name={activeSession.name}
      />

      <SessionStats
        localState={localState}
        isFocused={!!editor?.isFocused}
        activeSession={activeSession}
        currentContent={contentRef.current}
        showInactivityModal={showInactivityModal}
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
        isVisible={showDistractionWarning && !showCompletionModal}
        secondsRemaining={countdownSeconds}
        onReturn={handleReturnToSession}
        onEndSession={handleEndSessionAnyway}
        treeProgress={treeProgress}
      />

      {activeSession && showCompletionModal && (
        <CompletionModal
          session={activeSession}
          currentWordCount={localState.wordCount}
          onKeepWriting={handleKeepWriting}
          onEndSession={handleCompleteSession}
        />
      )}

      <SessionSetupModal
        isVisible={showSessionSetupModal}
        onClose={handleCloseSessionSetup}
      />
    </div>
  );
};
