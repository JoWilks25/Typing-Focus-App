import { useEffect, useRef, useState } from "react";

// Complete hook implementation
export const useDraggableModal = (initialPosition = { x: 100, y: 100 }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
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
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ref,
    position,
    isDragging,
    handleMouseDown,
  };
};