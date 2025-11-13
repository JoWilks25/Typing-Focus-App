import { ThemeProvider } from 'styled-components';
import { useAppStore } from './stores/AppStore';
import { getTheme } from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';


function App(): React.JSX.Element {
  const themePreference = useAppStore((state) => state.theme);
  const theme = getTheme(themePreference);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div>What's up?</div>
    </ThemeProvider>
  );
}

export default App;

