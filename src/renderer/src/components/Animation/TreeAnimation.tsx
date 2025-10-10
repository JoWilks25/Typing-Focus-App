// src/renderer/src/components/Animation/TreeAnimation.tsx
// Purpose: Tree animation component with continuous growth based on progress

import { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import styles from './TreeAnimation.module.css';

// Animation data will be loaded dynamically in the component

interface TreeAnimationProps {
    progress: number; // 0-100
    isActive: boolean;
    playFullAnimation?: boolean; // New prop for full animation playback
    showWiltedTree?: boolean; // New prop for showing wilted tree emoji
}

export const TreeAnimation = ({ progress, isActive, playFullAnimation = false, showWiltedTree = false }: TreeAnimationProps) => {
    console.debug('TreeAnimation: Rendering with progress:', progress, 'isActive:', isActive, 'playFullAnimation:', playFullAnimation, 'showWiltedTree:', showWiltedTree);

    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [currentAnimation, setCurrentAnimation] = useState<unknown>(null);
    const [animationsLoaded, setAnimationsLoaded] = useState(false);
    const [hasPlayedFullAnimation, setHasPlayedFullAnimation] = useState(false);

    // Load animations when component mounts
    useEffect(() => {
        const loadAnimations = async () => {
            try {
                const growthModule = await import('../../../assets/animations/tree-growth.json');
                setCurrentAnimation(growthModule.default);
                setAnimationsLoaded(true);
                console.log('TreeAnimation: Animations loaded successfully');
            } catch (error) {
                console.error('TreeAnimation: Failed to load animations:', error);
            }
        };

        loadAnimations();
    }, []);

    // Handle full animation playback for completed sessions
    useEffect(() => {
        if (lottieRef.current && playFullAnimation && !hasPlayedFullAnimation && animationsLoaded) {
            console.log('TreeAnimation: Playing full animation for completed session');
            lottieRef.current.play();
            setHasPlayedFullAnimation(true);
        }
    }, [playFullAnimation, hasPlayedFullAnimation, animationsLoaded]);

    // Calculate frame based on progress with custom scaling (only for non-animation modes)
    const totalFrames = 48; // Actual animation frame count from Lottie file
    const middleFrame = 24; // Frame to reach at 67%
    const middleProgress = 85; // Progress percentage for middle frame

    let targetFrame;
    if (!playFullAnimation && !showWiltedTree) {
        if (progress <= middleProgress) {
            // 0-67% maps to frames 0-24 (slower growth in early stages)
            targetFrame = Math.floor((progress / middleProgress) * middleFrame);
        } else {
            // 67-100% maps to frames 24-47 (faster growth in later stages)
            const remainingProgress = progress - middleProgress;
            const remainingFrames = totalFrames - 1 - middleFrame;
            targetFrame = middleFrame + Math.floor((remainingProgress / (100 - middleProgress)) * remainingFrames);
        }
        targetFrame = Math.min(targetFrame, totalFrames - 1);
    }

    // Update animation frame when progress changes (only for frame-based mode)
    useEffect(() => {
        if (lottieRef.current && isActive && !playFullAnimation && !showWiltedTree) {
            lottieRef.current.goToAndStop(targetFrame, true);
        }
    }, [progress, isActive, targetFrame, playFullAnimation, showWiltedTree]);

    return (
        <div className={styles['tree-container']}>
            {!animationsLoaded ? (
                <div className={styles['tree-animation']}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#9ca3af',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        Loading tree animation...
                    </div>
                </div>
            ) : showWiltedTree ? (
                <div className={styles['tree-animation']}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        fontSize: '200px', // Large emoji size
                        textAlign: 'center'
                    }}>
                        🍂
                    </div>
                </div>
            ) : isActive ? (
                <>
                    <div className={styles['tree-animation']}>
                        <Lottie
                            lottieRef={lottieRef}
                            animationData={currentAnimation}
                            loop={false} // Never loop - we control playback manually
                            autoplay={playFullAnimation} // Autoplay only for full animation mode
                            style={{
                                width: '300px',
                                height: '300px',
                                minWidth: '250px',
                                minHeight: '250px'
                            }}
                        />
                    </div>
                    {!playFullAnimation && (
                        <div className={styles['progress-indicator']}>
                            {Math.round(progress)}% Complete
                        </div>
                    )}
                </>
            ) : (
                <div className={styles['tree-animation']}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#9ca3af',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        Tree Animation<br />
                        (Start a session to see growth)
                    </div>
                </div>
            )}
        </div>
    );
};
