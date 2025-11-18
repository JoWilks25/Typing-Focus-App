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

export const StatsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Reduced from 1.5rem */
`;

export const StatItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* Reduced from 0.5rem */
`;

export const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.quaternary};
  text-transform: uppercase;
  letter-spacing: 0.03em; /* Reduced from 0.05em */
  font-weight: ${props => props.theme.fontWeights.medium};
`;

export const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes.base}; /* Reduced from lg */
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

export const TimerValue = styled.div<{ $isRunning?: boolean }>`
  font-size: ${props => props.theme.fontSizes.base}; /* Reduced from lg */
  font-family: ${props => props.theme.fonts.mono};
  color: ${props =>
    props.$isRunning
      ? props.theme.colors.accent.greenLight
      : props.theme.colors.text.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const TimerIndicator = styled.div`
  width: 0.4rem; /* Reduced from 0.5rem */
  height: 0.4rem; /* Reduced from 0.5rem */
  background-color: ${props => props.theme.colors.accent.greenLight};
  border-radius: 50%;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

export const GoalValue = styled.div`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

export const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem; /* Reduced from 0.5rem */
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 0.5rem; /* Reduced from 0.75rem */
  background-color: ${props => props.theme.colors.background.quaternary};
  border-radius: 9999px;
  overflow: hidden;
`;

export const ProgressBar = styled.div<{
  $color?: 'gray' | 'blue' | 'yellow' | 'green';
  $width?: number;
}>`
  height: 100%;
  width: ${props => props.$width ? `${props.$width}%` : '0%'};
  transition: all 0.3s ease-out;
  background-color: ${props => {
    switch (props.$color) {
      case 'gray':
        return props.theme.colors.text.quaternary;
      case 'blue':
        return props.theme.colors.accent.blue;
      case 'yellow':
        return props.theme.colors.accent.yellow;
      case 'green':
      default:
        return props.theme.colors.accent.green;
    }
  }};
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ProgressPercentage = styled.div`
  font-size: ${props => props.theme.fontSizes.xs}; /* Reduced from sm */
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

export const ProgressText = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.quaternary};
`;