import React from 'react';
import {
  SelectorContainer,
  SelectorLabel,
  SelectorGroup,
  GoalButton,
  GoalIcon,
  GoalText,
} from './GoalSelector.styles';
import { GoalType } from '@renderer/stores/SessionStore';

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
    <SelectorContainer>
      <SelectorLabel>
        Choose your goal type
      </SelectorLabel>

      <SelectorGroup
        role="group"
        aria-label="Choose your goal type"
      >
        {/* Word Count Goal Button */}
        <GoalButton
          type="button"
          data-testid="word-goal-button"
          $isActive={goalType === 'wordcount'}
          onClick={() => onGoalTypeChange('wordcount')}
          onKeyDown={(e) => handleKeyDown(e, 'wordcount')}
          aria-pressed={goalType === 'wordcount'}
          tabIndex={0}
        >
          {/* Document Icon */}
          <GoalIcon
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
          </GoalIcon>
          Word Count Goal
        </GoalButton>

        {/* Time Goal Button */}
        <GoalButton
          type="button"
          data-testid="time-goal-button"
          $isActive={goalType === 'time'}
          onClick={() => onGoalTypeChange('time')}
          onKeyDown={(e) => handleKeyDown(e, 'time')}
          aria-pressed={false}
          tabIndex={1}
        >
          <GoalIcon
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
          </GoalIcon>
          <GoalText>Time Goal</GoalText>
        </GoalButton>
      </SelectorGroup>

    </SelectorContainer>
  );
}