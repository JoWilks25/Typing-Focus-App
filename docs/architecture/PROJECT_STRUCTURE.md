# Project Structure

Complete folder structure and file organization for Draft Tree.

## Directory Structure

```
Draft-Tree/
├── src/
│   ├── main/                      # Electron main process (Node.js)
│   │   ├── index.ts               # Main process entry
│   │   ├── ipcHandlers.ts         # IPC handlers (centralized)
│   │   ├── services/              # Data service layer
│   │   │   ├── sessionManager.ts  # Session management
│   │   │   ├── fileManager.ts     # File I/O operations
│   │   │   ├── FloatingModalService.ts # Floating modal windows
│   │   │   ├── FocusMonitorService.ts  # Focus detection
│   │   │   └── InactivityService.ts    # Inactivity tracking
│   │   ├── utils/                 # Utility functions
│   │   │   ├── calculateSessionStats.ts
│   │   │   ├── generateId.ts
│   │   │   ├── pathUtils.ts
│   │   │   └── validation.ts
│   │   └── types/                 # Type definitions
│   │       ├── session.ts         # Session types
│   │       └── ipc.ts             # IPC channel types
│   │
│   ├── preload/                   # Preload scripts
│   │   ├── index.ts
│   │   └── index.d.ts
│   │
│   ├── shared/                    # Shared types and constants
│   │   └── types/
│   │       └── validation.ts      # Shared validation types
│   │
│   └── renderer/                  # React application (frontend)
│       ├── index.html
│       ├── assets/                # Static assets
│       │   └── animations/        # Lottie animation JSON files
│       │       ├── tree-grow-0.json through tree-grow-7.json
│       │       └── tree-growth.json
│       └── src/
│           ├── App.tsx            # Main app component
│           ├── main.tsx           # Entry point
│           ├── components/        # React components
│           │   ├── Editor/
│           │   │   ├── Editor.tsx
│           │   │   ├── EditorTitle.tsx
│           │   │   ├── EditorToolbar.tsx
│           │   │   ├── SessionStats.tsx
│           │   │   └── editorConfig.ts
│           │   ├── Session/
│           │   │   ├── SessionSetup.tsx
│           │   │   ├── SessionPanel.tsx
│           │   │   ├── SessionList.tsx
│           │   │   ├── SessionSummary.tsx
│           │   │   ├── GoalInput.tsx
│           │   │   └── GoalSelector.tsx
│           │   ├── Modals/
│           │   │   ├── Modal.tsx
│           │   │   ├── SessionSetupModal.tsx
│           │   │   ├── CompletionModal.tsx
│           │   │   ├── InactivityModal.tsx
│           │   │   ├── FloatingModal.tsx
│           │   │   ├── FloatingDistractionWarning.tsx
│           │   │   └── SettingsModal.tsx
│           │   ├── Animation/
│           │   │   ├── AnimationLayer.tsx
│           │   │   ├── AnimationControls.tsx
│           │   │   └── TreeAnimation.tsx
│           │   ├── Dashboard/
│           │   │   └── Dashboard.tsx
│           │   └── Toast/
│           ├── hooks/             # Custom React hooks
│           │   ├── useAppState.ts
│           │   ├── useSession.ts
│           │   ├── useDebounce.ts
│           │   ├── useTimer.ts
│           │   └── useFloatingModal.ts
│           ├── context/           # React context (state management)
│           │   ├── AppContext.tsx       # Consolidated app + session context
│           │   ├── AppContextDef.ts     # Context type definitions
│           │   ├── appStorage.ts        # App state persistence
│           │   └── sessionStorage.ts    # Session state persistence
│           ├── utils/             # Frontend utilities
│           │   ├── formatTime.ts
│           │   ├── validation.ts
│           │   ├── wordCount.ts
│           │   └── electronAPI.ts
│           ├── types/             # Frontend types
│           │   ├── app.ts
│           │   ├── session.ts
│           │   └── timer.ts
│           └── styles/            # Global styles
│               ├── global.css
│               └── theme.css
│
├── resources/                     # [existing + NEW]
│   ├── icons/                     # [NEW] App icons
│   │   └── .gitkeep
│   └── icon.png
│
├── out/                           # [NEW] Build output directory
│   └── .gitkeep
│
├── tests/                         # [NEW] All tests (unit, integration, and future E2E)
│   ├── main/                     # [NEW] Main process tests
│   │   ├── services/             # [NEW] Service layer tests
│   │   ├── handlers/             # [NEW] IPC handler tests
│   │   └── bootstrap.test.ts     # [NEW] Bootstrap tests
│   ├── preload/                  # [NEW] Preload script tests
│   │   ├── api.test.ts           # [NEW] API tests
│   │   └── type-validation.test.ts # [NEW] Type validation tests
│   ├── renderer/                 # [NEW] Renderer process tests
│   │   ├── src/utils/            # [NEW] Utility tests
│   │   └── context/              # [NEW] Context tests
│   └── setup.ts                  # [NEW] Global test setup
│
├── .env.example                   # [NEW] Environment variables template
├── electron.vite.config.ts        # [existing]
├── package.json                   # [existing]
├── tsconfig.json                  # [existing]
└── README.md                      # [existing]
```

