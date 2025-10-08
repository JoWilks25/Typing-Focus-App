// src/renderer/src/components/Modals/InactivityModal.tsx
// Purpose: Modal shown when user is inactive for 3 minutes

import { useEffect, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import styles from './InactivityModal.module.css';

interface InactivityModalProps {
    isVisible: boolean;
    onClose: () => void;
    onEndSession: () => void;
}

export const InactivityModal = ({ isVisible, onClose, onEndSession }: InactivityModalProps) => {
    const { activeSession } = useSession();

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
        if (!isVisible) return;

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose();
        }
    }, [isVisible, onClose]);

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

        const wordCount = activeSession.currentWords || 0;
        const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;
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
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Pause Icon */}
                <div className={styles.iconContainer}>
                    <div className={styles.pauseIcon}>⏸️</div>
                </div>

                {/* Heading */}
                <h2 className={styles.heading}>Session Paused</h2>

                {/* Main Message */}
                <p className={styles.message}>
                    We noticed you haven&apos;t typed for a while. Your timer has been paused to keep your session time accurate. Ready to continue?
                </p>

                {/* Subtext */}
                <p className={styles.subtext}>
                    Your progress is safe—no penalties applied.
                </p>

                {/* Current Stats */}
                <div className={styles.statsContainer}>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Words:</span>
                        <span className={styles.statValue}>{wordCount}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Time:</span>
                        <span className={styles.statValue}>{timeElapsed}</span>
                    </div>
                </div>

                {/* Tree Icon Placeholder */}
                <div className={styles.treeContainer}>
                    <div className={styles.treeIcon}>🌱</div>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonContainer}>
                    <button
                        className={styles.resumeButton}
                        onClick={onClose}
                        autoFocus
                    >
                        Resume Writing
                    </button>
                    <button
                        className={styles.endButton}
                        onClick={onEndSession}
                    >
                        End Session
                    </button>
                </div>

                {/* Bottom Hint */}
                <p className={styles.hint}>
                    Taking a thinking break is normal! Press Space or Enter to resume quickly.
                </p>
            </div>
        </div>
    );
};
