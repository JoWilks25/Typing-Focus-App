// src/renderer/src/components/Editor/SessionStats.tsx
// Purpose: Session statistics display component for word count, timer, and goal progress

import { useAppState } from '../../hooks/useAppState';
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
}

export const SessionStats = ({ localState, isFocused, activeSession }: SessionStatsProps) => {
    const { setView } = useAppState();

    // Calculate progress and timer state
    const { formattedTime, isTimerRunning, progress, hasReached33, hasReached67, hasReached100, goalType, goalValue } = useMemo(() => {
        if (!activeSession) {
            return {
                formattedTime: '00:00',
                isTimerRunning: false,
                progress: 0,
                hasReached33: false,
                hasReached67: false,
                hasReached100: false,
                goalType: 'word' as const,
                goalValue: 500
            };
        }

        const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const isTimerRunning = activeSession.status === 'active' && isFocused;

        const progress = activeSession.goalType === 'word'
            ? Math.min((localState.wordCount / activeSession.goalValue) * 100, 100)
            : Math.min((timeElapsed / (activeSession.goalValue * 60 * 1000)) * 100, 100);

        const hasReached33 = progress >= 33;
        const hasReached67 = progress >= 67;
        const hasReached100 = progress >= 100;

        return {
            formattedTime,
            isTimerRunning,
            progress,
            hasReached33,
            hasReached67,
            hasReached100,
            goalType: activeSession.goalType,
            goalValue: activeSession.goalValue
        };
    }, [activeSession, localState.wordCount, isFocused]);

    const handleEndSession = async () => {
        if (!activeSession) return;

        try {
            // Stop the session via API - backend only, no React state update
            await window.api.session.stop(activeSession.id);

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
                    {localState.wordCount} {localState.wordCount === 1 ? 'word' : 'words'}
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
                                className={`${styles['progress-bar']} ${hasReached100 ? styles['progress-bar-green'] :
                                    hasReached67 ? styles['progress-bar-yellow'] :
                                        hasReached33 ? styles['progress-bar-blue'] : styles['progress-bar-gray']
                                    }`}
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
