/* global $, localStorage, Shell */

const errors = {
  invalidDirectory: 'Error: not a valid directory',
  noWriteAccess: 'Error: you do not have write access to this directory',
  fileNotFound: 'Error: file not found in current directory',
  fileNotSpecified: 'Error: you did not specify a file',
  invalidFile: 'Error: not a valid file',
  noSudoAccess: 'Error: sudo not allowed'
};

const struct = {
  home: {
    dirs: ['skills'],
    files: ['about', 'resume', 'contact', 'projects', 'help']
  },
  skills: {
    dirs: [],
    files: ['proficient', 'familiar']
  }
};

const commands = {};
let systemData = {};
const homePath = '/home/abdul';
const guiSections = ['about', 'education', 'skills', 'experience', 'projects', 'resume', 'contact'];

const getDirectory = () => localStorage.directory;
const setDirectory = (dir) => {
  localStorage.directory = dir;
};

// Create new directory in current directory.
commands.mkdir = () => errors.noWriteAccess;

// Create new directory in current directory.
commands.touch = () => errors.noWriteAccess;

// Remove file from current directory.
commands.rm = () => errors.noWriteAccess;

// Sudo command show hackerman meme
commands.sudo = () => {
  return ' <img src="assets/images/sudo.jpg" alt="Sudo not allowed" class="sudo" >'
}

commands.prime = () => {
  return "<span style=\"line-height: 1;\" >\
  ───────────▄▄▄▄▄▄▄▄▄───────────<br>\
  ────────▄█████████████▄────────<br>\
  █████──█████████████████──█████<br>\
  ▐████▌─▀███▄───────▄███▀─▐████▌<br>\
  ─█████▄──▀███▄───▄███▀──▄█████─<br>\
  ─▐██▀███▄──▀███▄███▀──▄███▀██▌─<br>\
  ──███▄▀███▄──▀███▀──▄███▀▄███──<br>\
  ──▐█▄▀█▄▀███─▄─▀─▄─███▀▄█▀▄█▌──<br>\
  ───███▄▀█▄██─██▄██─██▄█▀▄███───<br>\
  ────▀███▄▀██─█████─██▀▄███▀────<br>\
  ───█▄─▀█████─█████─█████▀─▄█───<br>\
  ───███────────███────────███───<br>\
  ───███▄────▄█─███─█▄────▄███───<br>\
  ───█████─▄███─███─███▄─█████───<br>\
  ───█████─████─███─████─█████───<br>\
  ───█████─████─███─████─█████───<br>\
  ───█████─████─███─████─█████───<br>\
  ───█████─████▄▄▄▄▄████─█████───<br>\
  ────▀███─█████████████─███▀────<br>\
  ──────▀█─███─▄▄▄▄▄─███─█▀──────<br>\
  ─────────▀█▌▐█████▌▐█▀─────────<br>\
  ────────────███████────────────<br>\
  </span>";
}


// View contents of specified directory.
commands.ls = (directory) => {
  const currDir = getDirectory();

  if (directory === '..' || directory === '~') {
    const home = struct.home;
    const dirs = home.dirs.map((d) => `<span class="li-blue">${d}/</span>`);
    const files = home.files.map((f) => `${f}.txt`);
    return [...dirs, ...files].join('  ');
  }

  if (directory && struct[directory]) {
    const target = struct[directory];
    const dirs = target.dirs.map((d) => `<span class="li-blue">${d}/</span>`);
    const files = target.files.map((f) => `${f}.txt`);
    return [...dirs, ...files].join('  ');
  }

  const target = struct[currDir];
  const dirs = target.dirs.map((d) => `<span class="li-blue">${d}/</span>`);
  const files = target.files.map((f) => `${f}.txt`);
  return [...dirs, ...files].join('  ');
};

const commandHelp = {
  help: 'help [command] - show available commands or details about one command',
  path: 'path - display current directory',
  ls: 'ls - show files in current directory',
  cd: 'cd DIRECTORY - move into DIRECTORY or cd to return to home',
  cat: 'cat FILENAME - display FILENAME in window',
  open: 'open SECTION - open GUI section (about, education, skills, experience, projects, resume, contact)',
  gui: 'gui - open the profile window',
  history: 'history - see your command history',
  login: 'login - fetch login IP/location (opt-in)',
  clear: 'clear - clear current window'
};

// View list of possible commands.
commands.help = (cmd) => {
  if (cmd && commandHelp[cmd]) {
    return `<p>${commandHelp[cmd]}</p>`;
  }
  return systemData.help || '<p>Loading content... try again.</p>';
};

// Display current path.
commands.path = () => {
  const dir = getDirectory();
  return dir === 'home' ? homePath : `${homePath}/${dir}`;
};

