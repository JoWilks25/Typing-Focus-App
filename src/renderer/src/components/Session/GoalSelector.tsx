// src/renderer/src/components/Session/GoalSelector.tsx
// Purpose: Goal type selector component with toggle buttons

import React from 'react';
import type { GoalType } from '@renderer/types/session';
import styles from './GoalSelector.module.css';

interface GoalSelectorProps {
    goalType: GoalType;
    onGoalTypeChange: (goalType: GoalType) => void;
}

export function GoalSelector({ goalType, onGoalTypeChange }: GoalSelectorProps): React.JSX.Element {
    const handleKeyDown = (event: React.KeyboardEvent, targetGoalType: GoalType) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onGoalTypeChange(targetGoalType);
        }
    };

    return (
        <div className={styles['selector-container']}>
            <label className={styles['selector-label']}>
                Choose your goal type
            </label>

            <div
                className={styles['selector-group']}
                role="group"
                aria-label="Choose your goal type"
            >
                {/* Word Count Goal Button */}
                <button
                    type="button"
                    data-testid="word-goal-button"
                    className={`${styles['goal-button']} ${goalType === 'word' ? styles['goal-button-active'] : styles['goal-button-inactive']}`}
                    onClick={() => onGoalTypeChange('word')}
                    onKeyDown={(e) => handleKeyDown(e, 'word')}
                    aria-pressed={goalType === 'word'}
                    tabIndex={0}
                >
                    {/* Document Icon */}
                    <svg
                        className={styles['goal-icon']}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Word Count Goal
                </button>

                {/* Time Goal Button */}
                {/* <button
                    type="button"
                    data-testid="time-goal-button"
                    className={`${styles['goal-button']} ${goalType === 'time' ? styles['goal-button-active'] : styles['goal-button-inactive']}`}
                    onClick={() => onGoalTypeChange('time')}
                    onKeyDown={(e) => handleKeyDown(e, 'time')}
                    aria-pressed={goalType === 'time'}
                    tabIndex={0}
                    disabled
                >
                    <svg
                        className={styles['goal-icon']}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Time Goal
                </button> */}
            </div>
        </div>
    );
}
