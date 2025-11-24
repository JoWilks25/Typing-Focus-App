import { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import {
  TreeAnimation as TreeAnimationStyled,
  PopOutButton,
  MessageContainer,
  LottieContainer
} from './TreeAnimation.styles';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useEditorStore } from '@renderer/stores/EditorStore';

interface TreeAnimationProps {
  isPoppedOut: boolean;
  onPopOut: () => void;
}

const InactiveMessage = () => (
  <MessageContainer>
    Tree Animation<br />
    (Start a session to see growth)
  </MessageContainer>
);

const LoadingMessage = () => (
  <MessageContainer>
    Loading animation...
  </MessageContainer>
);

interface AnimationDisplayProps {
  currentStage: number;
  currentAnimation: unknown;
  lottieRef: React.RefObject<LottieRefCurrentProps | null>;
}

const AnimationDisplay = ({ currentStage, currentAnimation }: AnimationDisplayProps) => {
  if (!currentAnimation) {
    return <LoadingMessage />;
  }

  return (
    <LottieContainer>
      <Lottie
        key={currentStage}
        animationData={currentAnimation}
        loop={true}
        autoplay={true}
      />
    </LottieContainer>
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
      } catch (error) {
        console.error('TreeAnimation: Failed to load stage animations:', error);
        try {
          const growthModule = await import('../../assets/animations/tree-growth.json');
          setStageAnimations([growthModule.default]);
          setAnimationsLoaded(true);
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
      {sessionActive && animationsLoaded && (
        <AnimationDisplay
          currentStage={currentStage}
          currentAnimation={currentAnimation}
          lottieRef={lottieRef}
        />
      )}
    </TreeAnimationStyled>
  );
};