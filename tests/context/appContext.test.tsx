import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '@renderer/context/AppContext';
import { useAppState } from '@renderer/hooks/useAppState';

function wrapper({ children }: { children: React.ReactNode }) {
    return <AppProvider>{children}</AppProvider>;
}

describe('AppContext', () => {
    it('hydrates default state and persists changes', () => {
        localStorage.clear();
        const { result } = renderHook(() => useAppState(), { wrapper });
        expect(result.current.currentView).toBe('dashboard');

        act(() => result.current.setView('editor'));
        expect(result.current.currentView).toBe('editor');

        const stored = JSON.parse(localStorage.getItem('tfa:appState:v1') || '{}');
        expect(stored.currentView).toBe('editor');
    });
});


