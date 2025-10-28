// src/renderer/src/components/Modals/SessionSetupModal.tsx
// Purpose: Modal wrapper for SessionSetup component

import { useEffect, useCallback } from 'react';
import { SessionSetup } from '../Session/SessionSetup';
import styles from './SessionSetupModal.module.css';

interface SessionSetupModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const SessionSetupModal = ({ isVisible, onClose }: SessionSetupModalProps) => {
    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
        if (!isVisible) return;

        if (event.key === 'Escape') {
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

    // Handle backdrop click
    const handleBackdropClick = useCallback((event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles['modal-overlay']} onClick={handleBackdropClick}>
            <div className={styles['modal-container']}>
                <div className={styles['modal-content']}>
                    <SessionSetup />
                </div>
            </div>
        </div>
    );
};
