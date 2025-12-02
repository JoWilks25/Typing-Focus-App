import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import dayjs from 'dayjs'
import { useSessionStore } from './SessionStore';
import type { EditorJson } from '@shared/tiptapTypes';

interface EditorState {
  formattedContent: string;
  plainText: string;
  wordCount: number;
  initialWordCount: number; // Add this
  json: EditorJson | null;
  characterCount: number;
  goal: number;
  goalProgress: number;
  lastUpdated: string | null;
  duration: number;
  timeProgress: number;
  goalAchieved: boolean;
  setTimeProgress: (progress: number) => void;
  updateContent: (
    content: EditorState['formattedContent'],
    text: EditorState['plainText'],
    json: EditorJson,
    wordCount: EditorState['wordCount'],
  ) => void;
  resetEditor: () => void;
  setGoal: (goal: number) => void;
  setInitialWordCount: (count: number) => void; // Add this action
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      // Initial State
      formattedContent: '',
      plainText: '',
      json: null,
      wordCount: 0,
      characterCount: 0,
      goal: 100,
      goalProgress: 0,
      lastUpdated: null,
      timeProgress: 0,
      goalAchieved: false,
      initialWordCount: 0,

      // Actions
      updateContent: (content, text, json, wordCount) => {
        set((state) => {
          const sessionState = useSessionStore.getState();
          if (sessionState.goalType === 'wordcount') {
            // Calculate progress based on NEW words (current - initial)
            const newWords = wordCount - state.initialWordCount;
            const newGoalProgress = state.goal > 0 ? Math.round((newWords / state.goal) * 100) : 0;
            // Only update goalProgress if it actually changed
            if (newGoalProgress === state.goalProgress) {
              return {
                formattedContent: content,
                plainText: text,
                json,
                wordCount,
                characterCount: text.length,
                lastUpdated: dayjs().format(),
              };
            }
            return {
              formattedContent: content,
              plainText: text,
              json,
              wordCount,
              characterCount: text.length,
              goalProgress: newGoalProgress,
              goalAchieved: newGoalProgress >= 100,
              lastUpdated: dayjs().format(),
            };
          } else {
            return {
              formattedContent: content,
              plainText: text,
              json,
              wordCount,
              characterCount: text.length,
              lastUpdated: dayjs().format(),
            };
          }
        }, false, 'updateContent');
      },
      resetEditor: () => set({
        formattedContent: '',
        plainText: '',
        json: null,
        wordCount: 0,
        characterCount: 0,
        goal: 100,
        goalProgress: 0,
        lastUpdated: null,
        timeProgress: 0,
        goalAchieved: false,
        initialWordCount: 0,
      }, false, 'resetEditor'),
      setGoal: (goal) => set({ goal }, false, 'setGoal'),
      setTimeProgress: (timeProgress) => set({ timeProgress, goalAchieved: timeProgress >= 100 }, false, 'setTimeProgress'),
      setInitialWordCount: (count) => set({ initialWordCount: count }, false, 'setInitialWordCount'),
    }),
    { name: 'EditorStore' }
  )
);