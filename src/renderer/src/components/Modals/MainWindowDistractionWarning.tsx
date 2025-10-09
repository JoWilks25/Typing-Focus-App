// src/renderer/src/components/Modals/MainWindowDistractionWarning.tsx
// Purpose: Modal shown when user switches away from app during active session - renders within main window

import React, { useEffect, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';

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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-[90%] text-center shadow-2xl border-2 border-amber-500 max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                {/* Warning Icon */}
                <div className="mb-4">
                    <div className="text-5xl inline-block drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">⚠️</div>
                </div>

                {/* Heading */}
                <h2 className="text-gray-50 text-2xl font-semibold mb-4">Stay Focused?</h2>

                {/* Main Message */}
                <p className="text-gray-300 text-base leading-relaxed mb-6">
                    You are about to leave your writing session. If you switch away before reaching your goal, your progress will be marked as incomplete and your tree will wilt.
                </p>

                {/* Countdown Timer */}
                <div className="mb-6 p-5 bg-gray-700 rounded-lg border border-amber-500">
                    <div className="text-gray-400 text-sm mb-2">Return within</div>
                    <div className="flex items-baseline justify-center gap-1 my-3">
                        <span className="text-amber-500 text-4xl font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">
                            {typeof secondsRemaining === 'number' ? secondsRemaining : 10}
                        </span>
                        <span className="text-amber-500 text-lg font-medium">seconds</span>
                    </div>
                    <div className="text-gray-400 text-sm">to keep your progress</div>
                </div>

                {/* Current Stats */}
                <div className="flex justify-center gap-8 mb-6 p-4 bg-gray-700 rounded-lg">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Words:</span>
                        <span className="text-gray-50 text-lg font-semibold">{wordCount}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Time:</span>
                        <span className="text-gray-50 text-lg font-semibold">{timeElapsed}</span>
                    </div>
                </div>

                {/* Tree Icon Placeholder */}
                <div className="mb-8">
                    <div className="text-3xl inline-block drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]">🌱</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                    <button
                        className="flex-1 bg-amber-500 text-gray-800 border-none rounded-lg py-3 px-6 text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_2px_4px_rgba(245,158,11,0.2)] hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(245,158,11,0.3)] focus:outline-2 focus:outline-amber-500 focus:outline-offset-2"
                        onClick={onReturn}
                        autoFocus
                    >
                        Return to Session
                    </button>
                    <button
                        className="flex-1 bg-transparent text-gray-400 border border-gray-600 rounded-lg py-3 px-6 text-base font-medium cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:text-gray-300 hover:border-gray-500 focus:outline-2 focus:outline-gray-500 focus:outline-offset-2"
                        onClick={onEndSession}
                    >
                        End Session Anyway
                    </button>
                </div>

                {/* Keyboard shortcuts hint */}
                <div className="text-xs text-gray-500 mt-4">
                    Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Space</kbd> to return • <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Esc</kbd> to end session
                </div>
            </div>
        </div>
    );
};

export default MainWindowDistractionWarning;
