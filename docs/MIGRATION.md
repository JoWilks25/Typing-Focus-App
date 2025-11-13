# Rewrite Migration Guide

**Version:** 2.0  
**Status:** Implementation Guide  
**Last Updated:** December 2024

## Overview

This guide provides a step-by-step plan for migrating from the current architecture (React Context + monolithic IPC) to the new architecture (Zustand + organized IPC). The migration is planned over 8 weeks with incremental changes.

## Migration Strategy

### Principles

1. **Incremental Migration**: Change one area at a time
2. **Parallel Implementation**: New code runs alongside old code
3. **Thorough Testing**: Test after each phase
4. **Rollback Safety**: Keep old code until new code is proven

### Timeline

- **Phase 1: Foundation** (Week 1-2) - Set up new structure
- **Phase 2: Core Migration** (Week 3-4) - Migrate core features
- **Phase 3: Testing & Polish** (Week 5-6) - Test and optimize
- **Phase 4: Cleanup** (Week 7-8) - Remove old code

## Phase 1: Foundation (Week 1-2)

### Week 1: Setup and Structure

#### Day 1-2: Install Dependencies

```bash
npm install zustand
npm install --save-dev @redux-devtools/extension
```

#### Day 3-4: Create Store Structure

1. Create `src/renderer/src/stores/` directory
2. Create base store files:

```typescript
// stores/appStore.ts (skeleton)
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAppStore = create()(
  devtools(
    persist(
      (set) => ({
        // TODO: Implement
      }),
      { name: 'app-storage' }
    ),
    { name: 'AppStore' }
  )
);
```

3. Create similar skeletons for:
   - `sessionStore.ts`
   - `editorStore.ts`
   - `modalStore.ts`

#### Day 5: Create IPC Structure

1. Create `src/main/ipc/` directory
2. Create type definitions:

```typescript
// ipc/types.ts
export interface IPCRequest<T = unknown> {
  type: string;
  payload: T;
}

export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

3. Create channel constants:

```typescript
// ipc/channels.ts
export const IPC_CHANNELS = {
  SESSION_START: 'session:start',
  // ... other channels
} as const;
```

4. Create handler directory structure:
   - `handlers/sessionHandlers.ts`
   - `handlers/fileHandlers.ts`
   - `handlers/dialogHandlers.ts`
   - `handlers/modalHandlers.ts`

### Week 2: Implement Foundation

#### Day 1-2: Implement App Store

```typescript
// stores/appStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  currentView: 'dashboard' | 'editor' | 'session-summary';
  theme: 'light' | 'dark' | 'system';
  setView: (view: AppState['currentView']) => void;
  setTheme: (theme: AppState['theme']) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        currentView: 'editor',
        theme: 'dark',
        setView: (view) => set({ currentView: view }, false, 'setView'),
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
      }),
      { name: 'app-storage' }
    ),
    { name: 'AppStore' }
  )
);
```

#### Day 3-4: Implement IPC Types and Handlers

1. Complete `ipc/types.ts` with all request/response types
2. Implement one handler file (e.g., `sessionHandlers.ts`) as proof of concept
3. Update preload script to use new pattern

#### Day 5: Testing Setup

1. Set up test utilities for stores
2. Set up test utilities for IPC handlers
3. Write initial tests for app store

**Checklist:**
- [ ] Dependencies installed
- [ ] Store structure created
- [ ] IPC structure created
- [ ] App store implemented
- [ ] One handler implemented
- [ ] Tests written

## Phase 2: Core Migration (Week 3-4)

### Week 3: Session Management

#### Day 1-2: Implement Session Store

```typescript
// stores/sessionStore.ts
// Full implementation (see STATE_MANAGEMENT.md)
```

1. Implement all session store methods
2. Test session operations
3. Verify persistence

#### Day 3-4: Migrate Session Components

1. Update components to use session store:

```typescript
// Before
const { activeSession, startSession } = useSession();

