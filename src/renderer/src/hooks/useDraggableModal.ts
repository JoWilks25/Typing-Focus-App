import { useEffect, useRef, useState } from "react";

export type ResizeDirection =
  | 'n' | 's' | 'e' | 'w'
  | 'ne' | 'nw' | 'se' | 'sw'
  | null;

export interface SizeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const useDraggableModal = (
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 300, height: 400 },
  sizeConstraints?: SizeConstraints
) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: ResizeDirection
  ) => {
    e.stopPropagation(); // Prevent dragging when clicking resize handle
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    });
    setResizeDirection(direction);
    setIsResizing(true);
  };

  // Drag handler
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate the maximum allowed position (keeping modal fully visible)
      const maxX = viewportWidth - rect.width;
      const maxY = viewportHeight - rect.height;

      // Constrain position to viewport bounds
      const constrainedX = Math.max(0, Math.min(e.clientX - dragOffset.x, maxX));
      const constrainedY = Math.max(0, Math.min(e.clientY - dragOffset.y, maxY));

      setPosition({
        x: constrainedX,
        y: constrainedY,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Resize handler
  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.left;
      let newY = resizeStart.top;

      // Handle horizontal resizing
      if (resizeDirection.includes('e')) {
        newWidth = resizeStart.width + deltaX;
      } else if (resizeDirection.includes('w')) {
        newWidth = resizeStart.width - deltaX;
        newX = resizeStart.left + deltaX;
      }

      // Handle vertical resizing
      if (resizeDirection.includes('s')) {
        newHeight = resizeStart.height + deltaY;
      } else if (resizeDirection.includes('n')) {
        newHeight = resizeStart.height - deltaY;
        newY = resizeStart.top + deltaY;
      }

      // Apply size constraints
      const minWidth = sizeConstraints?.minWidth ?? 250;
      const maxWidth = sizeConstraints?.maxWidth ?? window.innerWidth;
      const minHeight = sizeConstraints?.minHeight ?? 200;
      const maxHeight = sizeConstraints?.maxHeight ?? window.innerHeight;

      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

      // Adjust position if resizing from top or left
      if (resizeDirection.includes('w')) {
        const widthDelta = newWidth - resizeStart.width;
        newX = resizeStart.left - widthDelta;
      }
      if (resizeDirection.includes('n')) {
        const heightDelta = newHeight - resizeStart.height;
        newY = resizeStart.top - heightDelta;
      }

      // Constrain to viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      newX = Math.max(0, Math.min(newX, viewportWidth - newWidth));
      newY = Math.max(0, Math.min(newY, viewportHeight - newHeight));

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, resizeStart, sizeConstraints]);

  // Keep modal in bounds when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // If modal is outside viewport, move it back in
      const maxX = viewportWidth - rect.width;
      const maxY = viewportHeight - rect.height;

      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY)),
      }));

      // Also constrain size if needed
      setSize(prev => ({
        width: Math.min(prev.width, viewportWidth),
        height: Math.min(prev.height, viewportHeight),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ref,
    position,
    size,
    isDragging,
    isResizing,
    handleMouseDown,
    handleResizeMouseDown,
  };
};