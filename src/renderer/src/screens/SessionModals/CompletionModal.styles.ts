import styled, { keyframes } from 'styled-components';

// Keyframe animation for bounce effect
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.background.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px ${props => props.theme.colors.shadow.sm}, 
              0 10px 10px -5px ${props => props.theme.colors.shadow.sm};
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalContent = styled.div`
  padding: 2rem;
  text-align: center;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
`;

export const CelebrationIcon = styled.div`
  font-size: ${props => props.theme.fontSizes['5xl']};
  margin-bottom: 1rem;
  animation: ${bounce} 1s ease-in-out;
`;

export const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.title};
  margin: 0 0 0.5rem 0;
`;

export const Subtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.text.quaternary};
  margin: 0;
  line-height: ${props => props.theme.lineHeights.normal};
`;

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: 8px;
`;

export const StatItem = styled.div`
  text-align: center;
`;

export const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.title};
  margin-bottom: 0.25rem;
`;

export const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.quaternary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;

  ${props => props.$variant === 'primary' ? `
    background-color: ${props.theme.colors.button.primary.bg};
    color: ${props.theme.colors.button.text};

    &:hover {
      background-color: ${props.theme.colors.button.primary.bgHover};
    }

    &:focus {
      outline: 2px solid ${props.theme.colors.accent.blue};
      outline-offset: 2px;
    }
  ` : `
    background-color: ${props.theme.colors.background.primary};
    color: ${props.theme.colors.text.secondary};
    border: 1px solid ${props.theme.colors.border.tertiary};

    &:hover {
      background-color: ${props.theme.colors.background.secondary};
      border-color: ${props.theme.colors.border.tertiary};
    }

    &:focus {
      outline: 2px solid ${props.theme.colors.accent.blue};
      outline-offset: 2px;
    }
  `}
`;
