import { createContext, useEffect, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import GlobalStyle from "./components/styles/GlobalStyle";
import Terminal from "./components/Terminal";

export const themeContext = createContext<
  ((switchTheme: DefaultTheme) => void) | null
>(null);

function App() {
  // themes
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  // Disable browser's default behavior
  // to prevent the page go up when Up Arrow is pressed
  useEffect(() => {
    window.addEventListener(
      "keydown",
      e => {
        if (["ArrowUp", "ArrowDown"].indexOf(e.code) > -1) {
          e.preventDefault();
        }
      },
      false
    );
  }, []);

  useEffect(() => {
    if (themeLoaded) {
      setSelectedTheme(theme);
    }
  }, [themeLoaded, theme]);

  // Update meta tag colors when switching themes
  useEffect(() => {
    const themeColor = theme.colors?.body;
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    const maskIcon = document.querySelector("link[rel='mask-icon']");
    const metaMsTileColor = document.querySelector("meta[name='msapplication-TileColor']");

    if (metaThemeColor && themeColor) metaThemeColor.setAttribute("content", themeColor);
    if (metaMsTileColor && themeColor) metaMsTileColor.setAttribute("content", themeColor);
    if (maskIcon && themeColor) maskIcon.setAttribute("color", themeColor);
  }, [selectedTheme, theme.colors?.body]);

  const themeSwitcher = (switchTheme: DefaultTheme) => {
    setSelectedTheme(switchTheme);
    setMode(switchTheme);
  };

  return (
    <div className="terminal-scope w-full h-full overflow-hidden">
      <h1 className="sr-only" aria-label="Terminal Portfolio">Terminal Portfolio</h1>
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle />
          <div className="terminal-inner h-full w-full overflow-y-auto">
            <themeContext.Provider value={themeSwitcher}>
              <Terminal />
            </themeContext.Provider>
          </div>
        </ThemeProvider>
      )}
    </div>
  );
}

export default App;
