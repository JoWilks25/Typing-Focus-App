import { useState } from 'react';
import { AiOutlineExport } from "react-icons/ai";
import { DraggableModal } from '@renderer/components/DraggableModal/DraggableModal';
import {
  HeaderStatsContainer,
  HeaderStatItem,
  HeaderStatLabel,
  HeaderStatValue,
  HeaderTimerValue,
  HeaderTimerIndicator,
  HeaderProgressBar,
  ExpandButton,
  StatsList,
  StatItem,
  StatLabel,
  StatValue,
  TimerValue,
  TimerIndicator,
  GoalValue,
  ProgressSection,
  ProgressInfo,
  ProgressText,
  ProgressPercentage,
  ProgressBarContainer,
  ProgressBar,
} from './SessionStats.styles';

import { useEditorStore } from '@renderer/stores/EditorStore';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useSessionTimer } from '@renderer/hooks/useSessionTimer';


// Compact header version for inline display
export const SessionStats = () => {
  const [showModal, setShowModal] = useState(false);
  const wordCount = useEditorStore(state => state.wordCount);
  const goalProgress = useEditorStore(state => state.goalProgress);
  const sessionActive = useSessionStore(state => state.sessionActive);
  const goalValue = useEditorStore(state => state.goal);;
  const goalType = useSessionStore(state => state.goalType);
  const { formattedTime, isRunning } = useSessionTimer();

  return (
    <>
      {
        !showModal ? (
          <HeaderStatsContainer>
            <HeaderStatItem>
              <HeaderStatLabel>Words</HeaderStatLabel>
              <HeaderStatValue>{wordCount.toLocaleString()}</HeaderStatValue>
            </HeaderStatItem>

            <HeaderStatItem>
              <HeaderStatLabel>Time</HeaderStatLabel>
              <HeaderTimerValue $isRunning={sessionActive}>
                {formattedTime}
                {sessionActive && <HeaderTimerIndicator />}
              </HeaderTimerValue>
            </HeaderStatItem>

            <HeaderStatItem>
              <HeaderStatLabel>Progress</HeaderStatLabel>
              <HeaderStatValue>{goalProgress}%</HeaderStatValue>
              <HeaderProgressBar $width={goalProgress} />
            </HeaderStatItem>

            <ExpandButton
              onClick={() => setShowModal(true)}
              title="Expand to detailed view"
              aria-label="Expand session stats"
            >
              <AiOutlineExport />
            </ExpandButton>
          </HeaderStatsContainer>
        ) : ''
      }

      <DraggableModal
        title="Session Stats"
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        initialPosition={{ x: 100, y: 100 }}
        initialSize={{ width: 180, height: 275 }}
        sizeConstraints={{
          minWidth: 120,
          maxWidth: 800,
          minHeight: 200,
          maxHeight: 600,
        }}
        resizable={true}
      >
        <StatsList>
          {/* Current Number of Words */}
          <StatItem>
            <StatLabel>Current Wordcount</StatLabel>
            <StatValue>{wordCount.toLocaleString()} words</StatValue>
          </StatItem>

          {/* Session duration */}
          <StatItem>
            <StatLabel>Session duration</StatLabel>
            <TimerValue $isRunning={isRunning}>
              {formattedTime}
              {isRunning && <TimerIndicator />}
            </TimerValue>
          </StatItem>

          {/* Goal (Fixed Display) */}
          <StatItem>
            <StatLabel>Goal</StatLabel>
            <GoalValue>
              {goalValue.toLocaleString()} {goalType === 'wordcount' ? 'words' : 'minutes'}
            </GoalValue>
          </StatItem>

          {/* Progress Meter */}
          <StatItem>
            <StatLabel>Progress</StatLabel>
            <ProgressSection>
              <ProgressInfo>
                <ProgressText>
                  {wordCount.toLocaleString()} / {goalValue.toLocaleString()} {goalType === 'wordcount' ? 'words' : 'minutes'}
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
      </DraggableModal>
    </>
  );
};