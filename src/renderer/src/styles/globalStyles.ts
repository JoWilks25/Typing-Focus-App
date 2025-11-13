import { createGlobalStyle } from 'styled-components';
import dancingScriptRegular from '../assets/fonts/DancingScript-Regular.ttf';
import dancingScriptMedium from '../assets/fonts/DancingScript-Medium.ttf';
import dancingScriptSemiBold from '../assets/fonts/DancingScript-SemiBold.ttf';
import dancingScriptBold from '../assets/fonts/DancingScript-Bold.ttf';

export const GlobalStyles = createGlobalStyle`
  /* Define Dancing Script font locally */
  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(${dancingScriptRegular}) format('truetype');
  }

  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url(${dancingScriptMedium}) format('truetype');
  }

  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url(${dancingScriptSemiBold}) format('truetype');
  }

  @font-face {
    font-family: 'Dancing Script';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url(${dancingScriptBold}) format('truetype');
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