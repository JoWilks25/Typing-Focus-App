import React from 'react';
import type { GoalType } from '@renderer/stores/SessionStore';
import {
  sanitizeInput,
  getRecommendedRange,
  getDefaultValue,
  formatGoalValue
} from '@renderer/utilities/validation';
import {
  InputContainer,
  InputLabel,
  InputField,
  InputHint,
} from './GoalInput.styles';

interface GoalInputProps {
  goalType: GoalType;
  value: number;
  onChange: (value: number) => void;
}

export function GoalInput({ goalType, value, onChange }: GoalInputProps): React.JSX.Element {
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Let the form handle submission
      event.preventDefault();
    }
  };

  const getLabel = () => {
    return goalType === 'wordcount' ? 'Target Word Count' : 'Target Time Duration';
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
    <InputContainer>
      <InputLabel htmlFor="goal-input">
        {getLabel()}
      </InputLabel>

      <InputField
        id="goal-input"
        type="text"
        inputMode="numeric"
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        aria-describedby="goal-recommendation"
      />

      <InputHint
        id="goal-recommendation"
      >
        {getRecommendationText()}
      </InputHint>
    </InputContainer>
  );
}