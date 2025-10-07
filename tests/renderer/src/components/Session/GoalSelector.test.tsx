// tests/renderer/src/components/Session/GoalSelector.test.tsx
// Purpose: Tests for GoalSelector component

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { GoalSelector } from '@renderer/components/Session/GoalSelector';

describe('GoalSelector Component', () => {
    const defaultProps = {
        goalType: 'word' as const,
        onGoalTypeChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render both goal type options', () => {
        render(<GoalSelector {...defaultProps} />);

        expect(screen.getByText('Word Count Goal')).toBeInTheDocument();
        expect(screen.getByText('Time Goal')).toBeInTheDocument();
    });

    it('should show word count goal as selected by default', () => {
        render(<GoalSelector {...defaultProps} />);

        const wordButton = screen.getByText('Word Count Goal').closest('button');
        const timeButton = screen.getByText('Time Goal').closest('button');

        expect(wordButton).toHaveClass('bg-blue-600', 'text-white');
        expect(timeButton).toHaveClass('bg-gray-200', 'text-gray-700');
    });

    it('should show time goal as selected when goalType is time', () => {
        render(<GoalSelector {...defaultProps} goalType="time" />);

        const wordButton = screen.getByText('Word Count Goal').closest('button');
        const timeButton = screen.getByText('Time Goal').closest('button');

        expect(wordButton).toHaveClass('bg-gray-200', 'text-gray-700');
        expect(timeButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should call onGoalTypeChange when word count goal is clicked', () => {
        const onGoalTypeChange = vi.fn();
        render(<GoalSelector {...defaultProps} onGoalTypeChange={onGoalTypeChange} />);

        const wordButton = screen.getByText('Word Count Goal').closest('button');
        fireEvent.click(wordButton!);

        expect(onGoalTypeChange).toHaveBeenCalledWith('word');
    });

    it('should call onGoalTypeChange when time goal is clicked', () => {
        const onGoalTypeChange = vi.fn();
        render(<GoalSelector {...defaultProps} onGoalTypeChange={onGoalTypeChange} />);

        const timeButton = screen.getByText('Time Goal').closest('button');
        fireEvent.click(timeButton!);

        expect(onGoalTypeChange).toHaveBeenCalledWith('time');
    });

    it('should display document icon for word count goal', () => {
        render(<GoalSelector {...defaultProps} />);

        // Check for document icon (using a test id or aria-label)
        const wordButton = screen.getByText('Word Count Goal').closest('button');
        expect(wordButton).toHaveAttribute('data-testid', 'word-goal-button');
    });

    it('should display clock icon for time goal', () => {
        render(<GoalSelector {...defaultProps} />);

        // Check for clock icon (using a test id or aria-label)
        const timeButton = screen.getByText('Time Goal').closest('button');
        expect(timeButton).toHaveAttribute('data-testid', 'time-goal-button');
    });

    it('should be accessible with keyboard navigation', () => {
        render(<GoalSelector {...defaultProps} />);

        const wordButton = screen.getByText('Word Count Goal').closest('button');
        const timeButton = screen.getByText('Time Goal').closest('button');

        expect(wordButton).toHaveAttribute('tabIndex', '0');
        expect(timeButton).toHaveAttribute('tabIndex', '0');
    });

    it('should handle keyboard events for goal type selection', () => {
        const onGoalTypeChange = vi.fn();
        render(<GoalSelector {...defaultProps} onGoalTypeChange={onGoalTypeChange} />);

        const timeButton = screen.getByText('Time Goal').closest('button');

        // Simulate Enter key press
        fireEvent.keyDown(timeButton!, { key: 'Enter', code: 'Enter' });
        expect(onGoalTypeChange).toHaveBeenCalledWith('time');

        // Simulate Space key press
        fireEvent.keyDown(timeButton!, { key: ' ', code: 'Space' });
        expect(onGoalTypeChange).toHaveBeenCalledTimes(2);
    });

    it('should have proper ARIA attributes for accessibility', () => {
        render(<GoalSelector {...defaultProps} />);

        const container = screen.getByRole('group', { name: /choose your goal type/i });
        expect(container).toBeInTheDocument();

        const wordButton = screen.getByRole('button', { name: /word count goal/i });
        const timeButton = screen.getByRole('button', { name: /time goal/i });

        expect(wordButton).toHaveAttribute('aria-pressed', 'true');
        expect(timeButton).toHaveAttribute('aria-pressed', 'false');
    });
});
