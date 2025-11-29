import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '@renderer/styles/theme';
import { GlobalStyles } from '@renderer/styles/globalStyles';
import { useAppStore } from '@renderer/stores/AppStore';
import { useEffectiveTheme } from '@renderer/hooks/useEffectiveTheme';
import {
  WarningContainer,
  WarningContent,
  WarningTitle,
  WarningMessage,
  CountdownText,
  ButtonGroup,
  WarningButton,
} from './DistractionWarningWindow.styles';

export const DistractionWarningWindow: React.FC = () => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Get theme preference from store (shared via localStorage)
  const themePreference = useAppStore((state) => state.theme);
  const effectiveTheme = useEffectiveTheme(themePreference);
  const theme = getTheme(effectiveTheme);

  useEffect(() => {
    if (!window.api) return;

    window.api.onupdateCountdown((seconds) => {
      setSecondsRemaining(seconds);
      if (seconds <= 0) {
        // Window will be closed by main process
        window.close();
      }
    });
  }, []);

  const handleReturnToSession = () => {
    if (window.api?.returnToSession) {
      window.api.returnToSession();
    }
    window.close();
  };

  const handleEndSessionAnyway = async () => {
    if (window.api?.session?.end) {
      await window.api.session.end();
    }
    window.close();
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <WarningContainer>
        <WarningContent>
          <WarningTitle>You're losing focus</WarningTitle>
          <WarningMessage>
            You switched away from your writing session. Stay here to keep your streak and tree healthy.
          </WarningMessage>
          {secondsRemaining !== null && secondsRemaining > 0 && (
            <CountdownText>
              If you don't return, this session will be marked as abandoned in{' '}
              <strong>{secondsRemaining}</strong> seconds.
            </CountdownText>
          )}
          <ButtonGroup>
            <WarningButton type="button" onClick={handleReturnToSession}>
              Return to Session
            </WarningButton>
            <WarningButton type="button" $secondary onClick={handleEndSessionAnyway}>
              End Session Anyway
            </WarningButton>
          </ButtonGroup>
        </WarningContent>
      </WarningContainer>
    </ThemeProvider>
  );
};

