/// <reference types="vite/client" />

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

interface Window {
  api?: {
    modal: {
      create: (options: {
        id?: string;
        width?: number;
        height?: number;
        x?: number;
        y?: number;
        title?: string;
      }) => Promise<{ success: boolean; modalId?: string }>;
      close: (modalId: string) => Promise<{ success: boolean }>;
    };
    state: {
      broadcast: (storeName: string, state: unknown) => void;
      sync: (callback: (data: { storeName: string; state: unknown }) => void) => void;
      request: (storeName: string) => Promise<{ success: boolean; state?: unknown }>;
      onStateRequest?: (callback: (data: { storeName: string; responseChannel: string }) => void) => void;
      respondToStateRequest?: (responseChannel: string, state: unknown) => void;
    };
  };
}
