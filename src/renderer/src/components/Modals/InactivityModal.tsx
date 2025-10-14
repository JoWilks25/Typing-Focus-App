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

    // Get current word count
    const wordCount = activeSession?.currentWords || 0;

    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles['modal-overlay']}>
            <div className={styles['modal-container']}>
                {/* Pause Icon */}
                <div className={styles['pause-icon']}>
                    <div className={styles['pause-emoji']}>⏸️</div>
                </div>

                {/* Heading */}
                <h2 className={styles['modal-title']}>Session Paused</h2>

                {/* Main Message */}
                <p className={styles['main-message']}>
                    We noticed you haven&apos;t typed for a while. Your timer has been paused to keep your session time accurate. Ready to continue?
                </p>

                {/* Subtext */}
                <p className={styles['subtext']}>
                    Your progress is safe—no penalties applied.
                </p>

                {/* Current Word Count */}
                <div className={styles['stats-container']}>
                    <div className={styles['stat-item']}>
                        <span className={styles['stat-label']}>Words:</span>
                        <span className={styles['stat-value']}>{wordCount}</span>
                    </div>
                </div>

                {/* Tree Icon Placeholder */}
                <div className={styles['tree-icon']}>
                    <div className={styles['tree-emoji']}>🌱</div>
                </div>

                {/* Action Buttons */}
                <div className={styles['action-buttons']}>
                    <button
                        className={styles['resume-button']}
                        onClick={onClose}
                        autoFocus
                    >
                        Resume Writing
                    </button>
                    <button
                        className={styles['end-session-button']}
                        onClick={onEndSession}
                    >
                        End Session
                    </button>
                </div>

                {/* Bottom Hint */}
                <p className={styles['bottom-hint']}>
                    Taking a thinking break is normal! Press Space or Enter to resume quickly.
                </p>
            </div>
        </div>
    );
};
