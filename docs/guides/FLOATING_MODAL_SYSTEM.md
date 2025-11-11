# Floating Modal System

A reusable React component and Electron BrowserWindow system for creating floating PiP-style modal overlays.

## Features

- ✅ **Always on top** - Modals stay above other windows
- ✅ **Draggable** - Users can drag modals by the header
- ✅ **Resizable** - Drag the bottom-right corner to resize
- ✅ **Minimizable** - Click the minimize button to collapse
- ✅ **Closable** - Click the close button or press ESC
- ✅ **Cross-platform** - Works on macOS, Windows, and Linux
- ✅ **Modern design** - Glassmorphism with rounded corners and shadows
- ✅ **Keyboard shortcuts** - ESC to close, Enter/Space for actions
- ✅ **Customizable content** - Support for HTML content and React components
- ✅ **Event callbacks** - Handle close, move, minimize events

## Architecture

The system consists of several key components:

### 1. Electron Main Process
- **FloatingModalService** - Manages window creation and lifecycle
- **IPC Handlers** - Handle communication between main and renderer processes

### 2. Electron Preload
- **API Bridge** - Exposes floating modal controls to renderer process

### 3. React Components
- **FloatingModal** - Base React component for modal content
- **FloatingDistractionWarning** - Specialized distraction warning modal
- **FloatingModalDemo** - Demo component showing usage examples

### 4. React Hooks
- **useFloatingModal** - Hook for managing floating modals

## Usage

### Basic Usage

```typescript
import { useFloatingModal } from '../hooks/useFloatingModal';

const MyComponent = () => {
  const { createModal, closeModal } = useFloatingModal();

  const handleShowModal = async () => {
    const modalId = await createModal({
      width: 400,
      height: 300,
      title: 'My Modal',
      content: '<div>Hello World!</div>',
      alwaysOnTop: true,
      resizable: true,
      minimizable: true,
      closable: true
    });
  };

  return (
    <button onClick={handleShowModal}>
      Show Modal
    </button>
  );
};
```

### Advanced Usage with Callbacks

```typescript
const { createModal } = useFloatingModal();

const modalId = await createModal({
  width: 500,
  height: 400,
  title: 'Advanced Modal',
  content: '<div>Advanced content here</div>',
  alwaysOnTop: true,
  resizable: true,
  minimizable: true,
  closable: true,
  onClose: () => {
    console.log('Modal was closed');
  },
  onMove: (x, y) => {
    console.log(`Modal moved to: ${x}, ${y}`);
  },
  onMinimize: () => {
    console.log('Modal was minimized');
  }
});
```

### Distraction Warning Modal

```typescript
import { FloatingDistractionWarning } from '../components/Modals/FloatingDistractionWarning';

const MyComponent = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);

  return (
    <FloatingDistractionWarning
      isVisible={showWarning}
      secondsRemaining={countdown}
      onReturn={() => {
        setShowWarning(false);
        console.log('User returned to session');
      }}
      onEndSession={() => {
        setShowWarning(false);
        console.log('User ended session');
      }}
    />
  );
};
```

## API Reference

### FloatingModalOptions

```typescript
interface FloatingModalOptions {
  width?: number;           // Default: 400
  height?: number;          // Default: 300
  x?: number;              // Default: center of screen
  y?: number;              // Default: center of screen
  alwaysOnTop?: boolean;   // Default: true
  resizable?: boolean;     // Default: true
  minimizable?: boolean;   // Default: true
  closable?: boolean;      // Default: true
  title?: string;          // Default: 'Floating Modal'
  content?: string;        // HTML content
  onClose?: () => void;    // Called when modal is closed
  onMove?: (x: number, y: number) => void;  // Called when modal is moved
  onMinimize?: () => void; // Called when modal is minimized
}
```

### useFloatingModal Hook

```typescript
const {
  modals,                    // Array of active modal instances
  createModal,              // Create a new modal
  closeModal,               // Close a specific modal
  closeAllModals,           // Close all modals
  minimizeModal,            // Minimize a specific modal
  moveModal,                // Move a modal to specific coordinates
  resizeModal,              // Resize a modal
  getModal,                 // Get modal information
  getAllModals,             // Get all modal information
  hasModal,                 // Check if modal exists
  updateModalContent,       // Update modal content
  createDistractionWarning  // Create distraction warning modal
} = useFloatingModal();
```

### FloatingModalInstance

```typescript
interface FloatingModalInstance {
  id: string;                    // Unique modal identifier
  isVisible: boolean;           // Whether modal is visible
  isMinimized: boolean;         // Whether modal is minimized
  position: [number, number];   // [x, y] coordinates
  size: [number, number];       // [width, height] dimensions
}
```

## Styling

The floating modals use modern CSS with:

- **Glassmorphism** - Semi-transparent background with backdrop blur
- **Rounded corners** - 12px border radius
- **Subtle shadows** - Multiple shadow layers for depth
- **Smooth animations** - CSS transitions for interactions
- **Responsive design** - Adapts to different screen sizes
- **High contrast support** - Respects user accessibility preferences
- **Reduced motion support** - Respects user motion preferences

### Custom Styling

You can customize the modal appearance by:

1. **Modifying CSS variables** in the FloatingModal.module.css
2. **Overriding styles** with custom CSS classes
3. **Using inline styles** in the content HTML

## Cross-Platform Compatibility

The system is designed to work consistently across:

- **macOS** - Native window controls, proper z-index handling
- **Windows** - Frame-less windows, proper taskbar integration
- **Linux** - X11/Wayland compatibility, proper window management

### Platform-Specific Features

- **macOS**: Traffic light-style window controls
- **Windows**: Standard minimize/close buttons
- **Linux**: Adapts to desktop environment (GNOME, KDE, etc.)

## Security Considerations

- **Context Isolation** - Enabled for security
- **Node Integration** - Disabled in modal windows
- **Sandbox** - Disabled for functionality, but content is sanitized
- **Web Security** - Enabled to prevent XSS attacks

## Performance

- **Efficient window management** - Only creates windows when needed
- **Memory cleanup** - Properly disposes of windows and event listeners
- **Minimal resource usage** - Lightweight HTML/CSS for modal content
- **Smooth animations** - Hardware-accelerated CSS transitions

## Troubleshooting

### Common Issues

1. **Modal not appearing**
   - Check if `alwaysOnTop` is set to `true`
   - Verify window creation permissions
   - Check console for error messages

2. **Modal not draggable**
   - Ensure the header has the `data-drag-handle` attribute
   - Check if `cursor: move` is applied to the header

3. **Modal not resizable**
   - Verify `resizable: true` in options
   - Check if resize handle is visible and clickable

4. **Content not updating**
   - Use `updateModalContent()` method
   - Ensure content is properly escaped HTML

### Debug Mode

Enable debug logging by setting:

```typescript
// In main process
process.env.DEBUG = 'floating-modal:*';

// In renderer process
localStorage.setItem('debug', 'floating-modal:*');
```

## Examples

See the `FloatingModalDemo` component for comprehensive usage examples including:

- Basic modal creation
- Distraction warning modal
- Custom content with styling
- Event handling
- Modal management

## Contributing

When adding new features:

1. Update the TypeScript interfaces
2. Add corresponding IPC handlers
3. Update the preload API
4. Add React components/hooks as needed
5. Update this documentation
6. Add tests for new functionality

## License

This floating modal system is part of Draft Tree and follows the same license terms.
