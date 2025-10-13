import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../../src/renderer/src/context/AppContext';
import { SessionSetup } from '../../src/renderer/src/components/Session/SessionSetup';

// Mock the window.api object
const mockApi = {
    session: {
        start: vi.fn().mockResolvedValue({
            id: 'test-session-id',
            name: 'Test Session',
            title: 'Test Title',
            content: '',
            goalType: 'word',
            goalValue: 500,
            startTime: Date.now(),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            currentWords: 0,
            timeElapsed: 0,
            progressPercentage: 0
        })
    },
    file: {
        read: vi.fn(),
        write: vi.fn(),
        exists: vi.fn(),
        autosave: vi.fn()
    },
    storage: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn()
    },
    process: {
        versions: {}
    }
};

// Mock window.api
Object.defineProperty(window, 'api', {
    value: mockApi,
    writable: true
});

describe('Session Flow Integration', () => {
    it('should render session setup component', () => {
        render(
            <AppProvider>
                <SessionSetup />
            </AppProvider>
        );

        expect(screen.getByText('Ready to Write?')).toBeInTheDocument();
        expect(screen.getByText('Start Writing')).toBeInTheDocument();
    });

    it('should have goal type selection buttons', () => {
        render(
            <AppProvider>
                <SessionSetup />
            </AppProvider>
        );

        expect(screen.getByTestId('word-goal-button')).toBeInTheDocument();
        expect(screen.getByTestId('time-goal-button')).toBeInTheDocument();
    });

    it('should have goal input field', () => {
        render(
            <AppProvider>
                <SessionSetup />
            </AppProvider>
        );

        expect(screen.getByLabelText(/Target Word Count|Target Time Duration/)).toBeInTheDocument();
    });

    it('should show start writing button', () => {
        render(
            <AppProvider>
                <SessionSetup />
            </AppProvider>
        );

        const startButton = screen.getByText('Start Writing');
        expect(startButton).toBeInTheDocument();
        expect(startButton).toBeEnabled();
    });
});
