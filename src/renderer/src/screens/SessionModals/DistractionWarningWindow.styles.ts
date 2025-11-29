import styled from 'styled-components';

export const WarningContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: ${(props) => props.theme.colors.background.primary};
`;

export const WarningContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 480px;
  width: 100%;
  padding: 2rem;
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border.secondary};
  box-shadow: 0 20px 25px -5px ${(props) => props.theme.colors.shadow.lg},
              0 10px 10px -5px ${(props) => props.theme.colors.shadow.md};
`;

export const WarningTitle = styled.h2`
  margin: 0;
  font-size: ${(props) => props.theme.fontSizes['2xl']};
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text.primary};
`;

export const WarningMessage = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.text.secondary};
  line-height: ${(props) => props.theme.lineHeights.relaxed};
  font-size: ${(props) => props.theme.fontSizes.base};
`;

export const CountdownText = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.accent.amber};
  font-size: ${(props) => props.theme.fontSizes.base};
  font-weight: ${(props) => props.theme.fontWeights.medium};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

export const WarningButton = styled.button<{ $secondary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: ${(props) => props.theme.fontSizes.base};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) =>
    props.$secondary
      ? `
    background: ${props.theme.colors.button.secondary.bg};
    color: ${props.theme.colors.button.text};
    
    &:hover {
      background: ${props.theme.colors.button.secondary.bgHover};
    }
  `
      : `
    background: ${props.theme.colors.button.primary.bg};
    color: ${props.theme.colors.button.text};
    
    &:hover {
      background: ${props.theme.colors.button.primary.bgHover};
    }
    
    &:active {
      background: ${props.theme.colors.button.primary.bgActive};
    }
  `}

  &:focus {
    outline: 2px solid ${(props) => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

