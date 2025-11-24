import styled from 'styled-components';

export const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 250px;
  padding: 1rem;
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border.primary};
  transition: all 0.3s ease-in-out;

  @media (max-width: 768px) {
    min-height: 200px;
    padding: 0.5rem;
  }

  @media (min-width: 1200px) {
    min-height: 300px;
  }
`;

export const TreeAnimation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 250px;
  flex: 1;
  position: relative;

  @media (max-width: 768px) {
    min-height: 150px;
    max-height: 250px;
  }

  @media (min-width: 1200px) {
    min-height: 300px;
    max-height: 500px;
  }
`;

export const PopOutButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: ${props => props.theme.colors.background.tertiary};
  border: 1px solid ${props => props.theme.colors.border.secondary};
  border-radius: 0.25rem;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  font-size: ${props => props.theme.fontSizes.lg};
  line-height: 1;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;

  &:hover {
    background-color: ${props => props.theme.colors.background.quaternary};
    color: ${props => props.theme.colors.text.primary};
    border-color: ${props => props.theme.colors.border.tertiary};
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const ProgressIndicator = styled.div`
  margin-top: 1rem;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  text-align: center;
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: opacity 0.3s ease-in-out;
`;
