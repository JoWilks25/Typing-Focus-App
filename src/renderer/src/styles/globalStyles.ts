import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Define Dancing Script font locally */
  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('../assets/fonts/DancingScript-Regular.ttf') format('truetype');
  }

  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url('../assets/fonts/DancingScript-Medium.ttf') format('truetype');
  }

  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url('../assets/fonts/DancingScript-SemiBold.ttf') format('truetype');
  }

  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url('../assets/fonts/DancingScript-Bold.ttf') format('truetype');
  }

  /* Optional: Add any base resets or global styles here */
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
  }
`;