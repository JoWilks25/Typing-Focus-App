// src/renderer/src/components/Editor/SessionStats.tsx
// Purpose: Session statistics display component for word count, timer, and goal progress

import { useSession } from '../../hooks/useSession';
import { useAppState } from '../../hooks/useAppState';
import { useMemo } from 'react';
import type { Session } from '../../types/session';

interface LocalEditorState {
    content: string;
    text: string;
    wordCount: number;
    characterCount: number;
    lastUpdated: number;
}

interface SessionStatsProps {
    localState: LocalEditorState; // Local editor state for immediate UI updates
    isFocused: boolean; // Whether the editor is focused for timer accuracy
    activeSession: Session | null; // Active session for goal tracking
}

export const SessionStats = ({ localState, isFocused, activeSession }: SessionStatsProps) => {
    const { updateSession } = useSession();
    const { setView } = useAppState();

    // Calculate progress and timer state
    const { formattedTime, isTimerRunning, progress, hasReached33, hasReached67, hasReached100, goalType, goalValue } = useMemo(() => {
        if (!activeSession) {
            return {
                formattedTime: '00:00',
                isTimerRunning: false,
                progress: 0,
                hasReached33: false,
                hasReached67: false,
                hasReached100: false,
                goalType: 'word' as const,
                goalValue: 500
            };
        }

        const timeElapsed = activeSession.startTime ? Date.now() - activeSession.startTime : 0;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const isTimerRunning = activeSession.status === 'active' && isFocused;

        const progress = activeSession.goalType === 'word'
            ? Math.min((localState.wordCount / activeSession.goalValue) * 100, 100)
            : Math.min((timeElapsed / (activeSession.goalValue * 60 * 1000)) * 100, 100);

        const hasReached33 = progress >= 33;
        const hasReached67 = progress >= 67;
        const hasReached100 = progress >= 100;

        return {
            formattedTime,
            isTimerRunning,
            progress,
            hasReached33,
            hasReached67,
            hasReached100,
            goalType: activeSession.goalType,
            goalValue: activeSession.goalValue
        };
    }, [activeSession, localState.wordCount, isFocused]);

    const handleEndSession = async () => {
        if (!activeSession) return;

        try {
            // Stop the session via API
            const stoppedSession = await window.api.session.stop(activeSession.id);
            updateSession(stoppedSession);

            // Navigate to summary
            setView('session-summary');
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    };

    // Calculate goal progress based on goal type
    const goalProgress = goalValue > 0 ? Math.min(progress, 100) : null;

    return (
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center space-x-4">
                {/* Word Count - Using local state for immediate updates */}
                <div className="text-sm text-gray-400">
                    {localState.wordCount} {localState.wordCount === 1 ? 'word' : 'words'}
                </div>

                {/* Live Timer */}
                <div className="flex items-center space-x-2">
                    <div className={`text-sm font-mono ${isTimerRunning ? 'text-green-400' : 'text-gray-500'}`}>
                        {formattedTime}
                    </div>
                    {isTimerRunning && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                </div>

                {/* Goal Progress */}
                {goalProgress !== null && (
                    <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500">
                            Goal: {goalValue} {goalType === 'word' ? 'words' : 'minutes'}
                        </div>
                        <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ease-out ${hasReached100 ? 'bg-green-500' :
                                    hasReached67 ? 'bg-yellow-500' :
                                        hasReached33 ? 'bg-blue-500' : 'bg-gray-500'
                                    }`}
                                style={{ width: `${goalProgress}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-500">
                            {Math.round(goalProgress)}%
                        </div>
                    </div>
                )}

                {/* Progress Indicator */}
                {activeSession && (
                    <div className="text-xs text-gray-500">
                        Progress: {Math.round(progress)}%
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-4">
                <div className="text-xs text-gray-500">
                    Cmd+S to save
                </div>
                <button
                    onClick={handleEndSession}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    End Session
                </button>
            </div>
        </div>
    );
};
