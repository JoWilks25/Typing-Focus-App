import React, { useEffect, useMemo, useState } from 'react';
import {
  SetupContainer,
  Header,
  Title,
  FileSection,
  FileModeToggle,
  FileModeButton,
  FileGrid,
  FilenameInput,
  Input,
  ErrorText,
  LocationSection,
  LocationDisplay,
  PathDisplay,
  BrowseButton,
  LoadFileRow,
  LoadFileButton,
  LoadedFileSummary,
  LoadedFileTitle,
  LoadedFilePath,
  LoadedFileStats,
  FormGrid,
  SubmitButton,
} from './SessionSetup.styles';
import { GoalType, useSessionStore } from '@renderer/stores/SessionStore';
import { GoalSelector } from './GoalSelector';
import { GoalInput } from './GoalInput';
import { useEditorStore } from '@renderer/stores/EditorStore';
import { fileNameCheck } from '@renderer/utilities/fileNameCheck';

const NEW = 'new';
const EXISTING = 'existing';

type FileModeType = typeof NEW | typeof EXISTING;

interface SessionSetup {
  closeModal: () => void;
}

export function SessionSetup({ closeModal }: SessionSetup): React.JSX.Element {
  const [fileMode, setFileMode] = useState<FileModeType>(NEW);
  const [isLoadingDefaultPath, setIsLoadingDefaultPath] = useState(true);
  const [formData, setFormData] = useState({
    fileName: 'test.txt',
    filePath: '',
    goal: 0,
    goalType: 'wordcount' as 'wordcount' | 'time',
  });
  const setInitSession = useSessionStore(state => state.setInitSession);
  const setGoal = useEditorStore(state => state.setGoal);

  // Load default save directory on mount
  useEffect(() => {
    const loadDefaultPath = async () => {
      try {
        const defaultPath = await window.api?.app?.getDefaultSaveDirectory();
        if (defaultPath) {
          setFormData(prev => ({ ...prev, filePath: defaultPath }));
        }
      } catch (error) {
        console.error('Failed to load default save directory:', error);
        // Fallback to empty string or a sensible default
        setFormData(prev => ({ ...prev, filePath: '' }));
      } finally {
        setIsLoadingDefaultPath(false);
      }
    };

    loadDefaultPath();
  }, []);

  const handleFileModeChange = (fileMode: FileModeType) => {
    setFileMode(fileMode);
  }

  // Update local state only
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, fileName: e.target.value }));
  };

  const isValidFileName = useMemo(() => {
    return fileNameCheck(formData.fileName);
  }, [formData.fileName])

  const handleGoalChange = (value: number) => {
    setFormData(prev => ({ ...prev, goal: value }));
  };

  const handleGoalTypeChange = (value: GoalType) => {
    setFormData(prev => ({ ...prev, goalType: value }));
  }

  // Update store on submit
  const handleSubmit = () => {
    // Construct full file path: directory + filename
    const fullFilePath = formData.filePath
      ? `${formData.filePath}/${formData.fileName}`
      : formData.fileName; // Fallback if no directory selected

    setInitSession(
      formData.fileName,
      fullFilePath, // Use full path here
      formData.goal,
      formData.goalType,
      true
    );
    setGoal(formData.goal);
    closeModal()
  };

  const handleBrowseDirectory = async () => {
    try {
      // Pass current filePath as defaultPath so dialog opens to current location
      const selectedPath = await window.api?.dialog?.showOpenDirectory?.(formData.filePath);

      if (selectedPath) {
        // Update formData with the selected directory
        setFormData(prev => ({ ...prev, filePath: selectedPath }));
      }
      // If user canceled, do nothing (selectedPath will be null)
    } catch (error) {
      console.error('Failed to browse directory:', error);
      // Optionally show an error message to the user
    }
  }

  const allInputsFilled = useMemo((): boolean => {
    return !!(isValidFileName && formData.filePath && formData.goal > 0);
  }, [formData.filePath, formData.goal, isValidFileName])

  return (
    <SetupContainer>
      <div role="form">
        {/* Header */}
        <Header>
          <Title>
            Setup New Writing Session
          </Title>
        </Header>

        {/* File Configuration Section */}
        <FileSection>
          {/* File Mode Toggle */}
          <FileModeToggle>
            <FileModeButton
              type="button"
              $active={fileMode === NEW}
              onClick={() => handleFileModeChange(NEW)}
            >
              New File
            </FileModeButton>
            <FileModeButton
              type="button"
              $active={fileMode === EXISTING}
              onClick={() => handleFileModeChange(EXISTING)}
            >
              Load Existing
            </FileModeButton>
          </FileModeToggle>

          {/* New File Mode */}
          {fileMode === NEW && (
            <FileGrid>
              <FilenameInput>
                <label htmlFor="filename">Filename *</label>
                <Input
                  id="filename"
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => handleFileNameChange(e)}
                  placeholder="Enter filename (e.g., my-story.txt)"
                  $hasError={!isValidFileName && formData.fileName.length > 0}
                />
                {!isValidFileName && formData.fileName.length > 0 && (
                  <ErrorText>
                    Filename must end with .txt and contain no invalid characters
                  </ErrorText>
                )}
                {/* {fileExistsError && (
                  <ErrorText>
                    A file with this name already exists. Please choose a different filename or location.
                  </ErrorText>
                )} */}
              </FilenameInput>

              <LocationSection>
                <label>Save Location</label>
                <LocationDisplay>
                  <PathDisplay title={formData.filePath}>
                    {isLoadingDefaultPath ? 'Loading...' : (formData.filePath || 'No location selected')}
                  </PathDisplay>
                  <BrowseButton
                    type="button"
                    onClick={handleBrowseDirectory}
                  >
                    Change Location
                  </BrowseButton>
                </LocationDisplay>
              </LocationSection>
            </FileGrid>
          )}

          {/* Load Existing Mode */}
          {/* {fileMode === EXISTING && (
            <>
              <LoadFileRow>
                <LoadFileButton
                  type="button"
                  onClick={handleLoadExistingFile}
                >
                  Choose File…
                </LoadFileButton>

                {isLoadingExisting && fullPath && (
                  <LoadedFileSummary>
                    <LoadedFileTitle>
                      ✓ Loaded File - {initialWordCount > 0 && (
                        <LoadedFileStats>
                          Initial word count: {initialWordCount.toLocaleString()} words
                        </LoadedFileStats>
                      )}
                    </LoadedFileTitle>
                    <LoadedFilePath>{fullPath}</LoadedFilePath>
                  </LoadedFileSummary>
                )}
              </LoadFileRow>
            </>
          )} */}

        </FileSection>

        {/* Goal Selection - show only if valid filename */}
        {isValidFileName && (
          <FormGrid>
            <GoalSelector
              goalType={formData.goalType}
              onGoalTypeChange={handleGoalTypeChange}
            />
            <GoalInput
              goalType={formData.goalType}
              value={formData.goal}
              onChange={handleGoalChange}
            />
          </FormGrid>
        )}

        {/* Submit Button */}
        {isValidFileName && (
          <SubmitButton
            type="button"
            onClick={handleSubmit}
            disabled={!allInputsFilled}
            $enabled={allInputsFilled}
          >
            Start Writing
          </SubmitButton>
        )}

      </div>
    </SetupContainer>
  );
}