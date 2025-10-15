// src/renderer/src/components/Toast/Toast.tsx
// Purpose: Simple toast notification component

import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    duration = 3000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`${styles.toast} ${styles[type]} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.content}>
                <span className={styles.message}>{message}</span>
                <button
                    className={styles.closeButton}
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onClose?.(), 300);
                    }}
                    aria-label="Close notification"
                >
                    ×
                </button>
            </div>
        </div>
    );
};
