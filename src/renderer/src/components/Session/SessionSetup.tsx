// src/renderer/src/components/Session/SessionSetup.tsx
// Purpose: Main session setup component with goal selection and form submission

import React, { useState, useCallback, useEffect } from 'react';
import { GoalSelector } from './GoalSelector';
import { GoalInput } from './GoalInput';
import { useSession } from '@renderer/hooks/useSession';
import { useAppState } from '@renderer/hooks/useAppState';
import { isValidGoal, getDefaultValue } from '@renderer/utils/validation';
import { calculateWordCount } from '@renderer/utils/wordCount';
import { getRecentFiles, addRecentFile, type RecentFile } from '@renderer/context/appStorage';
import type { GoalType } from '@renderer/types/session';
import styles from './SessionSetup.module.css';

// Add path utility - need to expose from preload or use string operations
const path = {
    join: (...parts: string[]) => parts.join('/').replace(/\/+/g, '/'),
    basename: (filePath: string) => filePath.split(/[/\\]/).pop() || '',
};

export function SessionSetup(): React.JSX.Element {
    const { addSession } = useSession();
    const { setView } = useAppState();

    const [goalType, setGoalType] = useState<GoalType>('word');
    const [goalValue, setGoalValue] = useState<number>(getDefaultValue('word'));

    // File mode and customization state
    const [fileMode, setFileMode] = useState<'new' | 'existing'>('new');
    const [customizeFilename, setCustomizeFilename] = useState(false);

    // File-related state
    const [fileName, setFileName] = useState('Writing-Session.txt');
    const [saveDirectory, setSaveDirectory] = useState('');

    // State for loading existing files
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);
    const [loadedFilePath, setLoadedFilePath] = useState<string>('');
    const [initialContent, setInitialContent] = useState<string>('');
    const [initialWordCount, setInitialWordCount] = useState<number>(0);

    // Recent files state
    const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

    // Add near other state
    const [previousFileName, setPreviousFileName] = useState(fileName);

    const isValid = isValidGoal(goalType, goalValue);

    // Load default save directory and recent files on mount
    useEffect(() => {
        const loadDefaultDirectory = async () => {
            try {
                const defaultDir = await window.api.dialog.getDefaultSaveDirectory();
                setSaveDirectory(defaultDir);
            } catch (error) {
                console.error('Failed to load default directory:', error);
            }
        };
        loadDefaultDirectory();

        // Load recent files
        setRecentFiles(getRecentFiles());
    }, []);

    // Auto-generate filename when goal changes (only for new files, not customizing)
    useEffect(() => {
        if (fileMode === 'new' && !customizeFilename && !isLoadingExisting) {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const goalLabel = goalType === 'word' ? `${goalValue}-words` : `${goalValue}-min`;
            setFileName(`Writing Session — ${yyyy}-${mm}-${dd} — ${goalLabel}.txt`);
        }
    }, [fileMode, customizeFilename, isLoadingExisting, goalType, goalValue]);

    // Construct full path - use loaded file path if available, otherwise construct from directory and filename
    const fullPath = isLoadingExisting && loadedFilePath
        ? loadedFilePath
        : (saveDirectory && fileName ? path.join(saveDirectory, fileName) : '');

    // Validate filename
    const isValidFileName = fileName.length > 0 &&
        fileName.endsWith('.txt') &&
        !/[<>:"|?*/\\]/.test(fileName);

    const handleGoalTypeChange = useCallback((newGoalType: GoalType) => {
        setGoalType(newGoalType);
        // Reset to default value for the new goal type
        setGoalValue(getDefaultValue(newGoalType));
    }, []);

    const handleGoalValueChange = useCallback((newValue: number) => {
        setGoalValue(newValue);
    }, []);

    const handleBrowseDirectory = useCallback(async () => {
        try {
            const result = await window.api.dialog.showOpenDirectory();
            if (!result.canceled && result.directoryPath) {
                setSaveDirectory(result.directoryPath);
            }
        } catch (error) {
            console.error('Failed to browse directory:', error);
        }
    }, []);

    const handleLoadExistingFile = useCallback(async () => {
        try {
            const result = await window.api.dialog.showOpenFile();
            if (!result.canceled && result.filePath) {
                // Read file content using external file read (bypasses path restrictions)
                const content = await window.api.file.readExternal(result.filePath);

                // Calculate initial word count
                const wordCount = calculateWordCount(content);

                // Update state
                setIsLoadingExisting(true);
                setLoadedFilePath(result.filePath);
                setInitialContent(content);
                setInitialWordCount(wordCount);

                // Extract directory and filename
                const lastSlash = Math.max(result.filePath.lastIndexOf('/'), result.filePath.lastIndexOf('\\'));
                const directory = result.filePath.substring(0, lastSlash);
                const filename = path.basename(result.filePath);

                setSaveDirectory(directory);
                setFileName(filename);
            }
        } catch (error) {
            console.error('Failed to load existing file:', error);
            // Reset state on error
            setIsLoadingExisting(false);
            setLoadedFilePath('');
            setInitialContent('');
            setInitialWordCount(0);
        }
    }, []);


    const handleFileModeChange = useCallback((mode: 'new' | 'existing') => {
        setFileMode(mode);
        if (mode === 'new') {
            setIsLoadingExisting(false);
            setLoadedFilePath('');
            setInitialContent('');
            setInitialWordCount(0);
            setCustomizeFilename(false);
        }
    }, []);

    const handleRecentFileClick = useCallback(async (recentFile: RecentFile) => {
        try {
            const content = await window.api.file.readExternal(recentFile.path);
            const wordCount = calculateWordCount(content);

            setIsLoadingExisting(true);
            setLoadedFilePath(recentFile.path);
            setInitialContent(content);
            setInitialWordCount(wordCount);

            const lastSlash = Math.max(recentFile.path.lastIndexOf('/'), recentFile.path.lastIndexOf('\\'));
            const directory = recentFile.path.substring(0, lastSlash);

            setSaveDirectory(directory);
            setFileName(recentFile.name);
        } catch (error) {
            console.error('Failed to load recent file:', error);
        }
    }, []);

    const confirmFilenameChange = useCallback(() => {
        if (isValidFileName) {
            setCustomizeFilename(false);
        }
    }, [isValidFileName]);

    const cancelFilenameChange = useCallback(() => {
        setFileName(previousFileName);
        setCustomizeFilename(false);
    }, [previousFileName]);

    const handleFilenameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmFilenameChange();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelFilenameChange();
        }
    }, [confirmFilenameChange, cancelFilenameChange]);


    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isValid || !isValidFileName || !fullPath) {
            return;
        }

        try {
            const sessionName = fileName.replace('.txt', '') ||
                `Writing Session - ${goalType === 'word' ? `${goalValue} words` : `${goalValue} min`}`;
            const newSession = await window.api.session.start(
                fullPath,
                sessionName,
                undefined,
                goalType,
                goalValue,
                isLoadingExisting ? initialContent : undefined
            );

            // Add to recent files if it's an existing file
            if (isLoadingExisting && loadedFilePath) {
                addRecentFile(loadedFilePath);
            }

            // Add session to local state and navigate to editor
            addSession(newSession);
            setView('editor');
        } catch (error) {
            console.error('Failed to create session:', error);
            // Handle validation errors from main process
            // You could show a toast notification here
        }
    }, [isValid, isValidFileName, fullPath, fileName, goalType, goalValue, isLoadingExisting, initialContent, loadedFilePath, addSession, setView]);

    return (
        <div className={styles['setup-container']}>
            <div role="form">
                {/* Header */}
                <div className={styles['header']}>
                    <h1 className={styles['title']}>
                        Setup New Writing Session
                    </h1>
                </div>

                {/* File Configuration Section */}
                <div className={styles['file-section']}>
                    {/* File Mode Toggle */}
                    <div className={styles['file-mode-toggle']}>
                        <button
                            type="button"
                            className={`${styles['file-mode-button']} ${fileMode === 'new' ? styles['file-mode-button-active'] : ''}`}
                            onClick={() => handleFileModeChange('new')}
                        >
                            New File
                        </button>
                        <button
                            type="button"
                            className={`${styles['file-mode-button']} ${fileMode === 'existing' ? styles['file-mode-button-active'] : ''}`}
                            onClick={() => handleFileModeChange('existing')}
                        >
                            Load Existing
                        </button>
                    </div>

                    {/* New File Mode */}
                    {fileMode === 'new' && (
                        <div className={styles['file-grid']}>
                            {/* Filename Input */}
                            <div className={styles['filename-input']}>
                                <label htmlFor="filename">Filename</label>
                                {!customizeFilename ? (
                                    <div className={styles['filename-display']}>
                                        <input
                                            id="filename"
                                            type="text"
                                            value={fileName}
                                            disabled
                                            title="Auto-generated. Click edit icon to customize."
                                        />
                                        <button
                                            type="button"
                                            className={styles['edit-icon-button']}
                                            onClick={() => { setPreviousFileName(fileName); setCustomizeFilename(true); }}
                                            title="Edit filename"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles['filename-display']}>
                                        <input
                                            id="filename"
                                            type="text"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            onKeyDown={handleFilenameKeyDown}
                                            placeholder="my-story.txt"
                                            className={!isValidFileName && fileName.length > 0 ? styles['input-error'] : ''}
                                        />
                                        <button
                                            type="button"
                                            className={styles['confirm-icon-button']}
                                            onClick={confirmFilenameChange}
                                            title="Confirm filename"
                                            disabled={!isValidFileName}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles['cancel-icon-button']}
                                            onClick={cancelFilenameChange}
                                            title="Cancel"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6 6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                {!isValidFileName && fileName.length > 0 && customizeFilename && (
                                    <span className={styles['error-text']}>
                                        Filename must end with .txt and contain no invalid characters
                                    </span>
                                )}
                            </div>

                            {/* Save Location */}
                            <div className={styles['location-section']}>
                                <label>Save Location</label>
                                <div className={styles['location-display']}>
                                    <span className={styles['path-display']} title={saveDirectory}>
                                        {saveDirectory || 'Loading...'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleBrowseDirectory}
                                        className={styles['browse-button']}
                                    >
                                        Change Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Load Existing Mode */}
                    {fileMode === 'existing' && (
                        <>
                            {/* Recent Files List */}
                            {recentFiles.length > 0 && (
                                <div className={styles['recent-files-list']}>
                                    <div className={styles['recent-files-title']}>Recent Files:</div>
                                    {recentFiles.map((recentFile) => (
                                        <div
                                            key={recentFile.path}
                                            className={styles['recent-file-item']}
                                            onClick={() => handleRecentFileClick(recentFile)}
                                        >
                                            <span className={styles['recent-file-icon']}>📄</span>
                                            <div className={styles['recent-file-info']}>
                                                <div className={styles['recent-file-name']}>{recentFile.name}</div>
                                                <div className={styles['recent-file-date']}>
                                                    {new Date(recentFile.lastAccessed).toLocaleDateString()}
                                                </div>
                                                <div className={styles['recent-file-path']}>{recentFile.path}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Divider */}
                            {recentFiles.length > 0 && (
                                <div className={styles['divider']}>
                                    <span className={styles['divider-text']}>or</span>
                                </div>)}

                            {/* Choose File Button */}
                            <div className={styles['load-file-row']}>
                                <button
                                    type="button"
                                    onClick={handleLoadExistingFile}
                                    className={styles['load-file-button']}
                                >
                                    Choose File…
                                </button>

                                {/* Loaded File Summary */}
                                {isLoadingExisting && fullPath && (
                                    <div className={styles['loaded-file-summary']}>
                                        <div className={styles['loaded-file-title']}>✓ Loaded File - {initialWordCount > 0 && (
                                            <span className={styles['loaded-file-stats']}>
                                                Initial word count: {initialWordCount.toLocaleString()} words
                                            </span>
                                        )}</div>
                                        <div className={styles['loaded-file-path']}>{fullPath}</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>

                {/* Goal Selection - show only if valid filename */}
                {isValidFileName && (
                    <div className={styles['form-grid']}>
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
                    </div>
                )}

                {/* Submit Button */}
                {isValidFileName && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || !isValidFileName || !fullPath}
                        className={`${styles['submit-button']} ${(isValid && isValidFileName && fullPath) ? styles['submit-button-enabled'] : styles['submit-button-disabled']}`}
                    >
                        <div>
                            Start Writing
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
