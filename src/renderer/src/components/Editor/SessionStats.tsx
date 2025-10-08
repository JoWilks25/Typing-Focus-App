// src/renderer/src/components/Editor/SessionStats.tsx
// Purpose: Session statistics display component for word count, timer, and goal progress

import { useSessionProgress } from '../../hooks/useSessionProgress';
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

    // Use the comprehensive progress tracking hook with local state
    const {
        formattedTime,
        isTimerRunning,
        progress,
        hasReached33,
        hasReached67,
        hasReached100,
        animationState,
        goalType,
        goalValue
    } = useSessionProgress({ text: localState.text, isFocused });

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

                {/* Animation State Indicator */}
                {activeSession && (
                    <div className="text-xs text-gray-500">
                        State: {animationState}
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-500">
                Cmd+S to save • Cmd+Q to end
            </div>
        </div>
    );
};
