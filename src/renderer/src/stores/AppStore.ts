import { THEME_SYSTEM, ThemePreference } from '@renderer/styles/theme';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  currentView: 'dashboard' | 'editor' | 'session-summary';
  theme: ThemePreference;
  setView: (view: AppState['currentView']) => void;
  setTheme: (theme: AppState['theme']) => void;
}


export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial State
        currentView: 'editor',
        theme: THEME_SYSTEM,

        // Actions
        setView: (view) => set({ currentView: view }, false, 'setView'),
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          currentView: state.currentView,
          theme: state.theme,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);