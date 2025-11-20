import React, { useState } from 'react';
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

const NEW = 'new';
const EXISTING = 'existing';

type FileModeType = typeof NEW | typeof EXISTING;

export function SessionSetup(): React.JSX.Element {
  const [fileMode, setFileMode] = useState<FileModeType>(NEW);

  const handleFileModeChange = (fileMode: FileModeType) => {
    console.log('fileMode', fileMode)
  }


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
          {/* {fileMode === NEW && (
            <FileGrid>
              <FilenameInput>
                <label htmlFor="filename">Filename *</label>
                <Input
                  id="filename"
                  type="text"
                  value={fileName}
                  onChange={(e) => { setFileName(e.target.value); clearFileExistsError(); }}
                  placeholder="Enter filename (e.g., my-story.txt)"
                  $hasError={!isValidFileName && fileName.length > 0}
                />
                {!isValidFileName && fileName.length > 0 && (
                  <ErrorText>
                    Filename must end with .txt and contain no invalid characters
                  </ErrorText>
                )}
                {fileExistsError && (
                  <ErrorText>
                    A file with this name already exists. Please choose a different filename or location.
                  </ErrorText>
                )}
              </FilenameInput>

              <LocationSection>
                <label>Save Location</label>
                <LocationDisplay>
                  <PathDisplay title={saveDirectory}>
                    {saveDirectory || 'Loading...'}
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
          )} */}

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
        {/* {isValidFileName && (
          <FormGrid>
            <GoalSelector
              goalType={goalType}
              onGoalTypeChange={handleGoalTypeChange}
            />
            <GoalInput
              goalType={goalType}
              value={goalValue}
              onChange={handleGoalValueChange}
              isValid={isValid}
            />
          </FormGrid>
        )} */}

        {/* Submit Button */}
        {/* {isValidFileName && (
          <SubmitButton
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || !isValidFileName || !fullPath || isCreatingSession}
            $enabled={isValid && isValidFileName && fullPath && !isCreatingSession}
          >
            <div>
              {isCreatingSession ? 'Creating Session...' :
                sessionCreated ? 'Session Created! 🎉' :
                  'Start Writing'}
            </div>
          </SubmitButton>
        )} */}

      </div>
    </SetupContainer>
  );
}