# Typing Focus App - Documentation

Welcome to the Typing Focus App documentation. This guide provides comprehensive information for developers, contributors, and users.

## 📚 Documentation Overview

The Typing Focus App is a distraction-free writing application built with Electron, React, and TypeScript. It uses gamified tree animations to encourage focused writing sessions and goal completion.

## 🚀 Quick Start

### For New Developers
1. **[Setup Guide](./getting-started/SETUP.md)** - Get the development environment running
2. **[Development Guide](./getting-started/DEVELOPMENT.md)** - Daily development workflow
3. **[Architecture Overview](./architecture/OVERVIEW.md)** - Understand the system design

### For Contributors
1. **[User Stories](./user-stories/USER_STORIES.md)** - Feature requirements and acceptance criteria
2. **[Testing Guide](./getting-started/TESTING.md)** - Testing setup and best practices
3. **[Project Goals](./project/PRODUCT_GOALS.md)** - Product vision and objectives

## 📖 Documentation Structure

### Getting Started
Essential guides for new developers and contributors.

| Document | Description |
|----------|-------------|
| [Setup Guide](./getting-started/SETUP.md) | Installation, verification, and troubleshooting |
| [Development Guide](./getting-started/DEVELOPMENT.md) | Daily workflow, patterns, and best practices |
| [Build Guide](./getting-started/BUILDING.md) | Building installers for Mac and Windows |
| [Testing Guide](./getting-started/TESTING.md) | Testing setup, strategies, and coverage requirements |

### Architecture
Technical documentation for system design and implementation.

| Document | Description |
|----------|-------------|
| [Overview](./architecture/OVERVIEW.md) | High-level system architecture and design patterns |
| [Project Structure](./architecture/PROJECT_STRUCTURE.md) | File organization and folder structure |
| [State Management](./architecture/STATE_MANAGEMENT.md) | State flow, patterns, and update strategies |
| [IPC Communication](./architecture/IPC_COMMUNICATION.md) | Inter-process communication patterns |
| [Features](./architecture/FEATURES.md) | Feature implementation details and validation rules |

### Implementation Guides
Detailed guides for specific system components.

| Document | Description |
|----------|-------------|
| [Animation System](./guides/ANIMATION_SYSTEM.md) | Tree growth animations and visual feedback |
| [Session Lifecycle](./guides/SESSION_LIFECYCLE.md) | Complete session flow from creation to completion |
| [File Management](./guides/FILE_MANAGEMENT.md) | Import, export, and autosave functionality |
| [Floating Modal System](./guides/FLOATING_MODAL_SYSTEM.md) | Modal system architecture and implementation |

### Project Management
Product vision, requirements, and planning documents.

| Document | Description |
|----------|-------------|
| [Product Goals](./project/PRODUCT_GOALS.md) | Core product vision and success metrics |
| [User Stories](./user-stories/USER_STORIES.md) | Feature requirements and acceptance criteria |

## 🏗️ System Architecture

The Typing Focus App follows a three-process Electron architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Process  │    │  Preload Script │    │ Renderer Process│
│   (Node.js)     │◄──►│ (Context Bridge)│◄──►│    (React)      │
│                 │    │                 │    │                 │
│ • Window Mgmt   │    │ • API Exposure  │    │ • UI Components │
│ • File System   │    │ • Type Safety   │    │ • State Mgmt    │
│ • Session Mgmt  │    │ • Validation    │    │ • Animations    │
│ • Focus Monitor │    │ • Security      │    │ • User Input    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components
- **Main Process**: Handles file I/O, session persistence, and system integration
- **Preload Script**: Provides secure, type-safe API bridge
- **Renderer Process**: Manages UI, user interactions, and visual feedback

## 🎯 Core Features

### Writing Sessions
- Distraction-free editor with live word count and timer
- Goal-based sessions (word count or time duration)
- Real-time progress tracking and visualization

### Tree Animation System
- Visual progress representation through growing trees
- Three growth stages: seedling, small tree, mature tree
- Penalty animations for incomplete sessions

### Focus Management
- Inactivity detection with session pausing
- Distraction warnings with countdown timers
- Focus enforcement through visual consequences

### File Management
- Import existing text files
- Export current work
- Automatic saving and recovery

## 🛠️ Development Workflow

### Daily Development
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run typecheck
```

### Testing Strategy
- **Unit Tests**: Individual functions and components
- **Integration Tests**: IPC communication and data flow
- **Component Tests**: React components with React Testing Library
- **Coverage**: 80%+ required for business logic

### Code Quality
- **TypeScript**: Strict mode for type safety
- **ESLint**: Code style and best practices
- **Prettier**: Consistent code formatting
- **CSS Modules**: Component-scoped styling

## 📋 Project Status

### Current Implementation
- ✅ Basic Electron app structure
- ✅ React UI with navigation
- ✅ Session setup and goal configuration
- ✅ Text editor with Tiptap integration
- ✅ Word count and timer functionality
- ✅ Tree animation system
- ✅ Modal system (inactivity, distraction, completion)
- ✅ File import/export functionality
- ✅ Autosave and recovery system

### In Progress
- 🔄 State management optimization
- 🔄 Animation performance improvements
- 🔄 Error handling and validation
- 🔄 Testing coverage expansion

### Planned Features
- 📅 Dashboard and statistics
- 📅 Session history and streaks
- 📅 Enhanced animation system
- 📅 Accessibility improvements

## 🤝 Contributing

### Getting Started
1. Read the [Setup Guide](./getting-started/SETUP.md)
2. Review [User Stories](./user-stories/USER_STORIES.md)
3. Check [Development Guide](./getting-started/DEVELOPMENT.md)
4. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines

### Development Standards
- Use TypeScript for all new code
- Follow existing patterns and architecture
- Write tests for new features
- Update documentation for changes
- Use conventional commit messages

### Code Review Process
- All changes require pull request review
- Tests must pass before merging
- Documentation must be updated
- Code must follow style guidelines

## 📞 Support

### Documentation Issues
- Check existing documentation first
- Search for similar issues
- Create detailed issue reports
- Include relevant code and error messages

### Development Questions
- Review architecture documentation
- Check existing implementations
- Ask specific, detailed questions
- Provide context and examples

## 🔗 External Resources

### Technology Stack
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type system
- [Tiptap](https://tiptap.dev/) - Text editor
- [Vitest](https://vitest.dev/) - Testing framework

### Development Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html) - React debugging
- [Electron DevTools](https://www.electronjs.org/docs/latest/tutorial/devtools) - Electron debugging

---

**Last Updated**: December 2024  
**Documentation Version**: 1.0  
**App Version**: MVP Development