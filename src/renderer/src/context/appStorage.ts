// src/renderer/src/context/appStorage.ts
// Purpose: App state storage utilities

import type { AppState } from '@renderer/types/app';

const STORAGE_KEY = 'tfa:appState:v1';
const RECENT_FILES_KEY = 'tfa:recentFiles:v1';

export interface RecentFile {
    path: string;
    name: string;
    lastAccessed: number;
}

export function loadAppState(): AppState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { currentView: 'editor', theme: 'dark' };
        const parsed = JSON.parse(raw);
        return {
            currentView: parsed?.currentView === 'session-summary' ? 'session-summary' : 'editor',
            theme: parsed?.theme === 'light' || parsed?.theme === 'system' ? parsed.theme : 'dark'
        };
    } catch {
        return { currentView: 'editor', theme: 'dark' };
    }
}

export function saveAppState(state: AppState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
}

export function getRecentFiles(): RecentFile[] {
    try {
        const raw = localStorage.getItem(RECENT_FILES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function addRecentFile(filePath: string): void {
    try {
        const recentFiles = getRecentFiles();
        const fileName = filePath.split(/[/\\]/).pop() || 'Unknown';
        
        // Remove if already exists
        const filtered = recentFiles.filter(file => file.path !== filePath);
        
        // Add to beginning
        const newRecentFiles = [
            { path: filePath, name: fileName, lastAccessed: Date.now() },
            ...filtered
        ].slice(0, 5); // Keep only 5 most recent
        
        localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(newRecentFiles));
    } catch {
        // ignore
    }
}
