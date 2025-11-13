// Theme preference constants
export const THEME_LIGHT = 'light' as const;
export const THEME_DARK = 'dark' as const;
export const THEME_SYSTEM = 'system' as const;

export type ThemePreference = typeof THEME_LIGHT | typeof THEME_DARK | typeof THEME_SYSTEM;

// Theme type definition
export interface Theme {
  fonts: {
    sans: string;
    mono: string;
    cursive: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  colors: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
      overlay: string;
      overlayDark: string;
      overlayLight: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
      inverse: string;
      title: string;
    };
    border: {
      primary: string;
      secondary: string;
      tertiary: string;
      accent: string;
    };
    button: {
      primary: {
        bg: string;
        bgHover: string;
        bgActive: string;
      };
      secondary: {
        bg: string;
        bgHover: string;
      };
      inactive: {
        bg: string;
        bgHover: string;
      };
      disabled: {
        bg: string;
      };
      text: string;
      textInactive: string;
      textDisabled: string;
    };
    accent: {
      blue: string;
      blueDark: string;
      blueLight: string;
      blueLighter: string;
      purple: string;
      amber: string;
      amberDark: string;
      green: string;
      greenLight: string;
      greenLighter: string;
      yellow: string;
      red: string;
      redLight: string;
      redDark: string;
      redDarker: string;
      redError: string;
    };
    gradient: {
      title: {
        start: string;
        end: string;
      };
      badge: {
        start: string;
        end: string;
      };
      button: {
        start: string;
        end: string;
      };
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
      accent: string;
      accentHover: string;
    };
  };
}

// Shared typography (same for both themes)
const typography = {
  fonts: {
    sans: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    mono: `ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace`,
    cursive: `'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', 'Apple Chancery', cursive`,
  },
  fontSizes: {
    xs: '0.625rem', // 10px
    sm: '0.75rem', // 12px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2rem', // 32px
    '5xl': '3rem', // 48px
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1,
    normal: 1.5,
    relaxed: 1.6,
  },
};

// Dark theme (default)
export const darkTheme: Theme = {
  ...typography,
  colors: {
    background: {
      primary: '#111827', // gray-900
      secondary: '#202b3a', // gray-800
      tertiary: '#374151', // gray-700
      quaternary: '#4b5563', // gray-600
      overlay: 'rgba(0, 0, 0, 0.5)',
      overlayDark: 'rgba(0, 0, 0, 0.85)',
      overlayLight: 'rgba(31, 41, 55, 0.95)',
    },
    text: {
      primary: '#f3f4f6', // gray-100
      secondary: '#d1d5db', // gray-300
      tertiary: '#9ca3af', // gray-400
      quaternary: '#6b7280', // gray-500
      inverse: '#111827', // gray-900
      title: '#f9fafb', // gray-50
    },
    border: {
      primary: '#374151', // gray-700
      secondary: '#4b5563', // gray-600
      tertiary: '#6b7280', // gray-500
      accent: 'rgba(59, 130, 246, 0.3)', // blue-500 with opacity
    },
    button: {
      primary: {
        bg: '#3b82f6', // blue-600
        bgHover: '#2563eb', // blue-700
        bgActive: '#1d4ed8', // blue-800
      },
      secondary: {
        bg: '#6b7280', // gray-500
        bgHover: '#4b5563', // gray-600
      },
      inactive: {
        bg: '#374151', // gray-700
        bgHover: '#4b5563', // gray-600
      },
      disabled: {
        bg: '#1f2937', // gray-800
      },
      text: '#ffffff',
      textInactive: '#d1d5db', // gray-300
      textDisabled: '#6b7280', // gray-500
    },
    accent: {
      blue: '#3b82f6', // blue-500
      blueDark: '#2563eb', // blue-600
      blueLight: '#60a5fa', // blue-400
      blueLighter: '#93c5fd', // blue-300
      purple: '#a855f7', // purple-500
      amber: '#f59e0b', // amber-500
      amberDark: '#d97706', // amber-600
      green: '#22c55e', // green-500
      greenLight: '#4ade80', // green-400
      greenLighter: '#86efac', // green-300
      yellow: '#eab308', // yellow-500
      red: '#ef4444', // red-500
      redLight: '#f87171', // red-400
      redDark: '#dc2626', // red-600
      redDarker: '#b91c1c', // red-700
      redError: '#ff6b6b', // error red
    },
    gradient: {
      title: {
        start: '#60a5fa', // blue-400
        end: '#a855f7', // purple-500
      },
      badge: {
        start: '#f59e0b', // amber-500
        end: '#d97706', // amber-600
      },
      button: {
        start: '#3b82f6', // blue-500
        end: '#2563eb', // blue-600
      },
    },
    shadow: {
      sm: 'rgba(0, 0, 0, 0.1)',
      md: 'rgba(0, 0, 0, 0.2)',
      lg: 'rgba(0, 0, 0, 0.4)',
      accent: 'rgba(59, 130, 246, 0.3)',
      accentHover: 'rgba(59, 130, 246, 0.4)',
    },
  },
};

