import styled from 'styled-components';

export const ModalContainer = styled.div<{
  $x: number;
  $y: number;
  $width: number;
  $height: number;
  $zIndex: number;
  $isDragging: boolean;
  $isResizing: boolean;
}>`
  position: fixed;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  min-width: 250px;
  max-width: 90vw;
  max-height: 90vh;
  background-color: ${props => props.theme.colors.background.tertiary};
  border-radius: 0.5rem;
  border: 2px solid ${props => props.theme.colors.border.secondary};
  box-shadow: 0 20px 25px -5px ${props => props.theme.colors.shadow.lg},
              0 10px 10px -5px ${props => props.theme.colors.shadow.md};
  z-index: ${props => props.$zIndex};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: ${props => (props.$isDragging || props.$isResizing) ? 'none' : 'auto'};
  cursor: ${props => props.$isDragging ? 'grabbing' : 'default'};
  transition: ${props => (props.$isDragging || props.$isResizing) ? 'none' : 'box-shadow 0.2s ease'};

  &:hover {
    box-shadow: ${props => (props.$isDragging || props.$isResizing)
    ? `0 20px 25px -5px ${props.theme.colors.shadow.lg}, 0 10px 10px -5px ${props.theme.colors.shadow.md}`
    : `0 25px 30px -5px ${props.theme.colors.shadow.lg}, 0 15px 15px -5px ${props.theme.colors.shadow.md}`};
  }
`;

export const ModalHeader = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  flex-shrink: 0;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

export const ModalTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: ${props => props.theme.fontSizes['2xl']};
  line-height: 1;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;

  &:hover {
    background-color: ${props => props.theme.colors.background.tertiary};
    color: ${props => props.theme.colors.text.primary};
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const ModalContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.secondary};
    border-radius: 4px;

    &:hover {
      background: ${props => props.theme.colors.border.tertiary};
    }
  }
`;

export const ResizeHandle = styled.div<{ $direction: string }>`
  position: absolute;
  background-color: transparent;
  z-index: 1;

  ${props => {
    const size = 8;
    const offset = -4; // Half of size to center on edge

    switch (props.$direction) {
      case 'n':
        return `
          top: ${offset}px;
          left: 0;
          right: 0;
          height: ${size}px;
          cursor: ns-resize;
        `;
      case 's':
        return `
          bottom: ${offset}px;
          left: 0;
          right: 0;
          height: ${size}px;
          cursor: ns-resize;
        `;
      case 'e':
        return `
          right: ${offset}px;
          top: 0;
          bottom: 0;
          width: ${size}px;
          cursor: ew-resize;
        `;
      case 'w':
        return `
          left: ${offset}px;
          top: 0;
          bottom: 0;
          width: ${size}px;
          cursor: ew-resize;
        `;
      case 'ne':
        return `
          top: ${offset}px;
          right: ${offset}px;
          width: ${size}px;
          height: ${size}px;
          cursor: nesw-resize;
        `;
      case 'nw':
        return `
          top: ${offset}px;
          left: ${offset}px;
          width: ${size}px;
          height: ${size}px;
          cursor: nwse-resize;
        `;
      case 'se':
        return `
          bottom: ${offset}px;
          right: ${offset}px;
          width: ${size}px;
          height: ${size}px;
          cursor: nwse-resize;
        `;
      case 'sw':
        return `
          bottom: ${offset}px;
          left: ${offset}px;
          width: ${size}px;
          height: ${size}px;
          cursor: nesw-resize;
        `;
      default:
        return '';
    }
  }}

  &:hover {
    background-color: ${props => props.theme.colors.accent.blue}40;
  }

  &:active {
    background-color: ${props => props.theme.colors.accent.blue}60;
  }
`;