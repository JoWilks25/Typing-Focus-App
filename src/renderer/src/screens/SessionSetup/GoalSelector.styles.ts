import styled from 'styled-components';

export const SelectorContainer = styled.div`
  margin-bottom: 1.5rem;
  min-width: 0; /* Allow proper flex/grid behavior */
`;

export const SelectorLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 0.75rem;
`;

export const SelectorGroup = styled.div`
  display: flex;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  background-color: ${props => props.theme.colors.background.primary};
`;

export const GoalButton = styled.button<{ $isActive?: boolean; $isDisabled?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: all 0.2s ease;
  border: none;
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  position: relative;

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }

  ${props => props.$isActive && !props.$isDisabled && `
    background-color: ${props.theme.colors.button.primary.bg};
    color: ${props.theme.colors.button.text};
  `}

  ${props => !props.$isActive && !props.$isDisabled && `
    background-color: ${props.theme.colors.background.quaternary};
    color: ${props.theme.colors.text.secondary};

    &:hover {
      background-color: ${props.theme.colors.background.tertiary};
    }
  `}

  ${props => props.$isDisabled && `
    background-color: ${props.theme.colors.background.tertiary};
    color: ${props.theme.colors.text.tertiary};
    opacity: 0.7;

    &:hover {
      background-color: ${props.theme.colors.background.tertiary};
    }
  `}
`;

export const GoalText = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const GoalIcon = styled.svg`
  width: 1rem;
  height: 1rem;
`;

export const FutureFeatureNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: rgba(245, 158, 11, 0.2);
  border: 1px solid ${props => props.theme.colors.accent.amber};
  border-radius: 0.375rem;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.accent.amberDark};
`;

export const NoticeIcon = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
`;

export const NoticeText = styled.span`
  font-weight: ${props => props.theme.fontWeights.medium};
`;