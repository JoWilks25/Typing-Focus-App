import styled from 'styled-components';

export const ModalOverlay = styled.div<{ $zIndex: number }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.$zIndex};
`;

export const ModalContainer = styled.div<{
  $width: number | string;
  $height: number | string;
  $maxWidth: number | string;
  $maxHeight: number | string;
  $zIndex: number;
}>`
  position: relative;
  width: ${props => typeof props.$width === 'number' ? `${props.$width}px` : props.$width};
  height: ${props => typeof props.$height === 'number' ? `${props.$height}px` : props.$height};
  max-width: ${props => typeof props.$maxWidth === 'number' ? `${props.$maxWidth}px` : props.$maxWidth};
  max-height: ${props => typeof props.$maxHeight === 'number' ? `${props.$maxHeight}px` : props.$maxHeight};
  background-color: ${props => props.theme.colors.background.tertiary};
  border-radius: 0.5rem;
  border: 2px solid ${props => props.theme.colors.border.secondary};
  box-shadow: 0 20px 25px -5px ${props => props.theme.colors.shadow.lg},
              0 10px 10px -5px ${props => props.theme.colors.shadow.md};
  z-index: ${props => props.$zIndex};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 25px 30px -5px ${props => props.theme.colors.shadow.lg},
                0 15px 15px -5px ${props => props.theme.colors.shadow.md};
  }
`;

export const ModalHeader = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  user-select: none;
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
  padding: 0.75rem;
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