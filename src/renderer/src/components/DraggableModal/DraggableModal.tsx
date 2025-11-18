import React from 'react';
import { useDraggableModal } from '@renderer/hooks/useDraggableModal';
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalContent,
} from './DraggableModal.styles';

export interface DraggableModalProps {
  /** Modal title displayed in header */
  title: string;
  /** Whether the modal is visible */
  isVisible: boolean;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Initial position of the modal */
  initialPosition?: { x: number; y: number };
  /** Modal content */
  children: React.ReactNode;
  /** Optional custom width */
  width?: number | string;
  /** Optional custom height */
  height?: number | string;
  /** Optional custom z-index */
  zIndex?: number;
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  title,
  isVisible,
  onClose,
  initialPosition = { x: 100, y: 100 },
  children,
  width = 300,
  height = 400,
  zIndex = 1000,
}) => {
  const { ref, position, isDragging, handleMouseDown } = useDraggableModal(initialPosition);

  if (!isVisible) return null;

  return (
    <ModalContainer
      ref={ref}
      $x={position.x}
      $y={position.y}
      $width={width}
      $height={height}
      $zIndex={zIndex}
      $isDragging={isDragging}
    >
      <ModalHeader onMouseDown={handleMouseDown}>
        <ModalTitle>{title}</ModalTitle>
        <ModalCloseButton onClick={onClose} aria-label="Close modal">
          ×
        </ModalCloseButton>
      </ModalHeader>
      <ModalContent>{children}</ModalContent>
    </ModalContainer>
  );
};