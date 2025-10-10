// src/renderer/src/components/Session/SessionSummary.tsx
// Purpose: Session completion summary component

import React, { useCallback, useMemo } from 'react';
import { useAppState } from '../../hooks/useAppState';
import type { Session } from '../../types/session';
import styles from './SessionSummary.module.css';

interface SessionSummaryProps {
    session: Session;
}

export function SessionSummary({ session }: SessionSummaryProps): React.JSX.Element {
    const { setView } = useAppState();

    // Calculate completion status and statistics
    const stats = useMemo(() => {
        const currentWords = session.currentWords || 0;
        const timeElapsed = session.timeElapsed || 0;

        const isCompleted = session.goalType === 'word'
            ? currentWords >= session.goalValue
            : timeElapsed >= (session.goalValue * 60 * 1000);

        const progressPercentage = session.goalType === 'word'
            ? Math.min((currentWords / session.goalValue) * 100, 100)
            : Math.min((timeElapsed / (session.goalValue * 60 * 1000)) * 100, 100);

        const timeElapsedMinutes = Math.floor(timeElapsed / (1000 * 60));
        const timeElapsedSeconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);

        return {
            isCompleted,
            progressPercentage: Math.round(progressPercentage),
            timeElapsedMinutes,
            timeElapsedSeconds,
            wordsPerMinute: timeElapsedMinutes > 0 ? Math.round(currentWords / timeElapsedMinutes) : 0
        };
    }, [session]);

    const handleStartNewSession = useCallback(() => {
        setView('session-setup');
    }, [setView]);

    const handleViewDashboard = useCallback(() => {
        setView('dashboard');
    }, [setView]);

    // Note: handleResetSessions removed as it was unused

    return (
        <div className={styles['summary-container']}>
            {/* Header */}
            <div className={styles['header']}>
                <h1 className={styles['title']}>
                    {stats.isCompleted ? '🎉 Goal Achieved!' : 'Session Complete'}
                </h1>
                <p className={styles['subtitle']}>
                    {stats.isCompleted
                        ? 'Congratulations on reaching your writing goal!'
                        : 'Great effort! Here\'s how you did.'
                    }
                </p>
            </div>

            {/* Statistics */}
            <div className={styles['stats-grid']}>
                <div className={styles['stat-card']}>
                    <div className={styles['stat-label']}>Words Written</div>
                    <div className={styles['stat-value']}>{session.currentWords}</div>
                </div>
                <div className={styles['stat-card']}>
                    <div className={styles['stat-label']}>Goal Progress</div>
                    <div className={styles['stat-value']}>{stats.progressPercentage}%</div>
                </div>
                <div className={styles['stat-card']}>
                    <div className={styles['stat-label']}>Time Elapsed</div>
                    <div className={styles['stat-value']}>
                        {stats.timeElapsedMinutes}:{stats.timeElapsedSeconds.toString().padStart(2, '0')}
                    </div>
                </div>
                <div className={styles['stat-card']}>
                    <div className={styles['stat-label']}>Words/Min</div>
                    <div className={styles['stat-value']}>{stats.wordsPerMinute}</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className={styles['progress-section']}>
                <div className={styles['progress-title']}>Progress</div>
                <div className={styles['progress-bar']}>
                    <div
                        className={styles['progress-fill']}
                        style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                    />
                </div>
                <div className={styles['progress-text']}>{stats.progressPercentage}%</div>
            </div>

            {/* Action Buttons */}
            <div className={styles['actions']}>
                <button
                    onClick={handleStartNewSession}
                    className={`${styles['action-button']} ${styles['action-button-primary']}`}
                >
                    Start New Session
                </button>
                <button
                    onClick={handleViewDashboard}
                    className={`${styles['action-button']} ${styles['action-button-secondary']}`}
                >
                    View Dashboard
                </button>
            </div>
        </div>
    );
}
