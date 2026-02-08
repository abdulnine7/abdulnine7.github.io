/* global $, localStorage */

class Shell {
  constructor(term, commands) {
    this.commands = commands;
    this.setupListeners(term);
    this.term = term;
    this.lastSuggestions = '';

    localStorage.directory = 'home';
    localStorage.history = JSON.stringify('');
    localStorage.historyIndex = -1;
    localStorage.inHistory = false;

    $('.input').focus();
  }

  setupListeners(term) {
    $('#terminal').mouseup(() => $('.input').last().focus());

    const focusEnd = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };

    const commonPrefix = (items) => {
      if (!items || items.length === 0) return '';
      let prefix = items[0];
      for (let i = 1; i < items.length; i += 1) {
        while (items[i].indexOf(prefix) !== 0) {
          prefix = prefix.slice(0, -1);
          if (!prefix) return '';
        }
      }
      return prefix;
    };

    const applyCompletion = (inputEl, result, current) => {
      const matches = result && result.matches ? result.matches : [];
      if (matches.length === 0) return;

      const hasTrailingSpace = /\s$/.test(current);
      const trimmed = current.replace(/\s+$/, '');
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return;

      if (matches.length === 1) {
        if (!result.isArg) {
          parts[0] = matches[0];
        } else if (hasTrailingSpace) {
          parts.push(matches[0]);
        } else {
          parts[parts.length - 1] = matches[0];
        }
        $(inputEl).text(`${parts.join(' ')}`);
        focusEnd(inputEl);
      } else {
        const prefix = commonPrefix(matches);
        const currentToken = hasTrailingSpace ? '' : parts[parts.length - 1];
        if (prefix && prefix.length > currentToken.length) {
          if (!result.isArg) {
            parts[0] = prefix;
          } else if (hasTrailingSpace) {
            parts.push(prefix);
          } else {
            parts[parts.length - 1] = prefix;
          }
          $(inputEl).text(`${parts.join(' ')}`);
          focusEnd(inputEl);
          return;
        }
        const key = matches.join('|');
        if (this.lastSuggestions !== key) {
          this.term.insertAdjacentHTML('beforeend', `<p>${matches.join('   ')}</p>`);
          this.lastSuggestions = key;
        }
        $(inputEl).focus();
      }
    };

    document.addEventListener(
      'keydown',
      (evt) => {
        const isTab = evt.key === 'Tab' || evt.keyCode === 9;
        if (!isTab) return;
        const target = evt.target;
        const inputEl = target && target.closest ? target.closest('.input') : null;
        if (!inputEl) return;
        evt.preventDefault();

        const current = inputEl.textContent;
        if (typeof window.getCompletions === 'function') {
          const result = window.getCompletions(current, localStorage.directory);
          applyCompletion(inputEl, result, current);
        }
      },
      true
    );

    term.addEventListener('keyup', (evt) => {
      const keyUp = 38;
      const keyDown = 40;
      const key = evt.keyCode;

      if ([keyUp, keyDown].includes(key)) {
        let history = localStorage.history;
        history = history ? Object.values(JSON.parse(history)) : [];

        if (key === keyUp) {
          if (history.length > 0) {
            if (localStorage.inHistory == 'false') {
              localStorage.inHistory = true;
              localStorage.historyIndex = history.length - 1;
            } else if (localStorage.historyIndex > 0) {
              localStorage.historyIndex -= 1;
            }
            const inputEl = $('.input').last();
            inputEl.text(history[localStorage.historyIndex]);
            focusEnd(inputEl[0]);
          }
        } else if (key === keyDown) {
          if (localStorage.inHistory == 'true') {
            if (localStorage.historyIndex < history.length - 1) {
              localStorage.historyIndex += 1;
              const inputEl = $('.input').last();
              inputEl.text(history[localStorage.historyIndex]);
              focusEnd(inputEl[0]);
            } else {
              localStorage.inHistory = false;
              localStorage.historyIndex = history.length - 1;
              $('.input').last().html('<span class="end"><span>');
            }
          }
        }
        evt.preventDefault();
        $('.end').focus();
      }
    });

