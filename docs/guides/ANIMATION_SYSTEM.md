# Animation System

Tree growth animations and visual feedback system for Draft Tree.

## Overview

The animation system provides visual feedback for writing progress through a tree that grows as users work toward their goals. The tree represents focus and completion, with different states for progress levels and penalties for incomplete sessions.

## Animation States

### Growth States

| State | Progress Range | Visual Description | Animation Behavior |
|-------|---------------|-------------------|-------------------|
| **Seedling** | 0-33% | Small sprout emerging from ground | Gentle swaying, subtle growth |
| **Small Tree** | 34-66% | Young tree with visible trunk and initial branches | More pronounced movement, branch growth |
| **Mature Tree** | 67-100% | Full healthy tree with complete foliage | Rich, full animation with detailed movement |

### Penalty States

| State | Trigger | Visual Description | Animation Behavior |
|-------|---------|-------------------|-------------------|
| **Wilting** | Session ended before goal | Leaves drooping, branches sagging | Gradual deterioration over 2-3 seconds |
| **Death** | Session abandoned | Bare branches or fallen tree | Complete collapse, static final state |

## Technical Implementation

### Animation Format
- **Format**: Lottie JSON animations
- **Renderer**: SVG rendering via `lottie-react`
- **Assets**: Bundled with app (no online fetching)
- **Performance**: Non-blocking, runs on separate rendering thread

### Asset Specifications
- **File Size**: < 500KB per animation
- **Dimensions**: 512x512px (1:1 aspect ratio)
- **Frame Rate**: 30fps minimum
- **Color Space**: RGB
- **Compression**: Optimized JSON (removed unnecessary keyframes)

### Animation Files
```
src/renderer/assets/animations/
├── seedling.json      # 0-33% progress
├── small-tree.json    # 34-66% progress
├── mature-tree.json   # 67-100% progress
└── wilt-death.json    # Penalty animation
```

## Component Architecture

### TreeAnimation Component
```typescript
interface TreeAnimationProps {
  progress: number;           // 0-100
  isActive: boolean;         // Session active state
  onAnimationComplete?: () => void;
}

export const TreeAnimation: React.FC<TreeAnimationProps> = ({
  progress,
  isActive,
  onAnimationComplete
}) => {
  const [currentState, setCurrentState] = useState<TreeState>('seedling');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animation logic here
};
```

### Animation Controller
```typescript
interface AnimationController {
  updateProgress(progress: number): void;
  triggerWiltAnimation(): void;
  triggerCompletionAnimation(): void;
  reset(): void;
}

export const useAnimationController = (): AnimationController => {
  // Controller logic here
};
```

## State Management

### Animation State (Local Component State)

**Note**: Draft Tree uses local component state for animations rather than a separate AnimationContext.

```typescript
// TreeAnimation component manages its own state
interface TreeAnimationState {
  currentStage: number;      // 0-7 for 8 growth stages
  isTransitioning: boolean;
  progress: number;          // 0-100
}

// Animation controlled by props from parent
interface TreeAnimationProps {
  progress: number;           // 0-100 from session progress
  isActive: boolean;         // Session active state
  onAnimationComplete?: () => void;
}
```

### Progress Calculation
```typescript
// Calculate animation stage based on progress percentage
const calculateAnimationStage = (progress: number): number => {
  // 8 stages (0-7) corresponding to tree growth
  // Stage boundaries: 0%, 14%, 28%, 42%, 56%, 70%, 84%, 100%
  if (progress >= 100) return 7;
  if (progress >= 84) return 6;
  if (progress >= 70) return 5;
  if (progress >= 56) return 4;
  if (progress >= 42) return 3;
  if (progress >= 28) return 2;
  if (progress >= 14) return 1;
  return 0;
};

// Update tree animation based on session progress
useEffect(() => {
  const newStage = calculateAnimationStage(progress);
  if (newStage !== currentStage) {
    setCurrentStage(newStage);
    setIsTransitioning(true);
  }
}, [progress]);
```

## Animation Transitions

### Smooth State Changes
- **Transition Duration**: 0.5-1 second
- **Easing**: Smooth interpolation between states
- **Visual Continuity**: Maintains tree position and scale
- **Performance**: 60fps during transitions

