# Product Goals

Core product vision and objectives for Draft Tree.

## Primary Goals

### 1. Incentivize Focused Writing Sessions
**Objective**: Create a desktop application that encourages deep, focused writing sessions on Mac.

**Key Features**:
- Distraction-free writing environment
- Goal-based session management
- Visual progress tracking
- Focus enforcement mechanisms

### 2. Visual Progress Representation
**Objective**: Use tree animations to represent concentration and progress, growing during writing and wilting when sessions are abandoned.

**Key Features**:
- Tree growth tied to writing progress
- Three distinct growth stages (seedling, small tree, mature tree)
- Penalty animations for incomplete sessions
- Celebration animations for goal completion

### 3. Goal Completion Motivation
**Objective**: Deter premature session exits and reinforce goal completion through visual feedback.

**Key Features**:
- Required goal setting before session start
- Progress tracking toward completion
- Penalty system for early exits
- Positive reinforcement for completion

## Target Users

### Primary Audience
- **Writers**: Authors, bloggers, content creators working on first drafts
- **Students**: Academic writing, essays, research papers
- **Professionals**: Report writing, documentation, creative projects

### User Characteristics
- Benefit from gamification for deep work
- Seek accountability tools for focused writing
- Value visual feedback and progress tracking
- Prefer distraction-free environments

## Core Features

### Writing Sessions
- Distraction-free editor with live word count and timer
- Selectable session goals (word count or time-based)
- Save/export drafts locally as plain text files
- Autosave functionality with automatic recovery
- Import existing plain text files to continue writing

### Session Goal System
- **Word Count Goals**: Target number of words (e.g., 500 words)
- **Time Goals**: Target duration for writing session (e.g., 30 minutes)
- **Recommended Ranges**: 15-30 minutes or 250-500 words for focused sessions
- **Enforcement**: Session cannot start until goal is selected

### Tree Animation System
- **Growth States**: Seedling (0-33%), Small Tree (34-66%), Mature Tree (67-100%)
- **Growth Behavior**: Incremental growth tied to progress toward goal
- **Completion Animation**: Full mature tree with celebration feedback
- **Penalty Animation**: Wilt/death sequence for incomplete sessions

### Focus Management
- **Inactivity Detection**: 3-minute threshold with pause functionality
- **Distraction Warning**: 10-second countdown when switching away from app
- **Focus Enforcement**: Penalties for abandoning sessions before goal completion

## Design Principles

### User Experience
- **Clean, Minimalist Interface**: Primary focus on writing area and tree animation
- **Distraction-Free Environment**: No unnecessary UI elements during active session
- **Clear Visual Feedback**: Tree animation provides immediate, intuitive progress representation
- **Non-Punitive Inactivity Handling**: Pausing for thought is encouraged; only abandonment is penalized

### Technical Approach
- **Local-First**: All data stored locally (no cloud sync in V1)
- **Performance**: Smooth animations without blocking UI or session functionality
- **Reliability**: Robust autosave and recovery systems
- **Accessibility**: Keyboard-driven workflow with minimal mouse requirements

## Success Metrics

### Engagement Metrics
- **60%+ Session Completion Rate**: Majority of started sessions reach their goal
- **Average Session Length**: 20+ minutes for time goals, 400+ words for word goals
- **Daily Active Usage**: Users start 2+ sessions per day on average

### Focus Metrics
- **Inactivity Modal Engagement**: 85%+ users choose "Resume Writing" vs "End Session"
- **Distraction Warning Return Rate**: 70%+ users return within countdown after distraction warning
- **Retention**: 40%+ of users return for 5+ consecutive days (streak building)

### Quality Metrics
- **User Satisfaction**: Positive feedback on focus improvement
- **Session Quality**: Meaningful writing progress in completed sessions
- **Feature Adoption**: High usage of goal-setting and progress tracking features

## Out of Scope for V1

### Features Not Included
- Cross-device sync (iCloud or cloud storage)
- Mobile apps (iPad/iPhone)
- Customizable visual themes (tree type, colors)
- Customizable inactivity threshold
- Multiple penalty levels or scaling consequences
- Advanced text formatting (markdown, rich text)
- Collaboration features
- Browser extension or web version

### Technical Limitations
- No auto-updater in V1
- No code signing (future enhancement)
- Windows/Linux builds deferred
- No analytics or crash reporting
- No localization/internationalization

## Future Vision

### V2+ Enhancements
- **Cloud Sync**: iCloud, Dropbox, Google Drive integration
- **Mobile Apps**: iOS and iPad apps with sync
- **Customization**: Different tree types, themes, and animations
- **Advanced Features**: Sound effects, customizable thresholds, export formats
- **Collaboration**: Real-time collaborative editing features

### Long-term Goals
- **Platform Expansion**: Windows and Linux support
- **Enterprise Features**: Team collaboration and management tools
- **AI Integration**: Writing assistance and productivity insights
- **Community Features**: Sharing and social writing challenges

## Risk Mitigation

### User Experience Risks
- **False Positive Distraction Detection**: Careful calibration of focus detection sensitivity
- **User Perception of "Punishment"**: Emphasize completion rewards over penalties
- **Performance Issues**: Optimize animations for various hardware configurations
- **Anxiety Around Incomplete Sessions**: Balance encouragement with accountability

### Technical Risks
- **Animation Asset Creation**: Quality animations require design resources and testing
- **Performance**: Ensuring smooth animation playback on various hardware
- **Data Loss**: Robust autosave and recovery systems
- **Platform Compatibility**: Focus on macOS stability before expansion

## Success Criteria

Draft Tree will be considered successful when:

1. **Users consistently complete their writing goals** (60%+ completion rate)
2. **Users report improved focus and productivity** during writing sessions
3. **The app becomes a regular part of users' writing workflow** (daily usage)
4. **Users build and maintain writing streaks** (5+ consecutive days)
5. **The visual feedback system motivates continued engagement** with writing goals

---

**Document Version:** 1.0
**Status:** Core product vision
**Last Updated:** December 2024
