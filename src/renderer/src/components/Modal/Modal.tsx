import React from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalContent,
} from './Modal.styles';

export interface ModalProps {
  /** Modal title displayed in header */
  title: string;
  /** Whether the modal is visible */
  isVisible: boolean;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Width of the modal */
  width?: number | string;
  /** Height of the modal */
  height?: number | string;
  /** Maximum width of the modal */
  maxWidth?: number | string;
  /** Maximum height of the modal */
  maxHeight?: number | string;
  /** Modal content */
  children: React.ReactNode;
  /** Optional custom z-index */
  zIndex?: number;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  isVisible,
  onClose,
  width = 500,
  height = 'auto',
  maxWidth = '90vw',
  maxHeight = '90vh',
  children,
  zIndex = 1000,
}) => {
  if (!isVisible) return null;

  return (
    <ModalOverlay $zIndex={zIndex} onClick={onClose}>
      <ModalContainer
        $width={width}
        $height={height}
        $maxWidth={maxWidth}
        $maxHeight={maxHeight}
        $zIndex={zIndex + 1}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalCloseButton onClick={onClose} aria-label="Close modal">
            ×
          </ModalCloseButton>
        </ModalHeader>
        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};