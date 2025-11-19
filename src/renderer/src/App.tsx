import { ThemeProvider } from 'styled-components';
import { useAppStore } from './stores/AppStore';
import { getTheme, THEME_LIGHT, THEME_DARK, THEME_SYSTEM, ThemePreference } from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';
import {
  AppContainer,
  Navigation,
  NavContent,
  NavButtons,
  NavButton,
  ThemeDropdown,
  MainContent,
  Footer,
} from './App.styles';
import { useEffectiveTheme } from './hooks/useEffectiveTheme';
import Versions from './components/Versions';
import { Editor } from './screens/Editor/Editor';
import { useState } from 'react';
import { AppTitleSection } from './components/AppTitleSection';


function App(): React.JSX.Element {
  // THEMING
  const themePreference = useAppStore((state) => state.theme);
  const effectiveTheme = useEffectiveTheme(themePreference);
  const theme = getTheme(themePreference);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value as ThemePreference;
    useAppStore.getState().setTheme(newTheme);
  }

  // VIEWS
  const [currentView, setCurrentView] = useState('editor')

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppContainer>
        <Navigation>
          <NavContent>
            {/* Title on the left */}
            <AppTitleSection effectiveTheme={effectiveTheme} />

            {/* Navigation buttons on the right */}
            <NavButtons>
              <ThemeDropdown
                value={themePreference}
                onChange={handleThemeChange}
                title="Select theme"
              >
                <option value={THEME_LIGHT}>☀️ Light</option>
                <option value={THEME_DARK}>🌙 Dark</option>
                <option value={THEME_SYSTEM}>💻 System</option>
              </ThemeDropdown>
              <NavButton
                // onClick={() => handleViewChange('editor')}
                // $isActive={currentView === 'editor'}
                title="Editor View"
              >
                Editor View
              </NavButton>
            </NavButtons>
          </NavContent>
        </Navigation>


        {/* Main Content */}
        <MainContent>
          {currentView === 'editor' && <Editor />}
          {/* {currentView === 'dashboard' && <Dashboard />} */}
          {/* {currentView === 'session-summary' && <SessionSummary />} */}
        </MainContent>

        {/* Footer with Versions */}
        <Footer>
          <Versions />
        </Footer>


      </AppContainer>
    </ThemeProvider>
  );
}

export default App;

