/// <reference types="vite/client" />

import type { EditorJson } from '@shared/tiptapTypes';

declare module '*.ttf' {
  const content: string;
  export default content;
}

declare module '*.woff' {
  const content: string;
  export default content;
}

declare module '*.woff2' {
  const content: string;
  export default content;
}

declare module '*.otf' {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    api?: {
      onshowDistractionWarning: (cb: () => void) => void;
      ondismissDistractionWarning: (cb: () => void) => void;
      onupdateCountdown: (cb: (seconds: number) => void) => void;
      returnToSession?: () => void;
      onShouldShowDistractionWarning?: (cb: (respond: (shouldShow: boolean) => void) => void) => void;
      onEndSessionFromDistraction?: (cb: () => void) => void;
      session: {
        end: () => void;
      };
      file: {
        write: (filePath: string, content: string) => Promise<void>;
        writeJson: (filePath: string, content: EditorJson) => Promise<void>;
        read: (filePath: string) => Promise<string>;
        exists: (filePath: string) => Promise<boolean>;
      };
      app: {
        getDefaultSaveDirectory: () => Promise<string>;
      };
      dialog: {
        showOpenDirectory: (defaultPath?: string) => Promise<string | null>;
        showOpenTiptap: () => Promise<string | null>;
      };
      shell: {
        showItemInFolder: (filePath: string) => Promise<void>;
      };
      onDistractionTimeout?: (callback: () => void) => void;
    };
  }
}

export { };
