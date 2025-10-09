<!-- d55211e1-1e59-4dd5-b1de-5aebc1ce9ed8 f521b9f9-fb13-4a54-b9b4-5d7f500a04ae -->
# TreeAnimation Floating Modal Component

## Implementation Approach

Create a TreeAnimation component that renders a Lottie animation in an always-on-top, draggable floating modal window using the existing FloatingModalService. The component will use `lottie-react` to render the forest-growing.json animation and communicate progress updates via IPC (following the distraction modal pattern). Progress from the main window will control which frame of the animation is displayed.

## Files to Create

### 1. `/src/renderer/src/types/animation.ts`

Define TypeScript interfaces for tree animation:

- `TreeState` type: `'seedling' | 'small' | 'mature' | 'wilting'`
- `TreeAnimationProps` interface with `progress: number` (0-100)
- `TreeAnimationOptions` interface extending `FloatingModalOptions`

### 2. `/src/renderer/src/components/Animation/TreeAnimation.tsx`

Create TreeAnimation React component:

- Accept `progress` prop (0-100) to determine tree state
- Calculate tree state based on progress ranges from tech spec:
  - 0-33%: 'seedling' (🌱)
  - 34-66%: 'small' (🌳)
  - 67-100%: 'mature' (🌲)
  - Special: 'wilting' state (🥀) for abandoned sessions
- Use `useFloatingModal` hook to create/manage floating window
- Generate HTML content with tree emoji and styling
- Include `data-testid` attributes for testing
- Clean up modal on unmount

### 3. `/src/renderer/src/components/Animation/TreeAnimation.module.css`

CSS Module for tree animation styling:

- `.tree-animation-container` - main wrapper with centering
- `.tree-icon` - emoji display with responsive sizing (use `clamp()` for fluid typography)
- `.tree-state-seedling`, `.tree-state-small`, `.tree-state-mature`, `.tree-state-wilting` - state-specific styles
- `.tree-progress-indicator` - optional progress bar/indicator
- Smooth transitions between states (0.5-1s as per tech spec)
- Responsive sizing using CSS custom properties

### 4. `/tests/renderer/TreeAnimation.test.tsx`

Component tests using Vitest + React Testing Library:

- Test all 4 tree states render correctly based on progress prop
- Test progress ranges (0%, 33%, 50%, 67%, 100%)
- Test floating modal creation with correct options
- Test cleanup on unmount
- Verify `data-testid` attributes are present
- Mock `useFloatingModal` hook

## Files to Modify

### 5. `/src/renderer/src/App.tsx`

Integrate TreeAnimation component:

- Import `TreeAnimation` component
- Add state to track tree animation visibility and progress
- Calculate progress from active session data
- Render TreeAnimation with progress prop when session is active
- Position component in app layout (likely during editor view)

## Key Technical Details

**Progress Calculation Logic:**

```typescript
const calculateTreeState = (progress: number): TreeState => {
  if (progress < 34) return 'seedling';
  if (progress < 67) return 'small';
  return 'mature';
};
```

**Floating Modal Configuration:**

```typescript
{
  width: 250,
  height: 300,
  alwaysOnTop: true,
  resizable: true,
  minimizable: true,
  closable: false, // Keep tree visible during session
  title: 'Progress Tree'
}
```

**Emoji Placeholders:**

- Seedling: 🌱
- Small Tree: 🌳
- Mature Tree: 🌲
- Wilting: 🥀

## Standards Compliance

- **CSS Modules**: Use kebab-case class names, import as `styles from './TreeAnimation.module.css'`
- **TypeScript**: Define all types in `/src/renderer/src/types/animation.ts`
- **Testing**: Place tests in `/tests/renderer/` with `data-testid` attributes
- **Floating Modal**: Use existing `FloatingModalService` infrastructure via `useFloatingModal` hook
- **State Management**: Receive progress as prop (simple, follows acceptance criteria)

## Definition of Done

✅ All 4 tree states visible based on progress prop

✅ Component renders in floating modal with alwaysOnTop + draggable

✅ Component tests cover all states and progress ranges

✅ TypeScript interfaces defined

✅ CSS Module with responsive sizing

✅ Integrated into App.tsx

✅ data-testid attributes present for testing

### To-dos

- [ ] Create animation TypeScript interfaces in /src/renderer/src/types/animation.ts
- [ ] Create TreeAnimation.tsx component with floating modal integration
- [ ] Create TreeAnimation.module.css with responsive emoji styling
- [ ] Create TreeAnimation.test.tsx with state and progress tests
- [ ] Integrate TreeAnimation into App.tsx with session progress