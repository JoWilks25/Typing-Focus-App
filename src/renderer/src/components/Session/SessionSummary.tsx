// src/renderer/src/components/Session/SessionSummary.tsx
// Purpose: Session completion summary component

import React, { useCallback, useMemo } from 'react';
import { useSession } from '../../hooks/useSession';
import { useAppState } from '../../hooks/useAppState';
import type { Session } from '../../types/session';

interface SessionSummaryProps {
    session: Session;
}

export function SessionSummary({ session }: SessionSummaryProps): React.JSX.Element {
    const { resetSessions } = useSession();
    const { setView } = useAppState();

    // Calculate completion status and statistics
    const stats = useMemo(() => {
        const isCompleted = session.goalType === 'word'
            ? session.currentWords >= session.goalValue
            : session.timeElapsed >= (session.goalValue * 60 * 1000);

        const progressPercentage = session.goalType === 'word'
            ? Math.min((session.currentWords / session.goalValue) * 100, 100)
            : Math.min((session.timeElapsed / (session.goalValue * 60 * 1000)) * 100, 100);

        const timeElapsedMinutes = Math.floor(session.timeElapsed / (1000 * 60));
        const timeElapsedSeconds = Math.floor((session.timeElapsed % (1000 * 60)) / 1000);

        return {
            isCompleted,
            progressPercentage: Math.round(progressPercentage),
            timeElapsedMinutes,
            timeElapsedSeconds,
            wordsPerMinute: timeElapsedMinutes > 0 ? Math.round(session.currentWords / timeElapsedMinutes) : 0
        };
    }, [session]);

    const handleStartNewSession = useCallback(() => {
        setView('session-setup');
    }, [setView]);

    const handleViewDashboard = useCallback(() => {
        setView('dashboard');
    }, [setView]);

    const handleResetSessions = useCallback(() => {
        resetSessions();
        setView('session-setup');
    }, [resetSessions, setView]);

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {stats.isCompleted ? '🎉 Goal Achieved!' : 'Session Complete'}
                </h1>
                <p className="text-gray-300">
                    {stats.isCompleted
                        ? 'Congratulations on reaching your writing goal!'
                        : 'Great effort! Here\'s how you did.'
                    }
                </p>
            </div>

            {/* Session Info */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Session Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-400">Session Name</p>
                        <p className="text-white font-medium">{session.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Goal Type</p>
                        <p className="text-white font-medium capitalize">{session.goalType} Goal</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Target</p>
                        <p className="text-white font-medium">
                            {session.goalType === 'word'
                                ? `${session.goalValue} words`
                                : `${session.goalValue} minutes`
                            }
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <p className={`font-medium ${stats.isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                            {stats.isCompleted ? 'Completed' : 'Incomplete'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{session.currentWords}</p>
                        <p className="text-sm text-gray-400">Words Written</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{stats.progressPercentage}%</p>
                        <p className="text-sm text-gray-400">Goal Progress</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">
                            {stats.timeElapsedMinutes}:{stats.timeElapsedSeconds.toString().padStart(2, '0')}
                        </p>
                        <p className="text-sm text-gray-400">Time Elapsed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">{stats.wordsPerMinute}</p>
                        <p className="text-sm text-gray-400">Words/Min</p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{stats.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${stats.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                        style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleStartNewSession}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Start New Session
                </button>
                <button
                    onClick={handleViewDashboard}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    View Dashboard
                </button>
                <button
                    onClick={handleResetSessions}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Clear All Sessions
                </button>
            </div>
        </div>
    );
}
