// src/renderer/src/screens/SessionModals/InactivityModal.styles.ts
// Purpose: Inactivity modal styling with styled-components

import styled from 'styled-components';

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
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 28rem; /* max-w-md */
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 50px -12px ${props => props.theme.colors.shadow.md};
  border: 2px solid ${props => props.theme.colors.accent.blue};
  max-height: 90vh;
  overflow-y: auto;
`;

export const PauseIcon = styled.div`
  margin-bottom: 1rem;
`;

export const PauseEmoji = styled.div`
  font-size: ${props => props.theme.fontSizes['5xl']};
  display: inline-block;
  filter: drop-shadow(0 0 8px ${props => props.theme.colors.shadow.accent});
`;

export const ModalTitle = styled.h2`
  color: ${props => props.theme.colors.text.title};
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin-bottom: 1rem;
`;

export const MainMessage = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.base};
  line-height: ${props => props.theme.lineHeights.relaxed};
  margin-bottom: 1rem;
`;

export const Subtext = styled.p`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: 1.5rem;
`;

export const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: ${props => props.theme.colors.background.tertiary};
  border-radius: 0.5rem;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

export const StatLabel = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const StatValue = styled.span`
  color: ${props => props.theme.colors.text.title};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

export const TreeIcon = styled.div`
  margin-bottom: 2rem;
`;

export const TreeEmoji = styled.div`
  font-size: ${props => props.theme.fontSizes['3xl']};
  display: inline-block;
  filter: drop-shadow(0 0 4px ${props => props.theme.colors.shadow.accent});
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const ResumeButton = styled.button`
  flex: 1;
  background-color: ${props => props.theme.colors.button.primary.bg};
  color: ${props => props.theme.colors.button.text};
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${props => props.theme.colors.shadow.accent};

  &:hover {
    background-color: ${props => props.theme.colors.button.primary.bgHover};
    transform: translateY(-0.125rem);
    box-shadow: 0 4px 8px ${props => props.theme.colors.shadow.accentHover};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const EndSessionButton = styled.button`
  flex: 1;
  background-color: transparent;
  color: ${props => props.theme.colors.text.tertiary};
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.background.tertiary};
    color: ${props => props.theme.colors.text.secondary};
    border-color: ${props => props.theme.colors.border.tertiary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const BottomHint = styled.p`
  color: ${props => props.theme.colors.text.quaternary};
  font-size: ${props => props.theme.fontSizes.xs};
`;
