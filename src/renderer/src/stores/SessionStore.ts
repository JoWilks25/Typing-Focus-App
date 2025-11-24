import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import dayjs from 'dayjs'

export type GoalType = 'wordcount' | 'time';

interface SessionState {
  fileName: string;
  filePath: string;
  goal: number;
  goalType: GoalType;
  sessionActive: boolean;
  startTime: string | null;
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
        startTime: null,

        // Actions
        setInitSession: (fileName, filePath, goal, goalType, sessionActive) => set({ fileName, filePath, goal, goalType, sessionActive, startTime: dayjs().format() }, false, 'setFileValues'),
        endSession: () => set({
          fileName: '',
          filePath: '',
          goal: 0,
          goalType: 'wordcount',
          sessionActive: false,
          startTime: null,  // Clear start time
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
          startTime: state.startTime,
        }),
      }
    ),
    { name: 'SessionStore' }
  )
);