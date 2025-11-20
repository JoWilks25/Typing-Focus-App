import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type GoalType = 'wordcount' | 'time';

interface SessionState {
  fileName: string;
  filePath: string;
  goal: number;
  goalType: GoalType;
  sessionActive: boolean;
  setInitSession: (fileName: SessionState['fileName'], filePath: SessionState['filePath'], goal: SessionState['goal'], goalType: SessionState['goalType'], sessionActive: SessionState['sessionActive']) => void;
  endSession: () => void;
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
        sessionActive: false,

        // Actions
        setInitSession: (fileName, filePath, goal, goalType, sessionActive) => set({ fileName, filePath, goal, goalType, sessionActive }, false, 'setFileValues'),
        endSession: () => set({
          fileName: '',
          filePath: '',
          goal: 0,
          goalType: 'wordcount',
          sessionActive: false
        }, false, 'endSession')
      }),
      {
        name: 'session-storage',
        partialize: (state) => ({
          fileName: state.fileName,
          filePath: state.filePath,
          goal: state.goal,
          goalType: state.goalType,
          sessionActive: state.sessionActive,
        }),
      }
    ),
    { name: 'SessionStore' }
  )
);