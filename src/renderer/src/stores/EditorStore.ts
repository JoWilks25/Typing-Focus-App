import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';



export const useEditorStore = create()(
  devtools(
    persist(
      (set) => ({
        // TODO: Implement
      }),
      { name: 'editor-storage' }
    ),
    { name: 'EditorStore' }
  )
);