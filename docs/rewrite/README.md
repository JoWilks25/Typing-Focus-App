# Draft Tree - Rewrite Architecture Documentation

**Version:** 2.0 (Post-Refactor)  
**Status:** Implementation Guide  
**Last Updated:** December 2024

## Overview

This documentation guides the rewrite of Draft Tree's architecture to improve maintainability, debuggability, and feature development speed. The rewrite focuses on:

- **State Management**: Migrating from React Context to Zustand
- **IPC Architecture**: Reorganizing IPC handlers with type-safe request/response patterns
- **Component Structure**: Refactoring large components into smaller, focused modules
- **Developer Experience**: Better debugging tools and clearer code organization

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture Overview](./ARCHITECTURE.md) | Complete system architecture with diagrams |
| [State Management](./STATE_MANAGEMENT.md) | Zustand store patterns and implementation |
| [IPC Communication](./IPC.md) | New IPC structure and request/response pattern |
| [Migration Guide](./MIGRATION.md) | Step-by-step migration plan (8 weeks) |

## Rewrite Goals

### Primary Objectives

1. **Improve Debuggability**
   - Redux DevTools integration for state inspection
   - Clear action names and state transitions
   - Better error messages and stack traces

2. **Easier Feature Development**
   - Modular store architecture
   - Organized IPC handlers by domain
   - Reusable component hooks
   - Clear data flow

3. **Better Code Organization**
   - Smaller, focused files
   - Clear separation of concerns
   - Easier to navigate and understand

4. **Maintain Existing Functionality**
   - Keep all existing services
   - Keep all existing utilities
   - Keep all existing components
   - Minimal breaking changes

## Key Architectural Changes

### State Management: Context → Zustand

**Before:**
- Single `AppContext.tsx` (330 lines)
- Mixed app and session state
- Complex dependency arrays
- Hard to debug

**After:**
- Four focused stores (~400 lines total)
- Clear separation of concerns
- Redux DevTools compatible
- Easy to test and debug

### IPC Architecture: Monolithic → Organized

**Before:**
- Single `ipcHandlers.ts` (786 lines)
- 70+ IPC channels in one file
- Hard to understand flow
- Type safety issues

**After:**
- Organized by domain (4 handler files)
- Type-safe request/response pattern
- Clear error handling
- Easy to test

### Component Structure: Large → Modular

**Before:**
- `Editor.tsx` (658 lines)
- Multiple responsibilities
- Hard to test
- Hard to debug

**After:**
- Container component (100 lines)
- Focused hooks (3 files)
- Clear responsibilities
- Easy to test

## Timeline

### Phase 1: Foundation (Week 1-2)
- Set up Zustand stores
- Create new IPC structure
- Write migration utilities

### Phase 2: Core Migration (Week 3-4)
- Migrate session management
- Migrate IPC handlers
- Refactor Editor component

### Phase 3: Testing & Polish (Week 5-6)
- Write tests
- Performance optimization
- Documentation updates

### Phase 4: Cleanup (Week 7-8)
- Remove old code
- Final testing
- Deploy

## Benefits Summary

### Debugging
- ✅ Redux DevTools integration
- ✅ Visual state inspection
- ✅ Time-travel debugging
- ✅ Better error messages

### Development
- ✅ Modular architecture
- ✅ Clear data flow
- ✅ Easy to add features
- ✅ Better code organization

### Code Quality
- ✅ Smaller files
- ✅ Better separation of concerns
- ✅ Easier to maintain
- ✅ Better testability

## Getting Started

1. **Read the Architecture Overview** - [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Understand State Management** - [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
3. **Review IPC Structure** - [IPC.md](./IPC.md)
4. **Follow Migration Guide** - [MIGRATION.md](./MIGRATION.md)

## Current vs. Planned Architecture

### Current Architecture (v1.0)
- React Context for state management
- Monolithic IPC handlers
- Large component files
- See: [../architecture/](../architecture/)

### Planned Architecture (v2.0)
- Zustand for state management
- Organized IPC handlers
- Modular component structure
- See: This documentation

---

**Next Steps:** Start with [ARCHITECTURE.md](./ARCHITECTURE.md) for a complete overview of the new architecture.

