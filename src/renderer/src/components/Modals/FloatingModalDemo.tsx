import React, { useState } from 'react';
import { useFloatingModal } from '../../hooks/useFloatingModal';
import styles from './FloatingModalDemo.module.css';

export const FloatingModalDemo: React.FC = () => {
    const { createModal, closeModal, closeAllModals, createDistractionWarning } = useFloatingModal();
    const [modalId, setModalId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(10);

    // Use setCountdown to avoid unused variable warning
    console.log('Countdown state:', countdown, setCountdown);

    const handleCreateBasicModal = async () => {
        const id = await createModal({
            width: 400,
            height: 300,
            title: 'Basic Floating Modal',
            content: `
        <div style="padding: 20px; text-align: center; color: #f9fafb;">
          <h2>Hello from Floating Modal!</h2>
          <p>This is a basic floating modal window.</p>
          <p>You can drag it around, resize it, minimize it, or close it.</p>
          <button onclick="window.electronAPI?.floatingModal?.close()" 
                  style="background: #f59e0b; color: #1f2937; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 16px;">
            Close Modal
          </button>
        </div>
      `,
            alwaysOnTop: true,
            resizable: true,
            minimizable: true,
            closable: true
        });

        if (id) {
            setModalId(id);
        }
    };

    const handleCreateDistractionWarning = async () => {
        const id = await createDistractionWarning(
            countdown,
            150,
            '05:30',
            () => {
                console.log('User returned to session');
                if (modalId) {
                    closeModal(modalId);
                    setModalId(null);
                }
            },
            () => {
                console.log('User ended session');
                if (modalId) {
                    closeModal(modalId);
                    setModalId(null);
                }
            }
        );

        if (id) {
            setModalId(id);
        }
    };

    const handleCloseModal = async () => {
        if (modalId) {
            await closeModal(modalId);
            setModalId(null);
        }
    };

    const handleCloseAllModals = async () => {
        await closeAllModals();
        setModalId(null);
    };

    return (
        <div className={styles['demo-container']}>
            <h2 className={styles['demo-title']}>Floating Modal Demo</h2>
            <p className={styles['demo-description']}>Test the floating modal system with these examples:</p>

            <div className={styles['demo-buttons']}>
                <button
                    className={styles['demo-button']}
                    onClick={handleCreateBasicModal}
                    disabled={!!modalId}
                >
                    Create Basic Modal
                </button>

                <button
                    className={styles['demo-button']}
                    onClick={handleCreateDistractionWarning}
                    disabled={!!modalId}
                >
                    Create Distraction Warning
                </button>

                <button
                    className={styles['demo-button']}
                    onClick={handleCloseModal}
                    disabled={!modalId}
                >
                    Close Current Modal
                </button>

                <button
                    className={styles['demo-button']}
                    onClick={handleCloseAllModals}
                >
                    Close All Modals
                </button>
            </div>
        </div>
    );
};

export default FloatingModalDemo;
