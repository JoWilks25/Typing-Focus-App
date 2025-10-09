import React, { useEffect, useRef, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { TreeAnimationModalContent, ANIMATION_CONFIG } from '../../types/animation';
import styles from './TreeAnimationModal.module.css';

// Import animation data
// eslint-disable-next-line @typescript-eslint/no-require-imports
const forestGrowingAnimationData = require('../../assets/animations/forest-growing.json') as unknown;

let forestGrowingAnimation: unknown;
try {
    forestGrowingAnimation = forestGrowingAnimationData;
} catch {
    // Fallback for testing or if file doesn't exist
    forestGrowingAnimation = {
        v: "5.7.4",
        fr: 30,
        ip: 0,
        op: 48,
        w: 400,
        h: 400,
        nm: "Forest Growing",
        ddd: 0,
        assets: [],
        layers: []
    };
}

interface TreeAnimationModalProps {
    data?: TreeAnimationModalContent;
}

export const TreeAnimationModal: React.FC<TreeAnimationModalProps> = ({ data }) => {
    const lottieRef = useRef<LottieRefCurrentProps | null>(null);
    const [currentProgress, setCurrentProgress] = useState(0);
    const [isWilting, setIsWilting] = useState(false);

    // Listen for IPC progress updates
    useEffect(() => {
        const handleProgressUpdate = (...args: unknown[]) => {
            const progress = args[1] as number;
            const wilting = (args[2] as boolean) || false;
            setCurrentProgress(progress);
            setIsWilting(wilting);
        };

        // Listen for tree animation progress updates
        if (window.api?.on) {
            window.api.on('tree-animation:progress', handleProgressUpdate);
        }

        return () => {
            if (window.api?.removeListener) {
                window.api.removeListener('tree-animation:progress', handleProgressUpdate);
            }
        };
    }, []);

    // Update animation frame when progress changes
    useEffect(() => {
        if (lottieRef.current) {
            const totalFrames = ANIMATION_CONFIG.TOTAL_FRAMES;
            let targetFrame: number;

            if (isWilting) {
                // For wilting, play reverse animation or use a specific wilting frame
                targetFrame = Math.floor((currentProgress / 100) * totalFrames);
                // Reverse the frame for wilting effect
                targetFrame = totalFrames - targetFrame;
            } else {
                // Normal growth animation
                targetFrame = Math.floor((currentProgress / 100) * totalFrames);
            }

            // Ensure frame is within bounds
            targetFrame = Math.max(0, Math.min(targetFrame, totalFrames - 1));

            // Seek to the calculated frame
            lottieRef.current.goToAndStop(targetFrame, true);
        }
    }, [currentProgress, isWilting]);

    // Initialize with data prop if provided
    useEffect(() => {
        if (data) {
            setCurrentProgress(data.progress);
            setIsWilting(data.isWilting);
        }
    }, [data]);

    return (
        <div className={styles['tree-animation-container']} data-testid="tree-animation-modal">
            <div className={styles['animation-wrapper']}>
                <Lottie
                    lottieRef={lottieRef}
                    animationData={forestGrowingAnimation}
                    loop={false}
                    autoplay={false}
                    style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '400px',
                        maxHeight: '400px'
                    }}
                />
            </div>

            {/* Progress indicator */}
            <div className={styles['progress-indicator']}>
                <div className={styles['progress-bar']}>
                    <div
                        className={styles['progress-fill']}
                        style={{ width: `${currentProgress}%` }}
                    />
                </div>
                <div className={styles['progress-text']}>
                    {isWilting ? '🌱 Wilting...' : `🌳 ${Math.round(currentProgress)}%`}
                </div>
            </div>
        </div>
    );
};
