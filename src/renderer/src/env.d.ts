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
    onshowDistractionWarning: (cb: () => void) => void;
    ondismissDistractionWarning: (cb: () => void) => void;
    onupdateCountdown: (cb: (seconds: number) => void) => void;
    returnToSession?: () => void;
    onShouldShowDistractionWarning?: (cb: (respond: (shouldShow: boolean) => void) => void) => void;
    session: {
      end: () => Promise<void>;
    };
  };
}
