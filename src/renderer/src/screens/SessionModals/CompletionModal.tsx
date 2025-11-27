import React, { useEffect } from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalContent,
  Header,
  CelebrationIcon,
  Title,
  Subtitle,
  Stats,
  StatItem,
  StatValue,
  StatLabel,
  Actions,
  ActionButton,
} from './CompletionModal.styles';
import { useEditorStore } from '@renderer/stores/EditorStore';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useSessionTimer } from '@renderer/hooks/useSessionTimer';
import { useAppStore } from '@renderer/stores/AppStore';

interface CompletionModalProps {
  showModal: (value: boolean) => void;
  clearAndCloseEditor: () => void;
}

export function CompletionModal({ showModal, clearAndCloseEditor }: CompletionModalProps): React.JSX.Element {
  const wordCount = useEditorStore(state => state.wordCount);
  const goalValue = useEditorStore(state => state.goal);
  const resetEditor = useEditorStore(state => state.resetEditor);
  const goalType = useSessionStore(state => state.goalType);
  const endSession = useSessionStore(state => state.endSession);
  const setSessionActive = useSessionStore(state => state.setSessionActive);
  const { formattedTime } = useSessionTimer();
  const setView = useAppStore((state) => state.setView);

  const handleKeepWriting = () => {
    setSessionActive(true);
    showModal(false);
  }

  const handleEndSession = () => {
    endSession();
    clearAndCloseEditor();
    resetEditor();
    showModal(false);
    setView('session-summary');
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalContent>
          {/* Header */}
          <Header>
            <CelebrationIcon>🎉</CelebrationIcon>
            <Title>Goal Reached!</Title>
            <Subtitle>
              Congratulations! You&apos;ve achieved your {goalType === 'wordcount' ? 'word count' : 'time'} goal.
            </Subtitle>
          </Header>

          {/* Stats */}
          <Stats>
            <StatItem>
              <StatValue>{wordCount}</StatValue>
              <StatLabel>words written</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                {formattedTime}
              </StatValue>
              <StatLabel>time elapsed</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{goalValue}</StatValue>
              <StatLabel>
                {goalType === 'wordcount' ? 'words' : 'minutes'} goal
              </StatLabel>
            </StatItem>
          </Stats>

          {/* Actions */}
          <Actions>
            <ActionButton
              onClick={handleKeepWriting}
              $variant="secondary"
            >
              Keep Writing
            </ActionButton>
            <ActionButton
              onClick={handleEndSession}
              $variant="primary"
            >
              End Session
            </ActionButton>
          </Actions>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
}
