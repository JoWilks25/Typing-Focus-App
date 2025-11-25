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

interface CompletionModalProps {
  showModal: (value: boolean) => void;
}

export function CompletionModal({ showModal }: CompletionModalProps): React.JSX.Element {
  const wordCount = useEditorStore(state => state.wordCount);
  const goalValue = useEditorStore(state => state.goal);
  const goalType = useSessionStore(state => state.goalType);
  const endSession = useSessionStore(state => state.endSession);
  const { formattedTime } = useSessionTimer();

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
                {/* {formattedTime} */}
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
              onClick={() => showModal(false)}
              $variant="secondary"
            >
              Keep Writing
            </ActionButton>
            <ActionButton
              onClick={() => {
                endSession();
                showModal(false);
              }}
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
