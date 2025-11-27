import { createGlobalStyle } from 'styled-components';

// Theme-dependent styles that can re-render
export const GlobalStyles = createGlobalStyle`
  /* Optional: Add any base resets or global styles here */
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${props => props.theme.fonts.sans};
  }
`;