import React, { useMemo, useState } from 'react';
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
import { fileNameCheck } from '@renderer/utilities/isValidFileName';
import { GoalSelector } from './GoalSelector';
import { GoalInput } from './GoalInput';

const NEW = 'new';
const EXISTING = 'existing';

type FileModeType = typeof NEW | typeof EXISTING;

interface SessionSetup {
  closeModal: () => void;
}

export function SessionSetup({ closeModal }: SessionSetup): React.JSX.Element {
  const [fileMode, setFileMode] = useState<FileModeType>(NEW);
  const [formData, setFormData] = useState({
    fileName: 'test.txt',
    filePath: '/some-path',
    goal: 0,
    goalType: 'wordcount' as 'wordcount' | 'time',
  });
  const setInitSession = useSessionStore(state => state.setInitSession);

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
    setInitSession(
      formData.fileName,
      formData.filePath,
      formData.goal,
      formData.goalType,
      true
    );
    closeModal()
  };

  const handleBrowseDirectory = () => {
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
                    {formData.filePath || 'Loading...'}
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