import styled from 'styled-components';

export const EditorContainer = styled.div`
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px ${props => props.theme.colors.shadow.sm};
  min-height: 500px;
  display: flex;
  flex-direction: column;
`;

export const EditorMain = styled.div`
  display: flex;
  flex: 1;
  gap: 1rem;
  min-height: 400px;
`;

export const EditorContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AnimationSidebar = styled.div`
  flex: 0 0 auto;
  width: 300px;
  min-width: 250px;
  max-width: 400px;
  background-color: ${props => props.theme.colors.background.tertiary};
  border-radius: 0.5rem;
  border: 2px solid ${props => props.theme.colors.border.secondary};
`;

export const DisabledMessage = styled.div`
  h2 {
    font-size: ${props => props.theme.fontSizes['4xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.text.title};
    margin-bottom: 1rem;
  }

  p {
    color: ${props => props.theme.colors.text.secondary};
    margin-bottom: 2rem;
    font-size: ${props => props.theme.fontSizes.lg};
    line-height: ${props => props.theme.lineHeights.relaxed};
  }
`;

export const StartSessionButton = styled.button`
  padding: 1rem 2.5rem;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.gradient.button.start} 0%,
    ${props => props.theme.colors.gradient.button.end} 100%
  );
  color: ${props => props.theme.colors.button.text};
  border: none;
  border-radius: 0.75rem;
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px ${props => props.theme.colors.shadow.accent};
  text-transform: none;
  letter-spacing: 0.025em;

  &:hover {
    background: linear-gradient(
      135deg,
      ${props => props.theme.colors.button.primary.bgHover} 0%,
      ${props => props.theme.colors.button.primary.bgActive} 100%
    );
    box-shadow: 0 12px 35px ${props => props.theme.colors.shadow.accentHover};
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${props => props.theme.colors.shadow.accent};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.shadow.accent};
  }
`;

export const DisabledEditorContent = styled.div`
  text-align: center;
  max-width: 500px;
  padding: 2rem;
`;

