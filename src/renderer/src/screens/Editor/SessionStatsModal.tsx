import { useEditorStore } from '@renderer/stores/EditorStore';
import {
  StatsList,
  StatItem,
  StatLabel,
  StatValue,
  TimerValue,
  TimerIndicator,
  GoalValue,
  ProgressSection,
  ProgressBarContainer,
  ProgressBar,
  ProgressInfo,
  ProgressPercentage,
  ProgressText,
} from './SessionStatsModal.styles';
import { useState } from 'react';

export const SessionStatsModal = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const wordCount = useEditorStore(state => state.wordCount);
  const goalValue = useEditorStore(state => state.goal);;
  const goalProgress = useEditorStore(state => state.goalProgress);

  // Hardcoded values for now
  const sessionDuration = '00:00:00';
  const goalType = 'word'; // 'word' or 'minute'

  return (
    <StatsList>
      {/* Current Number of Words */}
      <StatItem>
        <StatLabel>Current Wordcount</StatLabel>
        <StatValue>{wordCount.toLocaleString()} words</StatValue>
      </StatItem>

      {/* Session duration */}
      <StatItem>
        <StatLabel>Session duration</StatLabel>
        <TimerValue $isRunning={isTimerRunning}>
          {sessionDuration}
          {isTimerRunning && <TimerIndicator />}
        </TimerValue>
      </StatItem>

      {/* Goal (Fixed Display) */}
      <StatItem>
        <StatLabel>Goal</StatLabel>
        <GoalValue>
          {goalValue.toLocaleString()} {goalType === 'word' ? 'words' : 'minutes'}
        </GoalValue>
      </StatItem>

      {/* Progress Meter */}
      <StatItem>
        <StatLabel>Progress</StatLabel>
        <ProgressSection>
          <ProgressInfo>
            <ProgressText>
              {wordCount.toLocaleString()} / {goalValue.toLocaleString()} {goalType === 'word' ? 'words' : 'minutes'}
            </ProgressText>
            <ProgressPercentage>{goalProgress}%</ProgressPercentage>
          </ProgressInfo>
          <ProgressBarContainer>
            <ProgressBar
              $color="green"
              $width={goalProgress}
            />
          </ProgressBarContainer>
        </ProgressSection>
      </StatItem>
    </StatsList>
  );
};
