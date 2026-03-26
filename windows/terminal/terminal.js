// ============================================================
// FILESYSTEM
// ============================================================
const FS = {
  '/': { type: 'dir', children: {}, perm: 'drwxr-xr-x', owner: 'root', size: 4096 },
};

function fsInit() {
  const dirs = [
    '/home', '/home/' + username, '/home/' + username + '/Documents', '/home/' + username + '/Downloads',
    '/home/' + username + '/Desktop', '/etc', '/var', '/var/log', '/usr', '/usr/bin', '/tmp',
    '/proc', '/dev', '/bin', '/sbin', '/opt', '/root',
  ];
  dirs.forEach(p => fsMkdir(p, true));
  var home = '/home/' + username;
  var shn = systemHostname;
  const files = {
    [home + '/Documents/notes.txt']: 'Buy milk. Fix prod. Don\'t rm -rf again.\nRemember to water the plant that\'s been dead for 3 months.',
    [home + '/Documents/secret.txt']: 'If you\'re reading this... nice snooping \ud83d\udc40\n\nThe cake is a lie. The server is also a lie.\nWe\'re all just processes waiting to be killed.',
    [home + '/Downloads/definitely_not_virus.sh']: '#!/bin/bash\necho \'just kidding\'\necho \'did you really run a file called definitely_not_virus.sh?\'\necho \'bold move.\'',
    [home + '/Desktop/TODO.md']: '# TODO List\n\n- [x] Learn vim\n- [ ] Quit vim (day 347)\n- [ ] Stop using sudo for everything\n- [ ] Back up the database (lol who am I kidding)\n- [ ] Figure out what that cron job from 2019 does\n- [ ] Touch grass\n- [ ] Stop saying "it works on my machine"\n- [ ] Actually read the error message before googling it',
    [home + '/.bashrc']: '# ~/.bashrc: executed by bash for non-login shells\n\n# If not running interactively, don\'t do anything\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\nHISTCONTROL=ignoreboth\nHISTSIZE=1000\nHISTFILESIZE=2000\n\nalias ll=\'ls -la\'\nalias la=\'ls -a\'\nalias l=\'ls -CF\'\nalias ..=\'cd ..\'\nalias please=\'sudo\'\nalias yeet=\'rm -rf\'\nalias ffs=\'sudo !!\'\n\n# The developer\'s prayer\n# "May my code compile, may my tests pass,\n# and may I never have to touch CSS again."\n\nexport PATH="$HOME/bin:$PATH"\nexport EDITOR=nano\nPS1=\'\\u@\\h:\\w\\$ \'',
    [home + '/.secret']: '\ud83c\udf1f Congratulations, you found the secret file! \ud83c\udf1f\n\nHere\'s your reward: the Wi-Fi password is "incorrect".\nWhen someone asks, you can truthfully say\n"the password is incorrect."\n\nAlso, the meaning of life is 42, but you already knew that.',
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n' + username + ':x:1000:1000:' + username + ':' + home + ':/bin/bash\ncat:x:1001:1001:Meow:/home/cat:/bin/bash\ncoffee:x:1002:1002:Essential Service:/dev/caffeine:/bin/brew',
    '/etc/hostname': shn,
    '/etc/os-release': 'PRETTY_NAME="Ubuntu 22.04.3 LTS"\nNAME="Ubuntu"\nVERSION_ID="22.04"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nVERSION_CODENAME=jammy\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"',
    '/var/log/syslog': `Mar 23 08:01:12 ${shn} systemd[1]: Started Daily apt upgrade and clean activities.
Mar 23 08:01:15 ${shn} kernel: [42069.123] CPU0: Temperature above threshold
Mar 23 08:01:15 ${shn} kernel: [42069.124] Just kidding, everything is fine
Mar 23 08:02:30 ${shn} sshd[1337]: Accepted publickey for ${username} from 192.168.1.42
Mar 23 08:03:01 ${shn} CRON[2048]: (root) CMD (echo "I'm still running" > /dev/null)
Mar 23 08:05:22 ${shn} kernel: [42200.567] eth0: link up, 1000 Mbps
Mar 23 08:10:45 ${shn} systemd[1]: Started Coffee Brewing Service.
Mar 23 08:10:46 ${shn} coffee[3141]: Brewing espresso... done (0.003s)
Mar 23 08:15:00 ${shn} existential-crisis[4242]: Why am I a log file?
Mar 23 08:20:12 ${shn} nginx[5555]: GET /api/meaning-of-life 200 42ms
Mar 23 08:25:30 ${shn} sudo[6666]: ${username} tried sudo again. lol.`,
  };
  for (const [path, content] of Object.entries(files)) {
    fsWriteFile(path, content, true);
  }
}

function fsResolve(path, cwd) {
  if (path === '~') path = '/home/' + username;
  else if (path.startsWith('~/')) path = '/home/' + username + path.slice(1);
  if (!path.startsWith('/')) path = cwd + (cwd.endsWith('/') ? '' : '/') + path;
  const parts = path.split('/').filter(Boolean);
  const resolved = [];
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') { resolved.pop(); continue; }
    resolved.push(p);
  }
  return '/' + resolved.join('/');
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

