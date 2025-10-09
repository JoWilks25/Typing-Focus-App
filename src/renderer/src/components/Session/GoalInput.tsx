// src/renderer/src/components/Session/GoalInput.tsx
// Purpose: Goal input component with validation and dynamic labels

import React from 'react';
import type { GoalType } from '@renderer/types/session';
import {
    sanitizeInput,
    getRecommendedRange,
    getDefaultValue,
    formatGoalValue
} from '@renderer/utils/validation';
import styles from './GoalInput.module.css';

interface GoalInputProps {
    goalType: GoalType;
    value: number;
    onChange: (value: number) => void;
    isValid: boolean;
}

export function GoalInput({ goalType, value, onChange, isValid }: GoalInputProps): React.JSX.Element {
    // eslint-disable-next-line no-undef
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const sanitizedValue = sanitizeInput(rawValue);

        // Convert to number, defaulting to 0 if empty
        const numericValue = sanitizedValue === '' ? 0 : parseFloat(sanitizedValue);

        // Handle NaN case
        if (isNaN(numericValue)) {
            onChange(0);
            return;
        }

        onChange(numericValue);
    };

    // eslint-disable-next-line no-undef
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            // Let the form handle submission
            event.preventDefault();
        }
    };

    const getLabel = () => {
        return goalType === 'word' ? 'Target Word Count' : 'Target Time Duration';
    };

    const getPlaceholder = () => {
        const defaultValue = getDefaultValue(goalType);
        return formatGoalValue(goalType, defaultValue);
    };

    const getRecommendationText = () => {
        const recommended = getRecommendedRange(goalType);
        return `Recommended: ${recommended.label} for focused sessions`;
    };

    return (
        <div className={styles['input-container']}>
            <label htmlFor="goal-input" className={styles['input-label']}>
                {getLabel()}
            </label>

            <input
                id="goal-input"
                type="text"
                inputMode="numeric"
                value={value || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                className={`${styles['input-field']} ${!isValid ? styles['input-field-invalid'] : ''}`}
                aria-describedby="goal-recommendation"
                aria-invalid={!isValid}
            />

            <p
                id="goal-recommendation"
                className={styles['input-hint']}
            >
                {getRecommendationText()}
            </p>
        </div>
    );
}