// Light theme
export const lightTheme: Theme = {
  ...typography,
  colors: {
    background: {
      primary: '#ffffff', // white
      secondary: '#F3F4EC', // gray-50
      tertiary: '#ffffff', // gray-100
      quaternary: '#9096a0', // gray-200
      overlay: 'rgba(0, 0, 0, 0.3)',
      overlayDark: 'rgba(0, 0, 0, 0.6)',
      overlayLight: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#111827', // gray-900
      secondary: '#374151', // gray-700
      tertiary: '#6b7280', // gray-500
      quaternary: '#9ca3af', // gray-400
      inverse: '#f3f4f6', // gray-100
      title: '#111827', // gray-900
    },
    border: {
      primary: '#e5e7eb', // gray-200
      secondary: '#d1d5db', // gray-300
      tertiary: '#9ca3af', // gray-400
      accent: 'rgba(59, 130, 246, 0.4)', // blue-500 with opacity
    },
    button: {
      primary: {
        bg: '#2563eb', // blue-600
        bgHover: '#1d4ed8', // blue-700
        bgActive: '#1e40af', // blue-800
      },
      secondary: {
        bg: '#6b7280', // gray-500
        bgHover: '#4b5563', // gray-600
      },
      inactive: {
        bg: '#e5e7eb', // gray-200
        bgHover: '#d1d5db', // gray-300
      },
      disabled: {
        bg: '#f3f4f6', // gray-100
      },
      text: '#ffffff',
      textInactive: '#374151', // gray-700
      textDisabled: '#9ca3af', // gray-400
    },
    accent: {
      blue: '#2563eb', // blue-600
      blueDark: '#1d4ed8', // blue-700
      blueLight: '#3b82f6', // blue-500
      blueLighter: '#60a5fa', // blue-400
      purple: '#9333ea', // purple-600
      amber: '#d97706', // amber-600
      amberDark: '#b45309', // amber-700
      green: '#16a34a', // green-600
      greenLight: '#22c55e', // green-500
      greenLighter: '#4ade80', // green-400
      yellow: '#ca8a04', // yellow-600
      red: '#dc2626', // red-600
      redLight: '#ef4444', // red-500
      redDark: '#b91c1c', // red-700
      redDarker: '#991b1b', // red-800
      redError: '#dc2626', // error red
    },
    gradient: {
      title: {
        start: '#3b82f6', // blue-500
        end: '#9333ea', // purple-600
      },
      badge: {
        start: '#d97706', // amber-600
        end: '#b45309', // amber-700
      },
      button: {
        start: '#2563eb', // blue-600
        end: '#1d4ed8', // blue-700
      },
    },
    shadow: {
      sm: 'rgba(0, 0, 0, 0.05)',
      md: 'rgba(0, 0, 0, 0.1)',
      lg: 'rgba(0, 0, 0, 0.2)',
      accent: 'rgba(37, 99, 235, 0.2)',
      accentHover: 'rgba(37, 99, 235, 0.3)',
    },
  },
};

// Helper function to get theme based on preference
export const getTheme = (themePreference: ThemePreference): Theme => {
  if (themePreference === THEME_SYSTEM) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  }
  return themePreference === THEME_DARK ? darkTheme : lightTheme;
};

// Type augmentation for styled-components
declare module 'styled-components' {
  export interface DefaultTheme extends Theme { }
}