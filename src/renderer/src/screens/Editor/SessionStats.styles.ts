import styled, { keyframes } from 'styled-components';

// Keyframe animation for pulse effect
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 0.25rem;
  font-size: ${props => props.theme.fontSizes.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;

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

export const HeaderStatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
  padding: 0.25rem;
  margin: -0.25rem;
  border-radius: 0.375rem;

  &:has(${ExpandButton}:hover) {
    background-color: ${props => props.theme.colors.background.tertiary};
  }
`;
export const HeaderStatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
`;

export const HeaderStatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.quaternary};
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: ${props => props.theme.fontWeights.medium};
`;

export const HeaderStatValue = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

export const HeaderTimerValue = styled.div<{ $isRunning?: boolean }>`
  font-size: ${props => props.theme.fontSizes.sm};
  font-family: ${props => props.theme.fonts.mono};
  color: ${props =>
    props.$isRunning
      ? props.theme.colors.accent.greenLight
      : props.theme.colors.text.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

export const HeaderTimerIndicator = styled.div`
  width: 0.35rem;
  height: 0.35rem;
  background-color: ${props => props.theme.colors.accent.greenLight};
  border-radius: 50%;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

export const HeaderProgressBar = styled.div<{ $width?: number }>`
  width: 60px;
  height: 0.25rem;
  background-color: ${props => props.theme.colors.background.quaternary};
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 0.25rem;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$width ? `${props.$width}%` : '0%'};
    background-color: ${props => props.theme.colors.accent.green};
    transition: width 0.3s ease-out;
  }
`;
