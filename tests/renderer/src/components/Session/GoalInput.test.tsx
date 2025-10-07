// tests/renderer/src/components/Session/GoalInput.test.tsx
// Purpose: Tests for GoalInput component

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { GoalInput } from '@renderer/components/Session/GoalInput';

describe('GoalInput Component', () => {
    const defaultProps = {
        goalType: 'word' as const,
        value: 500,
        onChange: vi.fn(),
        isValid: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render input field with correct label for word count', () => {
        render(<GoalInput {...defaultProps} />);

        expect(screen.getByLabelText('Target Word Count')).toBeInTheDocument();
        expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });

    it('should render input field with correct label for time duration', () => {
        render(<GoalInput {...defaultProps} goalType="time" />);

        expect(screen.getByLabelText('Target Time Duration')).toBeInTheDocument();
        expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });

    it('should show word count recommendation text', () => {
        render(<GoalInput {...defaultProps} />);

        expect(screen.getByText(/Recommended: 250-500 words for focused sessions/)).toBeInTheDocument();
    });

    it('should show time duration recommendation text', () => {
        render(<GoalInput {...defaultProps} goalType="time" />);

        expect(screen.getByText(/Recommended: 15-30 min for focused sessions/)).toBeInTheDocument();
    });

    it('should call onChange when input value changes', () => {
        const onChange = vi.fn();
        render(<GoalInput {...defaultProps} onChange={onChange} />);

        const input = screen.getByLabelText('Target Word Count');
        fireEvent.change(input, { target: { value: '750' } });

        expect(onChange).toHaveBeenCalledWith(750);
    });

    it('should sanitize input to remove non-numeric characters', () => {
        const onChange = vi.fn();
        render(<GoalInput {...defaultProps} onChange={onChange} />);

        const input = screen.getByLabelText('Target Word Count');
        fireEvent.change(input, { target: { value: '500 words' } });

        expect(onChange).toHaveBeenCalledWith(500);
    });

    it('should handle decimal input for time duration', () => {
        const onChange = vi.fn();
        render(<GoalInput {...defaultProps} goalType="time" onChange={onChange} />);

        const input = screen.getByLabelText('Target Time Duration');
        fireEvent.change(input, { target: { value: '30.5' } });

        expect(onChange).toHaveBeenCalledWith(30.5);
    });

    it('should show error state when input is invalid', () => {
        render(<GoalInput {...defaultProps} isValid={false} />);

        const input = screen.getByLabelText('Target Word Count');
        expect(input).toHaveClass('border-red-500');
    });

    it('should show valid state when input is valid', () => {
        render(<GoalInput {...defaultProps} isValid={true} />);

        const input = screen.getByLabelText('Target Word Count');
        expect(input).toHaveClass('border-gray-300');
    });

    it('should display placeholder text based on goal type', () => {
        render(<GoalInput {...defaultProps} value={0} />);

        const input = screen.getByLabelText('Target Word Count');
        expect(input).toHaveAttribute('placeholder', '500 words');
    });

    it('should display time placeholder for time goal type', () => {
        render(<GoalInput {...defaultProps} goalType="time" value={0} />);

        const input = screen.getByLabelText('Target Time Duration');
        expect(input).toHaveAttribute('placeholder', '30 min');
    });

    it('should handle empty input gracefully', () => {
        const onChange = vi.fn();
        render(<GoalInput {...defaultProps} onChange={onChange} />);

        const input = screen.getByLabelText('Target Word Count');
        fireEvent.change(input, { target: { value: '' } });

        expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should handle negative input', () => {
        const onChange = vi.fn();
        render(<GoalInput {...defaultProps} onChange={onChange} />);

        const input = screen.getByLabelText('Target Word Count');
        fireEvent.change(input, { target: { value: '-100' } });

        expect(onChange).toHaveBeenCalledWith(-100);
    });

    it('should be accessible with proper ARIA attributes', () => {
        render(<GoalInput {...defaultProps} />);

        const input = screen.getByLabelText('Target Word Count');
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveAttribute('inputMode', 'numeric');
    });

    it('should handle keyboard events', () => {
        const onChange = vi.fn();
        render(<GoalInput {...defaultProps} onChange={onChange} />);

        const input = screen.getByLabelText('Target Word Count');

        // Test Enter key
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        // Should not call onChange for Enter key

        // Test number input
        fireEvent.change(input, { target: { value: '1000' } });
        expect(onChange).toHaveBeenCalledWith(1000);
    });
});
