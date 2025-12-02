import styled from 'styled-components';

export const SetupContainer = styled.div`
  max-width: clamp(28rem, 90vw, 64rem);
  margin: 0 auto;
  padding: 0 1rem; /* modest side padding so 90vw doesn't touch edges */

  input::placeholder {
    color: ${props => props.theme.colors.text.quaternary};
    opacity: 0.7;
  }

  input::-webkit-input-placeholder {
    color: ${props => props.theme.colors.text.quaternary};
    opacity: 0.7;
  }

  input::-moz-placeholder {
    color: ${props => props.theme.colors.text.quaternary};
    opacity: 0.7;
  }

  input:-ms-input-placeholder {
    color: ${props => props.theme.colors.text.quaternary};
    opacity: 0.7;
  }
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

export const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
`;

export const FileSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

export const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.xl};
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text.primary};
`;

/* File mode toggle - segmented control */
export const FileModeToggle = styled.div`
  display: flex;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  background-color: ${props => props.theme.colors.background.primary};
  margin-bottom: 1.5rem;
`;

export const FileModeButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.3)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? props.theme.colors.accent.blueLight : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.theme.fontWeights.medium};

  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: -2px;
  }

  ${props => props.$active && `
    border-color: rgba(59, 130, 246, 0.4);
  `}
`;

export const FileModeButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

export const LoadFileButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  color: ${props => props.theme.colors.accent.blueLight};
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.theme.fontWeights.medium};
  height: 3rem;

  &:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
  }
`;

export const NewFileButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 4px;
  color: ${props => props.theme.colors.accent.redLight};
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.theme.fontWeights.medium};
  height: 3rem;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.6);
  }
`;

export const InitialWordInfo = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 4px;
  color: ${props => props.theme.colors.accent.greenLighter};
  font-size: ${props => props.theme.fontSizes.sm};
`;

export const FilenameInput = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: ${props => props.theme.fontWeights.medium};
  }

  input {
    width: 90%;
    padding: 0.75rem;
    background-color: ${props => props.theme.colors.background.primary};
    border: 1px solid ${props => props.theme.colors.border.tertiary};
    border-radius: 4px;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.fontSizes.base};
  }

  input:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
    border-color: ${props => props.theme.colors.accent.blue};
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.$hasError ? props.theme.colors.accent.redError : props.theme.colors.border.tertiary};
  border-radius: 4px;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.fontSizes.base};

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
    border-color: ${props => props.theme.colors.accent.blue};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const ErrorText = styled.span`
  display: block;
  margin-top: 0.5rem;
  color: ${props => props.theme.colors.accent.redError};
  font-size: ${props => props.theme.fontSizes.sm};
`;

export const LocationSection = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: ${props => props.theme.fontWeights.medium};
  }
`;

export const LocationDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0; /* allow the path to shrink and ellipsis correctly */
`;

export const PathDisplay = styled.span`
  flex: 1;
  min-width: 0; /* critical for ellipsis in flex containers */
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  border-radius: 4px;
  font-family: ${props => props.theme.fonts.mono};
  font-size: ${props => props.theme.fontSizes.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BrowseButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  border-radius: 4px;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
    border-color: ${props => props.theme.colors.border.tertiary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const PathPreview = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: ${props => props.theme.fontSizes.sm};

  strong {
    display: block;
    margin-bottom: 0.25rem;
  }
`;

export const PreviewPath = styled.div`
  font-family: ${props => props.theme.fonts.mono};
  color: ${props => props.theme.colors.text.secondary};
  word-break: break-all;
`;

export const AdvancedSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const AdvancedToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: color 0.2s ease;
  background: none;
  border: none;
  padding: 0;

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

export const AdvancedArrow = styled.span<{ $rotated?: boolean }>`
  transform: ${props => props.$rotated ? 'rotate(90deg)' : 'none'};
  transition: transform 0.2s ease;
`;

export const AdvancedContent = styled.div`
  margin-top: 0.75rem;
  padding: 1rem;
  background-color: ${props => props.theme.colors.background.tertiary};
  border-radius: 0.375rem;
`;

export const AdvancedText = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

export const SubmitButton = styled.button<{ $enabled?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: all 0.2s ease;
  border: none;
  cursor: ${props => props.$enabled ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-sizing: border-box;
  background-color: ${props => props.$enabled ? props.theme.colors.button.primary.bg : props.theme.colors.button.disabled.bg};
  color: ${props => props.$enabled ? props.theme.colors.button.text : props.theme.colors.button.textDisabled};

  &:hover {
    background-color: ${props => props.$enabled ? props.theme.colors.button.primary.bgHover : props.theme.colors.button.disabled.bg};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const SubmitHint = styled.span`
  font-size: ${props => props.theme.fontSizes.xs};
  opacity: 0.75;
`;

/* Responsive form grid for Goal Selector + Goal Input */
export const FormGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

/* File grid for filename + location in new file mode */
export const FileGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 900px) {
    grid-template-rows: 1fr 1fr;
    align-items: end;
  }
`;

/* Auto-generated filename display (disabled state) */
export const FilenameDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  input {
    flex: 1;
    padding: 0.75rem;
    background-color: ${props => props.theme.colors.background.primary};
    border: 1px solid ${props => props.theme.colors.border.tertiary};
    border-radius: 4px;
    color: ${props => props.theme.colors.text.tertiary};
    font-size: ${props => props.theme.fontSizes.base};
    cursor: not-allowed;
  }
`;

/* Customize filename link */
export const EditIconButton = styled.button`
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  border-radius: 4px;
  color: ${props => props.theme.colors.accent.blueLight};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem; /* Ensure consistent button size */

  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
    border-color: ${props => props.theme.colors.border.tertiary};
    color: ${props => props.theme.colors.accent.blueLighter};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/* Reuse the same base as .edit-icon-button for consistency */
export const ConfirmIconButton = styled.button`
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  border-radius: 4px;
  color: ${props => props.theme.colors.accent.blueLight};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
    border-color: ${props => props.theme.colors.border.tertiary};
    color: ${props => props.theme.colors.accent.blueLighter};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelIconButton = styled.button`
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  border-radius: 4px;
  color: ${props => props.theme.colors.accent.blueLight};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
    border-color: ${props => props.theme.colors.border.tertiary};
    color: ${props => props.theme.colors.accent.blueLighter};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const LoadFileRow = styled.div`
  display: flex;
  gap: 1rem;
`;

/* Recent files list */
export const RecentFilesList = styled.div`
  margin-bottom: 1rem;
`;

export const RecentFilesTitle = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 0.75rem;
`;

export const RecentFileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.tertiary};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
    border-color: ${props => props.theme.colors.border.tertiary};
  }
`;

export const RecentFileIcon = styled.span`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.accent.blueLight};
`;

export const RecentFileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const RecentFileName = styled.div`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RecentFileDate = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.tertiary};
`;

export const RecentFilePath = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.quaternary};
  font-family: ${props => props.theme.fonts.mono};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* Divider for "or" text */
export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.fontSizes.sm};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const DividerText = styled.span`
  padding: 0 1rem;
`;

/* Loaded file summary */
export const LoadedFileSummary = styled.div`
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 4px;
  margin-bottom: 1rem;
`;

export const LoadedFileTitle = styled.div`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.accent.greenLighter};
  margin-bottom: 0.5rem;
`;

export const LoadedFilePath = styled.div`
  font-family: ${props => props.theme.fonts.mono};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.accent.greenLighter};
  margin-bottom: 0.25rem;
`;

export const LoadedFileStats = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.accent.greenLighter};
`;
