# File Management

Import, export, and autosave functionality for Draft Tree.

## Overview

The file management system in Draft Tree handles session-based file operations with automatic saving to prevent data loss. Each session is associated with a user-selected .txt file that is automatically saved every 10 seconds. All operations are local-only in V1, with no cloud sync.

**Key Concepts**:
- **Session Files**: User-selected .txt file paths where session content is saved
- **Autosave**: Automatic file saving every 10 seconds via SessionManager
- **File Manager**: Backend service (`fileManager.ts`) handling file I/O operations
- **External Files**: Files outside app data directory (user-selected locations)

## File Operations

### File Selection

**Purpose**: Choose file location for session content

**Supported Formats**:
- Plain text files (`.txt`)
- UTF-8 encoding
- No rich text or formatting

**File Selection Flow**:
```typescript
interface ImportResult {
  success: boolean;
  content: string;
  filePath: string;
  wordCount: number;
  error?: string;
}

const importFile = async (): Promise<ImportResult> => {
  try {
    // Show native file dialog
    const result = await dialog.showOpenDialog({
      title: 'Import Text File',
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths.length) {
      return { success: false, content: '', filePath: '', wordCount: 0 };
    }

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    const wordCount = calculateWordCount(content);

    return {
      success: true,
      content,
      filePath,
      wordCount
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      filePath: '',
      wordCount: 0,
      error: error.message
    };
  }
};
```

**File Selection Behavior**:
1. User starts new session via SessionSetupModal
2. User chooses file path (via directory picker + filename input or file picker)
3. If existing file selected:
   - File content loaded as initialContent
   - Initial word count calculated and stored in `initialWordCount`
   - Only NEW words (beyond initialWordCount) count toward goal
4. If new file:
   - Empty file created at selected path
   - initialWordCount is 0
5. Session created with filePath
6. File automatically saved every 10 seconds during session

### Manual File Save (Not Currently Implemented)

**Note**: In current implementation, files are automatically saved to the session's filePath. Manual export functionality is not yet implemented.

**Planned Export Flow**:
```typescript
interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

const exportFile = async (content: string): Promise<ExportResult> => {
  try {
    // Show native save dialog
    const result = await dialog.showSaveDialog({
      title: 'Export Text File',
      defaultPath: `writing-session-${new Date().toISOString().split('T')[0]}.txt`,
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { success: false };
    }

    await fs.writeFile(result.filePath, content, 'utf-8');

    return {
      success: true,
      filePath: result.filePath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

**Export Behavior**:
1. User triggers export via menu or button
2. Native save dialog opens with default filename
3. User selects save location
4. File written to selected path
5. Confirmation shown to user
6. Session continues (export doesn't end session)

## Autosave System

### Autosave Strategy

**Frequency**: Every 10 seconds during active sessions (backend)
**Additional Saves**: Content updates debounced at 2 seconds (renderer to backend)
**Purpose**: Prevent data loss from crashes or unexpected shutdowns
**Location**: SessionManager service in main process

### Autosave Implementation

```typescript
// SessionManager.ts
class SessionManager {
  private autosaveInterval: NodeJS.Timeout | null = null;
  private readonly AUTOSAVE_INTERVAL = 10000; // 10 seconds
  private fileManager: FileManager | null = null;

