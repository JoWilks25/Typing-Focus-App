import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TreeAnimation } from '../../src/renderer/src/components/Animation/TreeAnimation';

// Mock the useFloatingModal hook
const mockCreateModal = vi.fn();
const mockCloseModal = vi.fn();
const mockForceCloseModal = vi.fn();

vi.mock('../../src/renderer/src/hooks/useFloatingModal', () => ({
    useFloatingModal: () => ({
        createModal: mockCreateModal,
        closeModal: mockCloseModal,
        forceCloseModal: mockForceCloseModal,
    }),
}));

// Mock window.api
const mockApiSend = vi.fn();
const mockApiOn = vi.fn();
const mockApiOff = vi.fn();

Object.defineProperty(window, 'api', {
    value: {
        send: mockApiSend,
        on: mockApiOn,
        off: mockApiOff,
    },
    writable: true,
});

// Mock the useSession hook - start with no active session
let mockActiveSession: any = null;
vi.mock('../../src/renderer/src/hooks/useSession', () => ({
    useSession: () => ({
        activeSession: mockActiveSession,
    }),
}));

// Mock the TreeAnimationModal component to avoid import issues
vi.mock('../../src/renderer/src/components/Animation/TreeAnimationModal', () => ({
    TreeAnimationModal: () => <div data-testid="tree-animation-modal">Mock Tree Animation Modal</div>
}));

describe('TreeAnimation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateModal.mockResolvedValue('test-modal-id');
        mockCloseModal.mockResolvedValue(undefined);
        mockForceCloseModal.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should not create modal when there is no active session', () => {
        // mockActiveSession is null by default
        render(<TreeAnimation progress={0} />);

        expect(mockCreateModal).not.toHaveBeenCalled();
    });

    it('should create modal when there is an active session', async () => {
        // Set up a mock active session
        mockActiveSession = { id: 'test-session-id', name: 'Test Session' };

        render(<TreeAnimation progress={0} />);

        expect(mockCreateModal).toHaveBeenCalledWith({
            width: 400,
            height: 500,
            alwaysOnTop: true,
            resizable: true,
            minimizable: true,
            closable: true,
            title: 'Progress Tree',
            content: expect.stringContaining('tree-animation-container'),
        });
    });

    it('should create modal when session has progress', async () => {
        // Set up a mock active session
        mockActiveSession = { id: 'test-session-id', name: 'Test Session' };

        render(<TreeAnimation progress={50} />);

        expect(mockCreateModal).toHaveBeenCalledWith({
            width: 400,
            height: 500,
            alwaysOnTop: true,
            resizable: true,
            minimizable: true,
            closable: true,
            title: 'Progress Tree',
            content: expect.stringContaining('tree-animation-container'),
        });
    });

    it('should send progress updates via IPC', async () => {
        // Set up a mock active session
        mockActiveSession = { id: 'test-session-id', name: 'Test Session' };

        const { rerender } = render(<TreeAnimation progress={25} />);

        // Wait for modal creation
        await vi.waitFor(() => {
            expect(mockCreateModal).toHaveBeenCalled();
        });

        // Update progress
        rerender(<TreeAnimation progress={75} />);

        expect(mockApiSend).toHaveBeenCalledWith(
            'tree-animation:update-progress',
            'test-modal-id',
            75,
            false
        );
    });

    it('should handle wilting state', async () => {
        // Set up a mock active session
        mockActiveSession = { id: 'test-session-id', name: 'Test Session' };

        const { rerender } = render(<TreeAnimation progress={50} isWilting={false} />);

        // Wait for modal creation
        await vi.waitFor(() => {
            expect(mockCreateModal).toHaveBeenCalled();
        });

        // Update to wilting state
        rerender(<TreeAnimation progress={50} isWilting={true} />);

        expect(mockApiSend).toHaveBeenCalledWith(
            'tree-animation:update-progress',
            'test-modal-id',
            50,
            true
        );
    });

    it('should close modal on unmount', async () => {
        // Set up a mock active session
        mockActiveSession = { id: 'test-session-id', name: 'Test Session' };

        const { unmount } = render(<TreeAnimation progress={50} />);

        // Wait for modal creation
        await vi.waitFor(() => {
            expect(mockCreateModal).toHaveBeenCalled();
        });

        // Clear the mock to check only the unmount call
        mockCloseModal.mockClear();

        unmount();

        // The cleanup effect should call closeModal
        expect(mockCloseModal).toHaveBeenCalledWith('test-modal-id');
    });

    it('should not send duplicate progress updates', async () => {
        // Set up a mock active session
        mockActiveSession = { id: 'test-session-id', name: 'Test Session' };

        const { rerender } = render(<TreeAnimation progress={50} />);

        // Wait for modal creation and initial progress update
        await vi.waitFor(() => {
            expect(mockCreateModal).toHaveBeenCalled();
            expect(mockApiSend).toHaveBeenCalledWith(
                'tree-animation:update-progress',
                'test-modal-id',
                50,
                false
            );
        });

        // Clear previous calls
        mockApiSend.mockClear();

        // Rerender with same progress
        rerender(<TreeAnimation progress={50} />);

        // Should not send duplicate update since progress hasn't changed
        expect(mockApiSend).not.toHaveBeenCalled();
    });
});

describe('TreeAnimationModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render with initial data', () => {
        const testData = {
            progress: 60,
            isWilting: false,
        };

        render(<TreeAnimationModal data={testData} />);

        expect(screen.getByTestId('tree-animation-modal')).toBeInTheDocument();
        expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
    });

    it('should set up IPC listeners on mount', () => {
        render(<TreeAnimationModal />);

        expect(mockApiOn).toHaveBeenCalledWith(
            'tree-animation:progress',
            expect.any(Function)
        );
    });

    it('should clean up IPC listeners on unmount', () => {
        const { unmount } = render(<TreeAnimationModal />);

        unmount();

        expect(mockApiOff).toHaveBeenCalledWith(
            'tree-animation:progress',
            expect.any(Function)
        );
    });

    it('should display progress text correctly', () => {
        const testData = {
            progress: 75,
            isWilting: false,
        };

        render(<TreeAnimationModal data={testData} />);

        expect(screen.getByText('🌳 75%')).toBeInTheDocument();
    });

    it('should display wilting text when wilting', () => {
        const testData = {
            progress: 0,
            isWilting: true,
        };

        render(<TreeAnimationModal data={testData} />);

        expect(screen.getByText('🌱 Wilting...')).toBeInTheDocument();
    });
});
