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
    const [stageAnimations, setStageAnimations] = useState<unknown[]>([]);
    const [animationsLoaded, setAnimationsLoaded] = useState(false);
    const [hasPlayedFullAnimation, setHasPlayedFullAnimation] = useState(false);
    const previousStageRef = useRef<number | null>(null); // Track previous stage to detect changes

    // Load all 8 stage animations when component mounts
    useEffect(() => {
        const loadAnimations = async () => {
            try {
                // Load all 8 stage animations
                const animationPromises = Array.from({ length: 8 }, (_, i) =>
                    import(`../../../assets/animations/tree-grow-${i}.json`)
                );

                const animationModules = await Promise.all(animationPromises);
                const animations = animationModules.map(module => module.default);

                setStageAnimations(animations);
                setAnimationsLoaded(true);
                console.log('TreeAnimation: All 8 stage animations loaded successfully');
            } catch (error) {
                console.error('TreeAnimation: Failed to load stage animations:', error);
                // Fallback to old animation if stage animations fail
                try {
                    const growthModule = await import('../../../assets/animations/tree-growth.json');
                    setStageAnimations([growthModule.default]);
                    setAnimationsLoaded(true);
                    console.log('TreeAnimation: Loaded fallback animation');
                } catch (fallbackError) {
                    console.error('TreeAnimation: Failed to load fallback animation:', fallbackError);
                }
            }
        };

        loadAnimations();
    }, []);

    // Calculate current stage based on progress
    // Stages 0-6 divide progress by 7, stage 7 only appears at 100%
    const calculateStage = (progress: number): number => {
        if (progress === 100) {
            return 7; // Final stage only at 100%
        }
        // Stages 0-6: divide progress range into 7 equal parts
        return Math.min(Math.floor(progress / (100 / 7)), 6);
    };

    const currentStage = calculateStage(progress);
    const currentAnimation = stageAnimations[currentStage];

    // Handle stage switching only when stage actually changes (not on every progress update)
    useEffect(() => {
        // Only restart animation if stage actually changed
        if (previousStageRef.current !== null && previousStageRef.current !== currentStage) {
            if (lottieRef.current && isActive && !playFullAnimation && !showWiltedTree && animationsLoaded && currentAnimation) {
                console.log(`TreeAnimation: Switching from stage ${previousStageRef.current} to stage ${currentStage} (progress: ${progress}%)`);
                // Force re-render of animation when stage changes
                lottieRef.current.goToAndPlay(0, true);
            }
        }
        // Update the previous stage reference
        previousStageRef.current = currentStage;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStage, isActive, playFullAnimation, showWiltedTree, animationsLoaded, currentAnimation]); // Intentionally exclude 'progress' - only react to stage changes

    // Handle full animation playback for completed sessions
    useEffect(() => {
        if (lottieRef.current && playFullAnimation && !hasPlayedFullAnimation && animationsLoaded) {
            console.log('TreeAnimation: Playing full animation for completed session');
            lottieRef.current.play();
            setHasPlayedFullAnimation(true);
        }
    }, [playFullAnimation, hasPlayedFullAnimation, animationsLoaded]);

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
                            loop={!playFullAnimation} // Loop for stage animations, no loop for full animation
                            autoplay={true} // Always autoplay for continuous animation
                            style={{
                                width: '300px',  // Increase from 150px
                                height: '300px', // Increase from 150px
                                minWidth: '300px',
                                minHeight: '300px'
                            }}
                        />
                    </div>
                    {!playFullAnimation && (
                        <div className={styles['progress-indicator']}>
                            {Math.round(progress)}% Complete (Stage {currentStage + 1})
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
