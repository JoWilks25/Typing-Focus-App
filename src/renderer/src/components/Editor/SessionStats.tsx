// src/renderer/src/components/Editor/SessionStats.tsx
// Purpose: Session statistics display component for word count, timer, and goal progress

import { useAppState } from '../../hooks/useAppState';
import { useSession } from '../../hooks/useSession';
import { useMemo, useEffect, useState } from 'react';
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
    showInactivityModal?: boolean; // Whether inactivity modal is visible
}

export const SessionStats = ({ localState, isFocused, activeSession, currentContent, showInactivityModal = false }: SessionStatsProps) => {
    const { setView } = useAppState();
    const { endSession } = useSession();

    // Drive the live timer display with 1-second updates
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (activeSession?.status === 'active') {
            const id = globalThis.setInterval(() => setNow(Date.now()), 1000);
            return () => globalThis.clearInterval(id);
        }
        return undefined;
    }, [activeSession?.status]);

    // Calculate progress and timer state
    const { formattedTotalTime, isTimerRunning, showIndicator, progress, goalType, goalValue, newWords } = useMemo(() => {
        if (!activeSession) {
            return {
                formattedTotalTime: '00:00',
                isTimerRunning: false,
                showIndicator: false,
                progress: 0,
                goalType: 'word' as const,
                goalValue: 500,
                newWords: 0,
            };
        }

        // Total session time (since session start, includes pauses)
        const totalTime = activeSession.startTime ? now - activeSession.startTime : 0;

        // Format times
        const formatTime = (timeMs: number) => {
            const minutes = Math.floor(timeMs / 60000);
            const seconds = Math.floor((timeMs % 60000) / 1000);
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const formattedTotalTime = formatTime(totalTime);

        // Timer runs while session is active (but pauses when inactivity modal is shown)
        const isTimerRunning = activeSession.status === 'active' && !showInactivityModal;
        // Indicator shows only when timer is running AND editor is focused
        const showIndicator = isTimerRunning && isFocused;

        // Calculate new words vs total words
        const initialWordCount = activeSession.initialWordCount || 0;
        const totalWords = localState.wordCount;
        const newWords = initialWordCount > 0 ? Math.max(0, totalWords - initialWordCount) : totalWords;

        const progress = activeSession.goalType === 'word'
            ? Math.min((newWords / activeSession.goalValue) * 100, 100)
            : Math.min((totalTime / (activeSession.goalValue * 60 * 1000)) * 100, 100);

        return {
            formattedTotalTime,
            isTimerRunning,
            showIndicator,
            progress,
            goalType: activeSession.goalType,
            goalValue: activeSession.goalValue,
            newWords
        };
    }, [activeSession, localState.wordCount, isFocused, showInactivityModal, now]);

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

                {/* Total Duration */}
                <div className={styles['timer-container']}>
                    <div className={styles['timer-label']}>Total Duration</div>
                    <div className={`${styles['timer']} ${isTimerRunning ? styles['timer-running'] : styles['timer-paused']}`}>
                        {formattedTotalTime}
                    </div>
                    {showIndicator && (
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
