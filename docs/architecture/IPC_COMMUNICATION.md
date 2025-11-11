# IPC Communication

Guide to Inter-Process Communication between main and renderer processes using Electron's IPC system in Draft Tree.

## Architecture

Draft Tree uses a centralized IPC handler pattern with type-safe communication between processes.

### Key Files

1. **`src/main/ipcHandlers.ts`** - Centralized IPC handler registration
2. **`src/preload/index.ts`** - Context bridge exposing APIs to renderer
3. **`src/main/types/ipc.ts`** - IPC channel type definitions

## IPC Channel Categories

### Session Operations
```typescript
// Channel names from src/main/ipcHandlers.ts
SESSION_START: 'session:start'
SESSION_STOP: 'session:stop'
SESSION_END: 'session:end'
SESSION_GET: 'session:get'
SESSION_GET_ACTIVE: 'session:get-active'
SESSION_GET_LAST_ENDED: 'session:get-last-ended'
SESSION_LIST: 'session:list'
SESSION_UPDATE_CONTENT: 'session:update-content'
SESSION_UPDATE_PROGRESS: 'session:update-progress'
SESSION_INCREMENT_DISTRACTION: 'session:increment-distraction'
SESSION_ABANDON: 'session:abandon'
SESSION_MARK_INCOMPLETE: 'session:mark-incomplete'
SESSION_PAUSE: 'session:pause'
SESSION_RESUME: 'session:resume'
```

### File Operations
```typescript
FILE_READ: 'file:read'
FILE_READ_EXTERNAL: 'file:read-external'
FILE_WRITE: 'file:write'
FILE_EXISTS: 'file:exists'
FILE_EXISTS_EXTERNAL: 'file:exists-external'
FILE_AUTOSAVE: 'file:autosave'
```

### Storage Operations
```typescript
STORAGE_SET: 'storage:set'
STORAGE_GET: 'storage:get'
STORAGE_REMOVE: 'storage:remove'
```

### Activity Operations
```typescript
ACTIVITY_TYPING: 'activity:typing'
```

### Dialog Operations
```typescript
DIALOG_SHOW_OPEN_DIRECTORY: 'dialog:show-open-directory'
DIALOG_GET_DEFAULT_SAVE_DIRECTORY: 'dialog:get-default-save-directory'
DIALOG_OPEN_FOLDER: 'dialog:open-folder'
DIALOG_SHOW_OPEN_FILE: 'dialog:show-open-file'
```

### Floating Modal Operations
```typescript
FLOATING_MODAL_CREATE: 'floating-modal:create'
FLOATING_MODAL_CLOSE: 'floating-modal:close'
FLOATING_MODAL_CLOSE_ALL: 'floating-modal:close-all'
FLOATING_MODAL_MINIMIZE: 'floating-modal:minimize'
// ... and more
```

## Usage in React Components

### Via AppContext (Recommended)

```typescript
import { useSession } from '@renderer/hooks/useSession';

function MyComponent() {
  const { activeSession, startSession, endSession } = useSession();

  const handleStartSession = async () => {
    const session = await startSession(
      '/path/to/file.txt',
      'My Session',
      'Session Title',
      'word',
      500
    );
    console.log('Session started:', session);
  };

  return <button onClick={handleStartSession}>Start Session</button>;
}
```

### Direct API Access

```typescript
function MyComponent() {
  const handleSave = async () => {
    // Session operations
    const session = await window.api.session.start(
      '/path/to/file.txt',
      'Session Name',
      'Session Title',
      'word',
      500
    );
    
    // Update content
    await window.api.session.updateContent(session.id, 'New content');
    
    // Update progress
    await window.api.session.updateProgress(
      session.id,
      250,  // currentWords
      1800, // timeElapsed (ms)
      50    // progressPercentage
    );
  };

  return <button onClick={handleSave}>Start Session</button>;
}
```

## Session API

### Starting a Session

```typescript
const session = await window.api.session.start(
  filePath: string,          // Required: Path to .txt file
  name?: string,             // Optional: Session name
  title?: string,            // Optional: Session title
  goalType: GoalType,        // 'word' | 'time'
  goalValue: number,         // Goal value (words or minutes)
  initialContent?: string,   // Optional: Initial content
  isLoadingExisting?: boolean // Optional: Loading existing file
);
```

**Returns**: `Session` object

**Validation**:
- Word goals: 100-10,000 words
- Time goals: 5-480 minutes (8 hours)
- Invalid goals throw an error

### Updating Session Content

```typescript
const updatedSession = await window.api.session.updateContent(
  sessionId: string,
  content: string
);
```

**Returns**: Updated `Session` object

**Used by**: Editor component (debounced, 2-second delay)

### Updating Session Progress

```typescript
const updatedSession = await window.api.session.updateProgress(
  sessionId: string,
  currentWords: number,
  timeElapsed: number,
  progressPercentage: number
);
```

**Returns**: Updated `Session` object

**Used by**: Editor component (5-second intervals)

### Ending a Session

