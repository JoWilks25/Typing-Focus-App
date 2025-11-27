// src/renderer/src/components/Modals/InactivityModal.tsx
// Purpose: Modal shown when user is inactive for 3 minutes

import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@renderer/stores/EditorStore';
import {
  ModalOverlay,
  ModalContainer,
  PauseIcon,
  PauseEmoji,
  ModalTitle,
  MainMessage,
  Subtext,
  StatsContainer,
  StatItem,
  StatLabel,
  StatValue,
  TreeIcon,
  TreeEmoji,
  ActionButtons,
  ResumeButton,
  EndSessionButton,
  BottomHint,
} from './InactivityModal.styles';

interface InactivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onEndSession: () => void;
}

export const InactivityModal = ({ isVisible, onClose, onEndSession }: InactivityModalProps) => {
  // Get current word count from EditorStore
  const wordCount = useEditorStore(state => state.wordCount);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
    if (!isVisible) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClose();
    }
  }, [isVisible, onClose]);

  // Add keyboard event listener
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isVisible, handleKeyDown]);

  if (!isVisible) {
    return null;
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        {/* Pause Icon */}
        <PauseIcon>
          <PauseEmoji>⏸️</PauseEmoji>
        </PauseIcon>

        {/* Heading */}
        <ModalTitle>Session Paused</ModalTitle>

        {/* Main Message */}
        <MainMessage>
          We noticed you haven&apos;t typed for a while. Your timer has been paused to keep your session time accurate. Ready to continue?
        </MainMessage>

        {/* Subtext */}
        <Subtext>
          Your progress is safe—no penalties applied.
        </Subtext>

        {/* Current Word Count */}
        <StatsContainer>
          <StatItem>
            <StatLabel>Words:</StatLabel>
            <StatValue>{wordCount}</StatValue>
          </StatItem>
        </StatsContainer>

        {/* Tree Icon Placeholder */}
        <TreeIcon>
          <TreeEmoji>🌱</TreeEmoji>
        </TreeIcon>

        {/* Action Buttons */}
        <ActionButtons>
          <ResumeButton
            onClick={onClose}
            autoFocus
          >
            Resume Writing
          </ResumeButton>
          <EndSessionButton    
            onClick={onEndSession}
          >
            End Session
          </EndSessionButton>
        </ActionButtons>

        {/* Bottom Hint */}
        <BottomHint>
          Taking a thinking break is normal! Press Space or Enter to resume quickly.
        </BottomHint>
      </ModalContainer>
    </ModalOverlay>
  );
};