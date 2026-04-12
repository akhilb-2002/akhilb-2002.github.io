// enhanced-terminal.js
// Sample script to extend xterm.js with simple commands

// Define two themes (reuse from your demo.js if present)
const baseTheme = {
  foreground: '#F8F8F8', background: '#2D2E2C', selection: '#5DA5D533',
  black: '#1E1E1D', brightBlack: '#262625', red: '#CE5C5C', brightRed: '#FF7272',
  green: '#5BCC5B', brightGreen: '#72FF72', yellow: '#CCCC5B', brightYellow: '#FFFF72',
  blue: '#5D5DD3', brightBlue: '#7279FF', magenta: '#BC5ED1', brightMagenta: '#E572FF',
  cyan: '#5DA5D5', brightCyan: '#72F0FF', white: '#F8F8F8', brightWhite: '#FFFFFF'
};
const otherTheme = {
  foreground: '#eff0eb', background: '#282a36', selection: '#97979b33', black: '#282a36', brightBlack: '#686868',
  red: '#ff5c57', brightRed: '#ff5c57', green: '#5af78e', brightGreen: '#5af78e', yellow: '#f3f99d', brightYellow: '#f3f99d',
  blue: '#57c7ff', brightBlue: '#57c7ff', magenta: '#ff6ac1', brightMagenta: '#ff6ac1', cyan: '#9aedfe', brightCyan: '#9aedfe',
  white: '#f1f1f0', brightWhite: '#eff0eb'
};

function initEnhancedTerminal() {
  if (!window.Terminal) {
    console.error('xterm.js not loaded');
    return;
  }

  const term = new Terminal({
    theme: baseTheme,
    fontFamily: 'Cascadia Code, Menlo, monospace',
    cursorBlink: true,
    cols: 100,
    rows: 28
  });

  // Attach to existing #terminal element or create it
  let container = document.getElementById('terminal');
  if (!container) {
    container = document.createElement('div');
    container.id = 'terminal';
    (document.body || document.documentElement).appendChild(container);
  }
  term.open(container);

  let currentTheme = 'base';
  let input = '';
  const promptLabel = '$ ';

  const commands = {
    help() {
      return 'Commands: help, echo, clear, date, theme, ls, about';
    },
    echo(rest) {
      return rest.join(' ');
    },
    clear() {
      term.clear();
      return '';
    },
    date() {
      return new Date().toString();
    },
    theme() {
      currentTheme = currentTheme === 'base' ? 'other' : 'base';
      term.options.theme = currentTheme === 'base' ? baseTheme : otherTheme;
      return 'Switched theme to ' + currentTheme;
    },
    ls() {
      return 'apps\nprojects\nnotes';
    },
    about() {
      return 'Sample enhanced terminal demo.';
    }
  };

  function prompt() {
    term.write('\r\n' + promptLabel);
  }

  function run(line) {
    const parts = line.trim().split(/\s+/);
    const name = parts[0];
    const rest = parts.slice(1);
    if (!name) return;
    const cmd = commands[name];
    if (cmd) {
      const out = cmd(rest) || '';
      if (out) term.write('\r\n' + out.replace(/\n/g, '\r\n'));
    } else {
      term.write(`\r\nCommand not found: ${name}`);
    }
  }

  term.write('Enhanced xterm demo. Type \'help\'.');
  prompt();

  term.onKey(e => {
    const { key, domEvent: ev } = e;
    if (ev.key === 'Backspace') {
      if (input.length > 0) {
        // Move cursor back, erase char, move cursor back again
        term.write('\b \b');
        input = input.slice(0, -1);
      }
      return;
    }
    if (ev.key === 'Enter') {
      run(input);
      input = '';
      prompt();
      return;
    }
    if (ev.key === 'c' && ev.ctrlKey) { // Ctrl+C
      term.write('^C');
      input = '';
      prompt();
      return;
    }
    // Printable
    if (key && !ev.altKey && !ev.metaKey && !ev.ctrlKey) {
      term.write(key);
      input += key;
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedTerminal);
} else {
  initEnhancedTerminal();
}
