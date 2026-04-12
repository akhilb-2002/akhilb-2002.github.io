document.addEventListener('DOMContentLoaded', function() {
    (function () { // Converted from $(function() { ... }) to plain IIFE
      // Custom theme to match style of xterm.js logo
      var baseTheme = {
        foreground: '#F8F8F8',
        background: '#2D2E2C',
        selection: '#5DA5D533',
        black: '#1E1E1D',
        brightBlack: '#262625',
        red: '#CE5C5C',
        brightRed: '#FF7272',
        green: '#5BCC5B',
        brightGreen: '#72FF72',
        yellow: '#CCCC5B',
        brightYellow: '#FFFF72',
        blue: '#5D5DD3',
        brightBlue: '#7279FF',
        magenta: '#BC5ED1',
        brightMagenta: '#E572FF',
        cyan: '#5DA5D5',
        brightCyan: '#72F0FF',
        white: '#F8F8F8',
        brightWhite: '#FFFFFF'
      };
      // vscode-snazzy https://github.com/Tyriar/vscode-snazzy
      var otherTheme = {
        foreground: '#eff0eb',
        background: '#282a36',
        selection: '#97979b33',
        black: '#282a36',
        brightBlack: '#686868',
        red: '#ff5c57',
        brightRed: '#ff5c57',
        green: '#5af78e',
        brightGreen: '#5af78e',
        yellow: '#f3f99d',
        brightYellow: '#f3f99d',
        blue: '#57c7ff',
        brightBlue: '#57c7ff',
        magenta: '#ff6ac1',
        brightMagenta: '#ff6ac1',
        cyan: '#9aedfe',
        brightCyan: '#9aedfe',
        white: '#f1f1f0',
        brightWhite: '#eff0eb'
      };
      var isBaseTheme = true;

      function start() {
        if (!window.Terminal) {
          console.error('Terminal library not loaded');
          return;
        }
        var container = document.querySelector('.demo .inner') || document.getElementById('terminal');
        if (!container) {
          container = document.createElement('div');
          container.id = 'terminal';
          document.body.appendChild(container);
        }
        var term = new window.Terminal({
          fontFamily: '"Cascadia Code", Menlo, monospace',
          theme: baseTheme,
          cursorBlink: true,
          allowProposedApi: true
        });
        term.open(container);

        var isWebglEnabled = false;
        if (window.WebglAddon && window.WebglAddon.WebglAddon) {
          try {
            const webgl = new window.WebglAddon.WebglAddon();
            term.loadAddon(webgl);
            isWebglEnabled = true;
          } catch (e) {
            console.warn('WebGL addon failed', e);
          }
        }

        // Cancel wheel events from scrolling the page if the terminal has scrollback
        const xtermEl = document.querySelector('.xterm');
        if (xtermEl) {
          xtermEl.addEventListener('wheel', e => {
            if (term.buffer.active.baseY > 0) e.preventDefault();
          });
        }

        // function runFakeTerminal() {
        //   if (term._initialized) return;
        //   term._initialized = true;
        //   term.prompt = () => { term.write('\r\n$ '); };
        //   term.writeln([
        //     '    Xterm.js is the frontend component that powers many terminals including',
        //     '                           \x1b[3mVS Code\x1b[0m, \x1b[3mHyper\x1b[0m and \x1b[3mTheia\x1b[0m!',
        //     '',
        //     ' ┌ \x1b[1mFeatures\x1b[0m ──────────────────────────────────────────────────────────────────┐',
        //     ' │                                                                            │',
        //     ' │  \x1b[31;1mApps just work                         \x1b[32mPerformance\x1b[0m                        │',
        //     ' │   Xterm.js works with most terminal      Xterm.js is fast and includes an  │',
        //     ' │   apps like bash, vim and tmux           optional \x1b[3mWebGL renderer\x1b[0m           │',
        //     ' │                                                                            │',
        //     ' │  \x1b[33;1mAccessible                             \x1b[34mSelf-contained\x1b[0m                     │',
        //     ' │   A screen reader mode is available      Zero external dependencies        │',
        //     ' │                                                                            │',
        //     ' │  \x1b[35;1mUnicode support                        \x1b[36mAnd much more...\x1b[0m                   │',
        //     ' │   Supports CJK 語 and emoji \u2764\ufe0f            \x1b[3mLinks\x1b[0m, \x1b[3mthemes\x1b[0m, \x1b[3maddons\x1b[0m,            │',
        //     ' │                                          \x1b[3mtyped API\x1b[0m, \x1b[3mdecorations\x1b[0m            │',
        //     ' │                                                                            │',
        //     ' └────────────────────────────────────────────────────────────────────────────┘',
        //     ''
        //   ].join('\n\r'));
        //   term.writeln('Below is a simple emulated backend, try running `help`.');
        //   addDecoration(term);
        //   prompt(term);
        //   term.onData(e => {
        //     switch (e) {
        //       case '\u0003': term.write('^C'); prompt(term); break; // Ctrl+C
        //       case '\r': runCommand(term, command); command=''; break; // Enter
        //       case '\u007F': // Backspace
        //         if (term._core.buffer.x > 2) {
        //           term.write('\b \b');
        //           if (command.length) command = command.slice(0, -1);
        //         }
        //         break;
        //       default:
        //         if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
        //           command += e; term.write(e);
        //         }
        //     }
        //   });
        //   term.registerLinkProvider({
        //     provideLinks(bufferLineNumber, callback) {
        //       switch (bufferLineNumber) {
        //         case 2:
        //           callback([
        //             {
        //               text: 'VS Code',
        //               range: { start: { x: 28, y: 2 }, end: { x: 34, y: 2 } },
        //               activate() {
        //                 window.open('https://github.com/microsoft/vscode', '_blank');
        //               }
        //             },
        //             {
        //               text: 'Hyper',
        //               range: { start: { x: 37, y: 2 }, end: { x: 41, y: 2 } },
        //               activate() {
        //                 window.open('https://github.com/vercel/hyper', '_blank');
        //               }
        //             },
        //             {
        //               text: 'Theia',
        //               range: { start: { x: 47, y: 2 }, end: { x: 51, y: 2 } },
        //               activate() {
        //                 window.open('https://github.com/eclipse-theia/theia', '_blank');
        //               }
        //             }
        //           ]);
        //           return;
        //         case 8:
        //           callback([
        //             {
        //               text: 'WebGL renderer',
        //               range: { start: { x: 54, y: 8 }, end: { x: 67, y: 8 } },
        //               activate() {
        //                 window.open('https://npmjs.com/package/xterm-addon-webgl', '_blank');
        //               }
        //             }
        //           ]);
        //           return;
        //         case 14:
        //           callback([
        //             {
        //               text: 'Links',
        //               range: { start: { x: 45, y: 14 }, end: { x: 49, y: 14 } },
        //               activate() {
        //                 window.alert('You can handle links any way you want');
        //               }
        //             },
        //             {
        //               text: 'themes',
        //               range: { start: { x: 52, y: 14 }, end: { x: 57, y: 14 } },
        //               activate() {
        //                 isBaseTheme = !isBaseTheme;
        //                 term.options.theme = isBaseTheme ? baseTheme : otherTheme;
        //                 document.querySelector('.demo .inner').classList.toggle('other-theme', !isBaseTheme);
        //                 term.write(`\r\nActivated ${isBaseTheme ? 'xterm.js' : 'snazzy'} theme`);
        //                 prompt(term);
        //               }
        //             },
        //             {
        //               text: 'addons',
        //               range: { start: { x: 60, y: 14 }, end: { x: 65, y: 14 } },
        //               activate() {
        //                 window.open('/docs/guides/using-addons/', '_blank');
        //               }
        //             }
        //           ]);
        //           return;
        //         case 15: callback([
        //           {
        //             text: 'typed API',
        //             range: { start: { x: 45, y: 15 }, end: { x: 53, y: 15 } },
        //             activate() {
        //               window.open('https://github.com/xtermjs/xterm.js/blob/master/typings/xterm.d.ts', '_blank');
        //             }
        //           },
        //           {
        //             text: 'decorations',
        //             range: { start: { x: 56, y: 15 }, end: { x: 66, y: 15 } },
        //             activate() {
        //               window.open('https://github.com/xtermjs/xterm.js/blob/a351f5758a5126308b90d60b604b528462f6f051/typings/xterm.d.ts#L372', '_blank');
        //             }
        //           },
        //         ]);
        //           return;
        //       }
        //       callback(undefined);
        //     }
        //   });
        // }

        function prompt(term) { command=''; term.write('\r\n$ '); }
        var command='';
        var commands = {
          help: {
            f: () => { term.writeln('Available: ' + Object.keys(commands).join(', ')); prompt(term); },
            description: 'Show help'
          },
          ls: { f: () => { term.writeln(['a','bunch','of','fake','files'].join('\r\n')); term.prompt(); }, description: 'List files' }
          // ...existing code for other commands if needed...
        };
        function runCommand(term, text) {
          const name = text.trim().split(' ')[0];
          if (name) {
            term.writeln('');
            if (commands[name]) { commands[name].f(); return; }
            term.writeln(name + ': command not found');
          }
          prompt(term);
        }
        // runFakeTerminal();
      }
      if (window.Terminal) {
        start();
      } else {
        document.addEventListener('terminal-loaded', start);
      }
    })();
  });
