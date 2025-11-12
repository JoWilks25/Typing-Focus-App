# Development Guide

Daily workflow and development practices for Draft Tree.

## Development Workflow

### 1. Start Development Session

```bash
# Start the development server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch
```

### 2. Code Changes

The development environment provides:
- **Hot Module Replacement (HMR)** for React components
- **Auto-reload** for Electron main process changes
- **TypeScript compilation** with error checking
- **ESLint** integration for code quality

### 3. Testing Changes

```bash
# Run specific tests
npm run test -- --grep "SessionService"

# Run tests with coverage
npm run test:coverage

# Run tests with UI for debugging
npm run test:ui
```

### 4. Code Quality

```bash
# Check code style
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # Main process entry
│   ├── ipcHandlers.ts      # Centralized IPC handlers
│   ├── services/           # Business logic services
│   │   ├── sessionManager.ts
│   │   ├── fileManager.ts
│   │   ├── FloatingModalService.ts
│   │   ├── FocusMonitorService.ts
│   │   └── InactivityService.ts
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript types
├── preload/                # Preload scripts (context bridge)
│   └── index.ts
├── shared/                 # Shared types and constants
│   └── types/
│       └── validation.ts
└── renderer/               # React application
    ├── src/
    │   ├── components/     # React components
    │   ├── hooks/          # Custom React hooks
    │   ├── context/        # React context (AppContext)
    │   ├── utils/          # Frontend utilities
    │   ├── types/          # Frontend types
    │   └── styles/         # Global styles
    └── assets/             # Static assets (including animations)
```

## Development Patterns

### 1. Component Development

Use CSS Modules for styling:

```tsx
// Component.tsx
import styles from './Component.module.css';

export const Component = () => {
  return (
    <div className={styles['component-container']}>
      <h1 className={styles['component-title']}>Title</h1>
    </div>
  );
};
```

```css
/* Component.module.css */
.component-container {
  padding: 1rem;
  background-color: #1f2937;
}

.component-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f9fafb;
}
```

### 2. State Management

Use consolidated AppContext for state management:

```tsx
// Consolidated context in AppContext.tsx
export function AppProvider({ children }: { children: React.ReactNode }) {
  // App state
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  
  // Session state
  const [sessions, setSessions] = useState<Session[]>(() => loadSessionState().sessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Provides both app and session management
  const contextValue = useMemo(() => ({
    appState,
    setView,
    sessions,
    activeSession,
    startSession,
    endSession,
    updateProgress,
    // ... other methods
  }), [appState, sessions, activeSession]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hooks
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};

export const useSession = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useSession must be used within AppProvider');
  return {
    activeSession: context.activeSession,
    startSession: context.startSession,
    endSession: context.endSession,
    // ... other session methods
  };
};
```

### 3. IPC Communication

Use type-safe IPC channels via centralized handlers:

```typescript
// Main process (ipcHandlers.ts)
export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('session:start', async (_event, filePath: string, name?: string, title?: string, goalType: GoalType = 'word', goalValue: number = 500) => {
    return await sessionManager.startSession(filePath, name, title, goalType, goalValue);
  });
}

// Preload script
const sessionAPI = {
  start: (filePath: string, name?: string, title?: string, goalType?: GoalType, goalValue?: number) => 
    ipcRenderer.invoke('session:start', filePath, name, title, goalType, goalValue)
};

contextBridge.exposeInMainWorld('api', {
  session: sessionAPI,
  // ... other APIs
});

// Renderer (via AppContext)
const { startSession } = useSession();
const session = await startSession('/path/to/file.txt', 'My Session', 'Title', 'word', 500);
```

### 4. Service Layer Pattern

All data operations go through services:

```typescript
// src/main/services/sessionManager.ts
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private activeSessionId: string | null = null;
  private fileManager: FileManager | null = null;
  
  async startSession(
    filePath: string,
    name?: string,
    title?: string,
    goalType: GoalType = 'word',
    goalValue: number = 500,
    initialContent?: string
  ): Promise<Session> {
    // Validate goal
    if (!isValidGoal(goalType, goalValue)) {
      throw new Error(`Invalid goal: ${goalType} goal value ${goalValue} is out of range`);
    }
    
    // Stop any existing active session
    if (this.activeSessionId) {
      await this.stopSession(this.activeSessionId);
    }
    
    // Create session
    const session: Session = {
      id: generateId(),
      name: name || `Session ${new Date().toLocaleString()}`,
      title,
      filePath,
      goalType,
      goalValue,
      startTime: Date.now(),
      status: 'active',
      // ... other fields
    };
    
    // Save to file
    if (this.fileManager) {
      await this.fileManager.writeFileExternal(filePath, initialContent || '');
    }
    
    this.sessions.set(session.id, session);
    this.activeSessionId = session.id;
    this.startAutosave();
    
    return session;
  }
}
```

