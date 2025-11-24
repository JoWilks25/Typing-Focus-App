import React from 'react';
import type { GoalType } from '@renderer/stores/SessionStore';
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
    const numericValue = rawValue === '' ? 0 : parseFloat(rawValue);
    onChange(numericValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <InputContainer>
      <InputLabel htmlFor="goal-input">
        {goalType === 'wordcount' ? 'Target Word Count' : 'Target Time Duration (min)'}
      </InputLabel>

      <InputField
        id="goal-input"
        type="number"
        inputMode="numeric"
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={goalType === 'wordcount' ? '500' : '30'}
        aria-describedby="goal-recommendation"
        min={goalType === 'wordcount' ? 50 : 5}
        max={goalType === 'wordcount' ? 100000 : 720}
      />

      <InputHint
        id="goal-recommendation"
      >
        Recommended: {goalType === 'wordcount' ? '250-1000 words' : '15-60 minutes'} for focused sessions
      </InputHint>
    </InputContainer>
  );
}