// After
const activeSession = useSessionStore(state => state.activeSession);
const startSession = useSessionStore(state => state.startSession);
```

2. Update components:
   - `Editor.tsx`
   - `SessionSummary.tsx`
   - `SessionSetupModal.tsx`

#### Day 5: Implement Session IPC Handlers

1. Complete `handlers/sessionHandlers.ts`
2. Update preload script
3. Test IPC communication

**Checklist:**
- [ ] Session store implemented
- [ ] Session components migrated
- [ ] Session IPC handlers implemented
- [ ] All session operations tested

### Week 4: Editor and IPC

#### Day 1-2: Implement Editor Store

```typescript
// stores/editorStore.ts
// Full implementation (see STATE_MANAGEMENT.md)
```

1. Implement editor store
2. Test editor state updates

#### Day 3-4: Refactor Editor Component

1. Split `Editor.tsx` into smaller components:
   - `Editor.tsx` (container)
   - `EditorContent.tsx`
   - `EditorToolbar.tsx`
   - `EditorEmptyState.tsx`

2. Create custom hooks:
   - `hooks/useEditorContent.ts`
   - `hooks/useEditorProgress.ts`
   - `hooks/useEditorModals.ts`

3. Update to use stores

#### Day 5: Complete IPC Handlers

1. Implement remaining handlers:
   - `fileHandlers.ts`
   - `dialogHandlers.ts`
   - `modalHandlers.ts`

2. Update preload script
3. Test all IPC communication

**Checklist:**
- [ ] Editor store implemented
- [ ] Editor component refactored
- [ ] All IPC handlers implemented
- [ ] All IPC communication tested

## Phase 3: Testing & Polish (Week 5-6)

### Week 5: Testing

#### Day 1-2: Store Tests

1. Write unit tests for all stores
2. Test persistence
3. Test computed values

#### Day 3-4: IPC Tests

1. Write integration tests for IPC handlers
2. Test error handling
3. Test type safety

#### Day 5: Component Tests

1. Update component tests to use stores
2. Test component interactions
3. Test edge cases

**Checklist:**
- [ ] All stores tested
- [ ] All IPC handlers tested
- [ ] All components tested
- [ ] Edge cases covered

### Week 6: Performance & Polish

#### Day 1-2: Performance Optimization

1. Profile store updates
2. Optimize re-renders
3. Check memory usage

#### Day 3-4: Documentation

1. Update component documentation
2. Update API documentation
3. Update architecture documentation

#### Day 5: Final Testing

1. Full feature testing
2. User acceptance testing
3. Bug fixes

**Checklist:**
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] All features tested
- [ ] Bugs fixed

## Phase 4: Cleanup (Week 7-8)

### Week 7: Remove Old Code

#### Day 1-2: Remove Context Code

1. Remove `src/renderer/src/context/` directory
2. Remove context-related hooks
3. Update imports

#### Day 3-4: Remove Old IPC

1. Remove `src/main/ipcHandlers.ts`
2. Update main process entry
3. Clean up unused imports

#### Day 5: Update App Structure

1. Remove AppProvider from `App.tsx`
2. Update component structure
3. Clean up unused code

**Checklist:**
- [ ] Context code removed
- [ ] Old IPC handlers removed
- [ ] App structure updated
- [ ] No unused code

### Week 8: Final Testing & Deploy

#### Day 1-2: Comprehensive Testing

1. Full feature testing
2. Edge case testing
3. Performance testing
4. User acceptance testing

#### Day 3-4: Bug Fixes

1. Fix any remaining bugs
2. Address performance issues
3. Update documentation

#### Day 5: Deploy

1. Final code review
2. Merge to main branch
3. Deploy

**Checklist:**
- [ ] All tests passing
- [ ] All bugs fixed
- [ ] Documentation complete
- [ ] Ready to deploy

## Migration Checklist

### Phase 1: Foundation
- [ ] Install Zustand and DevTools
- [ ] Create store structure
- [ ] Create IPC structure
- [ ] Implement app store
- [ ] Implement one handler as proof of concept
- [ ] Set up testing infrastructure

### Phase 2: Core Migration
- [ ] Implement session store
- [ ] Migrate session components
- [ ] Implement session IPC handlers
- [ ] Implement editor store
- [ ] Refactor editor component
- [ ] Implement all IPC handlers

### Phase 3: Testing & Polish
- [ ] Write store tests
- [ ] Write IPC tests
- [ ] Write component tests
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Final testing

### Phase 4: Cleanup
- [ ] Remove context code
- [ ] Remove old IPC handlers
- [ ] Update app structure
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Deploy

## Rollback Procedures

### If Issues Arise

1. **Keep Old Code**: Don't delete old code until new code is proven
2. **Feature Flags**: Use feature flags to switch between old and new
3. **Incremental Rollback**: Roll back one feature at a time if needed
4. **Testing**: Test thoroughly before removing old code

### Rollback Steps

1. Revert to previous commit
2. Restore old context code if needed
3. Restore old IPC handlers if needed
4. Fix issues
5. Re-attempt migration

## Common Issues & Solutions

### Issue: Store Not Updating

**Solution:**
- Check DevTools for state changes
- Verify selector is correct
- Check for stale closures

### Issue: IPC Errors

**Solution:**
- Verify request/response types
- Check error handling
- Verify channel names

### Issue: Performance Issues

**Solution:**
- Use selective subscriptions
- Check for unnecessary re-renders
- Profile with DevTools

## Testing Strategy

### Unit Tests

```typescript
// stores/sessionStore.test.ts
import { useSessionStore } from './sessionStore';

describe('SessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({
      sessions: [],
      activeSessionId: null,
    });
  });

  it('should add a session', () => {
    const session = { id: '1', name: 'Test' };
    useSessionStore.getState().addSession(session);
    expect(useSessionStore.getState().sessions).toContain(session);
  });
});
```

### Integration Tests

```typescript
// ipc/handlers/sessionHandlers.test.ts
import { registerSessionHandlers } from './sessionHandlers';

describe('Session Handlers', () => {
  it('should start a session', async () => {
    const request = {
      type: 'session:start',
      payload: { filePath: '/test.txt', goalType: 'word', goalValue: 500 },
    };
    const response = await ipcMain.handle('session:start', request);
    expect(response.success).toBe(true);
  });
});
```

## Next Steps

1. **Review Architecture** - [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Review State Management** - [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
3. **Review IPC Structure** - [IPC.md](./IPC.md)
4. **Start Phase 1** - Begin foundation setup

---

**Questions or Issues?**

If you encounter any issues during migration:
1. Check this guide first
2. Review the architecture documentation
3. Test incrementally
4. Ask for help if needed

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Ready for Implementation

