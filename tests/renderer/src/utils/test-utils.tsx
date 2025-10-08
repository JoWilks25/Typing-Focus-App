import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { AppProvider } from '../../../../src/renderer/src/context/AppContext';
import { SessionProvider } from '../../../../src/renderer/src/context/SessionContext';
import { AnimationProvider } from '../../../../src/renderer/src/context/AnimationContext';

// Mock localStorage for tests
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialAppState?: {
        currentView?: 'dashboard' | 'editor' | 'session-setup';
        theme?: 'light' | 'dark' | 'system';
    };
    initialSessionState?: {
        sessions?: any[];
        activeSessionId?: string | null;
    };
}

function AllTheProviders({
    children,
    initialAppState,
    initialSessionState
}: {
    children: React.ReactNode;
    initialAppState?: CustomRenderOptions['initialAppState'];
    initialSessionState?: CustomRenderOptions['initialSessionState'];
}) {
    // Mock localStorage responses for initial states
    if (initialAppState) {
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'tfa:appState:v1') {
                return JSON.stringify(initialAppState);
            }
            return null;
        });
    }

    if (initialSessionState) {
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'tfa:sessionState:v1') {
                return JSON.stringify(initialSessionState);
            }
            return null;
        });
    }

    return (
        <AppProvider>
            <SessionProvider>
                <AnimationProvider>
                    {children}
                </AnimationProvider>
            </SessionProvider>
        </AppProvider>
    );
}

const customRender = (
    ui: ReactElement,
    options: CustomRenderOptions = {}
) => {
    const { initialAppState, initialSessionState, ...renderOptions } = options;

    return render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders
                initialAppState={initialAppState}
                initialSessionState={initialSessionState}
            >
                {children}
            </AllTheProviders>
        ),
        ...renderOptions,
    });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper function to create mock sessions
export const createMockSession = (overrides: Partial<any> = {}) => ({
    id: 'test-session-1',
    title: 'Test Session',
    content: 'This is test content',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    wordCount: 4,
    characterCount: 20,
    ...overrides,
});

// Helper function to create mock app state
export const createMockAppState = (overrides: Partial<any> = {}) => ({
    currentView: 'dashboard' as const,
    theme: 'dark' as const,
    ...overrides,
});

// Helper function to create mock session state
export const createMockSessionState = (overrides: Partial<any> = {}) => ({
    sessions: [],
    activeSessionId: null,
    ...overrides,
});

// Clean up function for tests
export const cleanupMocks = () => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
};
