// src/renderer/src/components/Session/SessionSetup.tsx
// Purpose: Main session setup component with goal selection and form submission

import React, { useState, useCallback } from 'react';
import { GoalSelector } from './GoalSelector';
import { GoalInput } from './GoalInput';
import { useSession } from '@renderer/context/useSession';
import { useAppState } from '@renderer/hooks/useAppState';
import { isValidGoal, getDefaultValue } from '@renderer/utils/validation';
import type { GoalType } from '@renderer/types/session';

export function SessionSetup(): React.JSX.Element {
    const { addSession } = useSession();
    const { setView } = useAppState();

    const [goalType, setGoalType] = useState<GoalType>('word');
    const [goalValue, setGoalValue] = useState<number>(getDefaultValue('word'));
    const [showAdvanced, setShowAdvanced] = useState(false);

    const isValid = isValidGoal(goalType, goalValue);

    const handleGoalTypeChange = useCallback((newGoalType: GoalType) => {
        setGoalType(newGoalType);
        // Reset to default value for the new goal type
        setGoalValue(getDefaultValue(newGoalType));
    }, []);

    const handleGoalValueChange = useCallback((newValue: number) => {
        setGoalValue(newValue);
    }, []);

    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isValid) {
            return;
        }

        // Create new session
        const newSession = {
            id: globalThis.crypto.randomUUID(),
            title: `Writing Session - ${goalType === 'word' ? `${goalValue} words` : `${goalValue} min`}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: '',
            goalType,
            goalValue,
        };

        // Add session and navigate to editor
        addSession(newSession);
        setView('editor');
    }, [isValid, goalType, goalValue, addSession, setView]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && isValid) {
            handleSubmit(event as React.FormEvent);
        }
    }, [isValid, handleSubmit]);

    return (
        <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} role="form">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Ready to Write?
                    </h1>
                    <p className="text-gray-300">
                        Set your goal and let&apos;s grow something great together
                    </p>
                </div>

                {/* Goal Selection */}
                <GoalSelector
                    goalType={goalType}
                    onGoalTypeChange={handleGoalTypeChange}
                />

                {/* Goal Input */}
                <GoalInput
                    goalType={goalType}
                    value={goalValue}
                    onChange={handleGoalValueChange}
                    isValid={isValid}
                />

                {/* Advanced Options */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        <span className={`transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
                            &gt;
                        </span>
                        Advanced Options
                    </button>

                    {showAdvanced && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                                Advanced options will be available in future updates.
                            </p>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!isValid}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isValid
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        Start Writing
                        <span className="text-xs opacity-75">Press Enter ↵</span>
                    </div>
                </button>
            </form>
        </div>
    );
}