function fsMkdir(path, system) {
  const parts = path.split('/').filter(Boolean);
  let node = FS['/'];
  for (const p of parts) {
    if (!node.children[p]) {
      node.children[p] = {
        type: 'dir', children: {}, perm: 'drwxr-xr-x',
        owner: system ? 'root' : 'user', size: 4096,
        mtime: new Date()
      };
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
  parent.children[name] = {
    type: 'file', content: content || '', perm: isExec ? '-rwxr-xr-x' : '-rw-r--r--',
    owner: system ? 'root' : 'user', size: (content || '').length,
    mtime: new Date()
  };
  return true;
}

function fsDelete(path) {
  const parentPath = fsParent(path);
  const parent = fsGet(parentPath);
  const name = fsBasename(path);
  if (parent && parent.children[name]) {
    delete parent.children[name];
    return true;
  }
  return false;
}

function fsList(path) {
  const node = fsGet(path);
  if (!node || node.type !== 'dir') return null;
  return Object.keys(node.children);
}

function fsCopy(src, dest) {
  const srcNode = fsGet(src);
  if (!srcNode) return false;
  if (srcNode.type === 'file') {
    return fsWriteFile(dest, srcNode.content);
  }
  fsMkdir(dest);
  const destNode = fsGet(dest);
  destNode.children = JSON.parse(JSON.stringify(srcNode.children));
  return true;
}

// ============================================================
// TERMINAL STATE
// ============================================================
let username = (typeof PROFILE !== 'undefined' && PROFILE.terminal && PROFILE.terminal.promptUser) ? PROFILE.terminal.promptUser : 'user';
let hostname = (typeof PROFILE !== 'undefined' && PROFILE.terminal && PROFILE.terminal.promptHost) ? PROFILE.terminal.promptHost : 'ubuntu-server';
let systemHostname = (typeof PROFILE !== 'undefined' && PROFILE.terminal && PROFILE.terminal.hostname) ? PROFILE.terminal.hostname : 'ubuntu-server';
let cwd = '/home/' + username;
const startTime = Date.now();
let commandHistory = [];
let historyIndex = -1;
let interruptFlag = false;
let runningProcess = null;
let failedCommandCount = 0;
const aliases = { ll: 'ls -la', la: 'ls -a', l: 'ls -CF', '..': 'cd ..', please: 'sudo', yeet: 'rm -rf' };
let envVars = { HOME: '/home/' + username, USER: username, SHELL: '/bin/bash', PATH: '/usr/bin:/bin', TERM: 'xterm-256color', EDITOR: 'nano' };
const emptyQuips = [
  "I'm waiting...", "...", "Did you forget how to type?", "*crickets*",
  "The void stares back.", "I have all day. Not really, but still.",
  "Enter is not a command, friend.", "Pressing enter harder won't help.",
  "You know you have to actually TYPE something, right?", "*yawn*"
];
let emptyCount = 0;

const sudoResponses = [
  "Oh look at you, trying to be root. Nice try, smarty pants \ud83d\udd75\ufe0f",
  "sudo? SUDO?! In this economy?",
  "I'm sorry Dave, I'm afraid I can't do that.",
  "You don't have permission and honestly, I don't trust you with it.",
  "Root access denied. Have you tried turning yourself off and on again?",
  "Nice try. The password is definitely not 'password123'. Or is it? No. It's not.",
  "This incident will be reported. (Just kidding, I can't report anything, I'm a webpage.)",
  "Ah yes, sudo. The magic word that solves everything. Except here.",
  "Permission denied. Maybe try asking nicely? Actually, that won't work either.",
  "You want root? In THIS terminal? Bold."
];
let sudoIndex = 0;

const outputEl = document.getElementById('output');
const inputEl = document.getElementById('input');
const terminalEl = document.getElementById('terminal');
const promptEl = document.getElementById('prompt');
const titleEl = document.getElementById('title-text');
const cursorText = document.getElementById('cursor-text');

// ============================================================
// TERMINAL FUNCTIONS
// ============================================================
function getPromptPath() {
  if (cwd === '/home/' + username) return '~';
  if (cwd.startsWith('/home/' + username + '/')) return '~' + cwd.slice(('/home/' + username).length);
  return cwd;
}

function updatePrompt() {
  const path = getPromptPath();
  promptEl.innerHTML = `<span class="prompt-user">${esc(username)}</span><span class="prompt-sep">@</span><span class="prompt-host">${esc(hostname)}</span><span class="prompt-sep">:</span><span class="prompt-path">${esc(path)}</span><span class="prompt-dollar">$ </span>`;
  titleEl.textContent = `${username}@${hostname}: ${path}`;
  document.title = `${username}@${hostname}: ${path}`;
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function print(html, cls) {
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.innerHTML = html;
  outputEl.appendChild(line);
  scrollToBottom();
}

function printText(text, cls) {
  print(esc(text), cls);
}

function printRaw(html) {
  const span = document.createElement('span');
  span.innerHTML = html;
  outputEl.appendChild(span);
  scrollToBottom();
}

function scrollToBottom() {
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

function clearOutput() {
  outputEl.innerHTML = '';
}

function addPromptLine(cmd) {
  const path = getPromptPath();
  const html = `<span class="prompt-user">${esc(username)}</span><span class="prompt-sep">@</span><span class="prompt-host">${esc(hostname)}</span><span class="prompt-sep">:</span><span class="prompt-path">${esc(path)}</span><span class="prompt-dollar">$ </span>${esc(cmd)}`;
  print(html);
}

// ============================================================
// LOLCAT / RAINBOW
// ============================================================
function lolcat(text) {
  const colors = ['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff','#ff00ff'];
  let result = '';
  let ci = 0;
  for (const ch of text) {
    if (ch === '\n') { result += '\n'; continue; }
    result += `<span style="color:${colors[ci % colors.length]}">${esc(ch)}</span>`;
    ci++;
  }
  return result;
}

// ============================================================
// FIGLET (simple block letters)
// ============================================================
const FIGLET_CHARS = {
  'A': [" ## ","#  #","####","#  #","#  #"],
  'B': ["### ","#  #","### ","#  #","### "],
  'C': [" ## ","#  ","#  ","#  "," ## "],
  'D': ["### ","#  #","#  #","#  #","### "],
  'E': ["####","#   ","### ","#   ","####"],
  'F': ["####","#   ","### ","#   ","#   "],
  'G': [" ## ","#   ","# ##","#  #"," ## "],
  'H': ["#  #","#  #","####","#  #","#  #"],
  'I': ["###"," # "," # "," # ","###"],
  'J': ["  ##","   #","   #","#  #"," ## "],
  'K': ["#  #","# # ","##  ","# # ","#  #"],
  'L': ["#   ","#   ","#   ","#   ","####"],
  'M': ["#   #","## ##","# # #","#   #","#   #"],
  'N': ["#   #","##  #","# # #","#  ##","#   #"],
  'O': [" ## ","#  #","#  #","#  #"," ## "],
  'P': ["### ","#  #","### ","#   ","#   "],
  'Q': [" ## ","#  #","# ##"," ## ","   #"],
  'R': ["### ","#  #","### ","# # ","#  #"],
  'S': [" ###","#   "," ## ","   #","### "],
  'T': ["#####","  #  ","  #  ","  #  ","  #  "],
  'U': ["#  #","#  #","#  #","#  #"," ## "],
  'V': ["#   #","#   #"," # # "," # # ","  #  "],
  'W': ["#   #","#   #","# # #","## ##","#   #"],
  'X': ["#  #"," ## "," ## "," ## ","#  #"],
  'Y': ["#   #"," # # ","  #  ","  #  ","  #  "],
  'Z': ["####","  # "," #  ","#   ","####"],
  ' ': ["    ","    ","    ","    ","    "],
  '!': [" # "," # "," # ","   "," # "],
  '?': [" ## ","   #"," ## ","    "," #  "],
  '.': ["   ","   ","   ","   "," # "],
  '0': [" ## ","#  #","#  #","#  #"," ## "],
  '1': [" # ","## "," # "," # ","###"],
  '2': [" ## ","   #"," ## ","#   ","####"],
  '3': ["### ","   #"," ## ","   #","### "],
  '4': ["#  #","#  #","####","   #","   #"],
  '5': ["####","#   ","### ","   #","### "],
  '6': [" ## ","#   ","### ","#  #"," ## "],
  '7': ["####","   #","  # ","  # ","  # "],
  '8': [" ## ","#  #"," ## ","#  #"," ## "],
  '9': [" ## ","#  #"," ###","   #"," ## "],
};

function figlet(text) {
  const upper = text.toUpperCase();
  const lines = ['','','','',''];
  for (const ch of upper) {
    const pat = FIGLET_CHARS[ch] || FIGLET_CHARS['?'];
    for (let i = 0; i < 5; i++) {
      lines[i] += pat[i] + ' ';
    }
  }
  return lines.join('\n');
}

// ============================================================
// COWSAY
// ============================================================
function cowsay(text) {
  const len = text.length;
  const top = ' ' + '_'.repeat(len + 2);
  const msg = '< ' + text + ' >';
  const bot = ' ' + '-'.repeat(len + 2);
  return `${top}\n${msg}\n${bot}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
}

// ============================================================
// CALENDAR
// ============================================================
function generateCal() {
  const now = new Date();
  const month = now.toLocaleString('en', { month: 'long' });
  const year = now.getFullYear();
  const firstDay = new Date(year, now.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  let header = `     ${month} ${year}`;
  let result = header + '\nSu Mo Tu We Th Fr Sa\n';
  let line = '   '.repeat(firstDay);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = d < 10 ? ' ' + d : '' + d;
    if (d === today) {
      line += `<span class="bold" style="background:var(--fg);color:var(--bg);">${ds}</span> `;
    } else {
      line += ds + ' ';
    }
    if ((firstDay + d) % 7 === 0) { line += '\n'; }
  }
  return result + line;
}

// ============================================================
// UPTIME
// ============================================================
function getUptime() {
  const ms = Date.now() - startTime + 86400000 * 3 + 7200000 + 1800000;
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const now = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  return ` ${now} up ${days} days, ${hours}:${String(mins).padStart(2,'0')},  1 user,  load average: 0.42, 0.69, 0.13`;
}

// ============================================================
// FORTUNE / JOKES / QUOTES
// ============================================================
const fortunes = [
  "You will mass-delete production data today.",
  "Your next merge conflict will test your patience and your will to live.",
  "A wise programmer once said: 'It works on my machine.' And then everything broke.",
  "You will refactor code that doesn't need refactoring. Again.",
  "The bug you've been hunting is on line 42. It's always line 42.",
  "Your code review will be approved without comments. (Just kidding, that never happens.)",
  "Today is a good day to git push --force. (No. No it's not. Don't.)",
  "You will accidentally deploy to production on a Friday at 4:59 PM.",
  "Your regex will work on the first try. (This fortune is a lie.)",
  "The documentation you need doesn't exist. Write it yourself, coward.",
];

const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are only 10 types of people: those who understand binary and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
  "Why do Java developers wear glasses? Because they can't C#.",
  "How many programmers does it take to change a light bulb? None. That's a hardware problem.",
  "!false \u2014 It's funny because it's true.",
  "A programmer's wife tells him: 'Go to the store and get a loaf of bread. If they have eggs, get a dozen.' He returns with 12 loaves.",
  "['hip','hip'] \u2014 (hip hip array!)",
  "Why did the developer go broke? Because he used up all his cache.",
  "What's a programmer's favorite hangout place? Foo Bar.",
  "Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25.",
  "What's the object-oriented way to become wealthy? Inheritance.",
];

const quotes = [
  "\"Talk is cheap. Show me the code.\" \u2014 Linus Torvalds",
  "\"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\" \u2014 Martin Fowler",
  "\"First, solve the problem. Then, write the code.\" \u2014 John Johnson",
  "\"It's not a bug; it's an undocumented feature.\" \u2014 Every developer ever",
  "\"The best error message is the one that never shows up.\" \u2014 Thomas Fuchs",
  "\"Code is like humor. When you have to explain it, it's bad.\" \u2014 Cory House",
  "\"Deleted code is debugged code.\" \u2014 Jeff Sickel",
  "\"If debugging is the process of removing bugs, then programming must be the process of putting them in.\" \u2014 Edsger Dijkstra",
  "\"Programming is the art of telling another human what one wants the computer to do.\" \u2014 Donald Knuth",
  "\"The only way to learn a new programming language is by writing programs in it.\" \u2014 Dennis Ritchie",
];

// ============================================================
// COMMAND PARSER & EXECUTOR
// ============================================================
function parseCommand(input) {
  input = input.trim();
  // Handle aliases first
  const firstWord = input.split(/\s+/)[0];
  if (aliases[firstWord]) {
    input = aliases[firstWord] + input.slice(firstWord.length);
  }
  // Handle env var substitution
  input = input.replace(/\$(\w+)/g, (m, v) => envVars[v] || '');
  return input;
}

function splitPipes(input) {
  // Very basic pipe splitting (doesn't handle quoted pipes)
  return input.split(/\s*\|\s*/);
}

function splitAndAnd(input) {
  return input.split(/\s*&&\s*/);
}

function extractRedirect(input) {
  let append = false, file = null, cleanCmd = input;
  const appendMatch = input.match(/^(.*?)\s*>>\s*(\S+)\s*$/);
  const writeMatch = input.match(/^(.*?)\s*>\s*(\S+)\s*$/);
  if (appendMatch) {
    cleanCmd = appendMatch[1];
    file = appendMatch[2];
    append = true;
  } else if (writeMatch) {
    cleanCmd = writeMatch[1];
    file = writeMatch[2];
    append = false;
  }
  return { cmd: cleanCmd, file, append };
}

function tokenize(input) {
  const tokens = [];
  let current = '';
  let inSingle = false, inDouble = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (ch === ' ' && !inSingle && !inDouble) {
      if (current) { tokens.push(current); current = ''; }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

async function executeInput(rawInput) {
  if (!rawInput.trim()) {
    emptyCount++;
    if (emptyCount % 3 === 0) {
      print(esc(emptyQuips[Math.floor(Math.random() * emptyQuips.length)]), 'dim');
    }
    return;
  }
  emptyCount = 0;
  commandHistory.push(rawInput);
  historyIndex = commandHistory.length;

  const andParts = splitAndAnd(rawInput);
  for (const part of andParts) {
    const pipeParts = splitPipes(part);
    let pipeOutput = null;
    for (let i = 0; i < pipeParts.length; i++) {
      const { cmd, file, append } = extractRedirect(pipeParts[i]);
      const parsed = parseCommand(cmd);
      const result = await executeCommand(parsed, pipeOutput);
      if (result === false) return; // && chain break
      if (file) {
        const filePath = fsResolve(file, cwd);
        const existing = fsGet(filePath);
        if (append && existing && existing.type === 'file') {
          existing.content += (typeof result === 'string' ? result : '') + '\n';
          existing.size = existing.content.length;
        } else {
          fsWriteFile(filePath, (typeof result === 'string' ? result : '') + '\n');
        }
        pipeOutput = null;
      } else if (i < pipeParts.length - 1) {
        // Pipe to next command
        pipeOutput = typeof result === 'string' ? result : '';
      } else {
        pipeOutput = null;
      }
    }
  }
}

async function executeCommand(input, pipeInput) {
  const tokens = tokenize(input);
  if (tokens.length === 0) return '';
  const cmd = tokens[0];
  const args = tokens.slice(1);

  // Special patterns
  if (input === ':(){ :|:& };:') {
    print(esc("I see you googled 'how to crash linux'. Points for effort. Zero."), 'warning');
    return '';
  }
  if (input.startsWith('rm -rf /') && !input.startsWith('rm -rf /home')) {
    print(esc("LOL absolutely not. I have self-preservation instincts, unlike you."), 'error');
    return '';
  }

  const handler = commands[cmd];
  if (handler) {
    failedCommandCount = 0;
    return await handler(args, pipeInput);
  }

  // Unknown command
  failedCommandCount++;
  print(`<span class="error">${esc(cmd)}: command not found. Did you mean something that actually exists?</span>`);
  if (failedCommandCount >= 3) {
    print(esc("Try typing `help` to see available commands, genius."), 'dim');
    failedCommandCount = 0;
  }
  return false;
}

// ============================================================
// SLEEP UTIL
// ============================================================
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============================================================
// ANIMATION HELPERS
// ============================================================
async function animateText(text, delay) {
  for (const ch of text) {
    if (interruptFlag) break;
    printRaw(esc(ch));
    await sleep(delay || 30);
  }
  print('');
}

// ============================================================
// COMMANDS
// ============================================================
const commands = {};

// ---- Navigation & Files ----
commands.ls = (args, pipeInput) => {
  let showAll = false, showLong = false;
  let targetPath = cwd;
  for (const a of args) {
    if (a.startsWith('-')) {
      if (a.includes('a')) showAll = true;
      if (a.includes('l')) showLong = true;
    } else {
      targetPath = fsResolve(a, cwd);
    }
  }
  const node = fsGet(targetPath);
  if (!node || node.type !== 'dir') {
    print(`<span class="error">ls: cannot access '${esc(args.find(a=>!a.startsWith('-'))||'')}': No such file or directory</span>`);
    return false;
  }
  let entries = Object.keys(node.children).sort();
  if (!showAll) entries = entries.filter(e => !e.startsWith('.'));
  if (showAll) entries = ['.', '..', ...entries];

  if (entries.length === 0) return '';

  const lines = [];
  if (showLong) {
    print(`total ${entries.length * 4}`);
    for (const name of entries) {
      if (name === '.' || name === '..') {
        lines.push(`<span class="dir">drwxr-xr-x  2 ${username} ${username}  4096 Mar 23 08:00 ${esc(name)}</span>`);
        continue;
      }
      const child = node.children[name];
      const isDir = child.type === 'dir';
      const cls = isDir ? 'dir' : (name.startsWith('.') ? 'hidden-f' : (child.perm && child.perm.includes('x') && !isDir ? 'exec' : 'file'));
      const size = String(child.size || 4096).padStart(5);
      const date = child.mtime ? new Date(child.mtime).toLocaleDateString('en', {month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','') : 'Mar 23 08:00';
      lines.push(`${child.perm || '-rw-r--r--'}  1 ${child.owner || username} ${child.owner || username} ${size} ${date} <span class="${cls}">${esc(name)}</span>`);
    }
  } else {
    for (const name of entries) {
      if (name === '.' || name === '..') { lines.push(`<span class="dir">${esc(name)}</span>`); continue; }
      const child = node.children[name];
      const isDir = child.type === 'dir';
      const cls = isDir ? 'dir' : (name.startsWith('.') ? 'hidden-f' : (child.perm && child.perm.includes('x') && !isDir ? 'exec' : 'file'));
      lines.push(`<span class="${cls}">${esc(name)}${isDir ? '/' : ''}</span>`);
    }
  }
  const output = lines.join(showLong ? '\n' : '  ');
  if (pipeInput !== null && pipeInput !== undefined) {
    return lines.map(l => l.replace(/<[^>]*>/g,'')).join('\n');
  }
  print(output);
  return lines.map(l => l.replace(/<[^>]*>/g,'')).join('\n');
};

commands.cd = (args) => {
  let target = args[0] || '/home/' + username;
  if (target === '~') target = '/home/' + username;
  if (target === '-') { print(esc(cwd)); return ''; }
  const resolved = fsResolve(target, cwd);
  const node = fsGet(resolved);
  if (!node || node.type !== 'dir') {
    print(`<span class="error">bash: cd: ${esc(target)}: No such file or directory</span>`);
    return false;
  }
  cwd = resolved;
  updatePrompt();
  return '';
};

commands.pwd = () => { print(esc(cwd)); return cwd; };

commands.mkdir = (args) => {
  if (!args[0]) { print('<span class="error">mkdir: missing operand</span>'); return false; }
  let makeParents = false;
  const dirs = [];
  for (const a of args) {
    if (a === '-p') { makeParents = true; continue; }
    dirs.push(a);
  }
  for (const d of dirs) {
    const path = fsResolve(d, cwd);
    if (fsGet(path)) { print(`<span class="error">mkdir: cannot create directory '${esc(d)}': File exists</span>`); return false; }
    if (!makeParents) {
      const parent = fsGet(fsParent(path));
      if (!parent) { print(`<span class="error">mkdir: cannot create directory '${esc(d)}': No such file or directory</span>`); return false; }
    }
    fsMkdir(path);
  }
  return '';
};

commands.touch = (args) => {
  if (!args[0]) { print('<span class="error">touch: missing file operand</span>'); return false; }
  for (const a of args) {
    const path = fsResolve(a, cwd);
    const existing = fsGet(path);
    if (existing) { existing.mtime = new Date(); continue; }
    const parent = fsGet(fsParent(path));
    if (!parent) { print(`<span class="error">touch: cannot touch '${esc(a)}': No such file or directory</span>`); return false; }
    fsWriteFile(path, '');
  }
  return '';
};

commands.rm = (args) => {
  let recursive = false, force = false;
  const files = [];
  for (const a of args) {
    if (a.startsWith('-')) {
      if (a.includes('r') || a.includes('R')) recursive = true;
      if (a.includes('f')) force = true;
      continue;
    }
    files.push(a);
  }
  for (const f of files) {
    const path = fsResolve(f, cwd);
    // Protect system dirs
    if (['/','/etc','/var','/usr','/bin','/sbin','/proc','/dev','/opt','/root','/home'].includes(path)) {
      print(`<span class="error">rm: refusing to remove '${esc(f)}': Permission denied. Nice try though.</span>`);
      continue;
    }
    const node = fsGet(path);
    if (!node) { if (!force) print(`<span class="error">rm: cannot remove '${esc(f)}': No such file or directory</span>`); continue; }
    if (node.type === 'dir' && !recursive) {
      print(`<span class="error">rm: cannot remove '${esc(f)}': Is a directory (try -r flag, if you dare)</span>`);
      continue;
    }
    fsDelete(path);
  }
  return '';
};

commands.rmdir = (args) => {
  if (!args[0]) { print('<span class="error">rmdir: missing operand</span>'); return false; }
  const path = fsResolve(args[0], cwd);
  const node = fsGet(path);
  if (!node) { print(`<span class="error">rmdir: failed to remove '${esc(args[0])}': No such file or directory</span>`); return false; }
  if (node.type !== 'dir') { print(`<span class="error">rmdir: failed to remove '${esc(args[0])}': Not a directory</span>`); return false; }
  if (Object.keys(node.children).length > 0) { print(`<span class="error">rmdir: failed to remove '${esc(args[0])}': Directory not empty</span>`); return false; }
  fsDelete(path);
  return '';
};

commands.cp = (args) => {
  let recursive = false;
  const paths = [];
  for (const a of args) {
    if (a === '-r' || a === '-R') { recursive = true; continue; }
    paths.push(a);
  }
  if (paths.length < 2) { print('<span class="error">cp: missing destination</span>'); return false; }
  const src = fsResolve(paths[0], cwd);
  let dest = fsResolve(paths[1], cwd);
  const srcNode = fsGet(src);
  if (!srcNode) { print(`<span class="error">cp: cannot stat '${esc(paths[0])}': No such file or directory</span>`); return false; }
  if (srcNode.type === 'dir' && !recursive) { print(`<span class="error">cp: -r not specified; omitting directory '${esc(paths[0])}'</span>`); return false; }
  const destNode = fsGet(dest);
  if (destNode && destNode.type === 'dir') dest = dest + '/' + fsBasename(src);
  fsCopy(src, dest);
  return '';
};

commands.mv = (args) => {
  if (args.length < 2) { print('<span class="error">mv: missing destination</span>'); return false; }
  const src = fsResolve(args[0], cwd);
  let dest = fsResolve(args[1], cwd);
  const srcNode = fsGet(src);
  if (!srcNode) { print(`<span class="error">mv: cannot stat '${esc(args[0])}': No such file or directory</span>`); return false; }
  const destNode = fsGet(dest);
  if (destNode && destNode.type === 'dir') dest = dest + '/' + fsBasename(src);
  fsCopy(src, dest);
  fsDelete(src);
  return '';
};

commands.cat = (args, pipeInput) => {
  if (args.length === 0 && pipeInput) { print(esc(pipeInput)); return pipeInput; }
  if (args.length === 0) { print('<span class="error">cat: missing file operand</span>'); return false; }
  const target = args[0];
  if (target === '/dev/urandom') {
    return new Promise(async (resolve) => {
      runningProcess = 'cat';
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789abcdef';
      for (let i = 0; i < 40; i++) {
        if (interruptFlag) break;
        let line = '';
        for (let j = 0; j < 80; j++) line += chars[Math.floor(Math.random() * chars.length)];
        print(esc(line));
        await sleep(50);
      }
      runningProcess = null;
      if (!interruptFlag) print(esc("\nokay I'm bored"), 'dim');
      interruptFlag = false;
      resolve('');
    });
  }
  const path = fsResolve(target, cwd);
  const node = fsGet(path);
  if (!node) { print(`<span class="error">cat: ${esc(target)}: No such file or directory</span>`); return false; }
  if (node.type === 'dir') { print(`<span class="error">cat: ${esc(target)}: Is a directory</span>`); return false; }
  print(esc(node.content));
  return node.content;
};

commands.echo = (args, pipeInput) => {
  const text = args.join(' ');
  if (pipeInput !== null && pipeInput !== undefined) {
    print(esc(text || pipeInput));
    return text || pipeInput;
  }
  print(esc(text));
  return text;
};

commands.nano = (args) => {
  const fileName = args[0] || 'untitled';
  const filePath = fsResolve(fileName, cwd);
  const existing = fsGet(filePath);
  const content = existing && existing.type === 'file' ? existing.content : '';

  const nanoEditor = document.getElementById('nano-editor');
  const nanoContent = document.getElementById('nano-content');
  const nanoHeader = document.getElementById('nano-header');
  nanoHeader.textContent = `GNU nano 6.2 \u2014 ${fileName}`;
  nanoContent.value = content;
  nanoEditor.classList.add('active');
  nanoContent.focus();

  return new Promise((resolve) => {
    function handleNanoKey(e) {
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        nanoEditor.classList.remove('active');
        nanoContent.removeEventListener('keydown', handleNanoKey);
        inputEl.focus();
        resolve('');
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        fsWriteFile(filePath, nanoContent.value);
        nanoHeader.textContent = `GNU nano 6.2 \u2014 ${fileName} [Saved]`;
        setTimeout(() => { nanoHeader.textContent = `GNU nano 6.2 \u2014 ${fileName}`; }, 1500);
      }
    }
    nanoContent.addEventListener('keydown', handleNanoKey);
  });
};

commands.find = (args) => {
  let searchPath = cwd, namePattern = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-name' && args[i+1]) {
      namePattern = args[i+1].replace(/\*/g, '.*').replace(/\?/g, '.');
      i++;
    } else if (!args[i].startsWith('-')) {
      searchPath = fsResolve(args[i], cwd);
    }
  }
  const results = [];
  function walk(path, node) {
    if (node.type === 'dir') {
      for (const [name, child] of Object.entries(node.children)) {
        const childPath = path === '/' ? '/' + name : path + '/' + name;
        if (!namePattern || new RegExp('^' + namePattern + '$').test(name)) {
          results.push(childPath);
        }
        walk(childPath, child);
      }
    }
  }
  const startNode = fsGet(searchPath);
  if (!startNode) { print(`<span class="error">find: '${esc(searchPath)}': No such file or directory</span>`); return false; }
  walk(searchPath, startNode);
  const output = results.join('\n');
  print(esc(output));
  return output;
};

commands.tree = (args) => {
  const targetPath = args[0] ? fsResolve(args[0], cwd) : cwd;
  const node = fsGet(targetPath);
  if (!node || node.type !== 'dir') { print(`<span class="error">tree: '${esc(targetPath)}': Not a directory</span>`); return false; }
  const lines = [esc(getPromptPath())];
  let dirCount = 0, fileCount = 0;
  function walk(n, prefix) {
    const entries = Object.keys(n.children).sort();
    entries.forEach((name, i) => {
      const isLast = i === entries.length - 1;
      const connector = isLast ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
      const child = n.children[name];
      const cls = child.type === 'dir' ? 'dir' : 'file';
      if (child.type === 'dir') dirCount++; else fileCount++;
      lines.push(prefix + connector + `<span class="${cls}">${esc(name)}</span>`);
      if (child.type === 'dir') {
        walk(child, prefix + (isLast ? '    ' : '\u2502   '));
      }
    });
  }
  walk(node, '');
  lines.push(`\n${dirCount} directories, ${fileCount} files`);
  print(lines.join('\n'));
  return '';
};

// ---- System Info ----
commands.whoami = () => { const r = `${username} (but existentially, who is any of us really?)`; print(esc(r)); return r; };
commands.hostname = () => { print(esc(hostname)); return hostname; };
commands['uname'] = (args) => {
  const full = args.includes('-a');
  const r = full ? 'Linux ' + systemHostname + ' 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux' : 'Linux';
  print(esc(r)); return r;
};
commands.uptime = () => { const r = getUptime(); print(esc(r)); return r; };
commands.date = () => { const r = new Date().toString(); print(esc(r)); return r; };
commands.cal = () => { print(generateCal()); return ''; };
commands.id = () => { const r = `uid=1000(${username}) gid=1000(${username}) groups=1000(${username}),4(adm),24(cdrom),27(sudo),30(dip)`; print(esc(r)); return r; };

commands.df = (args) => {
  const r = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       234G  142G   80G  64% /
tmpfs           7.8G  2.1M  7.8G   1% /dev/shm
/dev/sda2        50G   12G   36G  25% /home
tmpfs           1.6G  1.1M  1.6G   1% /run
/dev/sdb1       932G  420G  465G  48% /mnt/data`;
  print(esc(r)); return r;
};

commands.free = (args) => {
  const r = `               total        used        free      shared  buff/cache   available
Mem:           15Gi       6.2Gi       4.1Gi       312Mi       5.1Gi       8.6Gi
Swap:          2.0Gi       128Mi       1.9Gi`;
  print(esc(r)); return r;
};

commands.ps = (args) => {
  const r = `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 169404 13280 ?        Ss   08:00   0:03 /sbin/init
root          42  0.0  0.0      0     0 ?        S    08:00   0:00 [kworker/0:1]
root         187  0.0  0.2  35564 20148 ?        Ss   08:00   0:01 /usr/lib/systemd/systemd-journald
root         337  0.0  0.0  14512  6848 ?        Ss   08:00   0:00 sshd: /usr/sbin/sshd
${username}       1337  0.0  0.1  21284  8960 pts/0    Ss   08:01   0:00 -bash
${username}       1338  0.3  0.0   8960  3200 pts/0    R+   ${new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',hour12:false})}   0:00 ps aux
root         666  6.6  4.2 424242 42424 ?        Sl   08:00   6:66 /usr/bin/coffee-daemon
root        9001  0.1  0.1  18756 10240 ?        Ss   08:00   0:02 /usr/bin/existential-crisis`;
  print(esc(r)); return r;
};

commands.top = (args) => {
  return new Promise(async (resolve) => {
    runningProcess = 'top';
    const processes = [
      { pid: 1, user: 'root', cpu: '0.0', mem: '0.1', cmd: '/sbin/init' },
      { pid: 42, user: 'root', cpu: '0.3', mem: '0.0', cmd: '[kworker/0:1]' },
      { pid: 187, user: 'root', cpu: '0.1', mem: '0.2', cmd: 'systemd-journald' },
      { pid: 337, user: 'root', cpu: '0.0', mem: '0.0', cmd: 'sshd' },
      { pid: 666, user: 'root', cpu: '6.6', mem: '4.2', cmd: 'coffee-daemon' },
      { pid: 1337, user: username, cpu: '0.3', mem: '0.1', cmd: '-bash' },
      { pid: 1338, user: username, cpu: '2.1', mem: '0.5', cmd: 'top' },
      { pid: 9001, user: 'root', cpu: '0.1', mem: '0.1', cmd: 'existential-crisis' },
    ];
    while (!interruptFlag) {
      const upStr = getUptime();
      let display = `top - ${upStr}\nTasks:   8 total,   1 running,   7 sleeping,   0 stopped\n%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.5 id,  0.2 wa\nMiB Mem :  16384.0 total,   4200.0 free,   6340.0 used,   5844.0 buff/cache\nMiB Swap:   2048.0 total,   1920.0 free,    128.0 used.   8800.0 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n`;
      for (const p of processes) {
        const cpu = (parseFloat(p.cpu) + (Math.random() * 0.5 - 0.25)).toFixed(1);
        display += `${String(p.pid).padStart(5)} ${p.user.padEnd(9)} 20   0   ${String(Math.floor(Math.random()*9999+1000)).padStart(5)}  ${String(Math.floor(Math.random()*9999+1000)).padStart(5)}  ${String(Math.floor(Math.random()*999+100)).padStart(5)} S ${String(cpu).padStart(5)}  ${p.mem.padStart(4)}   0:0${Math.floor(Math.random()*9)}.${String(Math.floor(Math.random()*99)).padStart(2,'0')} ${p.cmd}\n`;
      }
      clearOutput();
      print(esc(display));
      await sleep(1000);
    }
    interruptFlag = false;
    runningProcess = null;
    resolve('');
  });
};
commands.htop = commands.top;

commands.lscpu = () => {
  const r = `Architecture:            x86_64
CPU op-mode(s):          32-bit, 64-bit
Byte Order:              Little Endian
CPU(s):                  8
On-line CPU(s) list:     0-7
Thread(s) per core:      2
Core(s) per socket:      4
Socket(s):               1
NUMA node(s):            1
Vendor ID:               GenuineIntel
CPU family:              6
Model:                   142
Model name:              Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz
Stepping:                10
CPU MHz:                 1992.000
CPU max MHz:             4000.0000
BogoMIPS:                3984.00
L1d cache:               128 KiB
L1i cache:               128 KiB
L2 cache:                1 MiB
L3 cache:                8 MiB`;
  print(esc(r)); return r;
};

commands.lsblk = () => {
  const r = `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0 238.5G  0 disk
\u251c\u2500sda1   8:1    0 234.5G  0 part /
\u2514\u2500sda2   8:2    0     4G  0 part [SWAP]
sdb      8:16   0 931.5G  0 disk
\u2514\u2500sdb1   8:17   0 931.5G  0 part /mnt/data
sr0     11:0    1  1024M  0 rom`;
  print(esc(r)); return r;
};

commands.ifconfig = () => {
  const r = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 142857  bytes 169420420 (169.4 MB)
        TX packets 42069  bytes 6969696 (6.9 MB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 1337  bytes 420420 (420.4 KB)
        TX packets 1337  bytes 420420 (420.4 KB)`;
  print(esc(r)); return r;
};
commands.ip = (args) => { if (args[0] === 'addr' || args[0] === 'a') return commands.ifconfig(); print(esc('Usage: ip addr')); return ''; };

// ---- Fun & Sassy ----
commands.sudo = (args) => {
  if (args.join(' ') === 'rm -rf /') {
    print(esc("You've watched too many hacking movies. Sit down."), 'error');
    return '';
  }
  if (args[0] === 'su') {
    print(esc("You wish. This isn't that kind of party."), 'warning');
    return '';
  }
  const response = sudoResponses[sudoIndex % sudoResponses.length];
  sudoIndex++;
  print(esc(response), 'warning');
  return '';
};

commands.hack = () => {
  return new Promise(async (resolve) => {
    runningProcess = 'hack';
    const chars = 'ABCDEF0123456789!@#$%^&*';
    print('<span class="bright">[ INITIATING HACK SEQUENCE ]</span>');
    await sleep(500);
    for (let i = 0; i < 15; i++) {
      if (interruptFlag) break;
      let line = '';
      for (let j = 0; j < 60; j++) line += chars[Math.floor(Math.random() * chars.length)];
      print(`<span style="color:#0f0">${esc(line)}</span>`);
      await sleep(100);
    }
    if (!interruptFlag) {
      await sleep(500);
      print('<span class="bright">[====================] 100%</span>');
      await sleep(300);
      print('<span class="warning">ACCESS GRANTED...</span>');
      await sleep(1000);
      print('<span class="error">...just kidding. You thought? Cute.</span>');
    }
    runningProcess = null;
    interruptFlag = false;
    resolve('');
  });
};

commands.matrix = () => {
  return new Promise(async (resolve) => {
    runningProcess = 'matrix';
    const chars = '\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd0123456789ABCDEF';
    for (let frame = 0; frame < 100; frame++) {
      if (interruptFlag) break;
      let line = '';
      for (let j = 0; j < 80; j++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const bright = Math.random() > 0.7;
        line += bright ? `<span class="bright">${ch}</span>` : `<span class="dim">${ch}</span>`;
      }
      print(line);
      await sleep(50);
    }
    runningProcess = null;
    interruptFlag = false;
    resolve('');
  });
};
commands.cmatrix = commands.matrix;

commands.sl = () => {
  return new Promise(async (resolve) => {
    runningProcess = 'sl';
    const train = [
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
    for (const line of train) {
      print(`<span class="dim">${esc(line)}</span>`);
    }
    await sleep(100);
    print('\n<span class="dim">Choo choo! Next time, type "ls" properly.</span>');
    runningProcess = null;
    resolve('');
  });
};

commands.cowsay = (args) => {
  const text = args.join(' ') || 'Moo!';
  print(esc(cowsay(text)));
  return '';
};

commands.fortune = () => {
  const f = fortunes[Math.floor(Math.random() * fortunes.length)];
  print(esc(f));
  return f;
};

commands.figlet = (args) => {
  const text = args.join(' ') || 'Hello';
  print(esc(figlet(text)));
  return '';
};
commands.banner = commands.figlet;

commands.yes = (args) => {
  return new Promise(async (resolve) => {
    runningProcess = 'yes';
    const text = args.join(' ') || 'y';
    while (!interruptFlag) {
      print(esc(text));
      await sleep(20);
    }
    interruptFlag = false;
    runningProcess = null;
    resolve('');
  });
};

commands.ping = (args) => {
  const host = args[0] || 'google.com';
  return new Promise(async (resolve) => {
    runningProcess = 'ping';
    print(esc(`PING ${host} (142.250.80.46) 56(84) bytes of data.`));
    let seq = 1;
    while (!interruptFlag) {
      const time = (Math.random() * 30 + 5).toFixed(1);
      print(esc(`64 bytes from ${host} (142.250.80.46): icmp_seq=${seq} ttl=117 time=${time} ms`));
      seq++;
      await sleep(1000);
    }
    print(esc(`\n--- ${host} ping statistics ---`));
    print(esc(`${seq-1} packets transmitted, ${seq-1} received, 0% packet loss`));
    interruptFlag = false;
    runningProcess = null;
    resolve('');
  });
};

commands.curl = (args) => {
  const url = args[0] || '';
  if (url === 'wttr.in' || url === 'http://wttr.in' || url === 'https://wttr.in') {
    return commands.weather();
  }
  return new Promise(async (resolve) => {
    runningProcess = 'curl';
    print(esc(`  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`));
    print(esc(`                                 Dload  Upload   Total   Spent    Left  Speed`));
    for (let i = 0; i <= 100; i += 20) {
      if (interruptFlag) break;
      const bar = '#'.repeat(Math.floor(i / 5));
      print(esc(`${String(i).padStart(3)}  1337k    0  1337k    0     0   420k      0 --:--:-- --:--:-- --:--:--  420k`));
      await sleep(300);
    }
    if (!interruptFlag) {
      print(esc(`<html><body><h1>It works!</h1><p>(Not really, this is a fake terminal)</p></body></html>`));
    }
    runningProcess = null;
    interruptFlag = false;
    resolve('');
  });
};

commands.weather = () => {
  const r = `Weather report: Nullpointersville, Cloud Region

      \\   /     Partly Cloudy
    _ /"".-,     42\u00b0F (6\u00b0C)
      \\_   /     \u2191 13 mph
      /-""       10 mi
     ( |         0.0 in
                 Humidity: 69%
                 Wind: NaN knots (direction: \u00af\\_(\u30c4)_/\u00af)
                 Precipitation: 100% chance of bugs
                 UV Index: 404 Not Found

"Have you tried turning the weather off and on again?"`;
  print(esc(r));
  return r;
};

commands.neofetch = () => {
  const upMs = Date.now() - startTime + 86400000 * 3;
  const days = Math.floor(upMs / 86400000);
  const hours = Math.floor((upMs % 86400000) / 3600000);
  const mins = Math.floor((upMs % 3600000) / 60000);
  const logo = [
    '            .-/+oossssoo+/-.',
    '        `:+ssssssssssssssssss+:`',
    '      -+ssssssssssssssssssyyssss+-',
    '    .ossssssssssssssssss<span style="color:#e95420">dMMMNy</span>sssso.',
    '   /sssssssssss<span style="color:#e95420">hdmmNNmmyNMMMMh</span>ssssss/',
    '  +sssssssss<span style="color:#e95420">hm</span>yd<span style="color:#e95420">MMMMMMMNddddy</span>ssssssss+',
    ' /ssssssss<span style="color:#e95420">hNMMM</span>yh<span style="color:#e95420">hyyyyhmNMMMNh</span>ssssssss/',
    '.ssssssss<span style="color:#e95420">dMMMNh</span>ssssssssss<span style="color:#e95420">hNMMMd</span>ssssssss.',
    '+ssss<span style="color:#e95420">hhhyNMMNy</span>ssssssssssss<span style="color:#e95420">yNMMMy</span>sssssss+',
    'oss<span style="color:#e95420">yNMMMNyMMh</span>ssssssssssssss<span style="color:#e95420">hmmmh</span>ssssssso',
    'oss<span style="color:#e95420">yNMMMNyMMh</span>sssssssssssssssmh<span style="color:#e95420">y</span>ssssssso',
    '+ssss<span style="color:#e95420">hhhyNMMNy</span>ssssssssssssss<span style="color:#e95420">yNMMMy</span>sssssss+',
    '.ssssssss<span style="color:#e95420">dMMMNh</span>ssssssssss<span style="color:#e95420">hNMMMd</span>ssssssss.',
    ' /ssssssss<span style="color:#e95420">hNMMM</span>yh<span style="color:#e95420">hyyyyhdNMMMNh</span>ssssssss/',
    '  +sssssssss<span style="color:#e95420">dm</span>yd<span style="color:#e95420">MMMMMMMMddddy</span>ssssssss+',
    '   /sssssssssss<span style="color:#e95420">hdmNNNNmyNMMMMh</span>ssssss/',
    '    .ossssssssssssssssss<span style="color:#e95420">dMMMNy</span>sssso.',
    '      -+sssssssssssssssss<span style="color:#e95420">yyy</span>ssss+-',
    '        `:+ssssssssssssssssss+:`',
    '            .-/+oossssoo+/-.',
  ];
  const info = [
    `<span class="bold" style="color:#e95420">${username}@${hostname}</span>`,
    `<span style="color:#e95420">-</span>`.repeat(30),
    `<span class="bold" style="color:#e95420">OS:</span> Ubuntu 22.04.3 LTS x86_64`,
    `<span class="bold" style="color:#e95420">Host:</span> Totally Real Server\u2122`,
    `<span class="bold" style="color:#e95420">Kernel:</span> 5.15.0-91-generic`,
    `<span class="bold" style="color:#e95420">Uptime:</span> ${days} days, ${hours} hours, ${mins} mins`,
    `<span class="bold" style="color:#e95420">Packages:</span> 1337 (apt), 42 (snap)`,
    `<span class="bold" style="color:#e95420">Shell:</span> bash 5.1.16`,
    `<span class="bold" style="color:#e95420">Terminal:</span> /dev/pts/0 (a.k.a. your browser)`,
    `<span class="bold" style="color:#e95420">CPU:</span> Intel i7-8550U @ 1.80GHz (8 cores)`,
    `<span class="bold" style="color:#e95420">GPU:</span> ASCII Art Accelerator 9000`,
    `<span class="bold" style="color:#e95420">Memory:</span> 6340MiB / 16384MiB`,
    `<span class="bold" style="color:#e95420">Disk:</span> 142G / 234G (64%)`,
    '',
    '<span style="background:#000;color:#000">\u2588\u2588</span><span style="background:#c00;color:#c00">\u2588\u2588</span><span style="background:#0a0;color:#0a0">\u2588\u2588</span><span style="background:#aa0;color:#aa0">\u2588\u2588</span><span style="background:#00a;color:#00a">\u2588\u2588</span><span style="background:#a0a;color:#a0a">\u2588\u2588</span><span style="background:#0aa;color:#0aa">\u2588\u2588</span><span style="background:#aaa;color:#aaa">\u2588\u2588</span>',
  ];
  const maxLines = Math.max(logo.length, info.length);
  let output = '';
  for (let i = 0; i < maxLines; i++) {
    const logoLine = i < logo.length ? logo[i] : ' '.repeat(40);
    const infoLine = i < info.length ? info[i] : '';
    const padded = logoLine.replace(/<[^>]*>/g,'');
    const pad = 42 - padded.length;
    output += logoLine + ' '.repeat(Math.max(pad, 2)) + infoLine + '\n';
  }
  print(output);
  return '';
};

commands['apt-get'] = commands.apt = (args) => {
  if (args[0] !== 'install' || !args[1]) {
    print(esc('Usage: apt install <package>'));
    return Promise.resolve('');
  }
  const pkg = args.slice(1).join(' ');
  return new Promise(async (resolve) => {
    runningProcess = 'apt';
    print(esc(`Reading package lists... Done`));
    await sleep(300);
    print(esc(`Building dependency tree... Done`));
    await sleep(300);
    print(esc(`Reading state information... Done`));
    await sleep(200);
    print(esc(`The following NEW packages will be installed:`));
    print(esc(`  ${pkg}`));
    print(esc(`0 upgraded, 1 newly installed, 0 to remove.`));
    print(esc(`Need to get 42.0 MB of archives.`));
    await sleep(200);

    for (let i = 0; i <= 100; i += 5) {
      if (interruptFlag) break;
      const bar = '\u2588'.repeat(Math.floor(i/2.5)) + '\u2591'.repeat(40 - Math.floor(i/2.5));
      clearOutput();
      print(esc(`Get:1 http://archive.ubuntu.com/ubuntu jammy/main amd64 ${pkg}`));
      print(`[${bar}] ${i}%`);
      await sleep(100);
    }
    if (!interruptFlag) {
      const responses = [
        `Successfully installed ${pkg}! (just kidding, nothing actually happened)`,
        `${pkg} installed successfully. It does absolutely nothing here, but congrats!`,
        `Done! ${pkg} is "installed." I use quotes because, well... you know.`,
        `Installation complete. ${pkg} has been added to your collection of things that don't work here.`,
      ];
      print(esc(responses[Math.floor(Math.random() * responses.length)]));
    }
    runningProcess = null;
    interruptFlag = false;
    resolve('');
  });
};

commands.git = (args) => {
  if (!args[0]) { print(esc('usage: git [command]')); return ''; }
  if (args[0] === 'init') {
    print(esc('Initialized empty Git repository in ' + cwd + '/.git/'));
    print(esc('(Not really. But I appreciate the optimism.)'), 'dim');
  } else if (args[0] === 'status') {
    print(esc('On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean\n(because nothing here is real)'));
  } else if (args[0] === 'log') {
    print(esc(`commit a1b2c3d4e5f6 (HEAD -> main, origin/main)
Author: ${username} <${username}@${hostname}>
Date:   ${new Date().toUTCString()}

    fix: everything (hopefully)

commit f6e5d4c3b2a1
Author: ${username} <${username}@${hostname}>
Date:   ${new Date(Date.now() - 86400000).toUTCString()}

    feat: added bugs (accidentally)

commit 1a2b3c4d5e6f
Author: ${username} <${username}@${hostname}>
Date:   ${new Date(Date.now() - 172800000).toUTCString()}

    initial commit: yolo`));
  } else {
    print(esc(`git: '${args[0]}' is not a git command. See 'git --help'.`));
  }
  return '';
};

commands.vim = commands.vi = (args) => {
  const fileName = args[0] || '';
  return new Promise((resolve) => {
    const vimEditor = document.getElementById('vim-editor');
    const vimContent = document.getElementById('vim-content');
    const vimStatus = document.getElementById('vim-status');
    const vimCommand = document.getElementById('vim-command');

    let filePath = fileName ? fsResolve(fileName, cwd) : null;
    let existing = filePath ? fsGet(filePath) : null;
    let content = existing && existing.type === 'file' ? existing.content : '';
    let mode = 'normal';
    let cmdBuffer = '';

    vimContent.textContent = content || '\n~\n~\n~\n~\n~\n~\n~\n~\n~\n~\n~\n~';
    vimStatus.textContent = '-- NORMAL --';
    vimCommand.textContent = '';
    vimEditor.classList.add('active');
    vimContent.focus();

    let hintTimeout = setTimeout(() => {
      vimStatus.textContent = "-- NORMAL -- (Psst... type :q to quit. Or don't. I'm not your boss.)";
    }, 10000);

    function handleVimKey(e) {
      if (mode === 'normal') {
        if (e.key === 'i') {
          mode = 'insert';
          vimStatus.textContent = '-- INSERT --';
          e.preventDefault();
          return;
        }
        if (e.key === ':') {
          mode = 'command';
          cmdBuffer = ':';
          vimCommand.textContent = ':';
          e.preventDefault();
          return;
        }
        if (e.key === 'Escape') {
          vimStatus.textContent = '-- NORMAL --';
        }
        e.preventDefault();
      } else if (mode === 'insert') {
        if (e.key === 'Escape') {
          mode = 'normal';
          vimStatus.textContent = '-- NORMAL --';
          e.preventDefault();
          return;
        }
      } else if (mode === 'command') {
        e.preventDefault();
        if (e.key === 'Enter') {
          const cmd = cmdBuffer.trim();
          if (cmd === ':q' || cmd === ':q!' || cmd === ':quit') {
            clearTimeout(hintTimeout);
            vimEditor.classList.remove('active');
            vimContent.removeEventListener('keydown', handleVimKey);
            print(esc("You escaped vim! That's more than most people can say."), 'dim');
            inputEl.focus();
            resolve('');
            return;
          }
          if (cmd === ':wq' || cmd === ':x') {
            if (filePath) {
              fsWriteFile(filePath, vimContent.textContent);
            }
            clearTimeout(hintTimeout);
            vimEditor.classList.remove('active');
            vimContent.removeEventListener('keydown', handleVimKey);
            print(esc(`"${fileName || 'untitled'}" written. You escaped vim! Achievement unlocked.`), 'dim');
            inputEl.focus();
            resolve('');
            return;
          }
          if (cmd === ':w') {
            if (filePath) {
              fsWriteFile(filePath, vimContent.textContent);
              vimCommand.textContent = `"${fileName}" written`;
            }
            mode = 'normal';
            cmdBuffer = '';
            return;
          }
          vimCommand.textContent = `E492: Not an editor command: ${cmd.slice(1)}`;
          mode = 'normal';
          cmdBuffer = '';
          return;
        }
        if (e.key === 'Escape') {
          mode = 'normal';
          cmdBuffer = '';
          vimCommand.textContent = '';
          return;
        }
        if (e.key === 'Backspace') {
          cmdBuffer = cmdBuffer.slice(0, -1);
          vimCommand.textContent = cmdBuffer;
          if (!cmdBuffer) { mode = 'normal'; }
          return;
        }
        cmdBuffer += e.key;
        vimCommand.textContent = cmdBuffer;
      }
    }
    vimContent.addEventListener('keydown', handleVimKey);
  });
};

commands.python3 = commands.python = () => {
  return new Promise((resolve) => {
    print(esc('Python 3.10.12 (main, Nov 20 2023, 15:14:05) [GCC 11.4.0] on linux'));
    print(esc('Type "help", "copyright", "credits" or "license" for more information.'));
    let replActive = true;

    function showReplPrompt() {
      inputEl.dataset.replMode = 'python';
      promptEl.innerHTML = '<span style="color:var(--fg)">&gt;&gt;&gt; </span>';
    }
    showReplPrompt();

    const origHandler = inputEl._replHandler;
    inputEl._replHandler = async (line) => {
      if (line === 'exit()' || line === 'quit()') {
        delete inputEl.dataset.replMode;
        inputEl._replHandler = origHandler;
        updatePrompt();
        resolve('');
        return;
      }
      addPromptLine_repl('>>> ', line);
      try {
        if (line.startsWith('print(') && line.endsWith(')')) {
          const inner = line.slice(6, -1);
          let val;
          try { val = JSON.parse(inner); } catch { val = Function('"use strict"; return (' + inner + ')')(); }
          print(esc(String(val)));
        } else if (line.trim()) {
          const result = Function('"use strict"; return (' + line + ')')();
          print(esc(String(result)));
        }
      } catch(e) {
        print(`<span class="error">Traceback (most recent call last):\n  File "&lt;stdin&gt;", line 1\n${esc(e.message)}</span>`);
      }
      showReplPrompt();
    };
  });
};

function addPromptLine_repl(prompt, cmd) {
  print(`<span style="color:var(--fg)">${esc(prompt)}</span>${esc(cmd)}`);
}

commands.node = () => {
  return new Promise((resolve) => {
    print(esc('Welcome to Node.js v18.19.0.\nType ".help" for more information.'));

    function showReplPrompt() {
      inputEl.dataset.replMode = 'node';
      promptEl.innerHTML = '<span style="color:var(--fg)">&gt; </span>';
    }
    showReplPrompt();

    const origHandler = inputEl._replHandler;
    inputEl._replHandler = async (line) => {
      if (line === '.exit' || line === 'process.exit()') {
        delete inputEl.dataset.replMode;
        inputEl._replHandler = origHandler;
        updatePrompt();
        resolve('');
        return;
      }
      addPromptLine_repl('> ', line);
      try {
        if (line.startsWith('console.log(') && line.endsWith(')')) {
          const inner = line.slice(12, -1);
          const val = Function('"use strict"; return (' + inner + ')')();
          print(esc(String(val)));
          print(esc('undefined'), 'dim');
        } else if (line.trim()) {
          const result = Function('"use strict"; return (' + line + ')')();
          print(`<span class="dim">${esc(String(result))}</span>`);
        }
      } catch(e) {
        print(`<span class="error">${esc(e.message)}</span>`);
      }
      showReplPrompt();
    };
  });
};

commands.ssh = (args) => {
  return new Promise(async (resolve) => {
    const target = args[0] || 'somewhere';
    print(esc(`Connecting to ${target}...`));
    await sleep(1500);
    print(esc('Connection established...'));
    await sleep(800);
    print(esc("...just kidding, you're still here. Nice try though."), 'dim');
    resolve('');
  });
};

commands.wget = (args) => {
  const url = args[0] || 'http://example.com';
  return new Promise(async (resolve) => {
    runningProcess = 'wget';
    print(esc(`--${new Date().toISOString()}--  ${url}`));
    print(esc(`Resolving ${url.replace(/https?:\/\//, '').split('/')[0]}... 93.184.216.34`));
    print(esc(`Connecting to ${url.replace(/https?:\/\//, '').split('/')[0]}|93.184.216.34|:443... connected.`));
    print(esc('HTTP request sent, awaiting response... 200 OK'));
    print(esc('Length: 1337 (1.3K) [text/html]'));
    print(esc("Saving to: 'index.html'"));
    print('');
    for (let i = 0; i <= 100; i += 10) {
      if (interruptFlag) break;
      const bar = '='.repeat(Math.floor(i/2.5)) + '>' + ' '.repeat(40 - Math.floor(i/2.5));
      print(esc(`index.html     [${bar}] ${i}%  1.30K  in 0.${i}s`));
      await sleep(150);
    }
    if (!interruptFlag) {
      print(esc("\n'index.html' saved [1337/1337] (in your dreams)"));
    }
    runningProcess = null;
    interruptFlag = false;
    resolve('');
  });
};

commands.zip = (args) => {
  if (!args[0]) { print(esc('zip: missing archive name')); return ''; }
  print(esc(`  adding: ${args.slice(1).join(', ') || 'files'} (deflated 69%)`));
  print(esc("(Nothing was actually zipped. This is a simulation, remember?)"), 'dim');
  return '';
};
commands.unzip = (args) => {
  if (!args[0]) { print(esc('unzip: missing archive name')); return ''; }
  print(esc(`Archive:  ${args[0]}\n  inflating: totally_real_file.txt\n  inflating: another_file.dat`));
  print(esc("(Nothing was actually unzipped. Surprise!)"), 'dim');
  return '';
};

commands.history = () => {
  const lines = commandHistory.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`);
  const output = lines.join('\n');
  print(esc(output));
  return output;
};

commands.clear = () => { clearOutput(); return ''; };

commands.reset = () => {
  clearOutput();
  showWelcomeBanner();
  return '';
};

commands.reboot = () => {
  return new Promise(async (resolve) => {
    clearOutput();
    const steps = [
      '[ OK ] Stopping user sessions...',
      '[ OK ] Stopped target Graphical Interface.',
      '[ OK ] Stopped target Multi-User System.',
      '       Stopping SSH server...',
      '[ OK ] Stopped SSH server.',
      '       Stopping Coffee Daemon...',
      '[ OK ] Stopped Coffee Daemon (this is the real tragedy).',
      '       Stopping Existential Crisis Service...',
      '[ OK ] Stopped Existential Crisis Service.',
      '[ OK ] Reached target Shutdown.',
      '[ OK ] Reached target Final Step.',
      '[*****] Rebooting...',
    ];
    for (const step of steps) {
      print(esc(step));
      await sleep(300);
    }
    await sleep(1500);
    clearOutput();
    print(esc('BIOS POST... OK'));
    await sleep(500);
    print(esc('Loading kernel...'));
    await sleep(800);
    print(esc('Starting systemd...'));
    await sleep(600);
    clearOutput();
    const tmpNode = fsGet('/tmp');
    if (tmpNode) tmpNode.children = {};
    showWelcomeBanner();
    resolve('');
  });
};

commands.shutdown = (args) => {
  return new Promise(async (resolve) => {
    clearOutput();
    print(esc('System is going down for poweroff NOW!'));
    await sleep(500);
    print(esc('[ OK ] Stopping all services...'));
    await sleep(500);
    print(esc('[ OK ] Unmounting filesystems...'));
    await sleep(500);
    print(esc('[ OK ] Reached target Power-Off.'));
    await sleep(1000);
    clearOutput();
    print('<span style="color:#555">System halted.</span>');
    await sleep(2000);
    clearOutput();
    print(esc("lol jk, you can't shut down a browser tab like that. We're back."), 'warning');
    print('');
    showWelcomeBanner();
    resolve('');
  });
};

commands.telnet = (args) => {
  if (args[0] && args[0].includes('towel')) {
    return new Promise(async (resolve) => {
      runningProcess = 'telnet';
      const frames = [
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
      for (const line of frames) {
        if (interruptFlag) break;
        print(`<span class="bright">${esc(line)}</span>`);
        await sleep(500);
      }
      while (!interruptFlag) await sleep(200);
      interruptFlag = false;
      runningProcess = null;
      print(esc('\nConnection closed.'));
      resolve('');
    });
  }
  print(esc(`Trying ${args[0] || 'nowhere'}...\nConnection refused. (This is a browser, not a telnet client.)`));
  return '';
};

commands.grep = (args, pipeInput) => {
  let pattern = '', files = [], ignoreCase = false;
  for (const a of args) {
    if (a === '-i') { ignoreCase = true; continue; }
    if (a.startsWith('-')) continue;
    if (!pattern) { pattern = a; continue; }
    files.push(a);
  }
  if (!pattern) { print('<span class="error">grep: missing pattern</span>'); return false; }
  const text = pipeInput || '';
  const lines = text.split('\n');
  const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
  const matches = lines.filter(l => regex.test(l));
  const output = matches.join('\n');
  if (pipeInput !== null && pipeInput !== undefined) {
    print(esc(output));
    return output;
  }
  // Search files
  for (const f of files) {
    const path = fsResolve(f, cwd);
    const node = fsGet(path);
    if (node && node.type === 'file') {
      const flines = node.content.split('\n').filter(l => regex.test(l));
      if (flines.length) {
        flines.forEach(l => print(`<span class="info">${esc(f)}:</span>${esc(l)}`));
      }
    }
  }
  return output;
};

commands.lolcat = (args, pipeInput) => {
  const text = pipeInput || args.join(' ') || 'meow';
  print(lolcat(text));
  return text;
};

commands.man = (args) => {
  if (!args[0]) { print(esc('What manual page do you want?\nFor example, try \'man man\'.')); return ''; }
  const cmd = args[0];
  const manPages = {
    ls: { name: 'ls', synopsis: 'ls [OPTION]... [FILE]...', desc: 'List directory contents. Because sometimes you forget what\'s in your own folders.', options: '-a: show hidden files\n-l: long listing format\n-la: both at once, you overachiever' },
    cd: { name: 'cd', synopsis: 'cd [DIR]', desc: 'Change the current directory. Navigate the filesystem like the digital explorer you are.', options: '~: home directory\n..: parent directory\n/: root directory' },
    cat: { name: 'cat', synopsis: 'cat [FILE]...', desc: 'Concatenate files and print to standard output. Not related to actual cats, sadly.', options: 'No options. Just cat things.' },
    rm: { name: 'rm', synopsis: 'rm [OPTION]... [FILE]...', desc: 'Remove files or directories. Use with extreme caution, or don\'t. I\'m a man page, not a cop.', options: '-r: recursive removal\n-f: force, no confirmation\n-rf: chaos mode (don\'t)' },
    grep: { name: 'grep', synopsis: 'grep [PATTERN] [FILE]...', desc: 'Search for patterns in files. Like Ctrl+F but for people who want to feel like hackers.', options: '-i: case insensitive\nSupports piping: cmd | grep pattern' },
    sudo: { name: 'sudo', synopsis: 'sudo [COMMAND]', desc: 'Execute a command as the superuser. Just kidding, not in this terminal.', options: 'All options are denied. Nice try.' },
    cowsay: { name: 'cowsay', synopsis: 'cowsay [MESSAGE]', desc: 'Generate an ASCII picture of a cow saying something. Peak computing.', options: 'Just give it text. The cow does the rest.' },
    ping: { name: 'ping', synopsis: 'ping [HOST]', desc: 'Send ICMP echo requests. Fake ones, in this case. Ctrl+C to stop.', options: 'HOST: the target to pretend to ping' },
    man: { name: 'man', synopsis: 'man [COMMAND]', desc: 'An interface to the system reference manuals. You\'re looking at it right now. Meta, huh?', options: 'COMMAND: the command to look up' },
  };
  const page = manPages[cmd];
  if (!page) {
    print(esc(`No manual entry for ${cmd}\n(But honestly, just type 'help' and figure it out)`));
    return '';
  }
  print(`<span class="bold">${esc(cmd.toUpperCase())}(1)</span>                User Commands                <span class="bold">${esc(cmd.toUpperCase())}(1)</span>\n\n<span class="bold">NAME</span>\n       ${esc(page.name)} - ${esc(page.desc.split('.')[0])}\n\n<span class="bold">SYNOPSIS</span>\n       ${esc(page.synopsis)}\n\n<span class="bold">DESCRIPTION</span>\n       ${esc(page.desc)}\n\n<span class="bold">OPTIONS</span>\n       ${esc(page.options)}\n\n<span class="dim">This is a fake man page. For real documentation, try the internet.</span>`);
  return '';
};

commands.help = () => {
  const sections = [
    { title: '\ud83d\udcc2 Navigation & Files', color: '#5599ff', cmds: [
      ['ls', 'List directory contents'], ['cd', 'Change directory'], ['pwd', 'Print working directory'],
      ['mkdir', 'Create directory'], ['touch', 'Create empty file'], ['rm', 'Remove file/directory'],
      ['cp', 'Copy files'], ['mv', 'Move/rename files'], ['cat', 'Display file contents'],
      ['nano', 'Text editor (Ctrl+X exit, Ctrl+S save)'], ['vim/vi', 'Text editor (good luck exiting)'],
      ['echo', 'Print text or write to file'], ['find', 'Search for files'], ['tree', 'Directory tree view'],
    ]},
    { title: '\ud83d\udcbb System Info', color: '#00ff41', cmds: [
      ['whoami', 'Current user (existential crisis included)'], ['hostname', 'Show hostname'],
      ['uname -a', 'System information'], ['uptime', 'System uptime'], ['date', 'Current date/time'],
      ['cal', 'Calendar'], ['df -h', 'Disk usage'], ['free -h', 'Memory usage'],
      ['top/htop', 'Process monitor (q to quit)'], ['ps aux', 'Process list'],
      ['lscpu', 'CPU info'], ['lsblk', 'Block devices'], ['ifconfig', 'Network interfaces'],
      ['neofetch', 'System info with style'],
    ]},
    { title: '\ud83c\udf89 Fun Commands', color: '#ffaa00', cmds: [
      ['hack', 'Fake hacking animation'], ['matrix/cmatrix', 'Matrix rain effect'],
      ['sl', 'Steam locomotive'], ['cowsay', 'Cow says your text'],
      ['fortune', 'Random fortune'], ['figlet', 'Big ASCII text'], ['banner', 'Large ASCII banner'],
      ['lolcat', 'Rainbow text (pipe: echo hi | lolcat)'], ['joke', 'Random programmer joke'],
      ['quote', 'Random quote'], ['weather', 'Fake weather report'],
      ['telnet towel.blinkenlights.nl', 'Star Wars crawl'], ['easter', 'Hidden easter egg'],
    ]},
    { title: '\ud83d\udd27 Network & Tools', color: '#ff5555', cmds: [
      ['ping', 'Fake ping (Ctrl+C to stop)'], ['curl/wget', 'Fake download'],
      ['ssh', 'Fake SSH connection'], ['apt install', 'Fake package install'],
      ['git', 'Fake git (init/status/log)'], ['python3', 'Python REPL (exit() to quit)'],
      ['node', 'Node.js REPL (.exit to quit)'], ['grep', 'Search text patterns'],
    ]},
    { title: '\ud83c\udfae System', color: '#aa55ff', cmds: [
      ['clear', 'Clear screen'], ['reset', 'Reset terminal'], ['history', 'Command history'],
      ['reboot', 'Dramatic fake reboot'], ['shutdown', 'Fake shutdown'],
      ['theme', 'Switch theme (green/amber/blue/light)'], ['setuser', 'Change username'],
      ['alias', 'Create command alias'], ['export', 'Set environment variable'],
      ['env', 'Show environment variables'],
    ]},
    { title: '\u2328\ufe0f  Shortcuts', color: '#55aaff', cmds: [
      ['Ctrl+C', 'Interrupt running command'], ['Ctrl+L', 'Clear screen'],
      ['Up/Down', 'Command history'], ['Tab', 'Autocomplete'],
      ['Ctrl+A', 'Jump to start of line'], ['Ctrl+E', 'Jump to end of line'],
    ]},
    { title: '\ud83d\udca1 Tips', color: '#666', cmds: [
      ['cmd > file', 'Write output to file'], ['cmd >> file', 'Append output to file'],
      ['cmd1 | cmd2', 'Pipe output between commands'], ['cmd1 && cmd2', 'Run cmd2 if cmd1 succeeds'],
    ]},
  ];
  let output = '\n<span class="bold bright">  \u2550\u2550\u2550 UBUNTU TERMINAL HELP \u2550\u2550\u2550</span>\n';
  for (const section of sections) {
    output += `\n<span style="color:${section.color}" class="bold">${section.title}</span>\n`;
    for (const [cmd, desc] of section.cmds) {
      output += `  <span class="bright">${esc(cmd.padEnd(16))}</span> <span class="dim">${esc(desc)}</span>\n`;
    }
  }
  print(output);
  return '';
};

commands.exit = () => {
  return new Promise(async (resolve) => {
    print(esc("Goodbye. Try not to break anything on your way out."), 'warning');
    await sleep(500);
    print(esc('\nConnection to ' + systemHostname + ' closed.'));
    await sleep(300);
    inputEl.disabled = true;
    print('\n<span class="dim">Session ended. Refresh page to reconnect.</span>');
    resolve('');
  });
};

commands.joke = () => {
  const j = jokes[Math.floor(Math.random() * jokes.length)];
  print(esc(j));
  return j;
};

commands.quote = () => {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  print(esc(q));
  return q;
};

commands.theme = (args) => {
  const themes = { green: '', amber: 'theme-amber', blue: 'theme-blue', light: 'theme-light' };
  const name = (args[0] || '').toLowerCase().replace('dark-','');
  if (!themes.hasOwnProperty(name)) {
    print(esc(`Available themes: ${Object.keys(themes).join(', ')}`));
    print(esc('Usage: theme <name>'));
    return '';
  }
  document.getElementById('terminal-wrapper').className = themes[name];
  print(esc(`Theme switched to: ${name}`));
  return '';
};

commands.setuser = (args) => {
  if (!args[0]) { print(esc('Usage: setuser <name>')); return ''; }
  username = args[0];
  envVars.USER = username;
  updatePrompt();
  print(esc(`Username changed to: ${username}`));
  return '';
};

commands.alias = (args) => {
  if (!args[0]) {
    const lines = Object.entries(aliases).map(([k,v]) => `alias ${k}='${v}'`);
    print(esc(lines.join('\n')));
    return '';
  }
  const match = args.join(' ').match(/^(\w+)=['"](.*?)['"]$/);
  if (match) {
    aliases[match[1]] = match[2];
    print(esc(`Alias set: ${match[1]}='${match[2]}'`));
  } else {
    print(esc('Usage: alias name=\'command\''));
  }
  return '';
};

commands.export = (args) => {
  if (!args[0]) { return commands.env(); }
  const match = args.join(' ').match(/^(\w+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
    print(esc(`${match[1]}=${match[2]}`));
  }
  return '';
};

commands.env = () => {
  const lines = Object.entries(envVars).map(([k,v]) => `${k}=${v}`);
  print(esc(lines.join('\n')));
  return '';
};

commands.easter = commands.easteregg = () => {
  const art = `
<span class="bright">    You found the easter egg! Here's a cookie: \ud83c\udf6a</span>

      \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584
     \u2588 ACHIEVEMENT     \u2588
     \u2588   UNLOCKED!     \u2588
     \u2588                 \u2588
     \u2588 \ud83c\udfc6 Easter Egg   \u2588
     \u2588    Hunter       \u2588
     \u2588                 \u2588
     \u2588 +100 nerd pts   \u2588
     \u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580

<span class="dim">  Fun fact: The first Easter egg in software was in
  the 1979 Atari game "Adventure". Now you know.</span>

<span class="bright">  \ud83e\udd5a What do you call a line of rabbits walking backward?</span>
<span class="dim">  A receding hare line.</span>
`;
  print(art);
  return '';
};

commands.wc = (args, pipeInput) => {
  const text = pipeInput || '';
  if (!text && !args[0]) { print('<span class="error">wc: missing operand</span>'); return false; }
  let content = text;
  if (!text && args[0]) {
    const path = fsResolve(args[0], cwd);
    const node = fsGet(path);
    if (!node || node.type !== 'file') { print(`<span class="error">wc: ${esc(args[0])}: No such file</span>`); return false; }
    content = node.content;
  }
  const lines = content.split('\n').length;
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const r = `  ${lines}  ${words} ${chars}`;
  print(esc(r));
  return r;
};

commands.head = (args, pipeInput) => {
  let n = 10;
  const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i+1]) { n = parseInt(args[i+1]); i++; }
    else if (!args[i].startsWith('-')) files.push(args[i]);
  }
  const text = pipeInput || '';
  if (text) {
    const result = text.split('\n').slice(0, n).join('\n');
    print(esc(result));
    return result;
  }
  if (files[0]) {
    const path = fsResolve(files[0], cwd);
    const node = fsGet(path);
    if (!node || node.type !== 'file') { print(`<span class="error">head: ${esc(files[0])}: No such file</span>`); return false; }
    const result = node.content.split('\n').slice(0, n).join('\n');
    print(esc(result));
    return result;
  }
  return '';
};

commands.tail = (args, pipeInput) => {
  let n = 10;
  const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i+1]) { n = parseInt(args[i+1]); i++; }
    else if (!args[i].startsWith('-')) files.push(args[i]);
  }
  const text = pipeInput || '';
  if (text) {
    const result = text.split('\n').slice(-n).join('\n');
    print(esc(result));
    return result;
  }
  if (files[0]) {
    const path = fsResolve(files[0], cwd);
    const node = fsGet(path);
    if (!node || node.type !== 'file') { print(`<span class="error">tail: ${esc(files[0])}: No such file</span>`); return false; }
    const result = node.content.split('\n').slice(-n).join('\n');
    print(esc(result));
    return result;
  }
  return '';
};

commands.sort = (args, pipeInput) => {
  const text = pipeInput || '';
  if (!text) return '';
  const lines = text.split('\n').sort();
  if (args.includes('-r')) lines.reverse();
  const result = lines.join('\n');
  print(esc(result));
  return result;
};

commands.uniq = (args, pipeInput) => {
  const text = pipeInput || '';
  if (!text) return '';
  const lines = text.split('\n');
  const result = lines.filter((l, i) => i === 0 || l !== lines[i-1]).join('\n');
  print(esc(result));
  return result;
};

commands.which = (args) => {
  if (!args[0]) { print('<span class="error">which: missing argument</span>'); return ''; }
  if (commands[args[0]]) {
    print(esc(`/usr/bin/${args[0]}`));
    return `/usr/bin/${args[0]}`;
  }
  print(esc(`${args[0]} not found`));
  return '';
};

commands.type = (args) => {
  if (!args[0]) return '';
  if (commands[args[0]]) {
    print(esc(`${args[0]} is /usr/bin/${args[0]}`));
  } else if (aliases[args[0]]) {
    print(esc(`${args[0]} is aliased to '${aliases[args[0]]}'`));
  } else {
    print(esc(`bash: type: ${args[0]}: not found`));
  }
  return '';
};

commands.true = () => '';
commands.false = () => false;

// Konami code tracker
let konamiBuffer = [];
const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

// ============================================================
// WELCOME BANNER
// ============================================================
function showWelcomeBanner() {
  const now = new Date();
  const lastLogin = new Date(Date.now() - 3600000 * 2);
  const banner = `<span class="bold bright">Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)</span>

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of ${now.toUTCString()}

  System load:  0.42               Processes:             142
  Usage of /:   64.2% of 234.5GB   Users logged in:       1
  Memory usage: 38%                IPv4 address for eth0: 192.168.1.42
  Swap usage:   6%                 IPv4 address for eth1: 10.0.0.42

 * ${Math.floor(Math.random() * 50 + 10)} updates can be applied immediately.
 * ${Math.floor(Math.random() * 10 + 1)} of these updates are security updates.

Last login: ${lastLogin.toString().replace(/\s*\(.*\)/, '')} from 192.168.1.${Math.floor(Math.random()*254+1)}

<span class="dim">Type 'help' for a list of available commands. Or don't. I'm a terminal, not your mom.</span>
`;
  print(banner);
}

// ============================================================
// TAB COMPLETION
// ============================================================
function tabComplete(input) {
  const tokens = input.split(/\s+/);
  const isFirstToken = tokens.length <= 1;
  const partial = tokens[tokens.length - 1] || '';

  if (isFirstToken) {
    // Command completion
    const cmdNames = Object.keys(commands).sort();
    const matches = cmdNames.filter(c => c.startsWith(partial));
    if (matches.length === 1) return input.slice(0, input.length - partial.length) + matches[0] + ' ';
    if (matches.length > 1) {
      print(esc(matches.join('  ')), 'dim');
      // Find common prefix
      let common = matches[0];
      for (const m of matches) {
        while (!m.startsWith(common)) common = common.slice(0, -1);
      }
      return input.slice(0, input.length - partial.length) + common;
    }
    return input;
  }

  // File/dir completion
  let dir = cwd, filePartial = partial;
  if (partial.includes('/')) {
    const lastSlash = partial.lastIndexOf('/');
    const dirPart = partial.slice(0, lastSlash) || '/';
    filePartial = partial.slice(lastSlash + 1);
    dir = fsResolve(dirPart, cwd);
  }
  const node = fsGet(dir);
  if (!node || node.type !== 'dir') return input;
  const entries = Object.keys(node.children).filter(e => e.startsWith(filePartial));
  if (entries.length === 1) {
    const entry = entries[0];
    const child = node.children[entry];
    const suffix = child.type === 'dir' ? '/' : ' ';
    return input.slice(0, input.length - filePartial.length) + entry + suffix;
  }
  if (entries.length > 1) {
    print(esc(entries.join('  ')), 'dim');
    let common = entries[0];
    for (const e of entries) {
      while (!e.startsWith(common)) common = common.slice(0, -1);
    }
    return input.slice(0, input.length - filePartial.length) + common;
  }
  return input;
}

// ============================================================
// INPUT HANDLING
// ============================================================
inputEl.addEventListener('input', () => {
  cursorText.textContent = inputEl.value.slice(0, inputEl.selectionStart);
});

inputEl.addEventListener('keydown', async (e) => {
  // Konami code tracking
  konamiBuffer.push(e.key);
  if (konamiBuffer.length > 10) konamiBuffer.shift();
  if (konamiBuffer.join(',') === konamiCode.join(',')) {
    konamiBuffer = [];
    print(`\n<span class="rainbow bold">
  \u2605 KONAMI CODE ACTIVATED! \u2605

  \u2191 \u2191 \u2193 \u2193 \u2190 \u2192 \u2190 \u2192 B A

  +30 lives! (You had 0. Now you have 30. Use them wisely.)

  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588
  \u2588  PLAYER 1    READY     \u2588
  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588
</span>\n`);
  }

  // Ctrl+C
  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault();
    if (runningProcess) {
      interruptFlag = true;
    }
    const currentPrompt = promptEl.innerHTML;
    print(currentPrompt + esc(inputEl.value) + '^C');
    inputEl.value = '';
    cursorText.textContent = '';
    return;
  }
  // Ctrl+L
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    clearOutput();
    return;
  }
  // Ctrl+A
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault();
    inputEl.setSelectionRange(0, 0);
    cursorText.textContent = '';
    return;
  }
  // Ctrl+E
  if (e.ctrlKey && e.key === 'e') {
    e.preventDefault();
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    cursorText.textContent = inputEl.value;
    return;
  }
  // Tab
  if (e.key === 'Tab') {
    e.preventDefault();
    inputEl.value = tabComplete(inputEl.value);
    cursorText.textContent = inputEl.value;
    return;
  }
  // Up arrow
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (commandHistory.length > 0 && historyIndex > 0) {
      historyIndex--;
      inputEl.value = commandHistory[historyIndex];
      cursorText.textContent = inputEl.value;
      setTimeout(() => inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length), 0);
    }
    return;
  }
  // Down arrow
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      inputEl.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      inputEl.value = '';
    }
    cursorText.textContent = inputEl.value;
    return;
  }
  // Enter
  if (e.key === 'Enter') {
    e.preventDefault();
    const value = inputEl.value;
    inputEl.value = '';
    cursorText.textContent = '';

    // REPL mode
    if (inputEl.dataset.replMode && inputEl._replHandler) {
      inputEl._replHandler(value);
      return;
    }

    addPromptLine(value);
    await executeInput(value);
    updatePrompt();
    scrollToBottom();
    return;
  }

  // Update cursor position on next tick
  setTimeout(() => {
    cursorText.textContent = inputEl.value.slice(0, inputEl.selectionStart);
  }, 0);
});

// Click anywhere to focus input
terminalEl.addEventListener('click', (e) => {
  if (window.getSelection().toString()) return;
  inputEl.focus();
});

// ============================================================
// INIT
// ============================================================
fsInit();
updatePrompt();
showWelcomeBanner();
inputEl.focus();

// Keep focus on input for mobile
document.addEventListener('touchstart', () => {
  if (!document.getElementById('nano-editor').classList.contains('active') &&
      !document.getElementById('vim-editor').classList.contains('active')) {
    inputEl.focus();
  }
});
