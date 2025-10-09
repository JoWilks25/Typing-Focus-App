import React, { useState } from 'react';
import { useFloatingModal } from '../../hooks/useFloatingModal';

export const FloatingModalDemo: React.FC = () => {
    const { createModal, closeModal, closeAllModals, createDistractionWarning } = useFloatingModal();
    const [modalId, setModalId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(10);

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
        <div className="p-6 max-w-2xl mx-auto bg-gray-800 rounded-xl border border-gray-700">
            <h2 className="text-gray-50 mb-4 text-2xl font-semibold">Floating Modal Demo</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">Test the floating modal system with these examples:</p>

            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    className="bg-blue-500 text-white border-none rounded-lg py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,0.2)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(59,130,246,0.3)] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none disabled:shadow-none focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                    onClick={handleCreateBasicModal}
                    disabled={!!modalId}
                >
                    Create Basic Modal
                </button>

                <button
                    className="bg-blue-500 text-white border-none rounded-lg py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,0.2)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(59,130,246,0.3)] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none disabled:shadow-none focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                    onClick={handleCreateDistractionWarning}
                    disabled={!!modalId}
                >
                    Create Distraction Warning
                </button>

                <button
                    className="bg-blue-500 text-white border-none rounded-lg py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,0.2)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(59,130,246,0.3)] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none disabled:shadow-none focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                    onClick={handleCloseModal}
                    disabled={!modalId}
                >
                    Close Current Modal
                </button>

                <button
                    className="bg-blue-500 text-white border-none rounded-lg py-3 px-5 text-sm font-medium cursor-pointer transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,0.2)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(59,130,246,0.3)] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none disabled:shadow-none focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                    onClick={handleCloseAllModals}
                >
                    Close All Modals
                </button>
            </div>

            <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <label className="flex items-center gap-3 text-gray-50 font-medium">
                    Countdown (seconds):
                    <input
                        type="number"
                        min="1"
                        max="60"
                        value={countdown}
                        onChange={(e) => setCountdown(parseInt(e.target.value) || 10)}
                        className="bg-gray-800 text-gray-50 border border-gray-600 rounded px-3 py-2 text-sm w-20 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 focus:border-blue-500"
                    />
                </label>
            </div>

            {modalId && (
                <div className="mb-6 p-4 bg-emerald-900 rounded-lg border border-emerald-500">
                    <p className="m-0 text-emerald-100">
                        Active Modal ID: <code className="bg-black bg-opacity-20 px-1.5 py-0.5 rounded text-emerald-100">{modalId}</code>
                    </p>
                </div>
            )}

            <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <h3 className="text-gray-50 mb-3 text-lg font-medium">Features:</h3>
                <ul className="text-gray-300 space-y-1">
                    <li>✅ Always on top</li>
                    <li>✅ Draggable by header</li>
                    <li>✅ Resizable (drag bottom-right corner)</li>
                    <li>✅ Minimizable</li>
                    <li>✅ Closable</li>
                    <li>✅ Cross-platform compatible</li>
                    <li>✅ Modern glassmorphism design</li>
                    <li>✅ Keyboard shortcuts (ESC to close)</li>
                </ul>
            </div>
        </div>
    );
};

export default FloatingModalDemo;
