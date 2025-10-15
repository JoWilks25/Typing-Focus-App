// src/renderer/src/context/ToastContext.tsx
// Purpose: Context for managing toast notifications

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastProps } from '../components/Toast/Toast';

export interface ToastMessage {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastMessage = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);
    }, []);

    const showSuccess = useCallback((message: string, duration = 3000) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message: string, duration = 3000) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const showInfo = useCallback((message: string, duration = 3000) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    const contextValue: ToastContextType = {
        showToast,
        showSuccess,
        showError,
        showInfo,
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000, pointerEvents: 'none' }}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
