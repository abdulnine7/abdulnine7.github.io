/* ============================================================
   Terminal Engine — abdulnine7.github.io
   Replaces shell.js + cli.js with an enhanced Ubuntu-style terminal.
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // FILESYSTEM
  // ============================================================
  const FS = { '/': { type: 'dir', children: {}, perm: 'drwxr-xr-x', owner: 'root', size: 4096 } };

  function fsMkdir(path, system) {
    const parts = path.split('/').filter(Boolean);
    let node = FS['/'];
    for (const p of parts) {
      if (!node.children[p]) {
        node.children[p] = { type: 'dir', children: {}, perm: 'drwxr-xr-x', owner: system ? 'root' : 'user', size: 4096, mtime: new Date() };
      }
      node = node.children[p];
    }
    return node;
  }

  function fsWriteFile(path, content, system) {
    const parent = fsGet(fsParent(path));
    if (!parent) return false;
    const name = fsBasename(path);
    const isExec = name.endsWith('.sh');
    parent.children[name] = { type: 'file', content: content || '', perm: isExec ? '-rwxr-xr-x' : '-rw-r--r--', owner: system ? 'root' : 'user', size: (content || '').length, mtime: new Date() };
    return true;
  }

  function fsGet(path) {
    if (path === '/') return FS['/'];
    const parts = path.split('/').filter(Boolean);
    let node = FS['/'];
    for (const p of parts) {
      if (!node || node.type !== 'dir' || !node.children[p]) return null;
      node = node.children[p];
    }
    return node;
  }

  function fsParent(path) {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }

  function fsBasename(path) {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || '/';
  }

  function fsResolve(path, base) {
    if (path === '~') path = homePath;
    else if (path.startsWith('~/')) path = homePath + path.slice(1);
    if (!path.startsWith('/')) path = base + (base.endsWith('/') ? '' : '/') + path;
    const parts = path.split('/').filter(Boolean);
    const resolved = [];
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') { resolved.pop(); continue; }
      resolved.push(p);
    }
    return '/' + resolved.join('/');
  }

  function fsDelete(path) {
    const parent = fsGet(fsParent(path));
    const name = fsBasename(path);
    if (parent && parent.children[name]) { delete parent.children[name]; return true; }
    return false;
  }

  function fsCopy(src, dest) {
    const srcNode = fsGet(src);
    if (!srcNode) return false;
    if (srcNode.type === 'file') return fsWriteFile(dest, srcNode.content);
    fsMkdir(dest);
    const destNode = fsGet(dest);
    destNode.children = JSON.parse(JSON.stringify(srcNode.children));
    return true;
  }

  function fsInit() {
    var sysDirs = [
      '/home', '/etc', '/var', '/var/log', '/usr', '/usr/bin',
      '/tmp', '/proc', '/dev', '/bin', '/sbin', '/opt', '/root',
    ];
    sysDirs.forEach(function (p) { fsMkdir(p, true); });
    // System files
    var sysFiles = {
      '/etc/hostname': 'ubuntu-server',
      '/etc/os-release': 'PRETTY_NAME="Ubuntu 22.04.3 LTS"\nNAME="Ubuntu"\nVERSION_ID="22.04"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"',
      '/var/log/syslog': 'Mar 24 08:01:12 ubuntu-server systemd[1]: Started Daily apt upgrade.\nMar 24 08:02:30 ubuntu-server sshd[1337]: Accepted publickey for user\nMar 24 08:10:45 ubuntu-server systemd[1]: Started Coffee Brewing Service.\nMar 24 08:15:00 ubuntu-server existential-crisis[4242]: Why am I a log file?',
    };
    for (var p in sysFiles) fsWriteFile(p, sysFiles[p], true);
  }

  function fsInitHome(user, home) {
    var homeDirs = [
      home, home + '/Desktop', home + '/Documents', home + '/Downloads', home + '/IMPORTANT', home + '/IMPORTANT/skills',
    ];
    homeDirs.forEach(function (p) { fsMkdir(p, true); });
    var homeFiles = {};
    homeFiles[home + '/Documents/notes.txt'] = 'Buy milk. Fix prod. Don\'t rm -rf again.\nRemember to water the plant that\'s been dead for 3 months.';
    homeFiles[home + '/Documents/secret.txt'] = 'If you\'re reading this... nice snooping \ud83d\udc40\n\nThe cake is a lie. The server is also a lie.';
    homeFiles[home + '/Downloads/definitely_not_virus.sh'] = '#!/bin/bash\necho \'just kidding\'\necho \'did you really run a file called definitely_not_virus.sh?\'';
    homeFiles[home + '/Desktop/TODO.md'] = '# TODO List\n\n- [x] Learn vim\n- [ ] Quit vim (day 347)\n- [ ] Touch grass\n- [ ] Stop saying "it works on my machine"';
    homeFiles[home + '/.bashrc'] = '# ~/.bashrc\nalias ll=\'ls -la\'\nalias please=\'sudo\'\nexport PATH="$HOME/bin:$PATH"\nexport EDITOR=nano';
    homeFiles[home + '/.secret'] = '\ud83c\udf1f You found the secret file! \ud83c\udf1f\n\nThe Wi-Fi password is "incorrect".\nWhen someone asks, you can truthfully say "the password is incorrect."';
    for (var p in homeFiles) fsWriteFile(p, homeFiles[p], true);
    // Update /etc/passwd with correct user
    fsWriteFile('/etc/passwd', 'root:x:0:0:root:/root:/bin/bash\n' + user + ':x:1000:1000:' + user + ':' + home + ':/bin/bash', true);
  }

  // ============================================================
  // STATE
  // ============================================================
  var promptUser = 'user';
  var promptHost = 'ubuntu-server';
  var homePath = '/home/user';
  var cwd = '/home/user';
  var commandHistory = [];
  var historyIndex = -1;
  var interruptFlag = false;
  var runningProcess = null;
  var failedCount = 0;
  var emptyCount = 0;
  var sudoIdx = 0;
  var startTime = Date.now();
  var systemData = {};
  var aliases = { ll: 'ls -la', la: 'ls -a', '..': 'cd ..', please: 'sudo' };
  var envVars = { HOME: homePath, USER: promptUser, SHELL: '/bin/bash', LANG: 'en_US.UTF-8', TERM: 'xterm-256color', PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' };
  var termEl, outputEl, inputEl, promptEl, cursorTextEl, cursorEl;

  var themes = ['default', 'amber', 'green', 'mono'];
  var guiSections = ['about', 'education', 'skills', 'experience', 'projects', 'resume', 'contact'];

  var emptyQuips = [
    "I'm waiting...", "...", "*crickets*", "The void stares back.",
    "Enter is not a command, friend.", "*yawn*", "Pressing enter harder won't help.",
  ];

  var sudoResponses = [
    "Oh look at you, trying to be root. Nice try, smarty pants \ud83d\udd75\ufe0f",
    "sudo? SUDO?! In this economy?",
    "I'm sorry Dave, I'm afraid I can't do that.",
    "Root access denied. Have you tried turning yourself off and on again?",
    "Nice try. The password is definitely not 'password123'.",
    "This incident will be reported. (Just kidding, I can't report anything.)",
    "Permission denied. Maybe try asking nicely?",
    "You want root? In THIS terminal? Bold.",
  ];

  var fortunes = [
    "You will mass-delete production data today.",
    "Your next merge conflict will test your will to live.",
    "The bug you've been hunting is on line 42.",
    "Today is a good day to git push --force. (No. No it's not.)",
    "Your regex will work on the first try. (This fortune is a lie.)",
  ];

  var jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are only 10 types of people: those who understand binary and those who don't.",
    "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
    "Why do Java developers wear glasses? Because they can't C#.",
    "!false \u2014 It's funny because it's true.",
    "Why did the developer go broke? Because he used up all his cache.",
    "What's the object-oriented way to become wealthy? Inheritance.",
  ];

  var quotes = [
    '"Talk is cheap. Show me the code." \u2014 Linus Torvalds',
    '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." \u2014 Martin Fowler',
    '"It\'s not a bug; it\'s an undocumented feature." \u2014 Every developer ever',
    '"Deleted code is debugged code." \u2014 Jeff Sickel',
    '"Code is like humor. When you have to explain it, it\'s bad." \u2014 Cory House',
  ];

  // ============================================================
  // HELPERS
  // ============================================================
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function print(html, cls) {
    var line = document.createElement('div');
    if (cls) line.className = cls;
    line.innerHTML = html;
    outputEl.appendChild(line);
    scrollToBottom();
  }

  function printRaw(html) {
    var span = document.createElement('span');
    span.innerHTML = html;
    outputEl.appendChild(span);
    scrollToBottom();
  }

  function scrollToBottom() {
    termEl.scrollTop = termEl.scrollHeight;
  }

  function clearOutput() { outputEl.innerHTML = ''; }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function getPromptPath() {
    if (cwd === homePath) return '~';
    if (cwd.startsWith(homePath + '/')) return '~' + cwd.slice(homePath.length);
    return cwd;
  }

  function buildPromptHTML() {
    return '<span class="term-prompt-user">' + esc(promptUser) + '@' + esc(promptHost) + '</span>' +
      '<span class="term-prompt-sep">:</span>' +
      '<span class="term-prompt-path">' + esc(getPromptPath()) + '</span>' +
      '<span class="term-prompt-dollar">$ </span>';
  }

  function updatePrompt() {
    if (promptEl) promptEl.innerHTML = buildPromptHTML();
  }

  function addPromptLine(cmd) {
    print(buildPromptHTML() + esc(cmd));
  }

  // ============================================================
  // FIGLET
  // ============================================================
  var FIGLET = {
    A:[" ## ","#  #","####","#  #","#  #"], B:["### ","#  #","### ","#  #","### "],
    C:[" ## ","#  ","#  ","#  "," ## "], D:["### ","#  #","#  #","#  #","### "],
    E:["####","#   ","### ","#   ","####"], F:["####","#   ","### ","#   ","#   "],
    G:[" ## ","#   ","# ##","#  #"," ## "], H:["#  #","#  #","####","#  #","#  #"],
    I:["###"," # "," # "," # ","###"], J:["  ##","   #","   #","#  #"," ## "],
    K:["#  #","# # ","##  ","# # ","#  #"], L:["#   ","#   ","#   ","#   ","####"],
    M:["#   #","## ##","# # #","#   #","#   #"], N:["#   #","##  #","# # #","#  ##","#   #"],
    O:[" ## ","#  #","#  #","#  #"," ## "], P:["### ","#  #","### ","#   ","#   "],
    R:["### ","#  #","### ","# # ","#  #"], S:[" ###","#   "," ## ","   #","### "],
    T:["#####","  #  ","  #  ","  #  ","  #  "], U:["#  #","#  #","#  #","#  #"," ## "],
    V:["#   #","#   #"," # # "," # # ","  #  "], W:["#   #","#   #","# # #","## ##","#   #"],
    X:["#  #"," ## "," ## "," ## ","#  #"], Y:["#   #"," # # ","  #  ","  #  ","  #  "],
    Z:["####","  # "," #  ","#   ","####"], ' ':["    ","    ","    ","    ","    "],
    '!':["# ","# ","# ","  ","# "], '?':[" ## ","   #"," ## ","    "," #  "],
  };

  function figlet(text) {
    var u = text.toUpperCase(), lines = ['','','','',''];
    for (var i = 0; i < u.length; i++) {
      var ch = FIGLET[u[i]] || FIGLET['?'];
      for (var j = 0; j < 5; j++) lines[j] += ch[j] + ' ';
    }
    return lines.join('\n');
  }

  function cowsay(text) {
    var l = text.length;
    return ' ' + '_'.repeat(l + 2) + '\n< ' + text + ' >\n ' + '-'.repeat(l + 2) +
      '\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||';
  }

  function lolcat(text) {
    var colors = ['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff','#ff00ff'];
    var r = '', ci = 0;
    for (var i = 0; i < text.length; i++) {
      if (text[i] === '\n') { r += '\n'; continue; }
      r += '<span style="color:' + colors[ci % colors.length] + '">' + esc(text[i]) + '</span>';
      ci++;
    }
    return r;
  }

  function generateCal() {
    var now = new Date();
    var month = now.toLocaleString('en', { month: 'long' });
    var year = now.getFullYear();
    var firstDay = new Date(year, now.getMonth(), 1).getDay();
    var daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
    var today = now.getDate();
    var result = '     ' + month + ' ' + year + '\nSu Mo Tu We Th Fr Sa\n';
    var line = '   '.repeat(firstDay);
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = d < 10 ? ' ' + d : '' + d;
      if (d === today) line += '<span class="t-bold" style="background:#EEEEEC;color:#300a24;">' + ds + '</span> ';
      else line += ds + ' ';
      if ((firstDay + d) % 7 === 0) line += '\n';
    }
    return result + line;
  }

  function getUptime() {
    var ms = Date.now() - startTime + 86400000 * 3 + 7200000;
    var days = Math.floor(ms / 86400000);
    var hours = Math.floor((ms % 86400000) / 3600000);
    var mins = Math.floor((ms % 3600000) / 60000);
    var now = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
    return ' ' + now + ' up ' + days + ' days, ' + hours + ':' + String(mins).padStart(2, '0') + ',  1 user,  load average: 0.42, 0.69, 0.13';
  }

  // ============================================================
  // COMMAND PARSER
  // ============================================================
  function parseCommand(input) {
    input = input.trim();
    var firstWord = input.split(/\s+/)[0];
    if (aliases[firstWord]) input = aliases[firstWord] + input.slice(firstWord.length);
    return input;
  }

  function tokenize(input) {
    var tokens = [], current = '', inS = false, inD = false;
    for (var i = 0; i < input.length; i++) {
      var ch = input[i];
      if (ch === "'" && !inD) { inS = !inS; continue; }
      if (ch === '"' && !inS) { inD = !inD; continue; }
      if (ch === ' ' && !inS && !inD) { if (current) { tokens.push(current); current = ''; } continue; }
      current += ch;
    }
    if (current) tokens.push(current);
    return tokens;
  }

  function extractRedirect(input) {
    var append = false, file = null, cmd = input;
    var am = input.match(/^(.*?)\s*>>\s*(\S+)\s*$/);
    var wm = input.match(/^(.*?)\s*>\s*(\S+)\s*$/);
    if (am) { cmd = am[1]; file = am[2]; append = true; }
    else if (wm) { cmd = wm[1]; file = wm[2]; }
    return { cmd: cmd, file: file, append: append };
  }

  async function executeInput(rawInput) {
    if (!rawInput.trim()) {
      emptyCount++;
      if (emptyCount % 3 === 0) print(esc(emptyQuips[Math.floor(Math.random() * emptyQuips.length)]), 't-dim');
      return;
    }
    emptyCount = 0;
    commandHistory.push(rawInput);
    historyIndex = commandHistory.length;
    // localStorage history for backward compat
    try {
      var hist = JSON.parse(localStorage.history || '[]');
      if (!Array.isArray(hist)) hist = [];
      hist.push({ cmd: rawInput, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) });
      localStorage.history = JSON.stringify(hist);
    } catch (e) { /* ignore */ }

    var andParts = rawInput.split(/\s*&&\s*/);
    for (var a = 0; a < andParts.length; a++) {
      var pipeParts = andParts[a].split(/\s*\|\s*/);
      var pipeOutput = null;
      for (var i = 0; i < pipeParts.length; i++) {
        var redir = extractRedirect(pipeParts[i]);
        var parsed = parseCommand(redir.cmd);
        var result = await executeCommand(parsed, pipeOutput);
        if (redir.file) {
          var filePath = fsResolve(redir.file, cwd);
          var existing = fsGet(filePath);
          if (redir.append && existing && existing.type === 'file') {
            existing.content += (typeof result === 'string' ? result : '') + '\n';
            existing.size = existing.content.length;
          } else {
            fsWriteFile(filePath, (typeof result === 'string' ? result : '') + '\n');
          }
          pipeOutput = null;
        } else if (i < pipeParts.length - 1) {
          pipeOutput = typeof result === 'string' ? result : '';
        } else {
          pipeOutput = null;
        }
      }
    }
  }

  async function executeCommand(input, pipeInput) {
    var tokens = tokenize(input);
    if (tokens.length === 0) return '';
    var cmd = tokens[0];
    var args = tokens.slice(1);

    if (input === ':(){ :|:& };:') { print(esc("I see you googled 'how to crash linux'. Points for effort. Zero."), 't-warn'); return ''; }
    if (input.startsWith('rm -rf /') && !input.startsWith('rm -rf /home')) { print(esc("LOL absolutely not. I have self-preservation instincts, unlike you."), 't-error'); return ''; }

    var handler = commands[cmd];
    if (handler) { failedCount = 0; return await handler(args, pipeInput); }

    failedCount++;
    print('<span class="t-error">' + esc(cmd) + ': command not found. Did you mean something that actually exists?</span>');
    if (failedCount >= 3) { print(esc("Try typing 'help' to see available commands, genius."), 't-dim'); failedCount = 0; }
    return false;
  }

  // ============================================================
  // COMMANDS
  // ============================================================
  var commands = {};

  // --- Portfolio commands ---
  commands.whoami = function () {
    var data = window.profileData;
    if (data && data.about) {
      print('<strong>' + esc(data.about.name) + '</strong> \u2014 ' + esc(data.about.headline));
    } else {
      print(esc(promptUser + ' (but existentially, who is any of us really?)'));
    }
    return promptUser;
  };

  commands.stats = function () {
    var data = window.profileData;
    if (!data || !data.about) { print('<span class="gray">Profile not loaded yet.</span>'); return ''; }
    var topSkills = (data.skills && data.skills.proficient) ? data.skills.proficient.slice(0, 5).join(', ') : 'N/A';
    print('<strong>Projects:</strong> ' + (data.projects ? data.projects.length : 0));
    print('<strong>Experience:</strong> ' + (data.experience ? data.experience.length : 0));
    print('<strong>Education:</strong> ' + (data.education ? data.education.length : 0));
    print('<strong>Top skills:</strong> ' + esc(topSkills));
    print('<strong>Domain:</strong> ' + esc(data.site ? data.site.domain : ''));
    return '';
  };

  commands.gui = function () {
    if (typeof window.showWindowById === 'function') { window.showWindowById('gui'); return null; }
    print('<span class="gray">GUI unavailable.</span>');
    return '';
  };

  commands.open = function (args) {
    var target = args[0] ? args[0].trim().toLowerCase() : '';
    if (!target || guiSections.indexOf(target) === -1) {
      print('Usage: open ' + guiSections.join(' | '));
      return '';
    }
    if (typeof window.showWindowById === 'function') window.showWindowById('gui');
    if (typeof window.showSection === 'function') { window.showSection(target); return null; }
    print('<span class="gray">GUI section unavailable.</span>');
    return '';
  };

  commands.login = function () {
    var now = new Date();
    var lastLogin = new Date(Date.now() - 3600000 * 2);
    var updates = Math.floor(Math.random() * 50 + 10);
    var secUpdates = Math.floor(Math.random() * 10 + 1);
    var lastIP = '192.168.1.' + Math.floor(Math.random() * 254 + 1);
    var banner =
      '<span class="t-bright">Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)</span>\n\n' +
      ' * Documentation:  https://help.ubuntu.com\n' +
      ' * Management:     https://landscape.canonical.com\n' +
      ' * Support:        https://ubuntu.com/advantage\n\n' +
      '  System information as of ' + now.toUTCString() + '\n\n' +
      '  System load:  0.42               Processes:             142\n' +
      '  Usage of /:   64.2% of 234.5GB   Users logged in:       1\n' +
      '  Memory usage: 38%                IPv4 address for eth0: 192.168.1.42\n' +
      '  Swap usage:   6%                 IPv4 address for eth1: 10.0.0.42\n\n' +
      ' * ' + updates + ' updates can be applied immediately.\n' +
      ' * ' + secUpdates + ' of these updates are security updates.\n\n' +
      'Last login: ' + lastLogin.toString().replace(/\s*\(.*\)/, '') + ' from ' + lastIP + '\n';
    print(banner);
    return null;
  };

  // --- cat: portfolio files + filesystem ---
  commands.cat = function (args, pipeInput) {
    if (args.length === 0 && pipeInput) { print(esc(pipeInput)); return pipeInput; }
    if (args.length === 0) { print('<span class="t-error">cat: missing file operand</span>'); return false; }
    var target = args[0];
    if (target === '/dev/urandom') {
      return new Promise(async function (resolve) {
        runningProcess = 'cat';
        var chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~0123456789abcdef';
        for (var i = 0; i < 30; i++) {
          if (interruptFlag) break;
          var line = '';
          for (var j = 0; j < 60; j++) line += chars[Math.floor(Math.random() * chars.length)];
          print(esc(line));
          await sleep(50);
        }
        runningProcess = null;
        if (!interruptFlag) print(esc("\nokay I'm bored"), 't-dim');
        interruptFlag = false;
        resolve('');
      });
    }
    // Try portfolio files first
    var clean = target.replace(/\.txt$/, '');
    if (systemData[clean]) { print(systemData[clean]); return ''; }
    // Try filesystem
    var path = fsResolve(target, cwd);
    var node = fsGet(path);
    if (!node) { print('<span class="t-error">cat: ' + esc(target) + ': No such file or directory</span>'); return false; }
    if (node.type === 'dir') { print('<span class="t-error">cat: ' + esc(target) + ': Is a directory</span>'); return false; }
    print(esc(node.content));
    return node.content;
  };

  // --- ls: shows portfolio structure + filesystem ---
  commands.ls = function (args) {
    var showAll = false, showLong = false;
    var targetArg = null;
    for (var i = 0; i < args.length; i++) {
      if (args[i].startsWith('-')) {
        if (args[i].indexOf('a') !== -1) showAll = true;
        if (args[i].indexOf('l') !== -1) showLong = true;
      } else {
        targetArg = args[i];
      }
    }
    var targetPath = targetArg ? fsResolve(targetArg, cwd) : cwd;
    var node = fsGet(targetPath);
    if (!node || node.type !== 'dir') {
      print('<span class="t-error">ls: cannot access \'' + esc(targetArg || '') + '\': No such file or directory</span>');
      return false;
    }
    var entries = Object.keys(node.children).sort();
    if (!showAll) entries = entries.filter(function (e) { return !e.startsWith('.'); });
    if (showAll) entries = ['.', '..'].concat(entries);
    if (entries.length === 0) return '';
    var lines = [];
    if (showLong) {
      print('total ' + entries.length * 4);
      for (var j = 0; j < entries.length; j++) {
        var name = entries[j];
        if (name === '.' || name === '..') {
          lines.push('<span class="t-dir">drwxr-xr-x  2 ' + promptUser + ' ' + promptUser + '  4096 Mar 23 08:00 ' + esc(name) + '</span>');
          continue;
        }
        var child = node.children[name];
        var isDir = child.type === 'dir';
        var cls = isDir ? 't-dir' : (name.startsWith('.') ? 't-hide' : (child.perm && child.perm.indexOf('x') !== -1 && !isDir ? 't-exec' : 't-file'));
        var size = String(child.size || 4096).padStart(5);
        lines.push((child.perm || '-rw-r--r--') + '  1 ' + (child.owner || promptUser) + ' ' + (child.owner || promptUser) + ' ' + size + ' Mar 23 08:00 <span class="' + cls + '">' + esc(name) + '</span>');
      }
    } else {
      for (var k = 0; k < entries.length; k++) {
        var n = entries[k];
        if (n === '.' || n === '..') { lines.push('<span class="t-dir">' + esc(n) + '</span>'); continue; }
        var c = node.children[n];
        var id = c.type === 'dir';
        var cl = id ? 't-dir' : (n.startsWith('.') ? 't-hide' : (c.perm && c.perm.indexOf('x') !== -1 && !id ? 't-exec' : 't-file'));
        lines.push('<span class="' + cl + '">' + esc(n) + (id ? '/' : '') + '</span>');
      }
    }
    print(lines.join(showLong ? '\n' : '  '));
    return lines.map(function (l) { return l.replace(/<[^>]*>/g, ''); }).join('\n');
  };

  commands.cd = function (args) {
    var target = args[0] || '~';
    if (target === '~' || target === '') target = homePath;
    if (target === '-') { print(esc(cwd)); return ''; }
    var resolved = fsResolve(target, cwd);
    var node = fsGet(resolved);
    if (!node || node.type !== 'dir') {
      print('<span class="t-error">bash: cd: ' + esc(target) + ': No such file or directory</span>');
      return false;
    }
    cwd = resolved;
    // Backward compat with localStorage.directory
    if (cwd === homePath) localStorage.directory = 'home';
    else if (cwd === homePath + '/skills') localStorage.directory = 'skills';
    updatePrompt();
    return '';
  };

  commands.pwd = function () { print(esc(cwd)); return cwd; };
  commands.path = commands.pwd;

  commands.mkdir = function (args) {
    if (!args[0]) { print('<span class="t-error">mkdir: missing operand</span>'); return false; }
    for (var i = 0; i < args.length; i++) {
      if (args[i].startsWith('-')) continue;
      var path = fsResolve(args[i], cwd);
      if (fsGet(path)) { print('<span class="t-error">mkdir: cannot create \'' + esc(args[i]) + '\': File exists</span>'); return false; }
      fsMkdir(path);
    }
    return '';
  };

  commands.touch = function (args) {
    if (!args[0]) { print('<span class="t-error">touch: missing file operand</span>'); return false; }
    for (var i = 0; i < args.length; i++) {
      var path = fsResolve(args[i], cwd);
      var existing = fsGet(path);
      if (existing) { existing.mtime = new Date(); continue; }
      fsWriteFile(path, '');
    }
    return '';
  };

  commands.rm = function (args) {
    var recursive = false, force = false, files = [];
    for (var i = 0; i < args.length; i++) {
      if (args[i].startsWith('-')) {
        if (args[i].indexOf('r') !== -1) recursive = true;
        if (args[i].indexOf('f') !== -1) force = true;
      } else files.push(args[i]);
    }
    for (var j = 0; j < files.length; j++) {
      var path = fsResolve(files[j], cwd);
      if (['/', '/etc', '/var', '/usr', '/bin', '/home'].indexOf(path) !== -1) {
        print('<span class="t-error">rm: refusing to remove \'' + esc(files[j]) + '\': Permission denied.</span>');
        continue;
      }
      var node = fsGet(path);
      if (!node) { if (!force) print('<span class="t-error">rm: cannot remove \'' + esc(files[j]) + '\': No such file or directory</span>'); continue; }
      if (node.type === 'dir' && !recursive) { print('<span class="t-error">rm: cannot remove \'' + esc(files[j]) + '\': Is a directory (try -r)</span>'); continue; }
      fsDelete(path);
    }
    return '';
  };

  commands.rmdir = function (args) {
    if (!args[0]) { print('<span class="t-error">rmdir: missing operand</span>'); return false; }
    var path = fsResolve(args[0], cwd);
    var node = fsGet(path);
    if (!node) { print('<span class="t-error">rmdir: \'' + esc(args[0]) + '\': No such file or directory</span>'); return false; }
    if (node.type !== 'dir') { print('<span class="t-error">rmdir: \'' + esc(args[0]) + '\': Not a directory</span>'); return false; }
    if (Object.keys(node.children).length > 0) { print('<span class="t-error">rmdir: \'' + esc(args[0]) + '\': Directory not empty</span>'); return false; }
    fsDelete(path);
    return '';
  };

  commands.cp = function (args) {
    var paths = args.filter(function (a) { return !a.startsWith('-'); });
    if (paths.length < 2) { print('<span class="t-error">cp: missing destination</span>'); return false; }
    var src = fsResolve(paths[0], cwd), dest = fsResolve(paths[1], cwd);
    var srcNode = fsGet(src);
    if (!srcNode) { print('<span class="t-error">cp: cannot stat \'' + esc(paths[0]) + '\'</span>'); return false; }
    var destNode = fsGet(dest);
    if (destNode && destNode.type === 'dir') dest = dest + '/' + fsBasename(src);
    fsCopy(src, dest);
    return '';
  };

  commands.mv = function (args) {
    if (args.length < 2) { print('<span class="t-error">mv: missing destination</span>'); return false; }
    var src = fsResolve(args[0], cwd), dest = fsResolve(args[1], cwd);
    if (!fsGet(src)) { print('<span class="t-error">mv: cannot stat \'' + esc(args[0]) + '\'</span>'); return false; }
    var d = fsGet(dest);
    if (d && d.type === 'dir') dest = dest + '/' + fsBasename(src);
    fsCopy(src, dest);
    fsDelete(src);
    return '';
  };

  commands.echo = function (args, pipeInput) {
    var text = args.join(' ');
    print(esc(text || (pipeInput || '')));
    return text || pipeInput || '';
  };

  commands.find = function (args) {
    var searchPath = cwd, namePattern = null;
    for (var i = 0; i < args.length; i++) {
      if (args[i] === '-name' && args[i + 1]) { namePattern = args[++i].replace(/\*/g, '.*').replace(/\?/g, '.'); }
      else if (!args[i].startsWith('-')) searchPath = fsResolve(args[i], cwd);
    }
    var results = [];
    function walk(p, n) {
      if (n.type === 'dir') {
        for (var name in n.children) {
          var cp = p === '/' ? '/' + name : p + '/' + name;
          if (!namePattern || new RegExp('^' + namePattern + '$').test(name)) results.push(cp);
          walk(cp, n.children[name]);
        }
      }
    }
    var startNode = fsGet(searchPath);
    if (!startNode) { print('<span class="t-error">find: \'' + esc(searchPath) + '\': No such file or directory</span>'); return false; }
    walk(searchPath, startNode);
    print(esc(results.join('\n')));
    return results.join('\n');
  };

  commands.tree = function (args) {
    var targetPath = args[0] ? fsResolve(args[0], cwd) : cwd;
    var node = fsGet(targetPath);
    if (!node || node.type !== 'dir') { print('<span class="t-error">Not a directory</span>'); return false; }
    var lines = [esc(getPromptPath())], dc = 0, fc = 0;
    function walk(n, prefix) {
      var entries = Object.keys(n.children).sort();
      entries.forEach(function (name, i) {
        var isLast = i === entries.length - 1;
        var connector = isLast ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
        var child = n.children[name];
        var cls = child.type === 'dir' ? 't-dir' : 't-file';
        if (child.type === 'dir') dc++; else fc++;
        lines.push(prefix + connector + '<span class="' + cls + '">' + esc(name) + '</span>');
        if (child.type === 'dir') walk(child, prefix + (isLast ? '    ' : '\u2502   '));
      });
    }
    walk(node, '');
    lines.push('\n' + dc + ' directories, ' + fc + ' files');
    print(lines.join('\n'));
    return '';
  };

  commands.grep = function (args, pipeInput) {
    var pattern = '', ignoreCase = false;
    for (var i = 0; i < args.length; i++) {
      if (args[i] === '-i') { ignoreCase = true; continue; }
      if (args[i].startsWith('-')) continue;
      if (!pattern) { pattern = args[i]; continue; }
    }
    if (!pattern) { print('<span class="t-error">grep: missing pattern</span>'); return false; }
    var text = pipeInput || '';
    var regex = new RegExp(pattern, ignoreCase ? 'i' : '');
    var matches = text.split('\n').filter(function (l) { return regex.test(l); });
    var output = matches.join('\n');
    print(esc(output));
    return output;
  };

  // --- System info ---
  commands.hostname = function () { print(esc(promptHost)); return promptHost; };
  commands.uname = function (args) {
    var r = (args.indexOf('-a') !== -1) ? 'Linux ' + promptHost + ' 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux' : 'Linux';
    print(esc(r)); return r;
  };
  commands.uptime = function () { var r = getUptime(); print(esc(r)); return r; };
  commands.date = function () { var r = new Date().toString(); print(esc(r)); return r; };
  commands.cal = function () { print(generateCal()); return ''; };
  commands.id = function () { print(esc('uid=1000(' + promptUser + ') gid=1000(' + promptUser + ') groups=1000(' + promptUser + '),27(sudo)')); return ''; };

  commands.df = function () {
    print(esc('Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       234G  142G   80G  64% /\ntmpfs           7.8G  2.1M  7.8G   1% /dev/shm\n/dev/sda2        50G   12G   36G  25% /home'));
    return '';
  };
  commands.free = function () {
    print(esc('               total        used        free      shared  buff/cache   available\nMem:           15Gi       6.2Gi       4.1Gi       312Mi       5.1Gi       8.6Gi\nSwap:          2.0Gi       128Mi       1.9Gi'));
    return '';
  };
  commands.ps = function () {
    print(esc('USER       PID %CPU %MEM COMMAND\nroot         1  0.0  0.1 /sbin/init\n' + promptUser + '     1337  0.3  0.1 -bash\n' + promptUser + '     1338  0.0  0.0 ps aux\nroot       666  6.6  4.2 /usr/bin/coffee-daemon'));
    return '';
  };
  commands.lscpu = function () {
    print(esc('Architecture:   x86_64\nCPU(s):         8\nModel name:     Intel(R) Core(TM) i7-8550U @ 1.80GHz\nL3 cache:       8 MiB'));
    return '';
  };
  commands.lsblk = function () {
    print(esc('NAME   SIZE TYPE MOUNTPOINT\nsda    238G disk\n\u251c\u2500sda1  234G part /\n\u2514\u2500sda2    4G part [SWAP]'));
    return '';
  };
  commands.ifconfig = function () {
    print(esc('eth0: inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255\n      ether 08:00:27:4e:66:a1\nlo:   inet 127.0.0.1  netmask 255.0.0.0'));
    return '';
  };
  commands.ip = function (args) { if (args[0] === 'addr' || args[0] === 'a') return commands.ifconfig(); print(esc('Usage: ip addr')); return ''; };

  // --- Top (animated) ---
  commands.top = commands.htop = function () {
    return new Promise(async function (resolve) {
      runningProcess = 'top';
      while (!interruptFlag) {
        clearOutput();
        var up = getUptime();
        var d = 'top - ' + up + '\nTasks:   8 total,   1 running\n%Cpu(s):  3.2 us,  1.1 sy, 95.5 id\nMiB Mem: 16384 total, 4200 free, 6340 used\n\n  PID USER      %CPU  %MEM COMMAND\n';
        var procs = [{p:1,u:'root',c:'0.0',cmd:'/sbin/init'},{p:666,u:'root',c:'6.6',cmd:'coffee-daemon'},{p:1337,u:promptUser,c:'0.3',cmd:'-bash'},{p:1338,u:promptUser,c:'2.1',cmd:'top'}];
        for (var i = 0; i < procs.length; i++) {
          var cpu = (parseFloat(procs[i].c) + Math.random() * 0.5 - 0.25).toFixed(1);
          d += String(procs[i].p).padStart(5) + ' ' + procs[i].u.padEnd(9) + ' ' + String(cpu).padStart(5) + '  0.1 ' + procs[i].cmd + '\n';
        }
        print(esc(d));
        await sleep(1000);
      }
      interruptFlag = false;
      runningProcess = null;
      resolve('');
    });
  };

  // --- Fun commands ---
  commands.sudo = function (args) {
    if (args.join(' ') === 'rm -rf /') { print(esc("You've watched too many hacking movies. Sit down."), 't-error'); return ''; }
    if (args[0] === 'su') { print(esc("You wish. This isn't that kind of party."), 't-warn'); return ''; }
    // Show image if available (backward compat)
    if (window.profileData && window.profileData.assets && window.profileData.assets.sudo) {
      print('<img src="' + window.profileData.assets.sudo + '" alt="Sudo" class="sudo">');
    }
    print(esc(sudoResponses[sudoIdx % sudoResponses.length]), 't-warn');
    sudoIdx++;
    return '';
  };

  commands.prime = function () {
    print("<span style=\"line-height: 1;\">\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500<br>\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2584\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500<br>\u2588\u2588\u2588\u2588\u2588\u2500\u2500\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2500\u2500\u2588\u2588\u2588\u2588\u2588</span>");
    return '';
  };

  commands.hack = function () {
    return new Promise(async function (resolve) {
      runningProcess = 'hack';
      var chars = 'ABCDEF0123456789!@#$%^&*';
      print('<span class="t-bright">[ INITIATING HACK SEQUENCE ]</span>');
      await sleep(500);
      for (var i = 0; i < 15; i++) {
        if (interruptFlag) break;
        var line = '';
        for (var j = 0; j < 50; j++) line += chars[Math.floor(Math.random() * chars.length)];
        print('<span style="color:#4E9A06">' + esc(line) + '</span>');
        await sleep(100);
      }
      if (!interruptFlag) {
        await sleep(500);
        print('<span class="t-bright">[====================] 100%</span>');
        await sleep(300);
        print('<span class="t-warn">ACCESS GRANTED...</span>');
        await sleep(1000);
        print('<span class="t-error">...just kidding. You thought? Cute.</span>');
      }
      runningProcess = null; interruptFlag = false; resolve('');
    });
  };

  commands.matrix = commands.cmatrix = function () {
    return new Promise(async function (resolve) {
      runningProcess = 'matrix';
      var chars = '\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af0123456789ABCDEF';
      for (var frame = 0; frame < 60; frame++) {
        if (interruptFlag) break;
        var line = '';
        for (var j = 0; j < 60; j++) {
          var ch = chars[Math.floor(Math.random() * chars.length)];
          line += Math.random() > 0.7 ? '<span class="t-bright">' + ch + '</span>' : '<span class="t-dim">' + ch + '</span>';
        }
        print(line);
        await sleep(50);
      }
      runningProcess = null; interruptFlag = false; resolve('');
    });
  };

  commands.sl = function () {
    var train = [
      '      ====        ________                ___________',
      '  _D _|  |_______/        \\__I_I_____===__|_________|',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|',
      '   /     |  |   H  |  |     |   |         ||_| |_||',
      '  |      |  |   H  |__--------------------| [___] |',
      '  | ________|___H__/__|_____/[][]~\\_______|       |',
      '  |/ |   |-----------I_____I [][] []  D   |=======|__',
      '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__',
      ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ',
      '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
    ];
    for (var i = 0; i < train.length; i++) print('<span class="t-dim">' + esc(train[i]) + '</span>');
    print('\n<span class="t-dim">Choo choo! Next time, type "ls" properly.</span>');
    return '';
  };

  commands.cowsay = function (args) { print(esc(cowsay(args.join(' ') || 'Moo!'))); return ''; };
  commands.fortune = function () { var f = fortunes[Math.floor(Math.random() * fortunes.length)]; print(esc(f)); return f; };
  commands.figlet = commands.banner = function (args) { print(esc(figlet(args.join(' ') || 'Hello'))); return ''; };
  commands.joke = function () { var j = jokes[Math.floor(Math.random() * jokes.length)]; print(esc(j)); return j; };
  commands.quote = function () { var q = quotes[Math.floor(Math.random() * quotes.length)]; print(esc(q)); return q; };

  commands.lolcat = function (args, pipeInput) { var text = pipeInput || args.join(' ') || 'meow'; print(lolcat(text)); return text; };

  commands.yes = function (args) {
    return new Promise(async function (resolve) {
      runningProcess = 'yes';
      var text = args.join(' ') || 'y';
      while (!interruptFlag) { print(esc(text)); await sleep(20); }
      interruptFlag = false; runningProcess = null; resolve('');
    });
  };

  commands.ping = function (args) {
    var host = args[0] || 'google.com';
    return new Promise(async function (resolve) {
      runningProcess = 'ping';
      print(esc('PING ' + host + ' (142.250.80.46) 56(84) bytes of data.'));
      var seq = 1;
      while (!interruptFlag) {
        var time = (Math.random() * 30 + 5).toFixed(1);
        print(esc('64 bytes from ' + host + ': icmp_seq=' + seq + ' ttl=117 time=' + time + ' ms'));
        seq++;
        await sleep(1000);
      }
      print(esc('\n--- ' + host + ' ping statistics ---\n' + (seq - 1) + ' packets transmitted, ' + (seq - 1) + ' received, 0% packet loss'));
      interruptFlag = false; runningProcess = null; resolve('');
    });
  };

  commands.neofetch = function () {
    var upMs = Date.now() - startTime + 86400000 * 3;
    var days = Math.floor(upMs / 86400000), hours = Math.floor((upMs % 86400000) / 3600000), mins = Math.floor((upMs % 3600000) / 60000);
    var info = [
      '<span class="t-bold" style="color:#e95420">' + promptUser + '@' + promptHost + '</span>',
      '<span style="color:#e95420">-</span>'.repeat(24),
      '<span class="t-bold" style="color:#e95420">OS:</span> Ubuntu 22.04.3 LTS x86_64',
      '<span class="t-bold" style="color:#e95420">Kernel:</span> 5.15.0-91-generic',
      '<span class="t-bold" style="color:#e95420">Uptime:</span> ' + days + ' days, ' + hours + 'h, ' + mins + 'm',
      '<span class="t-bold" style="color:#e95420">Shell:</span> bash 5.1.16',
      '<span class="t-bold" style="color:#e95420">Terminal:</span> /dev/pts/0 (your browser)',
      '<span class="t-bold" style="color:#e95420">CPU:</span> Intel i7-8550U (8 cores)',
      '<span class="t-bold" style="color:#e95420">Memory:</span> 6340MiB / 16384MiB',
    ];
    var logo = [
      '            .-/+oossssoo+/-.',
      '        `:+ssssssssssssssssss+:`',
      '      -+sssssssssssssssssssssss+-',
      '    .osssssssssssssssssssssssssso.',
      '   /sssssssssssssssssssssssssssss/',
      '  +sssssssssssssssssssssssssssssss+',
      ' /sssssssssssssssssssssssssssssssss/',
      '.sssssssssssssssssssssssssssssssssss.',
      '+ssssssssssssssssssssssssssssssssssss+',
      'ossssssssssssssssssssssssssssssssssssso',
    ];
    var out = '';
    var maxLines = Math.max(logo.length, info.length);
    for (var i = 0; i < maxLines; i++) {
      var l = i < logo.length ? '<span style="color:#e95420">' + logo[i] + '</span>' : ' '.repeat(44);
      var inf = i < info.length ? info[i] : '';
      var pad = 44 - (i < logo.length ? logo[i].length : 44);
      out += l + ' '.repeat(Math.max(pad, 2)) + inf + '\n';
    }
    print(out);
    return '';
  };

  commands.weather = function () {
    print(esc('Weather report: Nullpointersville, Cloud Region\n\n      \\   /     Partly Cloudy\n    _ /"".-,     42\u00b0F (6\u00b0C)\n      \\_   /     \u2191 13 mph\n      /-""       Humidity: 69%\n                 Precipitation: 100% chance of bugs'));
    return '';
  };
  commands.curl = function (args) {
    if (args[0] === 'wttr.in' || (args[0] && args[0].indexOf('wttr.in') !== -1)) return commands.weather();
    return new Promise(async function (resolve) {
      runningProcess = 'curl';
      for (var i = 0; i <= 100; i += 20) { if (interruptFlag) break; print(esc(i + '% downloaded...')); await sleep(200); }
      if (!interruptFlag) print(esc('<html><body>It works! (not really)</body></html>'));
      runningProcess = null; interruptFlag = false; resolve('');
    });
  };

  commands.wget = function (args) {
    return new Promise(async function (resolve) {
      runningProcess = 'wget';
      var url = args[0] || 'http://example.com';
      print(esc('--' + new Date().toISOString() + '--  ' + url));
      for (var i = 0; i <= 100; i += 10) { if (interruptFlag) break; print(esc(i + '% [' + '='.repeat(i / 2.5) + '>]')); await sleep(150); }
      if (!interruptFlag) print(esc("'index.html' saved [1337/1337] (in your dreams)"));
      runningProcess = null; interruptFlag = false; resolve('');
    });
  };

  commands.ssh = function (args) {
    return new Promise(async function (resolve) {
      print(esc('Connecting to ' + (args[0] || 'somewhere') + '...'));
      await sleep(1500);
      print(esc("...just kidding, you're still here."), 't-dim');
      resolve('');
    });
  };

  commands['apt-get'] = commands.apt = function (args) {
    if (args[0] !== 'install' || !args[1]) { print(esc('Usage: apt install <package>')); return Promise.resolve(''); }
    var pkg = args.slice(1).join(' ');
    return new Promise(async function (resolve) {
      runningProcess = 'apt';
      print(esc('Reading package lists... Done'));
      await sleep(300);
      print(esc('Building dependency tree... Done'));
      await sleep(300);
      for (var i = 0; i <= 100; i += 5) {
        if (interruptFlag) break;
        print(esc('[' + '\u2588'.repeat(i / 2.5) + '\u2591'.repeat(40 - i / 2.5) + '] ' + i + '%'));
        await sleep(80);
      }
      if (!interruptFlag) print(esc(pkg + ' installed successfully. (just kidding, nothing happened)'));
      runningProcess = null; interruptFlag = false; resolve('');
    });
  };

  commands.git = function (args) {
    if (!args[0]) { print(esc('usage: git [command]')); return ''; }
    if (args[0] === 'init') print(esc('Initialized empty Git repository in ' + cwd + '/.git/'));
    else if (args[0] === 'status') print(esc('On branch main\nnothing to commit, working tree clean\n(because nothing here is real)'));
    else if (args[0] === 'log') print(esc('commit a1b2c3d (HEAD -> main)\nAuthor: ' + promptUser + '\nDate: ' + new Date().toUTCString() + '\n\n    fix: everything (hopefully)'));
    else print(esc("git: '" + args[0] + "' is not a git command."));
    return '';
  };

  commands.vim = commands.vi = function (args) {
    var fileName = args[0] || '';
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'term-vim-overlay active';
      overlay.innerHTML = '<div class="term-vim-content" contenteditable="true"></div><div class="term-vim-status">-- NORMAL --</div><div class="term-vim-cmd"></div>';
      termEl.appendChild(overlay);
      var content = overlay.querySelector('.term-vim-content');
      var status = overlay.querySelector('.term-vim-status');
      var cmdLine = overlay.querySelector('.term-vim-cmd');
      var filePath = fileName ? fsResolve(fileName, cwd) : null;
      var existing = filePath ? fsGet(filePath) : null;
      content.textContent = existing && existing.type === 'file' ? existing.content : '\n~\n~\n~\n~\n~\n~\n~';
      content.focus();
      var mode = 'normal', cmdBuf = '';
      var hint = setTimeout(function () { status.textContent = "-- NORMAL -- (Psst... type :q to quit)"; }, 10000);
      function handleKey(e) {
        if (mode === 'normal') {
          if (e.key === 'i') { mode = 'insert'; status.textContent = '-- INSERT --'; e.preventDefault(); return; }
          if (e.key === ':') { mode = 'command'; cmdBuf = ':'; cmdLine.textContent = ':'; e.preventDefault(); return; }
          e.preventDefault();
        } else if (mode === 'insert') {
          if (e.key === 'Escape') { mode = 'normal'; status.textContent = '-- NORMAL --'; e.preventDefault(); }
        } else if (mode === 'command') {
          e.preventDefault();
          if (e.key === 'Enter') {
            var c = cmdBuf.trim();
            if (c === ':q' || c === ':q!' || c === ':quit') { clearTimeout(hint); overlay.remove(); content.removeEventListener('keydown', handleKey); print(esc("You escaped vim! Achievement unlocked."), 't-dim'); inputEl.focus(); resolve(''); return; }
            if (c === ':wq' || c === ':x') { if (filePath) fsWriteFile(filePath, content.textContent); clearTimeout(hint); overlay.remove(); content.removeEventListener('keydown', handleKey); print(esc('"' + (fileName || 'untitled') + '" written.'), 't-dim'); inputEl.focus(); resolve(''); return; }
            if (c === ':w') { if (filePath) fsWriteFile(filePath, content.textContent); cmdLine.textContent = 'written'; mode = 'normal'; cmdBuf = ''; return; }
            cmdLine.textContent = 'E492: Not an editor command'; mode = 'normal'; cmdBuf = ''; return;
          }
          if (e.key === 'Escape') { mode = 'normal'; cmdBuf = ''; cmdLine.textContent = ''; return; }
          if (e.key === 'Backspace') { cmdBuf = cmdBuf.slice(0, -1); cmdLine.textContent = cmdBuf; if (!cmdBuf) mode = 'normal'; return; }
          cmdBuf += e.key; cmdLine.textContent = cmdBuf;
        }
      }
      content.addEventListener('keydown', handleKey);
    });
  };

  commands.nano = function (args) {
    var fileName = args[0] || 'untitled';
    var filePath = fsResolve(fileName, cwd);
    var existing = fsGet(filePath);
    var content = existing && existing.type === 'file' ? existing.content : '';
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'term-nano-overlay active';
      overlay.innerHTML = '<div class="term-nano-header">GNU nano 6.2 \u2014 ' + esc(fileName) + '</div><textarea class="term-nano-content"></textarea><div class="term-nano-footer"><span>^X Exit</span><span>^S Save</span></div>';
      termEl.appendChild(overlay);
      var ta = overlay.querySelector('.term-nano-content');
      var header = overlay.querySelector('.term-nano-header');
      ta.value = content;
      ta.focus();
      function handleKey(e) {
        if (e.ctrlKey && e.key === 'x') { e.preventDefault(); overlay.remove(); ta.removeEventListener('keydown', handleKey); inputEl.focus(); resolve(''); }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); fsWriteFile(filePath, ta.value); header.textContent = 'GNU nano 6.2 \u2014 ' + fileName + ' [Saved]'; setTimeout(function () { header.textContent = 'GNU nano 6.2 \u2014 ' + fileName; }, 1500); }
      }
      ta.addEventListener('keydown', handleKey);
    });
  };

  commands.python3 = commands.python = function () {
    return new Promise(function (resolve) {
      print(esc('Python 3.10.12 (main) [GCC 11.4.0] on linux\nType "exit()" to quit.'));
      promptEl.innerHTML = '<span style="color:#EEEEEC">&gt;&gt;&gt; </span>';
      inputEl.dataset.replMode = 'python';
      inputEl._replHandler = function (line) {
        if (line === 'exit()' || line === 'quit()') { delete inputEl.dataset.replMode; delete inputEl._replHandler; updatePrompt(); resolve(''); return; }
        addPromptLine_repl('>>> ', line);
        try {
          if (line.startsWith('print(') && line.endsWith(')')) { var inner = line.slice(6, -1); var val; try { val = JSON.parse(inner); } catch (e) { val = Function('"use strict"; return (' + inner + ')')(); } print(esc(String(val))); }
          else if (line.trim()) { var result = Function('"use strict"; return (' + line + ')')(); print(esc(String(result))); }
        } catch (e) { print('<span class="t-error">' + esc(e.message) + '</span>'); }
        promptEl.innerHTML = '<span style="color:#EEEEEC">&gt;&gt;&gt; </span>';
      };
    });
  };

  commands.node = function () {
    return new Promise(function (resolve) {
      print(esc('Welcome to Node.js v18.19.0.\nType ".exit" to quit.'));
      promptEl.innerHTML = '<span style="color:#EEEEEC">&gt; </span>';
      inputEl.dataset.replMode = 'node';
      inputEl._replHandler = function (line) {
        if (line === '.exit' || line === 'process.exit()') { delete inputEl.dataset.replMode; delete inputEl._replHandler; updatePrompt(); resolve(''); return; }
        addPromptLine_repl('> ', line);
        try {
          if (line.startsWith('console.log(') && line.endsWith(')')) { var inner = line.slice(12, -1); var val = Function('"use strict"; return (' + inner + ')')(); print(esc(String(val))); print(esc('undefined'), 't-dim'); }
          else if (line.trim()) { var r = Function('"use strict"; return (' + line + ')')(); print('<span class="t-dim">' + esc(String(r)) + '</span>'); }
        } catch (e) { print('<span class="t-error">' + esc(e.message) + '</span>'); }
        promptEl.innerHTML = '<span style="color:#EEEEEC">&gt; </span>';
      };
    });
  };

  function addPromptLine_repl(prompt, cmd) {
    print('<span style="color:#EEEEEC">' + esc(prompt) + '</span>' + esc(cmd));
  }

  commands.history = function () {
    if (commandHistory.length === 0) { print('<span class="gray">No history yet.</span>'); return ''; }
    var lines = commandHistory.map(function (cmd, i) { return '  ' + String(i + 1).padStart(4) + '  ' + cmd; });
    print(esc(lines.join('\n')));
    return '';
  };

  commands.clear = function () { clearOutput(); return ''; };

  commands.reset = function () { clearOutput(); showWelcomeBanner(); return ''; };

  commands.reboot = function () {
    return new Promise(async function (resolve) {
      clearOutput();
      var steps = ['[ OK ] Stopping user sessions...', '[ OK ] Stopped SSH server.', '[ OK ] Stopped Coffee Daemon.', '[*****] Rebooting...'];
      for (var i = 0; i < steps.length; i++) { print(esc(steps[i])); await sleep(400); }
      await sleep(1500);
      clearOutput();
      print(esc('BIOS POST... OK'));
      await sleep(500);
      clearOutput();
      showWelcomeBanner();
      resolve('');
    });
  };

  commands.shutdown = function () {
    return new Promise(async function (resolve) {
      clearOutput();
      print(esc('System is going down for poweroff NOW!'));
      await sleep(1500);
      clearOutput();
      print('<span class="t-dim">System halted.</span>');
      await sleep(2000);
      clearOutput();
      print(esc("lol jk, you can't shut down a browser tab like that."), 't-warn');
      print('');
      showWelcomeBanner();
      resolve('');
    });
  };

  commands.exit = function () {
    return new Promise(async function (resolve) {
      print(esc("Goodbye. Try not to break anything on your way out."), 't-warn');
      await sleep(800);
      var closeBtn = termEl.closest('.window') ? termEl.closest('.window').querySelector('.win-btn.close') : null;
      if (closeBtn) {
        closeBtn.click();
      }
      resolve('');
    });
  };

  commands.theme = function (args) {
    if (!args[0]) { print('Usage: theme ' + themes.join(' | ')); return ''; }
    var next = themes.indexOf(args[0]) !== -1 ? args[0] : 'default';
    document.body.classList.remove('theme-amber', 'theme-green', 'theme-mono');
    if (next !== 'default') document.body.classList.add('theme-' + next);
    localStorage.theme = next;
    print(esc('Theme set to ' + next + '.'));
    return '';
  };

  commands.alias = function (args) {
    if (!args[0]) {
      var lines = Object.keys(aliases).map(function (k) { return 'alias ' + k + "='" + aliases[k] + "'"; });
      print(esc(lines.join('\n')));
      return '';
    }
    var match = args.join(' ').match(/^(\w+)=['"](.*?)['"]$/);
    if (match) { aliases[match[1]] = match[2]; print(esc('Alias set: ' + match[1] + "='" + match[2] + "'")); }
    else print(esc("Usage: alias name='command'"));
    return '';
  };

  commands.which = function (args) {
    if (!args[0]) return '';
    if (commands[args[0]]) { print(esc('/usr/bin/' + args[0])); return '/usr/bin/' + args[0]; }
    print(esc(args[0] + ' not found'));
    return '';
  };

  commands.type = function (args) {
    if (!args[0]) return '';
    if (commands[args[0]]) { print(esc(args[0] + ' is /usr/bin/' + args[0])); }
    else if (aliases[args[0]]) { print(esc(args[0] + " is aliased to '" + aliases[args[0]] + "'")); }
    else { print(esc('bash: type: ' + args[0] + ': not found')); }
    return '';
  };

  commands.setuser = function (args) {
    if (!args[0]) { print(esc('Usage: setuser <name>')); return ''; }
    promptUser = args[0];
    envVars.USER = promptUser;
    updatePrompt();
    print(esc('Username changed to: ' + promptUser));
    return '';
  };

  commands['export'] = function (args) {
    if (!args[0]) return commands.env();
    var match = args.join(' ').match(/^(\w+)=(.*)$/);
    if (match) { envVars[match[1]] = match[2]; print(esc(match[1] + '=' + match[2])); }
    return '';
  };

  commands.env = function () {
    var lines = Object.keys(envVars).map(function (k) { return k + '=' + envVars[k]; });
    print(esc(lines.join('\n')));
    return '';
  };

  commands.wc = function (args, pipeInput) {
    var text = pipeInput || '';
    if (!text && !args[0]) { print('<span class="t-error">wc: missing operand</span>'); return false; }
    var content = text;
    if (!text && args[0]) {
      var path = fsResolve(args[0], cwd);
      var node = fsGet(path);
      if (!node || node.type !== 'file') { print('<span class="t-error">wc: ' + esc(args[0]) + ': No such file</span>'); return false; }
      content = node.content;
    }
    var lines = content.split('\n').length;
    var words = content.split(/\s+/).filter(Boolean).length;
    var chars = content.length;
    var r = '  ' + lines + '  ' + words + ' ' + chars;
    print(esc(r));
    return r;
  };

  commands.head = function (args, pipeInput) {
    var n = 10, files = [];
    for (var i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[i + 1]); i++; }
      else if (!args[i].startsWith('-')) files.push(args[i]);
    }
    var text = pipeInput || '';
    if (text) { var result = text.split('\n').slice(0, n).join('\n'); print(esc(result)); return result; }
    if (files[0]) {
      var path = fsResolve(files[0], cwd);
      var node = fsGet(path);
      if (!node || node.type !== 'file') { print('<span class="t-error">head: ' + esc(files[0]) + ': No such file</span>'); return false; }
      var result = node.content.split('\n').slice(0, n).join('\n'); print(esc(result)); return result;
    }
    return '';
  };

  commands.tail = function (args, pipeInput) {
    var n = 10, files = [];
    for (var i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[i + 1]); i++; }
      else if (!args[i].startsWith('-')) files.push(args[i]);
    }
    var text = pipeInput || '';
    if (text) { var result = text.split('\n').slice(-n).join('\n'); print(esc(result)); return result; }
    if (files[0]) {
      var path = fsResolve(files[0], cwd);
      var node = fsGet(path);
      if (!node || node.type !== 'file') { print('<span class="t-error">tail: ' + esc(files[0]) + ': No such file</span>'); return false; }
      var result = node.content.split('\n').slice(-n).join('\n'); print(esc(result)); return result;
    }
    return '';
  };

  commands.sort = function (args, pipeInput) {
    var text = pipeInput || '';
    if (!text) return '';
    var lines = text.split('\n').sort();
    if (args.indexOf('-r') !== -1) lines.reverse();
    var result = lines.join('\n');
    print(esc(result));
    return result;
  };

  commands.uniq = function (args, pipeInput) {
    var text = pipeInput || '';
    if (!text) return '';
    var lines = text.split('\n');
    var result = lines.filter(function (l, i) { return i === 0 || l !== lines[i - 1]; }).join('\n');
    print(esc(result));
    return result;
  };

  commands.zip = function (args) {
    if (!args[0]) { print(esc('zip: missing archive name')); return ''; }
    print(esc('  adding: ' + (args.slice(1).join(', ') || 'files') + ' (deflated 69%)'));
    print('<span class="t-dim">(Nothing was actually zipped. This is a simulation, remember?)</span>');
    return '';
  };

  commands.unzip = function (args) {
    if (!args[0]) { print(esc('unzip: missing archive name')); return ''; }
    print(esc('Archive:  ' + args[0] + '\n  inflating: totally_real_file.txt\n  inflating: another_file.dat'));
    print('<span class="t-dim">(Nothing was actually unzipped. Surprise!)</span>');
    return '';
  };

  commands.telnet = function (args) {
    if (args[0] && args[0].indexOf('towel') !== -1) {
      return new Promise(async function (resolve) {
        runningProcess = 'telnet';
        var frames = [
          '                      *         *              ',
          '           *                          *        ',
          '                          STAR                 ',
          '              *           WARS          *      ',
          '       *                                       ',
          '                   Episode IV                  ',
          '          *                           *        ',
          '                  A NEW HOPE                   ',
          '       *                                    *  ',
          '',
          '   It is a period of civil war. Rebel          ',
          '   spaceships, striking from a hidden          ',
          '   base, have won their first victory          ',
          '   against the evil Galactic Empire.           ',
          '',
          '   (This is where the crawl would go           ',
          '   but I only had so much space in             ',
          '   this HTML file. Use your imagination.)      ',
          '',
          '   Press Ctrl+C to return to reality.          ',
        ];
        for (var f = 0; f < frames.length; f++) {
          if (interruptFlag) break;
          print('<span class="t-bright">' + esc(frames[f]) + '</span>');
          await sleep(500);
        }
        while (!interruptFlag) await sleep(200);
        interruptFlag = false;
        runningProcess = null;
        print(esc('\nConnection closed.'));
        resolve('');
      });
    }
    print(esc('Trying ' + (args[0] || 'nowhere') + '...\nConnection refused. (This is a browser, not a telnet client.)'));
    return '';
  };

  commands['true'] = function () { return ''; };
  commands['false'] = function () { return false; };

  commands.easter = commands.easteregg = function () {
    print('<span class="t-bright">    You found the easter egg! Here\'s a cookie: \ud83c\udf6a</span>\n\n      \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\n     \u2588 ACHIEVEMENT     \u2588\n     \u2588   UNLOCKED!     \u2588\n     \u2588 \ud83c\udfc6 Easter Egg   \u2588\n     \u2588    Hunter       \u2588\n     \u2588 +100 nerd pts   \u2588\n     \u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580');
    return '';
  };

  commands.man = function (args) {
    if (!args[0]) { print(esc("What manual page do you want?")); return ''; }
    var pages = {
      ls: { s: 'ls [OPTION]... [FILE]...', d: 'List directory contents.' },
      cd: { s: 'cd [DIR]', d: 'Change the current directory.' },
      cat: { s: 'cat [FILE]...', d: 'Display file contents.' },
      rm: { s: 'rm [OPTION]... [FILE]...', d: 'Remove files or directories.' },
      grep: { s: 'grep [PATTERN] [FILE]...', d: 'Search for patterns.' },
      sudo: { s: 'sudo [COMMAND]', d: 'Execute as superuser. (Not here though.)' },
    };
    var p = pages[args[0]];
    if (!p) { print(esc('No manual entry for ' + args[0])); return ''; }
    print('<span class="t-bold">' + esc(args[0].toUpperCase()) + '(1)</span>\n\n<span class="t-bold">NAME</span>\n       ' + esc(args[0]) + '\n\n<span class="t-bold">SYNOPSIS</span>\n       ' + esc(p.s) + '\n\n<span class="t-bold">DESCRIPTION</span>\n       ' + esc(p.d));
    return '';
  };

  commands.help = function (args) {
    // If a specific command is requested
    if (args && args[0]) {
      var helpMap = {
        whoami: 'whoami - display a quick profile summary',
        stats: 'stats - show highlights (projects, experience, top skills)',
        path: 'path - display current directory',
        pwd: 'pwd - display current directory',
        ls: 'ls - show files in current directory',
        cd: 'cd DIRECTORY - move into DIRECTORY',
        cat: 'cat FILENAME - display file contents',
        theme: 'theme NAME - set terminal theme (default|amber|green|mono)',
        open: 'open SECTION - open GUI section',
        gui: 'gui - open the profile window',
        history: 'history - see your command history',
        login: 'login - show login banner',
        clear: 'clear - clear terminal',
        help: 'help [command] - show available commands',
        setuser: 'setuser <name> - change the username in prompt',
        'export': 'export VAR=value - set environment variable',
        env: 'env - show environment variables',
        wc: 'wc [FILE] - word, line, character count',
        head: 'head [-n N] [FILE] - show first N lines',
        tail: 'tail [-n N] [FILE] - show last N lines',
        sort: 'sort [-r] - sort lines of text',
        uniq: 'uniq - remove adjacent duplicate lines',
        telnet: 'telnet HOST - fake telnet connection',
        zip: 'zip ARCHIVE FILES - fake zip',
        unzip: 'unzip ARCHIVE - fake unzip',
      };
      if (helpMap[args[0]]) { print(esc(helpMap[args[0]])); return ''; }
    }
    // Full help
    var sections = [
      { t: '\ud83d\udcc2 Navigation & Files', color: '#5599ff', cmds: [
        ['ls', 'List directory contents'], ['cd', 'Change directory'], ['pwd', 'Print working directory'],
        ['mkdir', 'Create directory'], ['touch', 'Create empty file'], ['rm', 'Remove file/directory'],
        ['cp', 'Copy files'], ['mv', 'Move/rename files'], ['cat', 'Display file contents'],
        ['nano', 'Text editor (Ctrl+X exit, Ctrl+S save)'], ['vim/vi', 'Text editor (good luck exiting)'],
        ['echo', 'Print text or write to file'], ['find', 'Search for files'], ['tree', 'Directory tree view'],
      ]},
      { t: '\ud83d\udcbb System Info', color: '#00ff41', cmds: [
        ['whoami', 'Current user (existential crisis included)'], ['hostname', 'Show hostname'],
        ['uname -a', 'System information'], ['uptime', 'System uptime'], ['date', 'Current date/time'],
        ['cal', 'Calendar'], ['df -h', 'Disk usage'], ['free -h', 'Memory usage'],
        ['top/htop', 'Process monitor (q to quit)'], ['ps aux', 'Process list'],
        ['lscpu', 'CPU info'], ['lsblk', 'Block devices'], ['ifconfig', 'Network interfaces'],
        ['neofetch', 'System info with style'],
      ]},
      { t: '\ud83c\udf89 Fun Commands', color: '#ffaa00', cmds: [
        ['hack', 'Fake hacking animation'], ['matrix/cmatrix', 'Matrix rain effect'],
        ['sl', 'Steam locomotive'], ['cowsay', 'Cow says your text'],
        ['fortune', 'Random fortune'], ['figlet', 'Big ASCII text'], ['banner', 'Large ASCII banner'],
        ['lolcat', 'Rainbow text (pipe: echo hi | lolcat)'], ['joke', 'Random programmer joke'],
        ['quote', 'Random quote'], ['weather', 'Fake weather report'],
        ['telnet towel...', 'Star Wars crawl'], ['easter', 'Hidden easter egg'],
      ]},
      { t: '\ud83d\udd27 Network & Tools', color: '#ff5555', cmds: [
        ['ping', 'Fake ping (Ctrl+C to stop)'], ['curl/wget', 'Fake download'],
        ['ssh', 'Fake SSH connection'], ['apt install', 'Fake package install'],
        ['git', 'Fake git (init/status/log)'], ['python3', 'Python REPL (exit() to quit)'],
        ['node', 'Node.js REPL (.exit to quit)'], ['grep', 'Search text patterns'],
        ['wc', 'Word/line/char count'], ['head/tail', 'Show first/last lines'],
        ['sort', 'Sort lines'], ['uniq', 'Remove duplicate lines'],
      ]},
      { t: '\ud83c\udfae System', color: '#aa55ff', cmds: [
        ['clear', 'Clear screen'], ['reset', 'Reset terminal'], ['history', 'Command history'],
        ['reboot', 'Dramatic fake reboot'], ['shutdown', 'Fake shutdown'],
        ['theme', 'Switch theme (default|amber|green|mono)'], ['setuser', 'Change username'],
        ['alias', 'Create command alias'], ['export', 'Set environment variable'],
        ['env', 'Show environment variables'],
      ]},
      { t: '\ud83d\udcc2 Portfolio', color: '#e95420', cmds: [
        ['open SECTION', 'Open GUI section'], ['gui', 'Open profile window'],
        ['stats', 'Portfolio highlights'], ['login', 'Show login banner'],
      ]},
      { t: '\u2328\ufe0f  Shortcuts', color: '#55aaff', cmds: [
        ['Ctrl+C', 'Interrupt running command'], ['Ctrl+L', 'Clear screen'],
        ['Up/Down', 'Command history'], ['Tab', 'Autocomplete'],
        ['Ctrl+A', 'Jump to start of line'], ['Ctrl+E', 'Jump to end of line'],
      ]},
      { t: '\ud83d\udca1 Tips', color: '#666', cmds: [
        ['cmd > file', 'Write output to file'], ['cmd >> file', 'Append output to file'],
        ['cmd1 | cmd2', 'Pipe output between commands'], ['cmd1 && cmd2', 'Run cmd2 if cmd1 succeeds'],
      ]},
    ];
    var out = '\n<span class="t-bright">  \u2550\u2550\u2550\u2550 UBUNTU TERMINAL HELP \u2550\u2550\u2550\u2550</span>\n';
    for (var s = 0; s < sections.length; s++) {
      out += '\n<span class="t-bold" style="color:' + sections[s].color + '">' + sections[s].t + '</span>\n';
      for (var c = 0; c < sections[s].cmds.length; c++) {
        out += '  <span class="t-bright">' + esc(sections[s].cmds[c][0].padEnd(16)) + '</span> <span class="t-dim">' + esc(sections[s].cmds[c][1]) + '</span>\n';
      }
    }
    print(out);
    return '';
  };

  // ============================================================
  // TAB COMPLETION
  // ============================================================
  function tabComplete(input) {
    var tokens = input.split(/\s+/);
    var isFirst = tokens.length <= 1;
    var partial = tokens[tokens.length - 1] || '';
    if (isFirst) {
      var cmdNames = Object.keys(commands).sort();
      var matches = cmdNames.filter(function (c) { return c.startsWith(partial); });
      if (matches.length === 1) return input.slice(0, input.length - partial.length) + matches[0] + ' ';
      if (matches.length > 1) {
        print(esc(matches.join('  ')), 't-dim');
        var common = matches[0];
        for (var i = 1; i < matches.length; i++) { while (!matches[i].startsWith(common)) common = common.slice(0, -1); }
        return input.slice(0, input.length - partial.length) + common;
      }
      return input;
    }
    // File/dir completion
    var dir = cwd, filePartial = partial;
    if (partial.indexOf('/') !== -1) {
      var lastSlash = partial.lastIndexOf('/');
      var dirPart = partial.slice(0, lastSlash) || '/';
      filePartial = partial.slice(lastSlash + 1);
      dir = fsResolve(dirPart, cwd);
    }
    // Also try portfolio completions for certain commands
    var cmd = tokens[0].toLowerCase();
    if (cmd === 'theme') {
      var tm = themes.filter(function (t) { return t.startsWith(filePartial); });
      if (tm.length === 1) return input.slice(0, input.length - filePartial.length) + tm[0] + ' ';
      if (tm.length > 1) { print(esc(tm.join('  ')), 't-dim'); }
      return input;
    }
    if (cmd === 'open') {
      var gm = guiSections.filter(function (s) { return s.startsWith(filePartial); });
      if (gm.length === 1) return input.slice(0, input.length - filePartial.length) + gm[0] + ' ';
      if (gm.length > 1) { print(esc(gm.join('  ')), 't-dim'); }
      return input;
    }
    var node = fsGet(dir);
    if (!node || node.type !== 'dir') return input;
    var entries = Object.keys(node.children).filter(function (e) { return e.startsWith(filePartial); });
    if (entries.length === 1) {
      var entry = entries[0];
      var child = node.children[entry];
      var suffix = child.type === 'dir' ? '/' : ' ';
      return input.slice(0, input.length - filePartial.length) + entry + suffix;
    }
    if (entries.length > 1) {
      print(esc(entries.join('  ')), 't-dim');
      var cmn = entries[0];
      for (var j = 1; j < entries.length; j++) { while (!entries[j].startsWith(cmn)) cmn = cmn.slice(0, -1); }
      return input.slice(0, input.length - filePartial.length) + cmn;
    }
    return input;
  }

  // ============================================================
  // WELCOME BANNER
  // ============================================================
  function showWelcomeBanner() {
    var now = new Date();
    var banner =
      '<span class="t-bright">Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)</span>\n\n' +
      '  System load:  0.42           Processes:           142\n' +
      '  Usage of /:   64.2%          Users logged in:     1\n' +
      '  Memory usage: 38%            IPv4 for eth0: 192.168.1.42\n\n' +
      '<span class="t-dim">Type \'help\' for commands. Type \'gui\' to open the profile window.</span>\n';
    print(banner);
  }

  // ============================================================
  // KEYBOARD HANDLING
  // ============================================================
  function setupKeyboard() {
    inputEl.addEventListener('input', function () {
      cursorTextEl.textContent = inputEl.value.slice(0, inputEl.selectionStart);
    });

    var executing = false;

    // Global Ctrl+C handler at document level so it works even when input is hidden
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'c' && runningProcess) {
        e.preventDefault();
        interruptFlag = true;
        inputEl.value = '';
        cursorTextEl.textContent = '';
      }
    });

    inputEl.addEventListener('keydown', async function (e) {
      // Ctrl+C handled by parent
      if (e.ctrlKey && e.key === 'c') { e.preventDefault(); return; }
      // Ctrl+L
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); clearOutput(); return; }
      // Block all other keys while a command is executing (except Ctrl shortcuts)
      if (executing || runningProcess) {
        if (!e.ctrlKey) e.preventDefault();
        return;
      }
      // Ctrl+A
      if (e.ctrlKey && e.key === 'a') { e.preventDefault(); inputEl.setSelectionRange(0, 0); cursorTextEl.textContent = ''; return; }
      // Ctrl+E
      if (e.ctrlKey && e.key === 'e') { e.preventDefault(); inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length); cursorTextEl.textContent = inputEl.value; return; }
      // Tab
      if (e.key === 'Tab') { e.preventDefault(); inputEl.value = tabComplete(inputEl.value); cursorTextEl.textContent = inputEl.value; return; }
      // Up arrow
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          inputEl.value = commandHistory[historyIndex];
          cursorTextEl.textContent = inputEl.value;
          setTimeout(function () { inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length); }, 0);
        }
        return;
      }
      // Down arrow
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) { historyIndex++; inputEl.value = commandHistory[historyIndex]; }
        else { historyIndex = commandHistory.length; inputEl.value = ''; }
        cursorTextEl.textContent = inputEl.value;
        return;
      }
      // Escape - toggle fullscreen
      if (e.key === 'Escape') {
        var win = termEl.closest('.terminal-window');
        if (win) win.classList.toggle('fullscreen');
        return;
      }
      // Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        var value = inputEl.value;
        inputEl.value = '';
        cursorTextEl.textContent = '';
        // REPL mode
        if (inputEl.dataset.replMode && inputEl._replHandler) { inputEl._replHandler(value); return; }
        addPromptLine(value);
        executing = true;
        var inputLine = document.getElementById('term-input-line');
        if (inputLine) inputLine.style.display = 'none';
        await executeInput(value);
        executing = false;
        if (inputLine) inputLine.style.display = '';
        updatePrompt();
        scrollToBottom();
        inputEl.focus();
        return;
      }
      // Update cursor on next tick
      setTimeout(function () { cursorTextEl.textContent = inputEl.value.slice(0, inputEl.selectionStart); }, 0);
    });

    // Cursor blink on focus
    var cursorSpan = document.getElementById('term-cursor');
    inputEl.addEventListener('focus', function () { if (cursorSpan) cursorSpan.classList.add('active'); });
    inputEl.addEventListener('blur', function () { if (cursorSpan) cursorSpan.classList.remove('active'); });

    // Click to focus
    termEl.addEventListener('click', function (e) {
      if (window.getSelection().toString()) return;
      // Don't steal focus from nano/vim overlays
      if (e.target.closest('.term-nano-overlay') || e.target.closest('.term-vim-overlay')) return;
      inputEl.focus();
    });
  }

  // ============================================================
  // PORTFOLIO FILESYSTEM INTEGRATION
  // ============================================================
  function populatePortfolioFiles(data) {
    systemData = typeof window.buildCliData === 'function' ? window.buildCliData(data) : {};
    // Map portfolio structure into IMPORTANT folder
    var importantPath = homePath + '/IMPORTANT';
    var portfolioFiles = {
      'about.txt': systemData.about || '',
      'resume.txt': systemData.resume || '',
      'contact.txt': systemData.contact || '',
      'projects.txt': systemData.projects || '',
      'help.txt': systemData.help || '',
    };
    var importantNode = fsGet(importantPath);
    if (importantNode) {
      for (var name in portfolioFiles) {
        importantNode.children[name] = { type: 'file', content: portfolioFiles[name], perm: '-rw-r--r--', owner: promptUser, size: portfolioFiles[name].length, mtime: new Date() };
      }
      // Skills directory inside IMPORTANT
      var skillsNode = fsGet(importantPath + '/skills');
      if (skillsNode) {
        skillsNode.children['proficient.txt'] = { type: 'file', content: systemData.proficient || '', perm: '-rw-r--r--', owner: promptUser, size: (systemData.proficient || '').length, mtime: new Date() };
        skillsNode.children['familiar.txt'] = { type: 'file', content: systemData.familiar || '', perm: '-rw-r--r--', owner: promptUser, size: (systemData.familiar || '').length, mtime: new Date() };
      }
    }
  }

  // ============================================================
  // INTEGRATION HOOKS (exposed globally)
  // ============================================================

  window.initCLI = async function () {
    termEl = document.getElementById('terminal');
    if (!termEl) return;
    outputEl = document.getElementById('term-output');
    inputEl = document.getElementById('term-input');
    promptEl = document.getElementById('term-prompt');
    cursorTextEl = document.getElementById('term-cursor-text');
    cursorEl = document.getElementById('term-cursor');

    if (!outputEl || !inputEl) return;

    // Save initial HTML for reset
    if (!termEl.dataset.initialHtml) termEl.dataset.initialHtml = termEl.innerHTML;

    // Apply saved theme
    if (localStorage.theme) {
      document.body.classList.remove('theme-amber', 'theme-green', 'theme-mono');
      if (localStorage.theme !== 'default') document.body.classList.add('theme-' + localStorage.theme);
    }

    // Init filesystem
    fsInit();

    // Load profile data
    try {
      var data = window.profileReady ? await window.profileReady : null;
      if (data) {
        promptUser = data.site.promptUser || 'user';
        promptHost = data.site.promptHost || 'ubuntu-server';
        homePath = '/home/' + promptUser;
        envVars.HOME = homePath;
        envVars.USER = promptUser;
        fsInitHome(promptUser, homePath);
        cwd = homePath;
        populatePortfolioFiles(data);
      }
    } catch (err) {
      systemData.help = '<p>Failed to load CLI content. Refresh and try again.</p>';
    }

    // Setup keyboard
    setupKeyboard();
    updatePrompt();
    localStorage.directory = 'home';

    // Show login banner immediately
    commands.login();
    // Auto-focus input
    if (inputEl) setTimeout(function () { inputEl.focus(); }, 100);
  };

  window.resetTerminal = function () {
    var term = document.getElementById('terminal');
    if (!term) return;
    var initial = term.dataset.initialHtml;
    if (initial) term.innerHTML = initial;
    localStorage.directory = 'home';
    localStorage.history = JSON.stringify([]);
    commandHistory = [];
    historyIndex = -1;
    cwd = homePath;
    // Re-init
    termEl = term;
    outputEl = document.getElementById('term-output');
    inputEl = document.getElementById('term-input');
    promptEl = document.getElementById('term-prompt');
    cursorTextEl = document.getElementById('term-cursor-text');
    cursorEl = document.getElementById('term-cursor');
    if (outputEl && inputEl) {
      setupKeyboard();
      updatePrompt();
      if (inputEl) inputEl.focus();
      commands.login();
    }
  };

  window.typeTerminalIntro = function () { return Promise.resolve(); };

  window.typeCommand = function (command) {
    if (!termEl || !inputEl) return;
    var text = String(command || '').trim();
    if (!text) return;
    inputEl.value = '';
    var i = 0;
    function step() {
      if (i >= text.length) {
        var value = inputEl.value;
        inputEl.value = '';
        if (cursorTextEl) cursorTextEl.textContent = '';
        addPromptLine(value);
        executeInput(value).then(function () {
          updatePrompt();
          scrollToBottom();
        });
        return;
      }
      inputEl.value += text[i];
      if (cursorTextEl) cursorTextEl.textContent = inputEl.value;
      i++;
      setTimeout(step, 65 + Math.floor(Math.random() * 35));
    }
    step();
  };

  // Backward compat: getCompletions for any external code
  window.getCompletions = function (input) {
    var raw = input || '';
    var parts = raw.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { matches: [], isArg: false };
    var isArg = parts.length > 1 || /\s$/.test(raw);
    if (!isArg) {
      var prefix = parts[0].toLowerCase();
      var matches = Object.keys(commands).filter(function (c) { return c.startsWith(prefix); });
      return { matches: matches, isArg: false };
    }
    return { matches: [], isArg: true };
  };

})();
