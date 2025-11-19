import React from 'react';
import { THEME_DARK } from '@renderer/styles/theme';
import logoDark from '@renderer/assets/logo_dark.svg';
import logoLight from '@renderer/assets/logo_light.svg';
import { AppLogo, AppTitle, AppTitleContainer, MvpBadge } from '../App.styles';

interface AppTitleSectionProps {
  effectiveTheme: typeof THEME_DARK | 'light';
}

export const AppTitleSection = React.memo<AppTitleSectionProps>(({ effectiveTheme }) => {
  return (
    <AppTitleContainer>
      <AppLogo
        src={effectiveTheme === THEME_DARK ? logoDark : logoLight}
        alt="Draft Tree Logo"
      />
      <AppTitle>
        Draft Tree
      </AppTitle>
      <MvpBadge>MVP</MvpBadge>
    </AppTitleContainer>
  );
});

AppTitleSection.displayName = 'AppTitleSection';

