// tests/renderer/src/components/Session/SessionSetup.test.tsx
// Purpose: Tests for SessionSetup component

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { SessionSetup } from '@renderer/components/Session/SessionSetup';

// Mock the SessionContext
const mockAddSession = vi.fn();
const mockSetActiveSession = vi.fn();

vi.mock('@renderer/context/useSession', () => ({
    useSession: () => ({
        addSession: mockAddSession,
        setActiveSession: mockSetActiveSession,
        activeSession: null,
    }),
}));

// Mock the AppContext
const mockSetView = vi.fn();

vi.mock('@renderer/hooks/useAppState', () => ({
    useAppState: () => ({
        setView: mockSetView,
        currentView: 'session-setup',
    }),
}));

// Mock window.electronAPI
const mockElectronAPI = {
    session: {
        start: vi.fn(),
    },
};

Object.defineProperty(window, 'electronAPI', {
    value: mockElectronAPI,
    writable: true,
});

describe('SessionSetup Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock successful session creation response
        mockElectronAPI.session.start.mockResolvedValue({
            success: true,
            data: {
                session: {
                    id: 'test-session-1',
                    title: 'Writing Session - 500 words',
                    goalType: 'word',
                    goalValue: 500,
                    content: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    wordCount: 0,
                    characterCount: 0,
                }
            }
        });
    });

    it('should render the main form elements', () => {
        render(<SessionSetup />);

        expect(screen.getByText('Ready to Write?')).toBeInTheDocument();
        expect(screen.getByText('Set your goal and let\'s grow something great together')).toBeInTheDocument();
        expect(screen.getByText('Choose your goal type')).toBeInTheDocument();
        expect(screen.getByText('Start Writing')).toBeInTheDocument();
    });

    it('should render goal selector and input components', () => {
        render(<SessionSetup />);

        expect(screen.getByText('Word Count Goal')).toBeInTheDocument();
        expect(screen.getByText('Time Goal')).toBeInTheDocument();
        expect(screen.getByLabelText('Target Word Count')).toBeInTheDocument();
    });

    it('should start with word count goal selected and default value', () => {
        render(<SessionSetup />);

        const wordButton = screen.getByText('Word Count Goal').closest('button');
        const input = screen.getByLabelText('Target Word Count');

        expect(wordButton).toHaveClass('bg-blue-600');
        expect(input).toHaveValue('500');
    });

    it('should switch to time goal when time button is clicked', () => {
        render(<SessionSetup />);

        const timeButton = screen.getByText('Time Goal').closest('button');
        fireEvent.click(timeButton!);

        expect(screen.getByLabelText('Target Time Duration')).toBeInTheDocument();
        expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });

    it('should update input value when user types', () => {
        render(<SessionSetup />);

        const input = screen.getByLabelText('Target Word Count');
        fireEvent.change(input, { target: { value: '750' } });

        expect(input).toHaveValue('750');
    });

    it('should disable start button when input is invalid', () => {
        render(<SessionSetup />);

        const input = screen.getByLabelText('Target Word Count');
        const startButton = screen.getByText('Start Writing').closest('button');

        // Set invalid value (too low)
        fireEvent.change(input, { target: { value: '5' } });

        expect(startButton).toBeDisabled();
    });

    it('should enable start button when input is valid', () => {
        render(<SessionSetup />);

        const input = screen.getByLabelText('Target Word Count');
        const startButton = screen.getByText('Start Writing').closest('button');

        // Set valid value
        fireEvent.change(input, { target: { value: '500' } });

        expect(startButton).not.toBeDisabled();
    });

    it('should create session and navigate to editor when form is submitted', async () => {
        render(<SessionSetup />);

        const startButton = screen.getByText('Start Writing').closest('button');
        fireEvent.click(startButton!);

        await waitFor(() => {
            expect(mockAddSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    goalType: 'word',
                    goalValue: 500,
                    title: expect.any(String),
                    content: '',
                })
            );
        });

        expect(mockSetView).toHaveBeenCalledWith('editor');
    });

    it('should handle Enter key submission', async () => {
        render(<SessionSetup />);

        const input = screen.getByLabelText('Target Word Count');
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(mockAddSession).toHaveBeenCalled();
        });
    });

    it('should show advanced options toggle', () => {
        render(<SessionSetup />);

        expect(screen.getByText('Advanced Options')).toBeInTheDocument();
    });

    it('should toggle advanced options when clicked', () => {
        render(<SessionSetup />);

        const advancedToggle = screen.getByText('Advanced Options');
        fireEvent.click(advancedToggle);

        // Advanced options should be expanded
        expect(screen.getByText('Advanced options will be available in future updates.')).toBeInTheDocument();
    });

    it('should show keyboard hint for start button', () => {
        render(<SessionSetup />);

        expect(screen.getByText('Press Enter ↵')).toBeInTheDocument();
    });

    it('should validate word count range', () => {
        render(<SessionSetup />);

        const input = screen.getByLabelText('Target Word Count');
        const startButton = screen.getByText('Start Writing').closest('button');

        // Test minimum boundary
        fireEvent.change(input, { target: { value: '10' } });
        expect(startButton).not.toBeDisabled();

        // Test below minimum
        fireEvent.change(input, { target: { value: '5' } });
        expect(startButton).toBeDisabled();

        // Test maximum boundary
        fireEvent.change(input, { target: { value: '10000' } });
        expect(startButton).not.toBeDisabled();

        // Test above maximum
        fireEvent.change(input, { target: { value: '15000' } });
        expect(startButton).toBeDisabled();
    });

    it('should validate time duration range', () => {
        render(<SessionSetup />);

        // Switch to time goal
        const timeButton = screen.getByText('Time Goal').closest('button');
        fireEvent.click(timeButton!);

        const input = screen.getByLabelText('Target Time Duration');
        const startButton = screen.getByText('Start Writing').closest('button');

        // Test minimum boundary
        fireEvent.change(input, { target: { value: '5' } });
        expect(startButton).not.toBeDisabled();

        // Test below minimum
        fireEvent.change(input, { target: { value: '1' } });
        expect(startButton).toBeDisabled();

        fireEvent.change(input, { target: { value: '0.5' } });
        expect(startButton).toBeDisabled();

        // Test maximum boundary
        fireEvent.change(input, { target: { value: '480' } });
        expect(startButton).not.toBeDisabled();

        // Test above maximum
        fireEvent.change(input, { target: { value: '600' } });
        expect(startButton).toBeDisabled();
    });

    it('should be accessible with proper ARIA attributes', () => {
        render(<SessionSetup />);

        expect(screen.getByRole('form')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: /choose your goal type/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start writing/i })).toBeInTheDocument();
    });
});