```typescript
const endedSession = await window.api.session.end(
  sessionId: string,
  finalContent: string,
  finalWordCount: number
);
```

**Returns**: Completed `Session` object with calculated stats

### Session State Management

```typescript
// Pause session (inactivity)
await window.api.session.pause(sessionId: string);

// Resume session
await window.api.session.resume(sessionId: string);

// Mark incomplete (distraction countdown expired)
await window.api.session.markIncomplete(sessionId: string);

// Abandon session (user explicitly ends early)
await window.api.session.abandon(sessionId: string);

// Increment distraction count
await window.api.session.incrementDistraction(sessionId: string);
```

## File API

### External File Operations

```typescript
// Read external file (user-selected)
const content = await window.api.file.readExternal(filePath: string);

// Write to external file
await window.api.file.write(filePath: string, content: string);

// Check if external file exists
const exists = await window.api.file.existsExternal(filePath: string);
```

### Internal File Operations

```typescript
// Read internal file (from app data)
const content = await window.api.file.read(path: string);

// Write internal file
await window.api.file.write(path: string, content: string);

// Check if file exists
const exists = await window.api.file.exists(path: string);

// Autosave (used internally by backend)
await window.api.file.autosave(path: string, content: string);
```

## Storage API

```typescript
// Set key-value storage
await window.api.storage.set(key: string, value: unknown);

// Get value by key
const value = await window.api.storage.get(key: string);

// Remove key
await window.api.storage.remove(key: string);
```

## Dialog API

```typescript
// Show directory picker
const result = await window.api.dialog.showOpenDirectory();
// Returns: { directoryPath?: string, canceled: boolean }

// Get default save directory
const defaultDir = await window.api.dialog.getDefaultSaveDirectory();

// Open folder in system file manager
await window.api.dialog.openFolder(filePath: string);

// Show file picker
const result = await window.api.dialog.showOpenFile();
// Returns: { filePath?: string, canceled: boolean }
```

## Activity API

```typescript
// Record typing activity (for inactivity tracking)
await window.api.activity.recordTyping();
```

**Used by**: Editor component on every keystroke (immediate, not debounced)

## Implementation Pattern

### Main Process Handler

```typescript
// src/main/ipcHandlers.ts
export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // Session start handler
  ipcMain.handle(IPC_CHANNELS.SESSION_START, async (
    _event,
    filePath: string,
    name?: string,
    title?: string,
    goalType: GoalType = 'word',
    goalValue: number = 500,
    initialContent?: string,
    isLoadingExisting?: boolean
  ) => {
    try {
      const session = await sessionManager.startSession(
        filePath,
        name,
        title,
        goalType,
        goalValue,
        initialContent
      );
      return session;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  });
  
  // ... other handlers
}
```

### Preload API Exposure

```typescript
// src/preload/index.ts
const sessionAPI = {
  start: (filePath: string, name?: string, title?: string, goalType: GoalType = 'word', goalValue: number = 500, initialContent?: string, isLoadingExisting?: boolean): Promise<Session> => {
    return ipcRenderer.invoke('session:start', filePath, name, title, goalType, goalValue, initialContent, isLoadingExisting);
  },
  updateContent: (sessionId: string, content: string): Promise<Session> => {
    return ipcRenderer.invoke('session:update-content', sessionId, content);
  },
  // ... other methods
};

contextBridge.exposeInMainWorld('api', {
  session: sessionAPI,
  file: fileAPI,
  storage: storageAPI,
  // ... other APIs
});
```

### Type Definitions

```typescript
// src/preload/index.d.ts
declare global {
  interface Window {
    api: {
      session: {
        start(filePath: string, name?: string, title?: string, goalType?: GoalType, goalValue?: number, initialContent?: string, isLoadingExisting?: boolean): Promise<Session>;
        updateContent(sessionId: string, content: string): Promise<Session>;
        updateProgress(sessionId: string, currentWords: number, timeElapsed: number, progressPercentage: number): Promise<Session>;
        // ... other methods
      };
      file: {
        // ... file methods
      };
      storage: {
        // ... storage methods
      };
    };
  }
}
```

## Best Practices

### Error Handling

```typescript
try {
  const session = await window.api.session.start(
    '/path/to/file.txt',
    'My Session',
    undefined,
    'word',
    500
  );
  console.log('Session started:', session);
} catch (error) {
  console.error('Failed to start session:', error);
  // Handle error appropriately
}
```

### Type Safety

- All IPC calls are fully typed
- TypeScript will catch type mismatches at compile time
- Use shared types between main and renderer processes

### Performance

- Debounce frequent updates (content: 2s, progress: 5s)
- Use refs to avoid unnecessary re-renders
- Batch related operations when possible

## Testing IPC

```typescript
// Mock in tests
global.window = {
  api: {
    session: {
      start: vi.fn().mockResolvedValue(mockSession),
      updateContent: vi.fn().mockResolvedValue(mockSession),
      // ... other methods
    }
  }
};
```

---

For related information, see:
- [State Management](./STATE_MANAGEMENT.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Session Lifecycle](../guides/SESSION_LIFECYCLE.md)
