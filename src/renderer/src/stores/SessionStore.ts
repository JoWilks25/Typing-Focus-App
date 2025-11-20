import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type GoalType = 'wordcount' | 'time';

interface SessionState {
  fileName: string;
  filePath: string;
  goal: number;
  goalType: GoalType;
  setInitSession: (fileName: SessionState['fileName'], filePath: SessionState['filePath'], goal: SessionState['goal'], goalType: SessionState['goalType']) => void;
}


export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set) => ({
        // Initial State
        fileName: '',
        filePath: '',
        goal: 0,
        goalType: 'wordcount',

        // Actions
        setInitSession: (fileName, filePath, goal, goalType) => set({ fileName, filePath, goal, goalType }, false, 'setFileValues')
      }),
      {
        name: 'session-storage',
        partialize: (state) => ({

        }),
      }
    ),
    { name: 'SessionStore' }
  )
);