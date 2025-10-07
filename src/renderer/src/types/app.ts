// src/renderer/src/types/app.ts
// Purpose: Type definitions for app state

export type View = 'dashboard' | 'editor';

export interface AppState {
  currentView: View;
  theme: 'light' | 'dark' | 'system';
}

