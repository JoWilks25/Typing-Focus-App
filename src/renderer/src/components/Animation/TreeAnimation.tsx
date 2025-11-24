import { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { TreeAnimation as TreeAnimationStyled, PopOutButton } from './TreeAnimation.styles';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useEditorStore } from '@renderer/stores/EditorStore';

interface TreeAnimationProps {
  isPoppedOut: boolean;
  onPopOut: () => void;
}

const InactiveMessage = () => (
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
);

const LoadingMessage = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9ca3af',
    fontSize: '14px',
    textAlign: 'center'
  }}>
    Loading animation...
  </div>
);

interface AnimationDisplayProps {
  currentStage: number;
  currentAnimation: unknown;
  lottieRef: React.RefObject<LottieRefCurrentProps>;
}

const AnimationDisplay = ({ currentStage, currentAnimation, lottieRef }: AnimationDisplayProps) => {
  if (!currentAnimation) {
    return <LoadingMessage />;
  }

  return (
    <Lottie
      key={currentStage}
      lottieRef={lottieRef}
      animationData={currentAnimation}
      loop={true}
      autoplay={true}
      style={{
        width: '300px',
        height: '300px',
        minWidth: '300px',
        minHeight: '300px'
      }}
    />
  );
};

export const TreeAnimation = ({ isPoppedOut, onPopOut }: TreeAnimationProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [stageAnimations, setStageAnimations] = useState<unknown[]>([]);
  const [animationsLoaded, setAnimationsLoaded] = useState(false);

  const sessionActive = useSessionStore(state => state.sessionActive);
  const goalType = useSessionStore(state => state.goalType);
  const wordProgress = useEditorStore(state => state.goalProgress);
  const timeProgress = useEditorStore(state => state.timeProgress);
  const previousStageRef = useRef<number | null>(null);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
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

  const calculateStage = (progress: number): number => {
    if (progress >= 100) {
      return 7;
    }
    return Math.min(Math.floor(progress / (100 / 7)), 6);
  };

  const currentStage = calculateStage(goalType === 'time' ? timeProgress : wordProgress);
  const currentAnimation = stageAnimations[currentStage];

  useEffect(() => {
    if (previousStageRef.current !== null && previousStageRef.current !== currentStage) {
      if (lottieRef.current && sessionActive && animationsLoaded && currentAnimation) {
        lottieRef.current.goToAndPlay(0, true);
      }
    }
    previousStageRef.current = currentStage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStage, animationsLoaded, currentAnimation, timeProgress, wordProgress]);

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
      {!sessionActive && <InactiveMessage />}
      {sessionActive && (
        <AnimationDisplay
          currentStage={currentStage}
          currentAnimation={currentAnimation}
          lottieRef={lottieRef}
        />
      )}
    </TreeAnimationStyled>
  );
};