import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { SessionProvider } from '@renderer/context/SessionContext';
import { useSession } from '@renderer/hooks/useSession';

function wrapper({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}

describe('SessionContext', () => {
    it('adds, updates, removes and persists sessions', () => {
        localStorage.clear();
        const { result } = renderHook(() => useSession(), { wrapper });

        act(() => {
            result.current.addSession({
                id: '1',
                title: 'First',
                content: 'Hello',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });
        expect(result.current.sessions.length).toBe(1);
        expect(result.current.activeSessionId).toBe('1');

        act(() => {
            result.current.updateSession({
                ...result.current.sessions[0],
                title: 'Updated',
            });
        });
        expect(result.current.sessions[0].title).toBe('Updated');

        act(() => {
            result.current.removeSession('1');
        });
        expect(result.current.sessions.length).toBe(0);
        expect(result.current.activeSessionId).toBeNull();

        const stored = JSON.parse(localStorage.getItem('tfa:sessionState:v1') || '{}');
        expect(Array.isArray(stored.sessions)).toBe(true);
    });
});


