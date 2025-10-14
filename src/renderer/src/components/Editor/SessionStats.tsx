// src/renderer/src/components/Editor/SessionStats.tsx
// Purpose: Session statistics display component for word count, timer, and goal progress

import { useAppState } from '../../hooks/useAppState';
import { useSession } from '../../hooks/useSession';
import { useMemo } from 'react';
import type { Session } from '../../types/session';
import styles from './SessionStats.module.css';

interface LocalEditorState {
    content: string;
    text: string;
    wordCount: number;
    characterCount: number;
    lastUpdated: number;
}

interface SessionStatsProps {
    localState: LocalEditorState; // Local editor state for immediate UI updates
    isFocused: boolean; // Whether the editor is focused for timer accuracy
    activeSession: Session | null; // Active session for goal tracking
    currentContent?: string; // Current content from contentRef for end session
}

export const SessionStats = ({ localState, isFocused, activeSession, currentContent }: SessionStatsProps) => {
    const { setView } = useAppState();
    const { endSession } = useSession();

    // Calculate progress and timer state
    const { formattedTime, isTimerRunning, progress, goalType, goalValue, newWords } = useMemo(() => {
        if (!activeSession) {
            return {
                formattedTime: '00:00',
                isTimerRunning: false,
                progress: 0,
                goalType: 'word' as const,
                goalValue: 500,
                newWords: 0,
                totalWords: 0
            };
        }

        const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const isTimerRunning = activeSession.status === 'active' && isFocused;

        // Calculate new words vs total words
        const initialWordCount = activeSession.initialWordCount || 0;
        const totalWords = localState.wordCount;
        const newWords = initialWordCount > 0 ? Math.max(0, totalWords - initialWordCount) : totalWords;

        const progress = activeSession.goalType === 'word'
            ? Math.min((newWords / activeSession.goalValue) * 100, 100)
            : Math.min((timeElapsed / (activeSession.goalValue * 60 * 1000)) * 100, 100);

        return {
            formattedTime,
            isTimerRunning,
            progress,
            goalType: activeSession.goalType,
            goalValue: activeSession.goalValue,
            newWords
        };
    }, [activeSession, localState.wordCount, isFocused]);

    const handleEndSession = async () => {
        if (!activeSession) return;

        try {
            // End the session with final content and word count
            const finalContent = currentContent || ''; // Use current content from contentRef, default to empty string
            const finalWordCount = localState.wordCount;
            await endSession(activeSession.id, finalContent, finalWordCount);

            // Navigate to summary
            setView('session-summary');
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    };

    // Calculate goal progress based on goal type
    const goalProgress = goalValue > 0 ? Math.min(progress, 100) : null;

    return (
        <div className={styles['stats-container']}>
            <div className={styles['stats-left']}>
                {/* Word Count - Using local state for immediate updates */}
                <div className={styles['word-count']}>
                    {activeSession?.initialWordCount && activeSession.initialWordCount > 0 ? (
                        <>
                            {newWords} new {newWords === 1 ? 'word' : 'words'}
                            {' '}
                            <span className={styles['word-count-secondary']}>
                                (+{activeSession.initialWordCount} existing)
                            </span>
                        </>
                    ) : (
                        <>
                            {localState.wordCount} {localState.wordCount === 1 ? 'word' : 'words'}
                        </>
                    )}
                </div>

                {/* Live Timer */}
                <div className={styles['timer-container']}>
                    <div className={`${styles['timer']} ${isTimerRunning ? styles['timer-running'] : styles['timer-paused']}`}>
                        {formattedTime}
                    </div>
                    {isTimerRunning && (
                        <div className={styles['timer-indicator']} />
                    )}
                </div>

                {/* Goal Progress */}
                {goalProgress !== null && (
                    <div className={styles['goal-progress']}>
                        <div className={styles['goal-label']}>
                            Goal: {goalValue} {goalType === 'word' ? 'words' : 'minutes'}
                        </div>
                        <div className={styles['progress-bar-container']}>
                            <div
                                className={`${styles['progress-bar']} ${styles['progress-bar-green']}`}
                                style={{ width: `${goalProgress}%` }}
                            />
                        </div>
                        <div className={styles['progress-percentage']}>
                            {Math.round(goalProgress)}%
                        </div>
                    </div>
                )}

                {/* Progress Indicator */}
                {activeSession && (
                    <div className={styles['progress-indicator']}>
                        Progress: {Math.round(progress)}%
                    </div>
                )}
            </div>

            <div className={styles['stats-right']}>
                <div className={styles['save-hint']}>
                    Cmd+S to save
                </div>
                <button
                    onClick={handleEndSession}
                    className={styles['end-session-button']}
                >
                    End Session
                </button>
            </div>
        </div>
    );
};
