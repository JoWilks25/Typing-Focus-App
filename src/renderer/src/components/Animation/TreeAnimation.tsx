import { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { TreeAnimation as TreeAnimationStyled, PopOutButton } from './TreeAnimation.styles';
import { useSessionStore } from '@renderer/stores/SessionStore';

interface TreeAnimationProps {
  isPoppedOut: boolean;
  onPopOut: () => void;
}

export const TreeAnimation = ({ isPoppedOut, onPopOut }: TreeAnimationProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [stageAnimations, setStageAnimations] = useState<unknown[]>([]);
  const [animationsLoaded, setAnimationsLoaded] = useState(false);

  const sessionActive = useSessionStore(state => state.sessionActive);

  // Load all 8 stage animations when component mounts
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        // Load all 8 stage animations
        const animationPromises = Array.from({ length: 8 }, (_, i) =>
          import(`../../assets/animations/tree-grow-${i}.json`)
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
          const growthModule = await import('../../assets/animations/tree-growth.json');
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

  return (
    <TreeAnimationStyled>
      {!isPoppedOut && (
        <PopOutButton
          onClick={onPopOut}
          title="Pop out animation"
          aria-label="Pop out animation"
        >
          ⤢
        </PopOutButton>
      )}
      {
        !sessionActive ? (
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
        ) : (
          <div> start animation? </div>
        )
      }
    </TreeAnimationStyled>
  );
};