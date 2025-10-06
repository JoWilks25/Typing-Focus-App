# Electron API Usage Guide

This document shows how to use the placeholder Electron API in your renderer components.

## 📁 Files Created

### 1. **src/preload/index.ts**

Exposes `window.electronAPI` with placeholder functions:

- `saveSession(sessionData)` - Save a session
- `loadSession(sessionId)` - Load a session
- `deleteSession(sessionId)` - Delete a session
- `listSessions()` - List all sessions
- `saveFile(filePath, content)` - Save file
- `loadFile(filePath)` - Load file

### 2. **src/preload/index.d.ts**

Type definitions for the preload script.

### 3. **src/renderer/src/types/electron.d.ts**

Type definitions for renderer process (window.electronAPI).

### 4. **src/renderer/src/utils/electronAPI.ts**

Helper utility to access the API safely from components.

## 🚀 Usage in React Components

### Method 1: Direct Access

```typescript
// In any component
import '../types/electron' // Import types

function MyComponent() {
  const handleSave = async () => {
    const result = await window.electronAPI.saveSession({
      title: 'My Session',
      content: 'Hello world'
    })
    console.log(result) // { success: false, message: 'Not implemented' }
  }

  return <button onClick={handleSave}>Save Session</button>
}
```

### Method 2: Using Helper Utility (Recommended)

```typescript
import { sessionAPI, fileAPI } from '@renderer/utils/electronAPI'

function MyComponent() {
  const handleSave = async () => {
    // Session operations
    const result = await sessionAPI.save({ title: 'My Session' })
    const session = await sessionAPI.load('session-id')
    const sessions = await sessionAPI.list()
    await sessionAPI.delete('session-id')

    // File operations
    await fileAPI.save('/path/to/file.txt', 'content')
    const content = await fileAPI.load('/path/to/file.txt')
  }

  return <button onClick={handleSave}>Save</button>
}
```

### Method 3: In Custom Hooks

```typescript
// src/renderer/src/hooks/useSession.ts
import { sessionAPI } from '@renderer/utils/electronAPI';
import { useState } from 'react';

export const useSession = () => {
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => {
    const list = await sessionAPI.list();
    setSessions(list);
  };

  const saveSession = async (data: unknown) => {
    return await sessionAPI.save(data);
  };

  return { sessions, loadSessions, saveSession };
};
```

## 🔧 Current Status

All API methods are **placeholders** and will:

- Log to console: `"methodName - not implemented"`
- Return mock responses:
  - Save/Delete operations: `{ success: false, message: 'Not implemented' }`
  - Load operations: `null`
  - List operations: `[]`

## 📝 Next Steps (For Implementation)

When ready to implement actual IPC:

1. **In src/main/index.ts** - Add IPC handlers:

```typescript
import { ipcMain } from 'electron';

ipcMain.handle('session:save', async (event, sessionData) => {
  // Actual implementation
  return { success: true, message: 'Saved' };
});
```

2. **In src/preload/index.ts** - Connect to IPC:

```typescript
import { ipcRenderer } from 'electron';

const electronAPI = {
  saveSession: (sessionData: unknown) => ipcRenderer.invoke('session:save', sessionData)
  // ... etc
};
```

3. **Update types** - Replace `unknown` with proper interfaces

## ✅ Testing the Setup

Run `npm run dev` and open DevTools console. You'll see placeholder logs when calling API methods.