  startAutosave() {
    if (this.autosaveInterval) {
      return; // Already running
    }

    this.autosaveInterval = setInterval(async () => {
      await this.performAutosave();
    }, this.AUTOSAVE_INTERVAL);
  }

  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  private async performAutosave() {
    if (!this.activeSessionId) return;

    const session = this.sessions.get(this.activeSessionId);
    if (!session || !this.fileManager) return;

    try {
      // Convert HTML to plain text
      const plainText = this.htmlToPlainText(session.content || '');
      
      // Save to external file
      await this.fileManager.writeFileExternal(session.filePath, plainText);
      
      // Update last saved timestamp
      session.lastSavedToFile = new Date().toISOString();
      
      console.log('Autosave completed:', session.filePath);
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }

  private htmlToPlainText(html: string): string {
    // Strip HTML tags and convert to plain text
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}
```

### Renderer-Side Content Updates

```typescript
// Editor.tsx - Debounced content save
const debouncedUpdateSession = useDebounce(
  useCallback(async () => {
    const content = contentRef.current;
    const currentActiveSession = activeSessionRef.current;
    if (currentActiveSession) {
      try {
        // Update session content in backend
        const updatedSession = await window.api.session.updateContent(
          currentActiveSession.id,
          content
        );
        
        // Update AppContext
        updateSession(updatedSession);
      } catch (error) {
        console.error('Failed to update session content:', error);
      }
    }
  }, [updateSession]),
  2000 // 2 second delay
);
```

**Combined Strategy**:
- **Renderer**: Updates session content in backend after 2s typing pause (via `session.updateContent`)
- **Backend**: SessionManager autosaves session content to file every 10s
- **Result**: Maximum 10 seconds of data loss in worst case scenario

### Autosave Storage

**Location**: User-selected file paths (e.g., `~/Documents/my-writing.txt`)
**Format**: Plain text (.txt)
**Content**: HTML stripped to plain text before saving

**Session Tracking**:
```typescript
interface Session {
  // ...
  filePath: string;           // Path to .txt file
  lastSavedToFile?: string;   // ISO timestamp of last save
}
```

**Additional Storage**:
- **App Data**: `~/Library/Application Support/Draft Tree/`
- **Storage JSON**: `storage.json` (key-value store)
- **Session History**: `session-history.json` (completed sessions)

## Session Recovery

### Active Session Validation

Draft Tree validates active sessions on startup to ensure consistency between localStorage and backend state.

```typescript
// AppContext.tsx - Startup validation
useEffect(() => {
  const validateActiveSession = async () => {
    const storedState = loadSessionState();
    
    if (storedState.activeSessionId) {
      try {
        // Check if stored active session is still active in backend
        const backendActiveSession = await window.api.session.getActive();
        
        if (backendActiveSession && backendActiveSession.id === storedState.activeSessionId) {
          // Backend confirms session is still active
          setActiveSessionId(storedState.activeSessionId);
          console.log('✅ Validated active session from storage');
        } else {
          // Backend says no active session, clear localStorage
          console.log('❌ Stored active session is no longer active in backend');
          setActiveSessionId(null);
          saveSessionState({ sessions: storedState.sessions, activeSessionId: null });
        }
      } catch (error) {
        console.warn('Failed to validate active session:', error);
        // On error, clear active session to be safe
        setActiveSessionId(null);
        saveSessionState({ sessions: storedState.sessions, activeSessionId: null });
      }
    }
  };

  validateActiveSession();
}, []);
```

### File Recovery

**Current Implementation**: No automatic recovery modal. Users can manually load existing files when starting a new session.

**File Persistence**:
- Session files are saved to user-selected locations
- Files persist even after app closes
- Users can reload files by selecting them when creating a new session

### Recovery Modal

**Trigger**: App startup with recent autosave data
**Purpose**: Allow user to recover unsaved work

**Modal Content**:
- "Recover Unsaved Work?" heading
- Timestamp of last save
- Word count and character count
- Preview of content (first 200 characters)
- "Recover Session" and "Discard" buttons

**Recovery Flow**:
1. App detects autosave on startup
2. Recovery modal appears
3. User chooses to recover or discard
4. If recover: content loaded, new session goal prompted
5. If discard: autosave files deleted
6. Previous session marked as incomplete

### Recovery Implementation

```typescript
const handleRecovery = async (recoveryData: RecoveryData) => {
  try {
    // Load content into editor
    await loadContentIntoEditor(recoveryData.content);
    
    // Calculate initial word count
    const initialWordCount = recoveryData.wordCount;
    
    // Prompt user for new session goal
    const goalData = await promptForSessionGoal();
    
    // Start new session with recovered content
    const session = await startNewSession({
      ...goalData,
      initialWordCount,
      recoveredFrom: recoveryData.sessionId
    });
    
    // Clean up autosave files
    await cleanupAutosaveFiles();
    
    return session;
  } catch (error) {
    console.error('Recovery failed:', error);
    showErrorModal('Failed to recover session. Starting fresh.');
  }
};
```

## File System Integration

### Storage Locations

**macOS**:
- App Data: `~/Library/Application Support/Draft Tree/`
- Sessions: Session files stored in user-selected locations
- Storage: `~/Library/Application Support/Draft Tree/storage.json`
- Session History: `~/Library/Application Support/Draft Tree/session-history.json`

**Windows** (future):
- App Data: `%APPDATA%/Draft Tree/`
- Sessions: Session files stored in user-selected locations
- Storage: `%APPDATA%/Draft Tree/storage.json`

### Directory Structure

```
~/Library/Application Support/Draft Tree/
├── storage.json              # Key-value storage
├── session-history.json      # Completed sessions history
└── [user-selected paths]/    # Session .txt files
    ├── my-document.txt
    └── another-file.txt
```

## Error Handling

### File Operation Errors

```typescript
const handleFileError = (error: Error, operation: string) => {
  console.error(`File ${operation} failed:`, error);
  
  switch (error.code) {
    case 'ENOENT':
      showErrorModal(`File not found. Please check the file path.`);
      break;
    case 'EACCES':
      showErrorModal(`Permission denied. Please check file permissions.`);
      break;
    case 'ENOSPC':
      showErrorModal(`Not enough disk space. Please free up space and try again.`);
      break;
    default:
      showErrorModal(`File ${operation} failed: ${error.message}`);
  }
};
```

### Autosave Error Recovery

```typescript
const handleAutosaveError = (error: Error, sessionId: string) => {
  console.error('Autosave failed:', error);
  
  // Try alternative storage location
  const fallbackPath = path.join(os.tmpdir(), `draft-tree-autosave-${sessionId}.json`);
  
  try {
    // Attempt fallback save
    fs.writeFileSync(fallbackPath, JSON.stringify(autosaveData));
    console.log('Autosave saved to fallback location:', fallbackPath);
  } catch (fallbackError) {
    console.error('Fallback autosave also failed:', fallbackError);
    // Notify user of potential data loss
    showWarningNotification('Autosave failed. Your work may not be saved.');
  }
};
```

## Performance Considerations

### File I/O Optimization

```typescript
// Use streaming for large files
const readLargeFile = async (filePath: string): Promise<string> => {
  const stats = await fs.stat(filePath);
  
  if (stats.size > 10 * 1024 * 1024) { // 10MB
    // Use streaming for large files
    return await readFileStream(filePath);
  } else {
    // Use regular read for small files
    return await fs.readFile(filePath, 'utf-8');
  }
};

// Debounced autosave to prevent excessive I/O
const debouncedAutosave = debounce(async (data: AutosaveData) => {
  await performAutosave(data);
}, 5000);
```

### Memory Management

```typescript
// Clean up old autosave files
const cleanupOldAutosaves = async () => {
  const autosaveDir = path.join(app.getPath('userData'), 'autosave');
  const files = await fs.readdir(autosaveDir);
  
  const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
  
  for (const file of files) {
    const filePath = path.join(autosaveDir, file);
    const stats = await fs.stat(filePath);
    
    if (stats.mtime.getTime() < cutoffTime) {
      await fs.unlink(filePath);
      console.log('Cleaned up old autosave:', file);
    }
  }
};
```

## Testing

### File Operation Tests

```typescript
describe('File Management', () => {
  it('should import text file successfully', async () => {
    const mockFile = 'test content';
    const result = await importFile();
    expect(result.success).toBe(true);
    expect(result.content).toBe(mockFile);
  });

  it('should export content to file', async () => {
    const content = 'export test content';
    const result = await exportFile(content);
    expect(result.success).toBe(true);
    expect(result.filePath).toBeDefined();
  });

  it('should autosave session data', async () => {
    const sessionId = 'test-session';
    await autosaveService.startAutosave(sessionId);
    // Simulate content changes
    await advanceTimersByTime(30000);
    // Verify autosave file exists
    const autosavePath = getAutosavePath(sessionId);
    expect(fs.existsSync(autosavePath)).toBe(true);
  });
});
```

### Recovery Tests

```typescript
describe('Recovery System', () => {
  it('should detect recovery data on startup', async () => {
    // Create mock autosave file
    await createMockAutosave();
    const recoveryData = await detectRecoveryData();
    expect(recoveryData).toBeDefined();
    expect(recoveryData.isRecent).toBe(true);
  });

  it('should recover session from autosave', async () => {
    const recoveryData = createMockRecoveryData();
    const session = await handleRecovery(recoveryData);
    expect(session).toBeDefined();
    expect(session.recoveredFrom).toBe(recoveryData.sessionId);
  });
});
```

## Future Enhancements

### Planned Features
- **Multiple File Formats**: Support for markdown, RTF
- **Cloud Sync**: iCloud, Dropbox, Google Drive integration
- **Version History**: Track changes over time
- **Collaborative Editing**: Real-time collaboration features

### Technical Improvements
- **Compression**: Compress autosave files
- **Encryption**: Encrypt sensitive session data
- **Backup**: Automatic backup to multiple locations
- **Sync**: Real-time sync across devices

---

For related information, see:
- [Session Lifecycle](./SESSION_LIFECYCLE.md)
- [State Management](../architecture/STATE_MANAGEMENT.md)
- [IPC Communication](../architecture/IPC_COMMUNICATION.md)
