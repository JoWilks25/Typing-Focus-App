// src/renderer/src/components/Session/SessionSetup.tsx
// Purpose: Main session setup component with goal selection and form submission

import React, { useState, useCallback, useEffect } from 'react';
import { GoalSelector } from './GoalSelector';
import { GoalInput } from './GoalInput';
import { useSession } from '@renderer/hooks/useSession';
import { useAppState } from '@renderer/hooks/useAppState';
import { isValidGoal, getDefaultValue } from '@renderer/utils/validation';
import { calculateWordCount } from '@renderer/utils/wordCount';
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
    const [showAdvanced, setShowAdvanced] = useState(false);

    // NEW: File-related state
    const [fileName, setFileName] = useState('Writing-Session.txt');
    const [saveDirectory, setSaveDirectory] = useState('');

    // State for loading existing files
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);
    const [loadedFilePath, setLoadedFilePath] = useState<string>('');
    const [initialContent, setInitialContent] = useState<string>('');
    const [, setInitialWordCount] = useState<number>(0);

    const isValid = isValidGoal(goalType, goalValue);

    // Load default save directory on mount
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
    }, []);

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

    const handleCreateNewFile = useCallback(() => {
        // Reset to new file mode
        setIsLoadingExisting(false);
        setLoadedFilePath('');
        setInitialContent('');
        setInitialWordCount(0);
        setFileName('Writing-Session.txt');
    }, []);

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

            // Add session to local state and navigate to editor
            addSession(newSession);
            setView('editor');
        } catch (error) {
            console.error('Failed to create session:', error);
            // Handle validation errors from main process
            // You could show a toast notification here
        }
    }, [isValid, isValidFileName, fullPath, fileName, goalType, goalValue, isLoadingExisting, initialContent, addSession, setView]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && isValid && isValidFileName && fullPath) {
            handleSubmit(event as React.FormEvent);
        }
    }, [isValid, isValidFileName, fullPath, handleSubmit]);

    return (
        <div className={styles['setup-container']}>
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} role="form">
                {/* Header */}
                <div className={styles['header']}>
                    <h1 className={styles['title']}>
                        Ready to Write?
                    </h1>
                    <p className={styles['subtitle']}>
                        Set your file location and goal to get started
                    </p>
                </div>

                {/* File Configuration Section */}
                <div className={styles['file-section']}>
                    <h2 className={styles['section-title']}>File Settings</h2>

                    {/* Load Existing File or Create New */}
                    <div className={styles['file-mode-buttons']}>
                        <button
                            type="button"
                            onClick={handleLoadExistingFile}
                            className={styles['load-file-button']}
                        >
                            Load Existing File
                        </button>
                        {isLoadingExisting && (
                            <button
                                type="button"
                                onClick={handleCreateNewFile}
                                className={styles['new-file-button']}
                            >
                                Create New File Instead
                            </button>
                        )}
                    </div>

                    {/* Filename Input */}
                    <div className={styles['filename-input']}>
                        <label htmlFor="filename">
                            {isLoadingExisting ? 'Selected File:' : 'Filename:'}
                        </label>
                        <input
                            id="filename"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="my-story.txt"
                            className={!isValidFileName && fileName.length > 0 ? styles['input-error'] : ''}
                            disabled={isLoadingExisting}
                            title={isLoadingExisting ? loadedFilePath : ''}
                        />
                        {!isValidFileName && fileName.length > 0 && !isLoadingExisting && (
                            <span className={styles['error-text']}>
                                Filename must end with .txt and contain no invalid characters
                            </span>
                        )}
                    </div>

                    {/* Save Location */}
                    <div className={styles['location-section']}>
                        <label>
                            {isLoadingExisting ? 'File Location:' : 'Save Location:'}
                        </label>
                        <div className={styles['location-display']}>
                            <span className={styles['path-display']} title={saveDirectory}>
                                {saveDirectory || 'Loading...'}
                            </span>
                            {!isLoadingExisting && (
                                <button
                                    type="button"
                                    onClick={handleBrowseDirectory}
                                    className={styles['browse-button']}
                                >
                                    Change Location
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Full Path Preview */}
                    {fullPath && (
                        <div className={styles['path-preview']}>
                            <strong>{isLoadingExisting ? 'Loaded File:' : 'Full Path:'}</strong>
                            <span className={styles['preview-path']}>{fullPath}</span>
                        </div>
                    )}
                </div>

                {/* Goal Selection - show only if valid filename */}
                {isValidFileName && (
                    <>
                        <GoalSelector
                            goalType={goalType}
                            onGoalTypeChange={handleGoalTypeChange}
                        />

                        {/* Goal Input */}
                        <GoalInput
                            goalType={goalType}
                            value={goalValue}
                            onChange={handleGoalValueChange}
                            isValid={isValid}
                        />
                    </>
                )}

                {/* Advanced Options */}
                {isValidFileName && (
                    <div className={styles['advanced-section']}>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={styles['advanced-toggle']}
                        >
                            <span className={`${styles['advanced-arrow']} ${showAdvanced ? styles['advanced-arrow-rotated'] : ''}`}>
                                &gt;
                            </span>
                            Advanced Options
                        </button>

                        {showAdvanced && (
                            <div className={styles['advanced-content']}>
                                <p className={styles['advanced-text']}>
                                    Advanced options will be available in future updates.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                {isValidFileName && (
                    <button
                        type="submit"
                        disabled={!isValid || !isValidFileName || !fullPath}
                        className={`${styles['submit-button']} ${(isValid && isValidFileName && fullPath) ? styles['submit-button-enabled'] : styles['submit-button-disabled']}`}
                    >
                        <div>
                            Start Writing
                            <span className={styles['submit-hint']}> Press Enter ↵</span>
                        </div>
                    </button>
                )}
            </form>
        </div>
    );
}
