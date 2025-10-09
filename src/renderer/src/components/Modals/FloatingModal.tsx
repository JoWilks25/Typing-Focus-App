import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './FloatingModal.module.css';

export interface FloatingModalProps {
    /** Unique identifier for this modal instance */
    id?: string;
    /** Modal title displayed in the header */
    title?: string;
    /** Whether the modal can be closed */
    closable?: boolean;
    /** Whether the modal can be minimized */
    minimizable?: boolean;
    /** Whether the modal can be resized */
    resizable?: boolean;
    /** Whether the modal should stay on top */
    alwaysOnTop?: boolean;
    /** Initial width of the modal */
    width?: number;
    /** Initial height of the modal */
    height?: number;
    /** Initial x position */
    x?: number;
    /** Initial y position */
    y?: number;
    /** Content to display in the modal */
    children?: React.ReactNode;
    /** Custom content as HTML string */
    content?: string;
    /** Callback when modal is closed */
    onClose?: () => void;
    /** Callback when modal is moved */
    onMove?: (x: number, y: number) => void;
    /** Callback when modal is minimized */
    onMinimize?: () => void;
    /** Callback when modal is resized */
    onResize?: (width: number, height: number) => void;
    /** Custom CSS class for the modal container */
    className?: string;
    /** Custom styles for the modal container */
    style?: React.CSSProperties;
}

export const FloatingModal: React.FC<FloatingModalProps> = ({
    title = 'Floating Modal',
    closable = true,
    minimizable = true,
    resizable = true,
    alwaysOnTop = true,
    width = 400,
    height = 300,
    x,
    y,
    children,
    content,
    onClose,
    onMove,
    onMinimize,
    onResize,
    className,
    style
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: x || 0, y: y || 0 });
    const [size, setSize] = useState({ width, height });
    const [isMinimized, setIsMinimized] = useState(false);

    // Handle drag start
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.target === modalRef.current || (e.target as HTMLElement).closest('[data-drag-handle]')) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [position]);

    // Handle drag move
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            setPosition({ x: newX, y: newY });
            onMove?.(newX, newY);
        }
    }, [isDragging, dragStart, onMove]);

    // Handle drag end
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle resize
    const handleResize = useCallback((e: MouseEvent) => {
        if (resizable && modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            const newWidth = Math.max(200, e.clientX - rect.left);
            const newHeight = Math.max(150, e.clientY - rect.top);

            setSize({ width: newWidth, height: newHeight });
            onResize?.(newWidth, newHeight);
        }
    }, [resizable, onResize]);

    // Handle close
    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    // Handle minimize
    const handleMinimize = useCallback(() => {
        setIsMinimized(!isMinimized);
        onMinimize?.();
    }, [isMinimized, onMinimize]);

    // Set up global event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
        return undefined;
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Set up resize event listener
    useEffect(() => {
        if (resizable) {
            document.addEventListener('mousemove', handleResize);
            return () => {
                document.removeEventListener('mousemove', handleResize);
            };
        }
        return undefined;
    }, [resizable, handleResize]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closable) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [closable, handleClose]);

    const modalStyle: React.CSSProperties = {
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: isMinimized ? 32 : size.height,
        zIndex: alwaysOnTop ? 9999 : 1000,
        ...style
    };

    return (
        <div
            ref={modalRef}
            className={`${styles.floatingModal} ${className || ''}`}
            style={modalStyle}
            onMouseDown={handleMouseDown}
        >
            {/* Header */}
            <div className={styles.header} data-drag-handle>
                <div className={styles.title}>{title}</div>
                <div className={styles.controls}>
                    {minimizable && (
                        <button
                            className={`${styles.controlButton} ${styles.minimizeButton}`}
                            onClick={handleMinimize}
                            title={isMinimized ? 'Restore' : 'Minimize'}
                        >
                            {isMinimized ? '□' : '−'}
                        </button>
                    )}
                    {closable && (
                        <button
                            className={`${styles.controlButton} ${styles.closeButton}`}
                            onClick={handleClose}
                            title="Close"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className={styles.content}>
                    {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        children
                    )}
                </div>
            )}

            {/* Resize handle */}
            {resizable && !isMinimized && (
                <div className={styles.resizeHandle} />
            )}
        </div>
    );
};

export default FloatingModal;
