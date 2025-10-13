// src/renderer/src/components/Session/SessionSetup.tsx
// Purpose: Main session setup component with goal selection and form submission

import React, { useState, useCallback } from 'react';
import { GoalSelector } from './GoalSelector';
import { GoalInput } from './GoalInput';
import { useSession } from '@renderer/hooks/useSession';
import { useAppState } from '@renderer/hooks/useAppState';
import { isValidGoal, getDefaultValue } from '@renderer/utils/validation';
import type { GoalType } from '@renderer/types/session';
import styles from './SessionSetup.module.css';

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

        try {
            // Create session via simplified IPC API
            const sessionName = `Writing Session - ${goalType === 'word' ? `${goalValue} words` : `${goalValue} min`}`;
            const newSession = await window.api.session.start(sessionName, undefined, goalType, goalValue);

            // Add session to local state and navigate to editor
            addSession(newSession);
            setView('editor');
        } catch (error) {
            console.error('Failed to create session:', error);
            // Handle validation errors from main process
            // You could show a toast notification here
        }
    }, [isValid, goalType, goalValue, addSession, setView]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && isValid) {
            handleSubmit(event as React.FormEvent);
        }
    }, [isValid, handleSubmit]);

    return (
        <div className={styles['setup-container']}>
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} role="form">
                {/* Header */}
                <div className={styles['header']}>
                    <h1 className={styles['title']}>
                        Ready to Write?
                    </h1>
                    <p className={styles['subtitle']}>
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
                <div className={styles['advanced-section']}>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={styles['advanced-toggle']}
                    >
                        <span className={`${styles['advanced-arrow']} ${showAdvanced ? styles['advanced-arrow-rotated'] : ''}`}>
                            &gt;
                        </span>
                        Advanced Options
                    </button>

                    {showAdvanced && (
                        <div className={styles['advanced-content']}>
                            <p className={styles['advanced-text']}>
                                Advanced options will be available in future updates.
                            </p>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!isValid}
                    className={`${styles['submit-button']} ${isValid ? styles['submit-button-enabled'] : styles['submit-button-disabled']}`}
                >
                    <div>
                        Start Writing
                        <span className={styles['submit-hint']}> Press Enter ↵</span>
                    </div>
                </button>
            </form>
        </div>
    );
}
