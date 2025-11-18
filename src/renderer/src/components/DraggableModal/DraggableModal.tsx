import React from 'react';
import { useDraggableModal, SizeConstraints } from '@renderer/hooks/useDraggableModal';
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalContent,
  ResizeHandle,
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
  /** Initial size of the modal */
  initialSize?: { width: number; height: number };
  /** Size constraints */
  sizeConstraints?: SizeConstraints;
  /** Modal content */
  children: React.ReactNode;
  /** Optional custom z-index */
  zIndex?: number;
  /** Whether to show resize handles (default: true) */
  resizable?: boolean;
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  title,
  isVisible,
  onClose,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 300, height: 400 },
  sizeConstraints,
  children,
  zIndex = 1000,
  resizable = true,
}) => {
  const {
    ref,
    position,
    size,
    isDragging,
    isResizing,
    handleMouseDown,
    handleResizeMouseDown
  } = useDraggableModal(initialPosition, initialSize, sizeConstraints);

  if (!isVisible) return null;

  return (
    <ModalContainer
      ref={ref}
      $x={position.x}
      $y={position.y}
      $width={size.width}
      $height={size.height}
      $zIndex={zIndex}
      $isDragging={isDragging}
      $isResizing={isResizing}
    >
      <ModalHeader onMouseDown={handleMouseDown}>
        <ModalTitle>{title}</ModalTitle>
        <ModalCloseButton onClick={onClose} aria-label="Close modal">
          ×
        </ModalCloseButton>
      </ModalHeader>
      <ModalContent>{children}</ModalContent>

      {resizable && (
        <>
          {/* Corner handles */}
          <ResizeHandle $direction="nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
          <ResizeHandle $direction="ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
          <ResizeHandle $direction="sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
          <ResizeHandle $direction="se" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />

          {/* Edge handles */}
          <ResizeHandle $direction="n" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
          <ResizeHandle $direction="s" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
          <ResizeHandle $direction="e" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
          <ResizeHandle $direction="w" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
        </>
      )}
    </ModalContainer>
  );
};