// See command history.
commands.history = () => {
  let history = localStorage.history;
  history = history ? Object.values(JSON.parse(history)) : [];
  return `<p>${history.join('<br>')}</p>`;
};

// Open GUI window.
commands.gui = () => {
  if (typeof window.showWindowById === 'function') {
    window.showWindowById('gui');
    return null;
  }
  return '<p class="gray">GUI unavailable.</p>';
};

// Open GUI section and bring window to front.
commands.open = (section) => {
  const target = section ? section.trim().toLowerCase() : '';
  if (!target || !guiSections.includes(target)) {
    return `<p>Usage: open ${guiSections.join(' | ')}</p>`;
  }
  if (typeof window.showWindowById === 'function') {
    window.showWindowById('gui');
  }
  if (typeof showSection === 'function') {
    showSection(target);
    return null;
  }
  return '<p class="gray">GUI section unavailable.</p>';
};

// Fetch login info on-demand.
commands.login = () => {
  const block = $('<div class="loginInfo"></div>');
  $('#terminal').append(block);
  if (typeof fetchLoginInfo === 'function') {
    fetchLoginInfo(block);
    return null;
  }
  return '<p class="gray">Login info unavailable.</p>';
};

window.getCompletions = function(input, directory) {
  const raw = input || '';
  const hasTrailingSpace = /\s$/.test(raw);
  const trimmed = raw.replace(/\s+$/,'');
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { matches: [], isArg: false };
  }

  const cmd = parts[0].toLowerCase();
  const isArg = parts.length > 1 || hasTrailingSpace;
  if (!isArg) {
    const prefix = parts[0].toLowerCase();
    const matches = Object.keys(commandHelp).filter((c) => c.startsWith(prefix));
    return { matches, isArg: false };
  }

  const prefix = hasTrailingSpace ? '' : parts[parts.length - 1].toLowerCase();
  let pool = [];
  if (cmd === 'cd') {
    const curr = struct[localStorage.directory] || struct.home;
    pool = curr.dirs.concat(['..', '~']);
  } else if (cmd === 'cat') {
    const curr = struct[localStorage.directory] || struct.home;
    pool = curr.files.map((f) => `${f}.txt`);
  } else if (cmd === 'open') {
    pool = guiSections;
  }

  const matches = pool.filter((item) => item.toLowerCase().startsWith(prefix));
  return { matches, isArg: true };
};

// Move into specified directory.
commands.cd = (newDirectory) => {
  const currDir = getDirectory();
  const newDir = newDirectory ? newDirectory.trim() : '';

  if (newDir === '' || newDir === '~') {
    setDirectory('home');
    return null;
  }

  if (newDir === '..') {
    if (currDir !== 'home') {
      setDirectory('home');
    }
    return null;
  }

  if (struct[currDir] && struct[currDir].dirs.includes(newDir)) {
    setDirectory(newDir);
    return null;
  }

  return errors.invalidDirectory;
};

// Display contents of specified file.
commands.cat = (filename) => {
  if (!filename) return errors.fileNotSpecified;

  const currDir = getDirectory();
  const clean = filename.trim();
  const hasValidFileExtension = (name, extension) => name.endsWith(extension);

  if (!hasValidFileExtension(clean, '.txt')) return errors.invalidFile;

  const parts = clean.split('/');
  let dir = currDir;
  let fileKey = clean.replace('.txt', '');

  if (parts.length === 2) {
    dir = parts[0];
    fileKey = parts[1].replace('.txt', '');
  }

  if (!struct[dir] || !struct[dir].files.includes(fileKey)) {
    return errors.noSuchFileOrDirectory;
  }

  return systemData[fileKey] || errors.fileNotFound;
};

// Initialize cli.
window.initCLI = async () => {
  const cmd = document.getElementById('terminal');
  if (!cmd) return;
  if (!cmd.dataset.initialHtml) {
    cmd.dataset.initialHtml = cmd.innerHTML;
  }

  try {
    const data = window.profileReady ? await window.profileReady : null;
    if (data && typeof window.buildCliData === 'function') {
      systemData = window.buildCliData(data);
      const prompt = document.querySelector('.prompt .home');
      if (prompt) {
        prompt.textContent = `${data.site.promptUser}@${data.site.promptHost}`;
      }
    }
  } catch (err) {
    systemData['help'] = '<p>Failed to load CLI content. Refresh and try again.</p>';
  } finally {
    new Shell(cmd, commands);
  }
};

window.resetTerminal = () => {
  const cmd = document.getElementById('terminal');
  if (!cmd) return;
  const initial = cmd.dataset.initialHtml;
  if (initial) {
    cmd.innerHTML = initial;
  }
  localStorage.directory = 'home';
  localStorage.history = JSON.stringify('');
  localStorage.historyIndex = -1;
  localStorage.inHistory = false;
  const input = cmd.querySelector('.input');
  if (input) input.focus();
};
