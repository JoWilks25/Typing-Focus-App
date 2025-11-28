import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme, THEME_LIGHT } from '@renderer/styles/theme';
import { GlobalStyles } from '@renderer/styles/globalStyles';
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
  const theme = getTheme(THEME_LIGHT);

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

