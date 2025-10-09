## Table of Contents

- [Repo Structure](#repo-structure)
- [Setup & Environment](#setup--environment)
- [Linting, Formatting, TypeScript](#linting-formatting-typescript)
- [NPM Scripts](#npm-scripts)
- [Testing Requirements](#testing-requirements)
- [Workflow & PR Process](#workflow--pr-process)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [Community, Security & License](#community-security--license)

---

## Repo Structure

**MUST:** Use the following electron-vite structure for consistency.

```

focus-writer/
├── src/
│   ├── main/                    \# Electron main process (Node.js)
│   │   ├── index.js
│   │   ├── services/
│   │   ├── handlers/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── preload/
│   │
│   └── renderer/                \# React application (frontend)
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   │   ├── Editor/
│       │   │   ├── Session/
│       │   │   ├── Modals/
│       │   │   ├── Animation/
│       │   │   └── Dashboard/
│       │   ├── hooks/
│       │   ├── store/
│       │   ├── utils/
│       │   ├── types/
│       │   └── styles/
│       ├── index.html
│       └── assets/
│           └── animations/
│
├── resources/
│   └── icons/
│
├── out/                         \# Build output directory
│
├── tests/                       \# All tests (unit, integration, and future E2E)
│   ├── main/                   \# Main process tests
│   ├── preload/                \# Preload script tests
│   ├── renderer/               \# Renderer process tests
│   └── setup.ts                \# Global test setup
│
├── electron.vite.config.js
├── package.json
├── .env.example
└── README.md

```

**NOTE:** Config files (e.g. `tsconfig.json`, ESLint, Prettier) can be shared at the root or separated per process as needed.

---

## Setup & Environment

**MUST:**

- Use latest LTS Node.js (20.19+ or 22.12+, see root `package.json`).
- Use `npm` for all dependency management and scripts.
- Run on MacOS for full app support (Electron/Mac MVP target).
- Install dependencies: `npm install`

---

## Linting, Formatting, TypeScript

- **SHOULD:** Use standard ESLint & Prettier configs.
- **WARN:** TypeScript is not strict for MVP, but try to address warnings when able.
- **TIP:** Types go in `/src/renderer/src/types` (frontend) and `/src/main/types` (backend). No `/shared` folder for MVP.

## Styling Guidelines

**MUST:** Use CSS Modules for all component styling. This ensures proper style encapsulation and prevents CSS conflicts.

### CSS Modules Standards

- **File naming:** `ComponentName.module.css` (e.g., `Editor.module.css`)
- **Class naming:** Use kebab-case for CSS class names (e.g., `.editor-content`, `.modal-header`)
- **Import pattern:** `import styles from './Component.module.css'`
- **Usage:** `className={styles['kebab-case-name']}`

### Example CSS Module Usage

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

### Global Styles

- Use `src/renderer/src/assets/main.css` for global base styles
- Use `src/renderer/src/assets/base.css` for CSS custom properties/variables
- Use `src/renderer/src/styles/global.css` for global resets and typography
- Use `src/renderer/src/styles/theme.css` for design tokens

**WARN:** Avoid global CSS classes. Use CSS Modules for component-specific styling.

---

## NPM Scripts

**SHOULD:** Use electron-vite standard script names.

```

npm run dev           \# Start dev server with HMR (renderer) and hot reload (main)
npm run build         \# Build for production
npm run preview       \# Preview production build
npm run test          \# Run all tests (Vitest)
npm run test:coverage \# Run tests with coverage report
npm run test:watch    \# Run tests in watch mode
npm run test:ui       \# Run tests with UI interface
npm run lint          \# Run ESLint
npm run format        \# Run Prettier

```

---

## Testing Requirements

- **MUST:** Use Vitest + React Testing Library for all testing (unified test framework).
- **MUST:** 80%+ test coverage for business logic (services, utilities, core functions).
- **MUST:** All tests located in `/tests` folder with clear organization:
  - `/tests/main/` - Main process tests (services, handlers, IPC)
  - `/tests/preload/` - Preload script tests (API, type validation)
  - `/tests/renderer/` - Renderer tests (components, hooks, utilities)
  - `/tests/setup.ts` - Global test setup with mocks
- **OPTIONAL:** No coverage enforced for UI components or files other than core logic (for MVP).
- **TIP:** Test utilities available in `/tests/renderer/src/utils/test-utils.tsx` for React component testing.

---

## Workflow & PR Process

**MUST:**

- Use feature branches off `dev`.
- Prefix all commits with `[JIRA-TICKET] Short description`
- PRs must have titles like `[JIRA-TICKET]: Brief description`
- All PRs must reference a JIRA ticket (enforced by GitHub Actions if available).
- PRs: squash + merge into `dev`, include summary and any UI screenshots.
- Board workflow: `open → in progress → code review → testing → done`

---

## Environment Variables

**MUST:**

- Use `.env` file(s) for secrets/config (not committed; `.env.example` provided for reference).
- **WARN:** Do not push real `.env` content.

---

## Architecture Guidelines

### Data Service Layer

**MUST:** All data operations go through service modules in `src/main/services/`. This abstraction allows for easy migration to API-based sync in future versions.

**Example pattern:**

```

// V1: Uses filesystem (local-only)
export async function saveSession(sessionData) {
return fs.writeFile(sessionPath, JSON.stringify(sessionData));
}

// V2+: Swap to API call (cross-device sync)
export async function saveSession(sessionData) {
return fetch('/api/sessions', {
method: 'POST',
body: JSON.stringify(sessionData)
});
}

```

### IPC Communication

**MUST:** Use type-safe IPC channels defined in `src/preload/api.js`. The preload script exposes a limited API to the renderer process through `contextBridge`.

**Example:**

```

// src/preload/api.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
saveSession: (data) => ipcRenderer.invoke('session:save', data),
loadSession: (id) => ipcRenderer.invoke('session:load', id)
});

```

### State Management

**SHOULD:** Session state, editor content, and animation state should be managed centrally in Redux or Context API. This ensures consistent behavior across components.

---

## Documentation

- **MUST:** Use `CONTRIBUTING.md` as your primary resource.
- `README.md` links here.
- **TBA:** Architecture/project documentation and onboarding will be added in `/docs`.

---

## Community, Security & License

- **NOTE:** No public contribution guidelines, security, or license for MVP.

---

**If you have questions or spots for improvement, open an issue or contact the core team directly.**

---
