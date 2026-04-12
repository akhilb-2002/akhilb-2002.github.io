document.addEventListener('DOMContentLoaded', function () {
  const term = new Terminal({
    cursorBlink: true,
    fontFamily: 'monospace',
    theme: {
      background: '#000000',
      foreground: '#ffffff'
    }
  });
  const fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);

  const container = document.getElementById('terminal');
  term.open(container);

  fitAddon.fit();
  window.addEventListener('resize', () => fitAddon.fit());

  let currentLine = '';
  const prompt = '$ ';

  function writePrompt() {
    currentLine = '';
    term.write('\r\n' + prompt);
  }

  term.writeln('Welcome to the terminal!');
  term.writeln('Type "help" for a list of commands.');
  writePrompt();

  const commands = {
    help: 'Available commands: help, date, clear',
    date: new Date().toLocaleString(),
    clear: ''
  };

  term.onKey(({ key, domEvent }) => {
    if (domEvent.key === 'Enter') {
      if (currentLine) {
        term.writeln(''); // Move to the next line before showing output
        const command = currentLine.trim();
        if (command === 'clear') {
          term.clear();
        } else if (commands[command]) {
          term.writeln(commands[command]);
        } else {
          term.writeln(`command not found: ${command}`);
        }
      }
      writePrompt();
    } else if (domEvent.key === 'Backspace') {
      if (currentLine.length > 0) {
        term.write('\b \b');
        currentLine = currentLine.slice(0, -1);
      }
    } else if (!domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
      term.write(key);
      currentLine += key;
    }
  });
});
