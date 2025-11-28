import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import dayjs from 'dayjs'
import { useEditorStore } from '@renderer/stores/EditorStore';


export type GoalType = 'wordcount' | 'time';

interface SessionStat {
  fileName: string;
  filePath: string;
  goal: number;
  goalType: GoalType;
  startTime: string | null;
  endTime: string | null;
  // From EditorStore
  wordCount: number;
  characterCount: number;
  goalProgress: number;
  timeProgress: number;
  // Calculated values
  duration: number; // in seconds
  goalAchieved: boolean;
  finalProgressValue: number; // words or minutes depending on goalType
}

interface SessionState {
  fileName: string;
  filePath: string;
  goal: number;
  goalType: GoalType;
  sessionActive: boolean;
  startTime: string | null;
  sessionStats: SessionStat[];
  elapsedSeconds: number;
  updateElapsedTime: () => void;
  resetElapsedTime: () => void;
  setInitSession: (fileName: SessionState['fileName'], filePath: SessionState['filePath'], goal: SessionState['goal'], goalType: SessionState['goalType'], sessionActive: SessionState['sessionActive']) => void;
  endSession: () => void;
  setSessionActive: (value: boolean) => void;
}

const STORE_NAME = 'SessionStore';

// Listen for state sync from other windows
if (typeof window !== 'undefined' && window.api?.state) {
  window.api.state.sync((data) => {
    if (data.storeName === STORE_NAME) {
      // Merge the synced state
      useSessionStore.setState(data.state as SessionState);
    }
  });

  // Respond to state requests from new windows
  window.api.state.onStateRequest?.((data) => {
    if (data.storeName === STORE_NAME) {
      const currentState = useSessionStore.getState();
      window.api?.state.respondToStateRequest?.(data.responseChannel, currentState);
    }
  });
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        fileName: '',
        filePath: '',
        goal: 0,
        goalType: 'wordcount',
        sessionActive: false,
        startTime: null,
        sessionStats: [],
        elapsedSeconds: 0, // Add this

        // Actions
        setSessionActive: (value) => {
          set({ sessionActive: value }, false, 'setSessionActive');

          // Broadcast to other windows
          if (window.api?.state) {
            window.api.state.broadcast(STORE_NAME, useSessionStore.getState());
          }
        },

        setInitSession: (fileName, filePath, goal, goalType, sessionActive) => {
          const newState = {
            fileName,
            filePath,
            goal,
            goalType,
            sessionActive,
            startTime: dayjs().format(),
          };

          set(newState, false, 'setInitSession');

          // Broadcast to other windows
          if (window.api?.state) {
            window.api.state.broadcast(STORE_NAME, useSessionStore.getState());
          }
        },

        endSession: () => {
          set((state) => {
            // Get current values from EditorStore
            const editorState = useEditorStore.getState();

            // Calculate duration
            const start = state.startTime ? dayjs(state.startTime) : null;
            const end = dayjs();
            const duration = start ? end.diff(start, 'second') : 0;

            // Calculate goal achievement and final progress value
            const goalAchieved = state.goalType === 'wordcount'
              ? editorState.wordCount >= state.goal
              : (duration / 60) >= state.goal; // time goal in minutes

            const finalProgressValue = state.goalType === 'wordcount'
              ? editorState.wordCount
              : Math.floor(duration / 60); // minutes

            const newSessionStat: SessionStat = {
              fileName: state.fileName,
              filePath: state.filePath,
              goal: state.goal,
              goalType: state.goalType,
              startTime: state.startTime,
              endTime: end.format(),
              // From EditorStore
              wordCount: editorState.wordCount,
              characterCount: editorState.characterCount,
              goalProgress: editorState.goalProgress,
              timeProgress: editorState.timeProgress,
              // Calculated values
              duration,
              goalAchieved,
              finalProgressValue,
            }

            return {
              fileName: '',
              filePath: '',
              goal: 0,
              goalType: 'wordcount',
              sessionActive: false,
              startTime: null,
              sessionStats: [
                ...state.sessionStats,
                newSessionStat,
              ]
            }
          }, false, 'endSession')

          // Broadcast to other windows
          if (window.api?.state) {
            window.api.state.broadcast(STORE_NAME, useSessionStore.getState());
          }
        },

        // Add these new actions:
        updateElapsedTime: () => {
          const state = get();
          if (state.sessionActive && state.startTime) {
            const start = dayjs(state.startTime);
            const now = dayjs();
            const elapsed = now.diff(start, 'second');
            set({ elapsedSeconds: elapsed }, false, 'updateElapsedTime');
          }
        },

        resetElapsedTime: () => {
          set({ elapsedSeconds: 0 }, false, 'resetElapsedTime');
        },
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
          sessionStats: state.sessionStats,
        }),
      }
    ),
    { name: 'SessionStore' }
  )
);

// Request state sync when store initializes (for modal windows)
if (typeof window !== 'undefined' && window.api?.state) {
  window.api.state.request(STORE_NAME).then((response) => {
    if (response.success && response.state) {
      useSessionStore.setState(response.state as SessionState);
    }
  });
}