// src/renderer/src/components/Modals/MainWindowDistractionWarning.tsx
// Purpose: Modal shown when user switches away from app during active session - renders within main window

import React, { useEffect, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import styles from './MainWindowDistractionWarning.module.css';

interface MainWindowDistractionWarningProps {
    isVisible: boolean;
    secondsRemaining: number;
    onReturn: () => void;
    onEndSession: () => void;
}

export const MainWindowDistractionWarning: React.FC<MainWindowDistractionWarningProps> = ({
    isVisible,
    secondsRemaining,
    onReturn,
    onEndSession
}) => {
    const { activeSession } = useSession();

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
        if (!isVisible) return;

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onReturn();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            onEndSession();
        }
    }, [isVisible, onReturn, onEndSession]);

    // Add keyboard event listener
    useEffect(() => {
        if (isVisible) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
        return undefined;
    }, [isVisible, handleKeyDown]);

    // Calculate current stats
    const getCurrentStats = () => {
        if (!activeSession) {
            return { wordCount: 0, timeElapsed: '00:00' };
        }

        const wordCount = typeof activeSession.currentWords === 'number' ? activeSession.currentWords : 0;
        const startTime = typeof activeSession.startTime === 'number' ? activeSession.startTime : Date.now();
        const timeElapsed = Date.now() - startTime;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return { wordCount, timeElapsed: formattedTime };
    };

    const { wordCount, timeElapsed } = getCurrentStats();

    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles['modal-overlay']}>
            <div className={styles['modal-container']}>
                {/* Warning Icon */}
                <div className={styles['warning-icon']}>
                    <div className={styles['warning-emoji']}>⚠️</div>
                </div>

                {/* Heading */}
                <h2 className={styles['modal-title']}>Stay Focused?</h2>

                {/* Main Message */}
                <p className={styles['main-message']}>
                    You are about to leave your writing session. If you switch away before reaching your goal, your progress will be marked as incomplete and your tree will wilt.
                </p>

                {/* Countdown Timer */}
                <div className={styles['countdown-container']}>
                    <div className={styles['countdown-label']}>Return within</div>
                    <div className={styles['countdown-display']}>
                        <span className={styles['countdown-number']}>
                            {typeof secondsRemaining === 'number' ? secondsRemaining : 10}
                        </span>
                        <span className={styles['countdown-unit']}>seconds</span>
                    </div>
                    <div className={styles['countdown-subtext']}>to keep your progress</div>
                </div>

                {/* Current Stats */}
                <div className={styles['stats-container']}>
                    <div className={styles['stat-item']}>
                        <span className={styles['stat-label']}>Words:</span>
                        <span className={styles['stat-value']}>{wordCount}</span>
                    </div>
                    <div className={styles['stat-item']}>
                        <span className={styles['stat-label']}>Time:</span>
                        <span className={styles['stat-value']}>{timeElapsed}</span>
                    </div>
                </div>

                {/* Tree Icon Placeholder */}
                <div className={styles['tree-icon']}>
                    <div className={styles['tree-emoji']}>🌱</div>
                </div>

                {/* Action Buttons */}
                <div className={styles['action-buttons']}>
                    <button
                        className={styles['return-button']}
                        onClick={onReturn}
                        autoFocus
                    >
                        Return to Session
                    </button>
                    <button
                        className={styles['end-session-button']}
                        onClick={onEndSession}
                    >
                        End Session Anyway
                    </button>
                </div>

                {/* Keyboard shortcuts hint */}
                <div className={styles['keyboard-hints']}>
                    Press <kbd className={styles['keyboard-key']}>Enter</kbd> or <kbd className={styles['keyboard-key']}>Space</kbd> to return • <kbd className={styles['keyboard-key']}>Esc</kbd> to end session
                </div>
            </div>
        </div>
    );
};

export default MainWindowDistractionWarning;
