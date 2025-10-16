# File Management

Import, export, and autosave functionality for the Typing Focus App.

## Overview

The file management system handles all file operations including importing existing documents, exporting current work, and automatic saving to prevent data loss. All operations are local-only in V1, with no cloud sync.

## File Operations

### Import Functionality

**Purpose**: Load existing plain text files to continue writing

**Supported Formats**:
- Plain text files (`.txt`)
- UTF-8 encoding
- No rich text or formatting

**Import Flow**:
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

**Import Behavior**:
1. User triggers import via menu or button
2. Native file dialog opens
3. User selects `.txt` file
4. File content loaded into editor
5. Initial word count calculated
6. User prompted to set new session goal
7. Imported words don't count toward goal progress

### Export Functionality

**Purpose**: Save current work to user-selected location

**Export Flow**:
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

**Frequency**: Every 30 seconds during active sessions
**Trigger**: Also on editor content changes (debounced)
**Purpose**: Prevent data loss from crashes or unexpected shutdowns

### Autosave Implementation

```typescript
interface AutosaveData {
  sessionId: string;
  content: string;
  timestamp: number;
  wordCount: number;
  characterCount: number;
}

class AutosaveService {
  private autosaveInterval: NodeJS.Timeout | null = null;
  private debouncedSave: (() => void) | null = null;

  startAutosave(sessionId: string) {
    // Interval-based autosave
    this.autosaveInterval = setInterval(async () => {
      await this.performAutosave(sessionId);
    }, 30 * 1000); // 30 seconds

    // Debounced autosave on content changes
    this.debouncedSave = debounce(async () => {
      await this.performAutosave(sessionId);
    }, 5000); // 5 seconds after last edit
  }

  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  private async performAutosave(sessionId: string) {
    try {
      const autosaveData: AutosaveData = {
        sessionId,
        content: getCurrentEditorContent(),
        timestamp: Date.now(),
        wordCount: getCurrentWordCount(),
        characterCount: getCurrentCharacterCount()
      };

      const autosavePath = this.getAutosavePath(sessionId);
      await fs.writeFile(autosavePath, JSON.stringify(autosaveData, null, 2));
      
      console.log('Autosave completed:', autosavePath);
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }

  private getAutosavePath(sessionId: string): string {
    const autosaveDir = path.join(app.getPath('userData'), 'autosave');
    return path.join(autosaveDir, `${sessionId}.json`);
  }
}
```

### Autosave Storage

**Location**: `~/Library/Application Support/focus-writer/autosave/`
**Format**: JSON files with session data
**Naming**: `{sessionId}.json`

**File Structure**:
```json
{
  "sessionId": "session-123",
  "content": "User's written content...",
  "timestamp": 1703123456789,
  "wordCount": 250,
  "characterCount": 1250
}
```

## Recovery System

### Recovery Detection

```typescript
interface RecoveryData {
  sessionId: string;
  content: string;
  timestamp: number;
  wordCount: number;
  isRecent: boolean;
}

const detectRecoveryData = async (): Promise<RecoveryData | null> => {
  try {
    const autosaveDir = path.join(app.getPath('userData'), 'autosave');
    const files = await fs.readdir(autosaveDir);
    
    if (files.length === 0) return null;

    // Find most recent autosave
    let mostRecent: RecoveryData | null = null;
    let mostRecentTime = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(autosaveDir, file);
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      
      if (data.timestamp > mostRecentTime) {
        mostRecentTime = data.timestamp;
        mostRecent = {
          sessionId: data.sessionId,
          content: data.content,
          timestamp: data.timestamp,
          wordCount: data.wordCount,
          isRecent: Date.now() - data.timestamp < 24 * 60 * 60 * 1000 // 24 hours
        };
      }
    }

    return mostRecent;
  } catch (error) {
    console.error('Recovery detection failed:', error);
    return null;
  }
};
```

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
- App Data: `~/Library/Application Support/focus-writer/`
- Autosave: `~/Library/Application Support/focus-writer/autosave/`
- Sessions: `~/Library/Application Support/focus-writer/sessions/`

**Windows** (future):
- App Data: `%APPDATA%/focus-writer/`
- Autosave: `%APPDATA%/focus-writer/autosave/`
- Sessions: `%APPDATA%/focus-writer/sessions/`

### Directory Structure

```
~/Library/Application Support/focus-writer/
├── autosave/
│   ├── session-123.json
│   └── session-456.json
├── sessions/
│   ├── active-session.json
│   └── session-history.json
└── config/
    └── app-config.json
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
  const fallbackPath = path.join(os.tmpdir(), `focus-writer-autosave-${sessionId}.json`);
  
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
