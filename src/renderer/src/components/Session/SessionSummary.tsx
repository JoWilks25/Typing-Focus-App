// src/renderer/src/components/Session/SessionSummary.tsx
// Purpose: Session completion summary component

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { TreeAnimation } from '../Animation/TreeAnimation';
import type { Session } from '../../types/session';
import styles from './SessionSummary.module.css';

export function SessionSummary(): React.JSX.Element {
    const { setView } = useAppState();

    // Session state - fetched from backend
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Tree animation state
    const [animationComplete, setAnimationComplete] = useState(false);

    // Fetch the most recently ended session from backend on mount
    useEffect(() => {
        const fetchLastSession = async () => {
            try {
                const lastSession = await window.api.session.getLastEnded();
                setSession(lastSession);
            } catch (error) {
                console.error('Failed to fetch last ended session:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLastSession();
    }, []);

    // Calculate completion status and statistics
    const stats = useMemo(() => {
        if (!session) {
            return {
                isCompleted: false,
                progressPercentage: 0,
                timeElapsedMinutes: 0,
                timeElapsedSeconds: 0,
                wordsPerMinute: null
            };
        }

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
            wordsPerMinute: timeElapsedMinutes >= 1 ? Math.round(currentWords / timeElapsedMinutes) : null
        };
    }, [session]);

    // Determine tree animation state based on completion
    const treeAnimationState = useMemo(() => {
        if (!session) {
            return 'wilt';
        }

        const isCompleted = stats.isCompleted;
        const isAbandoned = session.status === 'abandoned';
        const isIncomplete = session.status === 'incomplete' || (!isCompleted && session.status !== 'active');

        if (isCompleted) {
            return 'mature';
        } else if (isAbandoned || isIncomplete) {
            return 'wilt';
        } else {
            return 'mature'; // Default to mature for completed sessions
        }
    }, [stats.isCompleted, session]);

    // Trigger animation completion on mount
    useEffect(() => {
        if (treeAnimationState === 'wilt' && !animationComplete) {
            // Simulate animation duration (2-3 seconds)
            const timer = setTimeout(() => {
                setAnimationComplete(true);
            }, 2500);

            return () => clearTimeout(timer);
        } else {
            setAnimationComplete(true);
            return undefined;
        }
    }, [treeAnimationState, animationComplete]);

    const handleStartNewSession = useCallback(() => {
        setView('session-setup');
    }, [setView]);

    const handleViewDashboard = useCallback(() => {
        setView('dashboard');
    }, [setView]);

    const handleOpenFolder = useCallback(async () => {
        if (session?.filePath) {
            try {
                // Open the folder containing the saved file
                console.log('Opening folder for file:', session.filePath);
                await window.api.dialog.openFolder(session.filePath);
                console.log('Folder opened successfully');
            } catch (error) {
                console.error('Failed to open folder:', error);
            }
        }
    }, [session?.filePath]);

    // Note: handleResetSessions removed as it was unused

    // Show loading state while fetching
    if (loading) {
        return (
            <div className={styles['summary-container']}>
                <div className={styles['header']}>
                    <h1 className={styles['title']}>Loading...</h1>
                    <p className={styles['subtitle']}>Fetching your session data...</p>
                </div>
            </div>
        );
    }

    // Show error state if no session found
    if (!session) {
        return (
            <div className={styles['summary-container']}>
                <div className={styles['header']}>
                    <h1 className={styles['title']}>No Session Found</h1>
                    <p className={styles['subtitle']}>Unable to load session data.</p>
                </div>
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

    return (
        <div className={styles['summary-container']}>
            {/* Header */}
            <div className={styles['header']}>
                <h1 className={styles['title']}>
                    {stats.isCompleted ? '🎉 Goal Achieved!' : 'Session Incomplete'}
                </h1>
                <p className={styles['subtitle']}>
                    {stats.isCompleted
                        ? 'Congratulations on reaching your writing goal!'
                        : 'You didn\'t complete the goal. Keep going next time!'
                    }
                </p>
            </div>
            {/* Progress Bar */}
            {/* <div className={styles['progress-section']}>
                <div className={styles['progress-title']}>Progress</div>
                <div className={styles['progress-bar']}>
                    <div
                        className={styles['progress-fill']}
                        style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                    />
                </div>
                <div className={styles['progress-text']}>{stats.progressPercentage}%</div>
            </div> */}

            {/* Content Layout - Tree Animation and Stats */}
            <div className={styles['content-layout']}>
                {/* Tree Animation */}
                <div className={styles['tree-section']}>
                    <div className={styles['tree-container']}>
                        <TreeAnimation
                            progress={stats.progressPercentage}
                            isActive={true} // Always show animation in session summary
                            playFullAnimation={stats.isCompleted} // Play full animation when goal is completed
                            showWiltedTree={!stats.isCompleted} // Show wilted tree emoji when goal is not completed
                        />
                    </div>
                </div>

                {/* Statistics */}
                <div className={styles['stats-section']}>
                    <div className={styles['stats-grid']}>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-label']}>Goal Progress</div>
                            <div className={styles['stat-value']}>{stats.progressPercentage}%</div>
                        </div>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-label']}>Words Written</div>
                            <div className={styles['stat-value']}>{session.currentWords}</div>
                        </div>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-label']}>Time Elapsed</div>
                            <div className={styles['stat-value']}>
                                {stats.timeElapsedMinutes}:{stats.timeElapsedSeconds.toString().padStart(2, '0')}
                            </div>
                        </div>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-label']}>Words/Min</div>
                            <div className={styles['stat-value']}>
                                {stats.wordsPerMinute !== null ? stats.wordsPerMinute : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Information */}
            {session.filePath && (
                <div className={styles['file-info']}>
                    <h3>Saved Location</h3>
                    <p className={styles['file-path']}>{session.filePath}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className={styles['actions']}>
                <button
                    onClick={handleStartNewSession}
                    className={`${styles['action-button']} ${styles['action-button-primary']}`}
                >
                    Start New Session
                </button>
                {session?.filePath && (
                    <button
                        onClick={handleOpenFolder}
                        className={`${styles['action-button']} ${styles['action-button-secondary']}`}
                    >
                        Open Folder
                    </button>
                )}
                {/* <button
                    onClick={handleViewDashboard}
                    className={`${styles['action-button']} ${styles['action-button-secondary']}`}
                >
                    View Dashboard
                </button> */}
            </div>
        </div>
    );
}
