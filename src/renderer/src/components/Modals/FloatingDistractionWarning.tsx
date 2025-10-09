import React, { useEffect, useCallback, useState } from 'react';
import { useSession } from '../../hooks/useSession';
import { generateFloatingModalHtml } from '../../utils/componentToHtml';

interface FloatingDistractionWarningProps {
  isVisible: boolean;
  secondsRemaining: number;
  onReturn: () => void;
  onEndSession: () => void;
  modalId?: string;
}

export const FloatingDistractionWarning: React.FC<FloatingDistractionWarningProps> = ({
  isVisible,
  secondsRemaining,
  onReturn: _onReturn,
  onEndSession: _onEndSession,
  modalId
}) => {
  const { activeSession } = useSession();
  const [modalWindowId, setModalWindowId] = useState<string | null>(modalId || null);

  // Calculate current stats
  const getCurrentStats = () => {
    if (!activeSession) {
      return { wordCount: 0, timeElapsed: '00:00' };
    }

    const wordCount = typeof activeSession.currentWords === 'number' ? activeSession.currentWords : 0;
    const startTime = typeof activeSession.startTime === 'number' ? activeSession.startTime : Date.now();
    const timeElapsed = Date.now() - startTime;
    const minutes = Math.floor(timeElapsed / 60000);
    const seconds = Math.floor((timeElapsed % 60000) / 1000);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return { wordCount, timeElapsed: formattedTime };
  };

  const { wordCount, timeElapsed } = getCurrentStats();

  // Create floating modal when visible
  const createFloatingModal = useCallback(async () => {
    if (!isVisible || modalWindowId) return;

    try {
      const content = generateFloatingModalHtml(secondsRemaining, wordCount, timeElapsed, '');

      const id = await window.api.floatingModal.create({
        width: 480,
        height: 600,
        title: 'Focus Warning',
        content,
        alwaysOnTop: true,
        resizable: true,
        minimizable: true,
        closable: true
      });

      setModalWindowId(id);

      // Update content with the modal ID for proper event handling
      setTimeout(() => {
        const updatedContent = generateFloatingModalHtml(secondsRemaining, wordCount, timeElapsed, id);
        window.api.floatingModal.updateContent(id, updatedContent);
      }, 100);

    } catch (error) {
      console.error('Failed to create floating modal:', error);
    }
  }, [isVisible, modalWindowId, secondsRemaining, wordCount, timeElapsed]);

  // Close floating modal when not visible
  const closeFloatingModal = useCallback(async () => {
    if (modalWindowId) {
      try {
        await window.api.floatingModal.close(modalWindowId);
        setModalWindowId(null);
      } catch (error) {
        console.error('Failed to close floating modal:', error);
      }
    }
  }, [modalWindowId]);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      createFloatingModal();
    } else {
      closeFloatingModal();
    }
  }, [isVisible, createFloatingModal, closeFloatingModal]);

  // Update countdown in real-time by updating the modal content
  useEffect(() => {
    if (modalWindowId && isVisible) {
      const updatedContent = generateFloatingModalHtml(secondsRemaining, wordCount, timeElapsed, modalWindowId);
      window.api.floatingModal.updateContent(modalWindowId, updatedContent);
    }
  }, [modalWindowId, isVisible, secondsRemaining, wordCount, timeElapsed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (modalWindowId) {
        window.api.floatingModal.close(modalWindowId).catch(console.error);
      }
    };
  }, [modalWindowId]);

  // This component doesn't render anything in the main window
  // The floating modal is handled by the Electron window
  return null;
};

export default FloatingDistractionWarning;
