# Typing Focus App - Project Structure

This document shows the complete folder structure created based on CONTRIBUTING.md.

## Directory Structure

```
focus-writer/
├── src/
│   ├── main/                      # Electron main process (Node.js)
│   │   ├── index.ts               # [existing] Main process entry
│   │   ├── services/              # [NEW] Data service layer
│   │   │   ├── sessionService.ts  # Session CRUD operations
│   │   │   └── fileService.ts     # File I/O operations
│   │   ├── handlers/              # [NEW] IPC handlers
│   │   │   ├── sessionHandlers.ts # Session IPC handlers
│   │   │   └── fileHandlers.ts    # File IPC handlers
│   │   ├── utils/                 # [NEW] Utility functions
│   │   │   └── pathUtils.ts       # Path handling utilities
│   │   └── types/                 # [NEW] Type definitions
│   │       ├── session.ts         # Session types
│   │       └── ipc.ts             # IPC channel types
│   │
│   ├── preload/                   # [existing] Preload scripts
│   │   ├── index.ts
│   │   └── index.d.ts
│   │
│   └── renderer/                  # React application (frontend)
│       ├── index.html             # [existing]
│       ├── assets/                # [existing + NEW]
│       │   └── animations/        # [NEW] Animation assets
│       │       └── .gitkeep
│       └── src/
│           ├── App.tsx            # [existing] Main app component
│           ├── main.tsx           # [existing] Entry point
│           ├── components/        # [NEW] React components
│           │   ├── Editor/
│           │   │   ├── Editor.tsx
│           │   │   └── EditorToolbar.tsx
│           │   ├── Session/
│           │   │   ├── SessionPanel.tsx
│           │   │   └── SessionList.tsx
│           │   ├── Modals/
│           │   │   ├── Modal.tsx
│           │   │   └── SettingsModal.tsx
│           │   ├── Animation/
│           │   │   ├── AnimationLayer.tsx
│           │   │   └── AnimationControls.tsx
│           │   └── Dashboard/
│           │       └── Dashboard.tsx
│           ├── hooks/             # [NEW] Custom React hooks
│           │   ├── useSession.ts
│           │   └── useAnimation.ts
│           ├── store/             # [NEW] State management
│           │   ├── index.ts
│           │   ├── sessionSlice.ts
│           │   └── editorSlice.ts
│           ├── utils/             # [NEW] Frontend utilities
│           │   ├── formatters.ts
│           │   └── validators.ts
│           ├── types/             # [NEW] Frontend types
│           │   ├── session.ts
│           │   └── editor.ts
│           └── styles/            # [NEW] Styles
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

## Placeholder Files Created

All `.ts` and `.tsx` files contain:

- A comment describing the file's purpose
- Empty export statements or placeholder functions

Example:

```typescript
// src/main/services/sessionService.ts
// Purpose: Handle session CRUD operations (save, load, delete sessions)
export const sessionService = {};
```

## Next Steps for Developers

1. Install dependencies: `npm install`
2. Implement actual logic in placeholder files according to CONTRIBUTING.md guidelines
3. Follow the data service layer pattern for all data operations
4. Use type-safe IPC channels defined in preload scripts
5. Manage state centrally using Redux or Context API in the store/ directory

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
- **IPC Communication**: Use type-safe channels in `src/preload/`
- **State Management**: Centralize state in `src/renderer/src/store/`
- **Component Organization**: Group related components in feature folders
- **Type Safety**: Define types in dedicated `types/` directories
- **Testing**: Use Vitest + React Testing Library for all test layers
