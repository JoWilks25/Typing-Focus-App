import styled from 'styled-components';

export const FloatingModal = styled.div`
  background: ${props => props.theme.colors.background.overlayLight};
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.accent};
  box-shadow:
    0 25px 50px -12px ${props => props.theme.colors.shadow.md},
    0 0 0 1px ${props => props.theme.colors.shadow.accent};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  transition: all 0.2s ease;
  min-width: 300px;
  min-height: 200px;
  position: fixed;
  z-index: 9999;

  &:hover {
    box-shadow:
      0 25px 50px -12px ${props => props.theme.colors.shadow.lg},
      0 0 0 1px ${props => props.theme.colors.shadow.accentHover};
  }
`;

export const Header = styled.div`
  height: 32px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  cursor: move;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(239, 68, 68, 0.1);
`;

export const Title = styled.div`
  color: ${props => props.theme.colors.text.title};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
`;

export const Controls = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

export const ControlButton = styled.button`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.inverse};
  line-height: ${props => props.theme.lineHeights.tight};

  &:hover {
    transform: scale(1.1);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const CloseButton = styled(ControlButton)`
  background: ${props => props.theme.colors.accent.red};

  &:hover {
    background: ${props => props.theme.colors.accent.redDark};
  }
`;

export const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow: auto;
  color: ${props => props.theme.colors.text.title};
  background: transparent;
  text-align: center;
`;

export const WarningIcon = styled.div`
  margin-bottom: 12px;
`;

export const WarningEmoji = styled.div`
  font-size: ${props => props.theme.fontSizes['4xl']};
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.3));
`;

export const WarningTitle = styled.div`
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.title};
  margin-bottom: 8px;
`;

export const WarningMessage = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 16px;
  line-height: ${props => props.theme.lineHeights.normal};
`;

export const Countdown = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.accent.red};
  margin-bottom: 16px;
  font-family: ${props => props.theme.fonts.mono};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
`;

export const ReturnButton = styled(ActionButton)`
  background-color: ${props => props.theme.colors.accent.red};
  color: ${props => props.theme.colors.button.text};

  &:hover {
    background-color: ${props => props.theme.colors.accent.redDark};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const EndButton = styled(ActionButton)`
  background-color: ${props => props.theme.colors.button.secondary.bg};
  color: ${props => props.theme.colors.button.text};
  border: 1px solid ${props => props.theme.colors.border.tertiary};

  &:hover {
    background-color: ${props => props.theme.colors.button.secondary.bgHover};
    border-color: ${props => props.theme.colors.border.tertiary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;