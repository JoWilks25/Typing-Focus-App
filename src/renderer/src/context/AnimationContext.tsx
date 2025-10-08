// src/renderer/src/context/AnimationContext.tsx
// Purpose: Animation state management based on progress thresholds

import { createContext, useCallback, useMemo, useState } from 'react';

export type AnimationState = 'idle' | 'low' | 'medium' | 'high' | 'complete';

export interface AnimationContextValue {
    animationState: AnimationState;
    hasReached33: boolean;
    hasReached67: boolean;
    hasReached100: boolean;
    setProgressThresholds: (thresholds: { 33: boolean; 67: boolean; 100: boolean }) => void;
    onThresholdCrossed: (threshold: number) => void;
}

export const AnimationContext = createContext<AnimationContextValue | undefined>(undefined);

export interface AnimationProviderProps {
    children: React.ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
    const [hasReached33, setHasReached33] = useState(false);
    const [hasReached67, setHasReached67] = useState(false);
    const [hasReached100, setHasReached100] = useState(false);

    // Calculate animation state based on thresholds
    const animationState = useMemo<AnimationState>(() => {
        if (hasReached100) return 'complete';
        if (hasReached67) return 'high';
        if (hasReached33) return 'medium';
        return 'low';
    }, [hasReached33, hasReached67, hasReached100]);

    // Handle threshold crossings
    const onThresholdCrossed = useCallback((threshold: number) => {
        switch (threshold) {
            case 33:
                console.log('33')
                setHasReached33(true);
                break;
            case 67:
                console.log('67')
                setHasReached67(true);
                break;
            case 100:
                console.log('100')
                setHasReached100(true);
                break;
        }
    }, []);

    // Set progress thresholds (for initialization or external updates)
    const setProgressThresholds = useCallback((thresholds: { 33: boolean; 67: boolean; 100: boolean }) => {
        setHasReached33(thresholds[33]);
        setHasReached67(thresholds[67]);
        setHasReached100(thresholds[100]);
    }, []);

    const value = useMemo<AnimationContextValue>(
        () => ({
            animationState,
            hasReached33,
            hasReached67,
            hasReached100,
            setProgressThresholds,
            onThresholdCrossed
        }),
        [animationState, hasReached33, hasReached67, hasReached100, setProgressThresholds, onThresholdCrossed]
    );

    return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}
