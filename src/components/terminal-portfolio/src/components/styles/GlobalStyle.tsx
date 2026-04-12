import { createGlobalStyle, DefaultTheme } from "styled-components";
import { normalize } from "styled-normalize";

/* All global adjustments are now scoped under .terminal-scope to avoid impacting the host page */
const GlobalStyle = createGlobalStyle<{ theme: DefaultTheme }>`
  .terminal-scope { ${normalize}; }

  .terminal-scope, .terminal-scope * , .terminal-scope *::before, .terminal-scope *::after {
    box-sizing: border-box;
  }

  .terminal-scope {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    background-color: ${({ theme }) => theme.colors?.body};
    color: ${({ theme }) => theme.colors?.text[100]};
  }

  .terminal-scope blockquote, .terminal-scope dl, .terminal-scope dd,
  .terminal-scope h1, .terminal-scope h2, .terminal-scope h3, .terminal-scope h4,
  .terminal-scope h5, .terminal-scope h6, .terminal-scope hr, .terminal-scope figure,
  .terminal-scope p, .terminal-scope pre { margin: 0; }

  .terminal-scope h1, .terminal-scope h2, .terminal-scope h3, .terminal-scope h4, .terminal-scope h5, .terminal-scope h6 { font-size: inherit; font-weight: inherit; }

  .terminal-scope img, .terminal-scope svg, .terminal-scope video, .terminal-scope canvas,
  .terminal-scope audio, .terminal-scope iframe, .terminal-scope embed, .terminal-scope object { display: block; }

  /* Scrollbar only inside terminal */
  .terminal-scope ::-webkit-scrollbar { width: 12px; }
  .terminal-scope ::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors?.body}; }
  .terminal-scope ::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors?.scrollHandle}; }
  .terminal-scope ::-webkit-scrollbar-thumb:hover { background: ${({ theme }) => theme.colors?.scrollHandleHover}; }

  .terminal-scope input[type=text] {
    background-color: ${({ theme }) => theme.colors?.body};
    color: ${({ theme }) => theme.colors?.text[100]};
    caret-color: ${({ theme }) => theme.colors?.primary};
  }
  .terminal-scope input[type=text]:focus-visible { outline: none; }

  .terminal-scope .sr-only {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;

export default GlobalStyle;