### Wilt Animation Sequence
```typescript
const triggerWiltAnimation = () => {
  setIsTransitioning(true);
  
  // Play wilt-death animation (non-looping)
  playAnimation('wilt-death', {
    loop: false,
    duration: 2500, // 2.5 seconds
    onComplete: () => {
      setIsTransitioning(false);
      setCurrentState('dead');
      onAnimationComplete?.();
    }
  });
};
```

## Integration with Session System

### Progress Updates
```typescript
// TreeAnimation component receives progress from parent (Editor component)
// Editor calculates progress from session state
const TreeAnimation = ({ progress, isActive }: TreeAnimationProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  
  useEffect(() => {
    const newStage = calculateAnimationStage(progress);
    if (newStage !== currentStage && isActive) {
      setCurrentStage(newStage);
    }
  }, [progress, currentStage, isActive]);
  
  return (
    <div className={styles.container}>
      <Lottie
        animationData={treeAnimations[currentStage]}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};
```

### Session Progress Integration
```typescript
// In Editor component
const progress = activeSession?.progressPercentage || 0;

return (
  <div>
    <TreeAnimation
      progress={progress}
      isActive={activeSession?.status === 'active'}
    />
    {/* ... editor content */}
  </div>
);
```

### Animation Assets
```typescript
// Tree growth animations (Lottie JSON files)
const treeAnimations = [
  treeGrow0,  // Stage 0: 0-14%
  treeGrow1,  // Stage 1: 14-28%
  treeGrow2,  // Stage 2: 28-42%
  treeGrow3,  // Stage 3: 42-56%
  treeGrow4,  // Stage 4: 56-70%
  treeGrow5,  // Stage 5: 70-84%
  treeGrow6,  // Stage 6: 84-100%
  treeGrow7,  // Stage 7: 100% (complete)
];
```

## Performance Optimization

### Animation Loading
- **Pre-loading**: All animations loaded on app start
- **Memory Management**: Efficient Lottie instance management
- **Cleanup**: Proper disposal of animation instances

### Rendering Optimization
```typescript
// Use React.memo for expensive animation components
export const TreeAnimation = React.memo<TreeAnimationProps>(({
  progress,
  isActive,
  onAnimationComplete
}) => {
  // Component implementation
});

// Optimize re-renders
const animationState = useMemo(() => ({
  currentState: calculateTreeState(progress),
  isTransitioning: progress !== previousProgress
}), [progress, previousProgress]);
```

### Frame Rate Management
- **Target FPS**: 30fps minimum, 60fps preferred
- **Adaptive Quality**: Reduce complexity on slower devices
- **Background Throttling**: Pause animations when window not focused

## Accessibility

### Reduced Motion Support
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Use static images instead of animations
  return <StaticTreeImage state={currentState} />;
}
```

### Visual Alternatives
- **Static Images**: Fallback for users who prefer no motion
- **Color Changes**: Alternative visual feedback
- **Text Indicators**: Progress percentages and status text

## Testing

### Animation Testing
```typescript
describe('TreeAnimation', () => {
  it('should transition to small tree at 34% progress', () => {
    render(<TreeAnimation progress={34} isActive={true} />);
    expect(screen.getByTestId('tree-animation')).toHaveAttribute('data-state', 'small');
  });

  it('should trigger wilt animation on incomplete session', () => {
    const onComplete = jest.fn();
    render(<TreeAnimation progress={50} isActive={false} onAnimationComplete={onComplete} />);
    // Test wilt animation logic
  });
});
```

### Performance Testing
- **Frame Rate**: Monitor animation performance
- **Memory Usage**: Track animation memory consumption
- **Load Time**: Measure animation loading performance

## Future Enhancements

### Planned Features
- **Sound Effects**: Audio feedback for animations
- **Custom Trees**: Different tree types and themes
- **Seasonal Themes**: Weather and seasonal variations
- **Particle Effects**: Enhanced visual feedback

### Technical Improvements
- **WebGL Rendering**: Hardware-accelerated animations
- **Animation Compression**: Better asset optimization
- **Dynamic Loading**: Load animations on demand
- **Custom Animations**: User-created animation support

---

For related information, see:
- [Session Lifecycle](./SESSION_LIFECYCLE.md)
- [State Management](../architecture/STATE_MANAGEMENT.md)
- [Project Structure](../architecture/PROJECT_STRUCTURE.md)