    term.addEventListener('keydown', (evt) => {
      // Keydown legend:
      // 9 -> Tab key.
      // 27 -> Escape key.
      // 8 -> Backspace key.
      // 46 -> Delete key.

      if (evt.keyCode === 9) {
        evt.preventDefault();
        const prompt = evt.target;
        const current = prompt.textContent;
        if (typeof window.getCompletions === 'function') {
          const result = window.getCompletions(current, localStorage.directory);
          applyCompletion(prompt, result, current);
        }
      } else if (evt.keyCode === 27) {
        $('.terminal-window').toggleClass('fullscreen');
      } else if (evt.keyCode === 8 || evt.keyCode === 46) {
        this.resetHistoryIndex();
      }
    });

    term.addEventListener('keypress', (evt) => {
      // Exclude these keys for Firefox, as they're fired for arrow/tab keypresses.
      if (![9, 27, 37, 38, 39, 40].includes(evt.keyCode)) {
        // If input keys are pressed then resetHistoryIndex() is called.
        this.resetHistoryIndex();
      }
      
      // if (evt.keyCode == 0 || evt.keyCode == 229) { //for android chrome keycode fix
      //   evt.keyCode = this.value.charCodeAt(this.value.length - 1);
      //   alert(evt.keyCode);
      // }
      if (evt.keyCode === 13) {
        const prompt = evt.target;
        const input = prompt.textContent.trim().split(' ');
        const cmd = input[0].toLowerCase();
        const args = input[1];

        if (!cmd) {
          this.resetPrompt(term, prompt);
          this.setPromptPrefix(localStorage.directory);
        } else if (cmd === 'clear') {
          this.updateHistory(cmd);
          this.clearConsole();
        } else if (cmd && cmd in this.commands) {
          this.runCommand(cmd, args);
          this.resetPrompt(term, prompt);
          this.setPromptPrefix(localStorage.directory);
        } else {
          this.updateHistory(cmd + (args ? ` ${args}` : ''));
          this.term.innerHTML += 'Error: command not recognized';
          this.resetPrompt(term, prompt);
        }
        evt.preventDefault();
        $("#terminal").scrollTop(9999999999999999);
      }
    });
  }

  runCommand(cmd, args) {
    const command = args ? `${cmd} ${args}` : cmd;
    this.updateHistory(command);

    const output = this.commands[cmd](args);
    if (output) {
      this.term.innerHTML += output;
    }
  }

  setPromptPrefix(directory){
    if(directory == "home"){
      $('.dir').last().html("~");
    } else if(directory == "skills"){
      $('.dir').last().html("~/" + directory);
    }
  }

  resetPrompt(term, prompt) {
    // console.log(prompt);
    const newPrompt = prompt.parentNode.cloneNode(true);
    prompt.setAttribute('contenteditable', false);

    if (this.prompt) {
      newPrompt.querySelector('.prompt').textContent = this.prompt;
    }

    term.appendChild(newPrompt);
    newPrompt.querySelector('.input').innerHTML = '';
    newPrompt.querySelector('.input').focus();
  }

  resetHistoryIndex() {
    let history = localStorage.history;

    history = history ? Object.values(JSON.parse(history)) : [];
    if (localStorage.goingThroughHistory == true) {
      localStorage.goingThroughHistory = false;
    }

    if (history.length == 0) {
      localStorage.historyIndex = -1;
    } else {
      localStorage.historyIndex = history.length - 1 > 0 ? history.length - 1 : 0;
    }
  }

  updateHistory(command) {
    let history = localStorage.history;
    history = history ? Object.values(JSON.parse(history)) : [];

    history.push(command);
    localStorage.history = JSON.stringify(history);
    localStorage.historyIndex = history.length - 1;
  }

  clearConsole() {
    const getDirectory = () => localStorage.directory;
    var dir = "";
    if(getDirectory() != "home") {
      dir = "/" + getDirectory();
    }

    $('#terminal').html(
      `<p class="hidden">
          <span class="prompt">
            <strong class="home">abdul@linuxy.us</strong>
            <strong class="white">:</strong>
            <strong class="dir">~${dir}</strong>
            <strong class="white">$</strong>
          </span>
          <span contenteditable="true" class="input"></span>
        </p>`,
    );

    $('.input').focus();
  }
}
