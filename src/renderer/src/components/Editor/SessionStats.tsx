// src/renderer/src/components/Editor/SessionStats.tsx
// Purpose: Session statistics display component for word count and goal progress

import { useSession } from '../../context/useSession';

interface SessionStatsProps {
    wordCount: number; // Immediate word count for display
    trackedWordCount: number; // Debounced word count for goal tracking
}

export const SessionStats = ({ wordCount, trackedWordCount }: SessionStatsProps) => {
    const { activeSession } = useSession();

    // Calculate goal progress if session has a word goal (uses debounced count)
    const goalProgress = activeSession?.goalType === 'word' && activeSession?.goalValue
        ? Math.min((trackedWordCount / activeSession.goalValue) * 100, 100)
        : null;

    return (
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </div>

                {goalProgress !== null && (
                    <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500">
                            Goal: {activeSession?.goalValue} words
                        </div>
                        <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${goalProgress}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-500">
                            {Math.round(goalProgress)}%
                        </div>
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-500">
                Cmd+S to save • Cmd+Q to end
            </div>
        </div>
    );
};
