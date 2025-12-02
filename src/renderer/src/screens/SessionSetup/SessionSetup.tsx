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
  const [fileExistsError, setFileExistsError] = useState(false);
  const [loadedFilePath, setLoadedFilePath] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
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
      setIsLoadingExisting(true);
      const fullPath = await window.api?.dialog?.showOpenTiptap?.();
      if (!fullPath) {
        setIsLoadingExisting(false);
        return; // user canceled
      }

      // Read JSON string and parse
      const raw = await window.api?.file?.read(fullPath);
      if (!raw) {
        setIsLoadingExisting(false);
        return;
      }

      const json = JSON.parse(raw);

      // Extract word count from the loaded JSON using TipTap's structure
      // You'll need to create a temporary editor instance or use a helper
      // For now, store the JSON and let the editor calculate it when it loads
      useEditorStore.setState({ json });

      // When the editor loads this JSON, it will call onUpdate which will
      // give us the word count. But we need to capture that initial count.
      // Better approach: extract text from JSON and calculate word count here

      // Helper to extract text from TipTap JSON
      const extractText = (node: any): string => {
        if (node.text) {
          return node.text;
        }
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join(' ');
        }
        return '';
      };

      const text = extractText(json);
      const initialWordCount = text.trim().split(/\s+/).filter(Boolean).length;

      // Set the initial word count so progress tracks only new words
      useEditorStore.getState().setInitialWordCount(initialWordCount);

      // Derive base path (strip .dt.json) and file name (no extension)
      const lastSlash = fullPath.lastIndexOf('/');
      const dir = lastSlash === -1 ? '' : fullPath.slice(0, lastSlash);
      const fileWithExt = lastSlash === -1 ? fullPath : fullPath.slice(lastSlash + 1);
      const base = fileWithExt.replace(/\.dt\.json$/, '');
      const basePath = dir ? `${dir}/${base}` : base;

      setLoadedFilePath(basePath);
    } catch (error) {
      console.error('Failed to load existing file:', error);
      // Optionally show error message to user
    } finally {
      setIsLoadingExisting(false);
    }
  }

  const allInputsFilled = useMemo((): boolean => {
    if (fileMode === NEW) {
      return !!(isValidFileName && formData.filePath && formData.goal > 0);
    } else {
      // EXISTING mode: only need loaded file and goal
      return !!(loadedFilePath && formData.goal > 0);
    }
  }, [fileMode, isValidFileName, formData.filePath, formData.goal, loadedFilePath])

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
                      <PathDisplay title={loadedFilePath}>
                        {loadedFilePath}
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
                {loadedFilePath && (
                  <LoadedFileSummary>
                    <LoadedFileTitle>
                      ✓ File Loaded
                    </LoadedFileTitle>
                    <LoadedFilePath>{loadedFilePath}</LoadedFilePath>
                  </LoadedFileSummary>
                )}
              </LocationSection>
            </FileGrid>
          )}

        </FileSection>

        {/* Goal Selection - show if valid filename (NEW) or file loaded (EXISTING) */}
        {((fileMode === NEW && isValidFileName) || (fileMode === EXISTING && loadedFilePath)) && (
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
        {((fileMode === NEW && isValidFileName) || (fileMode === EXISTING && loadedFilePath)) && (
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