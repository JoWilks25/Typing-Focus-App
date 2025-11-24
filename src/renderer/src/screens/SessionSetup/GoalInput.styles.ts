// src/renderer/src/screens/SessionSetup/GoalInput.styles.ts
// Purpose: Goal input field styling with styled-components

import styled from 'styled-components';

export const InputContainer = styled.div`
  margin-bottom: 1.5rem;
  min-width: 0; /* Allow proper flex/grid behavior */
`;

export const InputLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

export const InputField = styled.input<{ $isInvalid?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.$isInvalid ? props.theme.colors.accent.red : props.theme.colors.border.tertiary};
  border-radius: 0.5rem;
  font-size: ${props => props.theme.fontSizes.base};
  background-color: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.2s ease;
  box-sizing: border-box; /* Add this to include border in width calculation */

  &:focus {
    outline: 2px solid ${props => props.$isInvalid ? props.theme.colors.accent.red : props.theme.colors.accent.blue};
    outline-offset: 2px;
    border-color: ${props => props.$isInvalid ? props.theme.colors.accent.red : props.theme.colors.accent.blue};
  }
`;

export const InputHint = styled.p`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.quaternary};
  margin-top: 0.25rem;
`;

export const InputError = styled.p`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.accent.red};
  margin-top: 0.25rem;
`;