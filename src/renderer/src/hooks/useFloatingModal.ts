import { useState, useCallback, useEffect, useRef } from 'react';

export interface FloatingModalOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  alwaysOnTop?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  title?: string;
  content?: string;
}

export interface FloatingModalInstance {
  id: string;
  isVisible: boolean;
  isMinimized: boolean;
  position: [number, number];
  size: [number, number];
}

export const useFloatingModal = () => {
  const [modals, setModals] = useState<Map<string, FloatingModalInstance>>(new Map());
  const modalRefs = useRef<Map<string, FloatingModalOptions>>(new Map());

  // Create a new floating modal
  const createModal = useCallback(async (options: FloatingModalOptions = {}): Promise<string | null> => {
    try {
      const id = await window.api.floatingModal.create(options);
      
      const modalInstance: FloatingModalInstance = {
        id,
        isVisible: true,
        isMinimized: false,
        position: [options.x || 0, options.y || 0],
        size: [options.width || 400, options.height || 300]
      };

      setModals(prev => new Map(prev).set(id, modalInstance));
      modalRefs.current.set(id, options);

      return id;
    } catch (error) {
      console.error('Failed to create floating modal:', error);
      return null;
    }
  }, []);

  // Close a specific modal
  const closeModal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await window.api.floatingModal.close(id);
      if (success) {
        setModals(prev => {
          const newModals = new Map(prev);
          newModals.delete(id);
          return newModals;
        });
        modalRefs.current.delete(id);
      }
      return success;
    } catch (error) {
      console.error('Failed to close floating modal:', error);
      return false;
    }
  }, []);

  // Close all modals
  const closeAllModals = useCallback(async (): Promise<void> => {
    try {
      await window.api.floatingModal.closeAll();
      setModals(new Map());
      modalRefs.current.clear();
    } catch (error) {
      console.error('Failed to close all floating modals:', error);
    }
  }, []);

  // Minimize a specific modal
  const minimizeModal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await window.api.floatingModal.minimize(id);
      if (success) {
        setModals(prev => {
          const newModals = new Map(prev);
          const modal = newModals.get(id);
          if (modal) {
            newModals.set(id, { ...modal, isMinimized: !modal.isMinimized });
          }
          return newModals;
        });
      }
      return success;
    } catch (error) {
      console.error('Failed to minimize floating modal:', error);
      return false;
    }
  }, []);

  // Move a modal to specific coordinates
  const moveModal = useCallback(async (id: string, x: number, y: number): Promise<boolean> => {
    try {
      const success = await window.api.floatingModal.move(id, x, y);
      if (success) {
        setModals(prev => {
          const newModals = new Map(prev);
          const modal = newModals.get(id);
          if (modal) {
            newModals.set(id, { ...modal, position: [x, y] });
          }
          return newModals;
        });
      }
      return success;
    } catch (error) {
      console.error('Failed to move floating modal:', error);
      return false;
    }
  }, []);

  // Resize a modal
  const resizeModal = useCallback(async (id: string, width: number, height: number): Promise<boolean> => {
    try {
      const success = await window.api.floatingModal.resize(id, width, height);
      if (success) {
        setModals(prev => {
          const newModals = new Map(prev);
          const modal = newModals.get(id);
          if (modal) {
            newModals.set(id, { ...modal, size: [width, height] });
          }
          return newModals;
        });
      }
      return success;
    } catch (error) {
      console.error('Failed to resize floating modal:', error);
      return false;
    }
  }, []);

  // Get modal information
  const getModal = useCallback(async (id: string): Promise<FloatingModalInstance | null> => {
    try {
      const modalInfo = await window.api.floatingModal.get(id);
      if (modalInfo) {
        const modalInstance: FloatingModalInstance = {
          id: modalInfo.id,
          isVisible: modalInfo.isVisible,
          isMinimized: modalInfo.isMinimized,
          position: modalInfo.position,
          size: modalInfo.size
        };
        return modalInstance;
      }
      return null;
    } catch (error) {
      console.error('Failed to get floating modal:', error);
      return null;
    }
  }, []);

  // Get all modals
  const getAllModals = useCallback(async (): Promise<FloatingModalInstance[]> => {
    try {
      const modalInfos = await window.api.floatingModal.getAll();
      return modalInfos.map(modalInfo => ({
        id: modalInfo.id,
        isVisible: modalInfo.isVisible,
        isMinimized: modalInfo.isMinimized,
        position: modalInfo.position,
        size: modalInfo.size
      }));
    } catch (error) {
      console.error('Failed to get all floating modals:', error);
      return [];
    }
  }, []);

  // Check if a modal exists
  const hasModal = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await window.api.floatingModal.has(id);
    } catch (error) {
      console.error('Failed to check if floating modal exists:', error);
      return false;
    }
  }, []);

  // Update modal content
  const updateModalContent = useCallback(async (id: string, content: string): Promise<boolean> => {
    try {
      return await window.api.floatingModal.updateContent(id, content);
    } catch (error) {
      console.error('Failed to update floating modal content:', error);
      return false;
    }
  }, []);

  // Create a distraction warning modal
  const createDistractionWarning = useCallback(async (
    secondsRemaining: number,
    wordCount: number,
    timeElapsed: string,
    _onReturn: () => void,
    _onEndSession: () => void
  ): Promise<string | null> => {
    const content = `
      <div class="floating-distraction-warning">
        <!-- Warning Icon -->
        <div class="icon-container">
          <div class="warning-icon">⚠️</div>
        </div>

        <!-- Heading -->
        <h2 class="heading">Stay Focused?</h2>

        <!-- Main Message -->
        <p class="message">
          You are about to leave your writing session. If you switch away before reaching your goal, your progress will be marked as incomplete and your tree will wilt.
        </p>

        <!-- Countdown Timer -->
        <div class="countdown-container">
          <div class="countdown-label">Return within</div>
          <div class="countdown-timer">
            <span class="countdown-number">${secondsRemaining}</span>
            <span class="countdown-unit">seconds</span>
          </div>
          <div class="countdown-label">to keep your progress</div>
        </div>

        <!-- Current Stats -->
        <div class="stats-container">
          <div class="stat">
            <span class="stat-label">Words:</span>
            <span class="stat-value">${wordCount}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Time:</span>
            <span class="stat-value">${timeElapsed}</span>
          </div>
        </div>

        <!-- Tree Icon Placeholder -->
        <div class="tree-container">
          <div class="tree-icon">🌱</div>
        </div>

        <!-- Action Buttons -->
        <div class="button-container">
          <button id="return-button" class="return-button">
            Return to Session
          </button>
          <button id="end-button" class="end-button">
            End Session Anyway
          </button>
        </div>
      </div>

      <style>
        .floating-distraction-warning {
          text-align: center;
          color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .icon-container {
          margin-bottom: 16px;
        }

        .warning-icon {
          font-size: 48px;
          display: inline-block;
          filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3));
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.5));
          }
        }

        .heading {
          color: #f9fafb;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        .message {
          color: #d1d5db;
          font-size: 16px;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .countdown-container {
          margin-bottom: 24px;
          padding: 20px;
          background-color: rgba(55, 65, 81, 0.8);
          border-radius: 8px;
          border: 1px solid #f59e0b;
          backdrop-filter: blur(5px);
        }

        .countdown-label {
          color: #9ca3af;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .countdown-timer {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
          margin: 12px 0;
        }

        .countdown-number {
          color: #f59e0b;
          font-size: 36px;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
          animation: countdownPulse 1s infinite;
        }

        @keyframes countdownPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .countdown-unit {
          color: #f59e0b;
          font-size: 18px;
          font-weight: 500;
        }

        .stats-container {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 24px;
          padding: 16px;
          background-color: rgba(55, 65, 81, 0.8);
          border-radius: 8px;
          backdrop-filter: blur(5px);
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat-label {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          color: #f9fafb;
          font-size: 18px;
          font-weight: 600;
        }

        .tree-container {
          margin-bottom: 32px;
        }

        .tree-icon {
          font-size: 32px;
          display: inline-block;
          filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.3));
          animation: treeSway 3s ease-in-out infinite;
        }

        @keyframes treeSway {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(2deg);
          }
          75% {
            transform: rotate(-2deg);
          }
        }

        .button-container {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .return-button {
          flex: 1;
          background-color: #f59e0b;
          color: #1f2937;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
        }

        .return-button:hover {
          background-color: #d97706;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
        }

        .end-button {
          flex: 1;
          background-color: transparent;
          color: #9ca3af;
          border: 1px solid #4b5563;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .end-button:hover {
          background-color: rgba(55, 65, 81, 0.5);
          color: #d1d5db;
          border-color: #6b7280;
        }
      </style>
    `;

    const modalId = await createModal({
      width: 480,
      height: 600,
      title: 'Focus Warning',
      content,
      alwaysOnTop: true,
      resizable: true,
      minimizable: true,
      closable: true
    });

    if (modalId) {
      // Set up button event listeners after a short delay
      setTimeout(() => {
        // Note: This would need to be handled differently in a real implementation
        // as we can't directly access the modal's DOM from here
        console.log('Modal created with ID:', modalId);
      }, 100);
    }

    return modalId;
  }, [createModal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeAllModals();
    };
  }, [closeAllModals]);

  return {
    modals: Array.from(modals.values()),
    createModal,
    closeModal,
    closeAllModals,
    minimizeModal,
    moveModal,
    resizeModal,
    getModal,
    getAllModals,
    hasModal,
    updateModalContent,
    createDistractionWarning
  };
};
