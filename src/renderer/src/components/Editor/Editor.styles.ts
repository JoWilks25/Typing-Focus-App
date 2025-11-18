import styled from 'styled-components';

export const EditorContainer = styled.div`
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px ${props => props.theme.colors.shadow.sm};
  min-height: 500px;
  display: flex;
  flex-direction: column;
`;

export const EditorTitle = styled.div`
  padding: 1rem 0 0 1rem;
`;

export const EditorTitleText = styled.h1`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  line-height: ${props => props.theme.lineHeights.tight};
  letter-spacing: -0.025em;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes['2xl']};
  }

  @media (max-width: 480px) {
    font-size: ${props => props.theme.fontSizes.xl};
  }
`;

export const EditorMain = styled.div`
  display: flex;
  flex: 1;
  gap: 1rem;
  padding: 1rem;
  min-height: calc(100vh - 150px);
  height: calc(100vh - 150px); /* Add explicit height */
  max-height: calc(100vh - 150px); /* Constrain height */
`;

export const EditorContentDiv = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px); /* Fixed height based on viewport */
  background-color: ${props => props.theme.colors.background.primary};
  border-radius: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
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

export const DisabledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.background.overlay};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
  text-align: center;
`;

export const TipTapEditor = styled.div<{ $disabled?: boolean }>`
  flex: 1;
  padding: 1rem;
  min-height: 0;
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  .tiptap {
    outline: none;
    /* Basic editor styles */
    :first-child {
      margin-top: 0;
    }

    /* List styles */
    ul,
    ol {
      padding: 0 1rem;
      margin: 1.25rem 1rem 1.25rem 0.4rem;

      li p {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
      }
    }

    /* Heading styles */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
      margin-top: 2.5rem;
      text-wrap: pretty;
    }

    h1,
    h2 {
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.4rem;
    }

    h2 {
      font-size: 1.2rem;
    }

    h3 {
      font-size: 1.1rem;
    }

    h4,
    h5,
    h6 {
      font-size: 1rem;
    }

    /* Code and preformatted text styles */
    code {
      background-color: ${props => props.theme.colors.accent.purple}33;
      border-radius: 0.4rem;
      color: ${props => props.theme.colors.text.inverse};
      font-size: 0.85rem;
      padding: 0.25em 0.3em;
    }

    pre {
      background: ${props => props.theme.colors.background.primary};
      border-radius: 0.5rem;
      color: ${props => props.theme.colors.text.primary};
      font-family: ${props => props.theme.fonts.mono};
      margin: 1.5rem 0;
      padding: 0.75rem 1rem;

      code {
        background: none;
        color: inherit;
        font-size: 0.8rem;
        padding: 0;
      }
    }

    blockquote {
      border-left: 3px solid ${props => props.theme.colors.border.secondary};
      margin: 1.5rem 0;
      padding-left: 1rem;
    }

    hr {
      border: none;
      border-top: 1px solid ${props => props.theme.colors.border.primary};
      margin: 2rem 0;
    }
  }
`;

export const EditorContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  min-height: 0; /* Important for flex scrolling */
`;