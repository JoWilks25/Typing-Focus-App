import styled from 'styled-components';

export const ControlGroup = styled.div<{ $disabled?: boolean }>`
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  padding: 0.75rem 1rem;
  flex-shrink: 0;
  width: 100%;
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

export const EditorToolbarButton = styled.button<{ $isActive?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border.secondary};
  border-radius: 0.375rem;
  background-color: ${props =>
    props.$isActive
      ? props.theme.colors.button.primary.bg
      : props.theme.colors.button.inactive.bg};
  color: ${props =>
    props.$isActive
      ? props.theme.colors.button.text
      : props.theme.colors.button.textInactive};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props =>
    props.$isActive
      ? props.theme.colors.button.primary.bgHover
      : props.theme.colors.button.inactive.bgHover};
    border-color: ${props => props.theme.colors.border.accent};
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const HeadingNumber = styled.span`
  font-size: 0.7em;
  vertical-align: middle;
  margin-left: -0.3em;
`;

export const EndSessionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border.secondary};
  border-radius: 0.375rem;
  background-color: ${props => props.theme.colors.button.primary.bg};
  color: ${props => props.theme.colors.button.text};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${props => props.theme.colors.button.primary.bgHover};
    border-color: ${props => props.theme.colors.border.accent};
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;