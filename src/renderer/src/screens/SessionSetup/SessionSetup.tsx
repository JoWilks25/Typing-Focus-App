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
  LoadedFileSummary,
  LoadedFileTitle,
  LoadedFilePath,
  FormGrid,
  GoalSelectorWrapper,
  GoalInputWrapper,
  SubmitButton,
} from './SessionSetup.styles';
import { GoalType, useSessionStore } from '@renderer/stores/SessionStore';
import { GoalSelector } from './GoalSelector';
import { GoalInput } from './GoalInput';
import { useEditorStore } from '@renderer/stores/EditorStore';
import { fileNameCheck } from '@renderer/utilities/fileNameCheck';
import type { EditorJson } from '@shared/tiptapTypes';
import {
  convertMarkdownToDoc,
  convertTextToDoc,
  countWordsFromDoc,
  stripExtension,
} from '@renderer/utilities/importHelpers';

const NEW = 'new';
const EXISTING = 'existing';

type FileModeType = typeof NEW | typeof EXISTING;

interface SessionSetup {
  closeModal: () => void;
}

export function SessionSetup({ closeModal }: SessionSetup): React.JSX.Element {
  const [fileMode, setFileMode] = useState<FileModeType>(NEW);
  const [isLoadingDefaultPath, setIsLoadingDefaultPath] = useState(true);
  const [fileExistsError, setFileExistsError] = useState(false);
  const [loadedFilePath, setLoadedFilePath] = useState<string | null>(null);
  const [loadedFileDisplayPath, setLoadedFileDisplayPath] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fileName: 'My first session', // no extension; purely a title/base name
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
  const handleSubmit = async () => {
    if (fileMode === NEW) {
      // Construct full file path: directory + filename
      const fullFilePath = formData.filePath
        ? `${formData.filePath}/${formData.fileName}`
        : formData.fileName; // Fallback if no directory selected

      // Check if file already exists
      const fileExists = await window.api?.file?.exists(fullFilePath);
      if (fileExists) {
        setFileExistsError(true);
        return;
      }

      setInitSession(
        formData.fileName,
        fullFilePath, // Use full path here
        formData.goal,
        formData.goalType,
        true
      );
      setGoal(formData.goal);
    } else {
      // EXISTING mode
      if (!loadedFilePath) {
        return;
      }

      // Extract filename from base path
      const lastSlash = loadedFilePath.lastIndexOf('/');
      const fileNameFromPath = lastSlash === -1 ? loadedFilePath : loadedFilePath.slice(lastSlash + 1);

      setInitSession(
        fileNameFromPath,
        loadedFilePath,
        formData.goal,
        formData.goalType,
        true
      );
      setGoal(formData.goal);
    }

    closeModal();
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

  const handleLoadExistingFile = async () => {
    try {
      setLoadError(null);
      setIsLoadingExisting(true);
      const fullPath = await window.api?.dialog?.showOpenTiptap?.();
      if (!fullPath) {
        setIsLoadingExisting(false);
        return; // user canceled
      }

      const lowerPath = fullPath.toLowerCase();
      const extension = lowerPath.endsWith('.dt.json')
        ? 'dt.json'
        : lowerPath.split('.').pop();
      const basePath = stripExtension(fullPath);

      if (extension === 'dt.json') {
        const raw = await window.api?.file?.read(fullPath);
        if (!raw) {
          setIsLoadingExisting(false);
          return;
        }
        const json = JSON.parse(raw) as EditorJson;
        useEditorStore.setState({ json });
        useEditorStore.getState().setInitialWordCount(countWordsFromDoc(json));
        setLoadedFilePath(basePath);
        setLoadedFileDisplayPath(fullPath);
        return;
      }

      if (extension === 'txt' || extension === 'md') {
        const raw = await window.api?.file?.read(fullPath);
        if (raw === undefined || raw === null) {
          setIsLoadingExisting(false);
          return;
        }

        const doc = extension === 'md'
          ? convertMarkdownToDoc(raw)
          : convertTextToDoc(raw);

        useEditorStore.setState({ json: doc });
        useEditorStore.getState().setInitialWordCount(countWordsFromDoc(doc));
        setLoadedFilePath(basePath);
        setLoadedFileDisplayPath(fullPath);
        return;
      }

      setLoadError('Unsupported file type. Please choose a .dt.json, .txt, or .md file.');
      setLoadedFilePath(null);
      setLoadedFileDisplayPath(null);
    } catch (error) {
      console.error('Failed to load existing file:', error);
      setLoadError('Failed to load file. Please try again.');
      setLoadedFilePath(null);
      setLoadedFileDisplayPath(null);
    } finally {
      setIsLoadingExisting(false);
    }
  }

  const allInputsFilled = useMemo((): boolean => {
    if (fileMode === NEW) {
      return !!(isValidFileName && formData.filePath && formData.goal > 0);
    } else {
      // EXISTING mode: only need loaded file and goal
      return !!(loadedFilePath && formData.goal > 0 && !loadError);
    }
  }, [fileMode, isValidFileName, formData.filePath, formData.goal, loadedFilePath, loadError])

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
                  placeholder="Enter filename (e.g., My first session)"
                  $hasError={!isValidFileName && formData.fileName.length > 0}
                />
                {!isValidFileName && formData.fileName.length > 0 && (
                  <ErrorText>
                    Filename must not contain dots or invalid characters
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
          {fileMode === EXISTING && (
            <FileGrid>
              <LocationSection>
                <label>Session File</label>
                <PathDisplay title="Supported file types">
                  Supports .dt.json, .txt, .md
                </PathDisplay>
                <LocationDisplay>
                  {!loadedFilePath ? (
                    <>
                      <PathDisplay>No file selected</PathDisplay>
                      <BrowseButton
                        type="button"
                        onClick={handleLoadExistingFile}
                        disabled={isLoadingExisting}
                      >
                        {isLoadingExisting ? 'Loading…' : 'Choose File…'}
                      </BrowseButton>
                    </>
                  ) : (
                    <>
                      <PathDisplay title={loadedFileDisplayPath || loadedFilePath}>
                        {loadedFileDisplayPath || loadedFilePath}
                      </PathDisplay>
                      <BrowseButton
                        type="button"
                        onClick={handleLoadExistingFile}
                        disabled={isLoadingExisting}
                      >
                        Change File
                      </BrowseButton>
                    </>
                  )}
                </LocationDisplay>
                {loadError && (
                  <ErrorText>{loadError}</ErrorText>
                )}
                {loadedFilePath && (
                  <LoadedFileSummary>
                    <LoadedFileTitle>
                      ✓ File Loaded
                    </LoadedFileTitle>
                    <LoadedFilePath>{loadedFileDisplayPath || loadedFilePath}</LoadedFilePath>
                  </LoadedFileSummary>
                )}
              </LocationSection>
            </FileGrid>
          )}

        </FileSection>

        {/* Goal Selection - show if valid filename (NEW) or file loaded (EXISTING) */}
        {((fileMode === NEW && isValidFileName) || (fileMode === EXISTING && loadedFilePath && !loadError)) && (
          <FormGrid>
            <GoalSelectorWrapper>
              <GoalSelector
                goalType={formData.goalType}
                onGoalTypeChange={handleGoalTypeChange}
              />
            </GoalSelectorWrapper>
            <GoalInputWrapper>
              <GoalInput
                goalType={formData.goalType}
                value={formData.goal}
                onChange={handleGoalChange}
              />
            </GoalInputWrapper>
          </FormGrid>
        )}

        {/* Submit Button */}
        {((fileMode === NEW && isValidFileName) || (fileMode === EXISTING && loadedFilePath && !loadError)) && (
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