## Key Files and Their Purposes

### Main Process
- **`index.ts`**: Main process entry point, creates windows
- **`ipcHandlers.ts`**: Centralized IPC handler registration (not separate handlers/ directory)
- **`sessionManager.ts`**: Session lifecycle and state management
- **`fileManager.ts`**: File I/O operations with external file support
- **`FloatingModalService.ts`**: Creates and manages floating modal windows
- **`FocusMonitorService.ts`**: Detects when user switches away from app
- **`InactivityService.ts`**: Tracks keyboard inactivity for session pausing

### Renderer Process
- **`AppContext.tsx`**: Consolidated app and session state management (no separate contexts)
- **`Editor.tsx`**: Main text editor with Tiptap integration and local state management
- **`useSession.ts`**: Custom hook for session operations
- **`useDebounce.ts`**: Debouncing utility for content updates
- **`wordCount.ts`**: Word counting algorithm
- **`sessionStorage.ts`**: Session state persistence to localStorage

### Shared
- **`validation.ts`**: Shared validation constants (100-10,000 words, 5-480 minutes)

## Testing Architecture

The project uses **Vitest** as the unified test framework for all layers:

### Test Organization
- **`/tests/main/`** - Main process tests (services, handlers, IPC)
- **`/tests/preload/`** - Preload script tests (API, type validation)  
- **`/tests/renderer/`** - Renderer tests (components, hooks, utilities)
- **`/tests/setup.ts`** - Global test setup with mocks

### Test Coverage
- **80%+ coverage** required for business logic (services, utilities, core functions)
- **React Testing Library** for component testing
- **Electron mocks** for isolated testing
- **Type-safe test utilities** in `/tests/renderer/src/utils/test-utils.tsx`

### Available Commands
```bash
npm run test         # Run all tests
npm run test:coverage # Run with coverage report
npm run test:watch   # Run in watch mode
npm run test:ui      # Run with UI interface
```

## Architecture Guidelines

- **Data Service Layer**: All data operations go through `src/main/services/`
- **IPC Communication**: Centralized in `src/main/ipcHandlers.ts` with type-safe channels
- **State Management**: Single `AppContext` in `src/renderer/src/context/` (no Redux/separate contexts)
- **Component Organization**: Group related components in feature folders
- **Type Safety**: Define types in dedicated `types/` directories, shared types in `src/shared/types/`
- **Testing**: Use Vitest + React Testing Library for all test layers
- **File Persistence**: Sessions save to user-selected .txt file paths
- **Local Storage**: App state and session state persist to localStorage
