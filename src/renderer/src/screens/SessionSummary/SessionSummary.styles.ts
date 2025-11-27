import styled from 'styled-components';

export const SummaryContainer = styled.div`
  max-width: 48rem; /* Increased from 32rem to 48rem (768px) */
  margin: 0 auto;
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: 0.75rem;
  padding: 0.5rem 2rem;
  box-shadow: 0 10px 25px -5px ${props => props.theme.colors.shadow.sm};
`;

export const Header = styled.div`
  margin-bottom: 1rem;
  text-align: center;
`;

export const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes['4xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.title};
  margin-bottom: 0.75rem;
`;

export const Subtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.text.tertiary};
  margin-bottom: 0;
`;

export const SummaryTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.title};
  margin-bottom: 1.5rem;
  text-align: center;
`;

export const ContentLayout = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
`;

export const TreeSection = styled.div`
  flex: 1;
  text-align: center;
  margin-bottom: 2rem;
`;

export const TreeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  width: 300px;
  height: 300px;
  min-width: 300px;
  min-height: 300px;
`;

export const TreeStatus = styled.div`
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text.title};
  text-align: center;
`;

export const ProgressSection = styled.div`
  margin-bottom: 2rem;
`;

export const ProgressTitle = styled.div`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 1rem;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: ${props => props.theme.colors.background.quaternary};
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

export const ProgressFill = styled.div<{ $width?: number }>`
  height: 100%;
  background-color: ${props => props.theme.colors.accent.green};
  transition: width 0.3s ease;
  width: ${props => props.$width ? `${Math.min(props.$width, 100)}%` : '0%'};
`;

export const ProgressText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  text-align: center;
`;

export const StatsSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const StatsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0;
`;

export const StatCard = styled.div`
  background-color: ${props => props.theme.colors.background.tertiary};
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  min-width: 200px;
`;

export const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

export const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.title};
`;

export const FileInfo = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background.tertiary};
  border-radius: 8px;

  h3 {
    font-size: ${props => props.theme.fontSizes.base};
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.text.secondary};
  }
`;

export const FilePath = styled.p`
  font-family: ${props => props.theme.fonts.mono};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.primary};
  word-break: break-all;
`;

export const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.$variant === 'primary' ? `
    background-color: ${props.theme.colors.button.primary.bg};
    color: ${props.theme.colors.button.text};

    &:hover {
      background-color: ${props.theme.colors.button.primary.bgHover};
    }

    &:focus {
      outline: 2px solid ${props.theme.colors.accent.blue};
      outline-offset: 2px;
    }
  ` : `
    background-color: ${props.theme.colors.button.secondary.bg};
    color: ${props.theme.colors.button.text};
    border: 1px solid ${props.theme.colors.border.tertiary};

    &:hover {
      background-color: ${props.theme.colors.button.secondary.bgHover};
      border-color: ${props.theme.colors.border.tertiary};
    }

    &:focus {
      outline: 2px solid ${props.theme.colors.accent.blue};
      outline-offset: 2px;
    }
  `}
`;