## File Organization

### Component Structure

```
components/
├── Editor/
│   ├── Editor.tsx
│   ├── Editor.module.css
│   ├── EditorToolbar.tsx
│   └── EditorToolbar.module.css
├── Session/
│   ├── SessionPanel.tsx
│   ├── SessionPanel.module.css
│   └── index.ts
└── Modals/
    ├── Modal.tsx
    ├── Modal.module.css
    └── index.ts
```

### Hook Structure

```
hooks/
├── useSession.ts
├── useWordCount.ts
├── useTimer.ts
└── index.ts
```

### Utility Structure

```
utils/
├── formatters.ts
├── validators.ts
├── wordCount.ts
└── index.ts
```

## Testing Strategy

### 1. Unit Tests

Test individual functions and components:

```typescript
// tests/renderer/src/utils/wordCount.test.ts
import { describe, it, expect } from 'vitest';
import { countWords } from '../../../../src/renderer/src/utils/wordCount';

describe('wordCount utilities', () => {
  it('should count words correctly', () => {
    const result = countWords('Hello world');
    expect(result.words).toBe(2);
    expect(result.characters).toBe(11);
  });
});
```

### 2. Component Tests

Test React components with React Testing Library:

```typescript
// tests/renderer/src/components/Editor.test.tsx
import { render, screen } from '@testing-library/react';
import { Editor } from '../../../../src/renderer/src/components/Editor/Editor';

describe('Editor', () => {
  it('should render editor content', () => {
    render(<Editor />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

### 3. Service Tests

Test business logic in services:

```typescript
// tests/main/services/sessionService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SessionService } from '../../../src/main/services/sessionService';

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService();
  });

  it('should create a new session', () => {
    const session = sessionService.startSession('Test Session');
    expect(session.name).toBe('Test Session');
    expect(session.status).toBe('active');
  });
});
```

## Debugging

### 1. React DevTools

Install React DevTools browser extension for component debugging.

### 2. Electron DevTools

Use built-in DevTools for debugging:
- **View → Toggle Developer Tools**
- **Cmd+Option+I** (macOS)

### 3. Console Logging

```typescript
// Use structured logging
console.log('Session started:', { sessionId, timestamp: Date.now() });

// Use console.group for related logs
console.group('Session Management');
console.log('Starting session...');
console.log('Session created:', session);
console.groupEnd();
```

### 4. Breakpoints

Set breakpoints in:
- VS Code (recommended)
- Chrome DevTools
- Electron DevTools

## Performance Considerations

### 1. Bundle Size

- Use dynamic imports for large components
- Tree-shake unused code
- Optimize images and assets

### 2. Memory Usage

- Clean up event listeners
- Use React.memo for expensive components
- Avoid memory leaks in long-running sessions

### 3. Rendering Performance

- Use React.memo for components that don't change often
- Implement proper key props for lists
- Avoid unnecessary re-renders

## Common Issues

### 1. Hot Reload Not Working

```bash
# Restart dev server
npm run dev
```

### 2. TypeScript Errors

```bash
# Check types
npm run typecheck

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### 3. Test Failures

```bash
# Clear test cache
npm run test -- --no-cache

# Run specific test file
npm run test tests/main/services/sessionService.test.ts
```

### 4. Build Issues

```bash
# Clean build
rm -rf out dist
npm run build
```

## Best Practices

### 1. Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Write descriptive variable names
- Add JSDoc comments for complex functions

### 2. Git Workflow

- Use feature branches
- Write descriptive commit messages
- Keep commits focused and atomic
- Test before committing

### 3. Error Handling

```typescript
// Use try-catch for async operations
try {
  const result = await sessionService.startSession(data);
  return result;
} catch (error) {
  console.error('Failed to start session:', error);
  throw new Error('Session start failed');
}
```

### 4. Type Safety

- Use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use type guards for runtime checks

---

For more detailed information, see:
- [Architecture Overview](../architecture/OVERVIEW.md)
- [Build Guide](./BUILDING.md) - For production builds and installers
- [Testing Guide](./TESTING.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
