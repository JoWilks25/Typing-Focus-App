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

export const SessionStatsModal = () => {
  // Hardcoded values for now
  const wordCount = 1250;
  const sessionDuration = '00:45:23';
  const isTimerRunning = true;
  const goalValue = 2000;
  const goalType = 'word'; // 'word' or 'minute'
  const goalProgress = 62.5; // percentage
  const currentProgress = 1250; // current words or minutes

  return (
    <StatsList>
      {/* Current Number of Words */}
      <StatItem>
        <StatLabel>Current Wordcount</StatLabel>
        <StatValue>{wordCount.toLocaleString()} words</StatValue>
      </StatItem>

      {/* Session Duration */}
      <StatItem>
        <StatLabel>Session Duration</StatLabel>
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
              {currentProgress.toLocaleString()} / {goalValue.toLocaleString()} {goalType === 'word' ? 'words' : 'minutes'}
            </ProgressText>
            <ProgressPercentage>{Math.round(goalProgress)}%</ProgressPercentage>
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
