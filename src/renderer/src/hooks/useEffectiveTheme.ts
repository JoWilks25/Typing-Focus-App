import { THEME_DARK, THEME_LIGHT, THEME_SYSTEM, ThemePreference } from '@renderer/styles/theme';
import { useEffect, useState } from 'react';

export const useEffectiveTheme = (themePreference: ThemePreference): typeof THEME_DARK | typeof THEME_LIGHT => {
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (themePreference === THEME_SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handler = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    return undefined;
  }, [themePreference]);

  if (themePreference === THEME_SYSTEM) {
    return systemPrefersDark ? THEME_DARK : THEME_LIGHT;
  }
  return themePreference;
};