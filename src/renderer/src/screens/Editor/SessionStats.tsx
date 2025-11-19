import { useState } from 'react';
import { AiOutlineExport } from "react-icons/ai";
import { DraggableModal } from '@renderer/components/DraggableModal/DraggableModal';
import { SessionStatsModal } from './SessionStatsModal';
import {
  HeaderStatsContainer,
  HeaderStatItem,
  HeaderStatLabel,
  HeaderStatValue,
  HeaderTimerValue,
  HeaderTimerIndicator,
  HeaderProgressBar,
  ExpandButton,
} from './SessionStats.styles';

// Compact header version for inline display
export const SessionStats = () => {
  const [showModal, setShowModal] = useState(false);

  // Hardcoded values for now
  const wordCount = 1250;
  const sessionDuration = '00:45:23';
  const isTimerRunning = true;
  const goalProgress = 62.5; // percentage

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
              <HeaderTimerValue $isRunning={isTimerRunning}>
                {sessionDuration}
                {isTimerRunning && <HeaderTimerIndicator />}
              </HeaderTimerValue>
            </HeaderStatItem>

            <HeaderStatItem>
              <HeaderStatLabel>Progress</HeaderStatLabel>
              <HeaderStatValue>{Math.round(goalProgress)}%</HeaderStatValue>
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
        <SessionStatsModal />
      </DraggableModal>
    </>
  );
};