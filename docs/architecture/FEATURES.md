# App Features & Validation Rules

This document describes the core features and validation rules for the Typing Focus App.

## Writing Sessions

The app supports two types of writing goals:

### 1. Word Count Goals
- **Minimum**: 10 words
- **Maximum**: 10,000 words
- **Recommended**: 250-500 words for focused sessions
- **Default**: 500 words

### 2. Time Duration Goals
- **Minimum**: 5 minutes
- **Maximum**: 480 minutes (8 hours)
- **Recommended**: 15-30 minutes for focused sessions
- **Default**: 30 minutes

## Validation Rules

### Goal Validation
- All goals are validated both in the renderer (for immediate feedback) and in the main process (for data integrity)
- Invalid goals will disable the "Start Writing" button
- Session creation will fail if validation rules are not met

### Input Sanitization
- Non-numeric characters are automatically removed from goal inputs
- Decimal values are supported for time durations
- Negative values are rejected
- Empty inputs default to 0

## Session Management

### Session Creation
- Sessions are created via `window.electronAPI.session.start()`
- Each session gets a unique ID and timestamp
- Session data is persisted to local storage
- Validation occurs in the main process before session creation

### Session Data Structure
```typescript
interface Session {
  id: string;
  title: string;
  goalType: 'word' | 'time';
  goalValue: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  characterCount: number;
}
```

## User Interface

### Session Setup
- Goal type selection (Word Count vs Time Duration)
- Input validation with real-time feedback
- Recommended ranges displayed to users
- Keyboard shortcuts (Enter to submit)

### Error Handling
- Validation errors are shown through UI state (disabled buttons)
- Network/communication errors are logged to console
- Graceful fallbacks for storage errors

## Technical Implementation

### Validation Layers
1. **Renderer Validation** (`src/renderer/src/utils/validation.ts`)
   - Immediate UI feedback
   - Input sanitization
   - Real-time validation

2. **Main Process Validation** (`src/main/utils/validation.ts`)
   - Data integrity enforcement
   - Server-side validation
   - Consistent with renderer rules

### API Flow
1. User enters goal in SessionSetup component
2. Renderer validates input and updates UI
3. Form submission calls `window.electronAPI.session.start()`
4. Main process validates goal again
5. Session is created and persisted if valid
6. User is navigated to editor view

## Testing

All validation rules are thoroughly tested:
- Unit tests for validation functions
- Integration tests for session creation
- Component tests for UI behavior
- Edge case testing for boundary values

See `tests/` directory for complete test coverage.
