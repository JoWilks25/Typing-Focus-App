// src/renderer/src/components/Modals/CompletionModal.tsx
// Purpose: Modal shown when user reaches 100% progress goal

import React, { useCallback } from 'react';
import type { Session } from '@renderer/types/session';
import styles from './CompletionModal.module.css';

interface CompletionModalProps {
    session: Session;
    currentContent: string; // Current content from contentRef
    currentWordCount: number; // Current word count from local state
    onKeepWriting: () => void;
    onEndSession: () => void;
}

export function CompletionModal({ session, currentContent, currentWordCount, onKeepWriting, onEndSession }: CompletionModalProps): React.JSX.Element {
    const handleEndSession = useCallback(() => {
        onEndSession();
    }, [onEndSession]);

    const handleKeepWriting = useCallback(() => {
        onKeepWriting();
    }, [onKeepWriting]);

    // Calculate time elapsed
    const timeElapsed = session.timeElapsed || 0;
    const minutes = Math.floor(timeElapsed / (1000 * 60));
    const seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);

    return (
        <div className={styles['modal-overlay']}>
            <div className={styles['modal-container']}>
                <div className={styles['modal-content']}>
                    {/* Header */}
                    <div className={styles['header']}>
                        <div className={styles['celebration-icon']}>🎉</div>
                        <h2 className={styles['title']}>Goal Reached!</h2>
                        <p className={styles['subtitle']}>
                            Congratulations! You&apos;ve achieved your {session.goalType === 'word' ? 'word count' : 'time'} goal.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className={styles['stats']}>
                        <div className={styles['stat-item']}>
                            <div className={styles['stat-value']}>{currentWordCount}</div>
                            <div className={styles['stat-label']}>words written</div>
                        </div>
                        <div className={styles['stat-item']}>
                            <div className={styles['stat-value']}>
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </div>
                            <div className={styles['stat-label']}>time elapsed</div>
                        </div>
                        <div className={styles['stat-item']}>
                            <div className={styles['stat-value']}>{session.goalValue}</div>
                            <div className={styles['stat-label']}>
                                {session.goalType === 'word' ? 'words' : 'minutes'} goal
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles['actions']}>
                        <button
                            onClick={handleKeepWriting}
                            className={`${styles['action-button']} ${styles['action-button-secondary']}`}
                        >
                            Keep Writing
                        </button>
                        <button
                            onClick={handleEndSession}
                            className={`${styles['action-button']} ${styles['action-button-primary']}`}
                        >
                            End Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
