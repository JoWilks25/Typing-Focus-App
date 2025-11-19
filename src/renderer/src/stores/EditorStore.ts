import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface EditorState {
  formattedContent: string;
  plainText: string;
  wordCount: number;
  characterCount: number;
  startTime: number;
  goal: number;
  goalProgress: number;
  lastUpdated: number;
  Duration: number;
  updateContent: (content: EditorState['formattedContent'], text: EditorState['plainText'], wordCount: EditorState['wordCount']) => void;
  setGoal: (goal: number) => void;
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      // Initial State
      formattedContent: '',
      plainText: '',
      wordCount: 0,
      characterCount: 0,
      goal: 100,
      goalProgress: 0,

      // Actions
      updateContent: (content, text, wordCount) => {
        set((state) => {
          const newGoalProgress = state.goal > 0 ? Math.round((wordCount / state.goal) * 100) : 0;

          // Only update goalProgress if it actually changed
          if (newGoalProgress === state.goalProgress) {
            return {
              formattedContent: content,
              plainText: text,
              wordCount,
              characterCount: text.length,
              lastUpdated: Date.now(),
            };
          }

          return {
            formattedContent: content,
            plainText: text,
            wordCount,
            characterCount: text.length,
            goalProgress: newGoalProgress,
            lastUpdated: Date.now(),
          };
        }, false, 'updateContent');
      },
      setGoal: (goal) => set({ goal }, false, 'setGoal'),
    }),
    { name: 'EditorStore' }
  )
);