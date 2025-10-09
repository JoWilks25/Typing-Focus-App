// src/renderer/src/components/Modals/DistractionWarning.tsx
// Purpose: Modal shown when user switches away from app during active session

import { useEffect, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import styles from './DistractionWarning.module.css';

interface DistractionWarningProps {
    isVisible: boolean;
    secondsRemaining: number;
    onReturn: () => void;
    onEndSession: () => void;
}

export const DistractionWarning = ({
    isVisible,
    secondsRemaining: _secondsRemaining,
    onReturn,
    onEndSession
}: DistractionWarningProps) => {
    const { activeSession } = useSession();

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
        if (!isVisible) return;

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onReturn();
        }
    }, [isVisible, onReturn]);

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

    // Use the variables to avoid unused destructuring warning
    console.log('Current stats:', { wordCount, timeElapsed });

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
            </div>
        </div>
    );
};
