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
├── tests/                       \# Reserved for Playwright/UAT tests (empty for MVP)
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

---

## NPM Scripts

**SHOULD:** Use electron-vite standard script names.

```

npm run dev           \# Start dev server with HMR (renderer) and hot reload (main)
npm run build         \# Build for production
npm run preview       \# Preview production build
npm run test          \# Run all tests
npm run test:main     \# Jest tests for main process
npm run test:renderer \# Jest/RTL tests for renderer
npm run lint          \# Run ESLint
npm run format        \# Run Prettier

```

---

## Testing Requirements

- **MUST:** Use React Testing Library + Jest (renderer), Jest (main process).
- **MUST:** 100% unit test coverage for functions, utilities, and business logic.
- **OPTIONAL:** No coverage enforced for UI components or files other than core logic (for MVP).
- **TIP:** `/tests` exists for future Playwright end-to-end/UAT tests.

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
