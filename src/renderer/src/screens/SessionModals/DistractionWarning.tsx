import { Modal } from '@renderer/components/Modal/Modal';
import React, { useEffect, useState } from 'react';

export const DistractionWarning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!window.api) return;

    window.api.onshowDistractionWarning(() => {
      setIsVisible(true);
    });

    window.api.ondismissDistractionWarning(() => {
      setIsVisible(false);
      setSecondsRemaining(null);
    });

    window.api.onupdateCountdown((seconds) => {
      setSecondsRemaining(seconds);
      if (seconds <= 0) {
        // Main will mark the session abandoned; hide locally.
        setIsVisible(false);
      }
    });
  }, []);

  const handleClose = () => {
    // User explicitly dismisses the warning (e.g. presses close / returns).
    setIsVisible(false);
  };

  const handleReturnToSession = () => {
    // User intends to come back; window focus should clear countdown in main.
    setIsVisible(false);
  };

  const handleEndSessionAnyway = async () => {
    // await window.api.session.end();
    setIsVisible(false);
  };

  return (
    <Modal
      title="You’re losing focus"
      isVisible={isVisible}
      onClose={handleClose}
      width={480}
      maxWidth="95vw"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p>
          You switched away from your writing session. Stay here to keep your streak and tree healthy.
        </p>
        {secondsRemaining !== null && secondsRemaining > 0 && (
          <p>
            If you don’t return, this session will be marked as abandoned in{' '}
            <strong>{secondsRemaining}</strong> seconds.
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={handleReturnToSession}>
            Return to Session
          </button>
          <button type="button" onClick={handleEndSessionAnyway}>
            End Session Anyway
          </button>
        </div>
      </div>
    </Modal>
  );
};
