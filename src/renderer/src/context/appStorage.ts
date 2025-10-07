// src/renderer/src/context/appStorage.ts
// Purpose: App state storage utilities

import type { AppState } from '@renderer/types/app';

const STORAGE_KEY = 'tfa:appState:v1';

export function loadAppState(): AppState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { currentView: 'dashboard', theme: 'dark' };
        const parsed = JSON.parse(raw);
        return {
            currentView: parsed?.currentView === 'editor' ? 'editor' : 'dashboard',
            theme: parsed?.theme === 'light' || parsed?.theme === 'system' ? parsed.theme : 'dark'
        };
    } catch {
        return { currentView: 'dashboard', theme: 'dark' };
    }
}

export function saveAppState(state: AppState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
}
