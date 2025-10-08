// tests/renderer/src/components/Editor.basic.test.tsx
// Purpose: Basic component tests for the Tiptap Editor

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../utils/test-utils';

// Simple mock for Tiptap
vi.mock('@tiptap/react', () => ({
    useEditor: vi.fn(() => ({
        getHTML: () => '<p>Test content</p>',
        getText: () => 'Test content',
        commands: {
            setContent: vi.fn(),
            focus: vi.fn(),
        },
        isFocused: false,
    })),
    EditorContent: () => <div data-testid="editor-content">Editor Ready</div>,
}));

// Mock our custom hooks
vi.mock('../../../../src/renderer/src/hooks/useDebounce', () => ({
    useDebounce: vi.fn((callback) => callback),
}));

vi.mock('../../../../src/renderer/src/utils/wordCount', () => ({
    calculateWordCount: vi.fn(() => 2),
    getWordCount: vi.fn(() => 2), // Legacy export
}));

vi.mock('../../../../src/renderer/src/hooks/useWordCount', () => ({
    useWordCount: vi.fn(() => 0),
}));

vi.mock('../../../../src/renderer/src/hooks/useSessionProgress', () => ({
    useSessionProgress: vi.fn(() => ({
        currentWords: 0,
        formattedTime: '00:00',
        isTimerRunning: false,
        progress: 0,
        hasReached33: false,
        hasReached67: false,
        hasReached100: false,
        animationState: 'idle',
        goalType: 'word',
        goalValue: 500,
    })),
}));


// Mock crypto
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: vi.fn(() => 'mock-uuid-123'),
    },
});

// Import after mocks
const { Editor } = await import('../../../../src/renderer/src/components/Editor/Editor');

describe('Editor Component - Basic Tests', () => {
    it('should render editor with word count', () => {
        render(<Editor />);

        expect(screen.getByTestId('editor-content')).toBeInTheDocument();
        expect(screen.getByText('0 words')).toBeInTheDocument();
    });

    it('should display keyboard shortcuts hint', () => {
        render(<Editor />);

        expect(screen.getByText(/Cmd\+S to save/)).toBeInTheDocument();
        expect(screen.getByText(/Cmd\+Q to end/)).toBeInTheDocument();
    });

    it('should render editor content', () => {
        render(<Editor />);

        expect(screen.getByText('Editor Ready')).toBeInTheDocument();
    });
});
