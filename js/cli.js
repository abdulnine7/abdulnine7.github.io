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

// Turn on fullscreen.
const registerFullscreenToggle = () => {
  $('.button.green').click(() => {
    $('.flip-box').removeClass('minimized');
    $('.flip-box').toggleClass('fullscreen');
    $('.resume-frame').attr("src", $(".resume-frame").attr("src")); // reload resume if its open
  });
};
const registerMinimizedToggle = () => {
  $('.button.yellow').click(() => {
    $('.flip-box').removeClass('fullscreen');
    $('.flip-box').toggleClass('minimized');
  });
};

// Create new directory in current directory.
commands.mkdir = () => errors.noWriteAccess;

// Create new directory in current directory.
commands.touch = () => errors.noWriteAccess;

// Remove file from current directory.
commands.rm = () => errors.noWriteAccess;

// Sudo command show hackerman meme
commands.sudo = () => {
  return ' <img src="data/sudo.jpg" alt="Sudo not allowed" class="sudo" >'
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
  gui: 'gui - flip to the graphical interface',
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

// Flip to GUI.
commands.gui = () => {
  if (typeof flipWindow === 'function') {
    flipWindow();
    return null;
  }
  return '<p class="gray">GUI unavailable.</p>';
};

// Open GUI section and flip.
commands.open = (section) => {
  const target = section ? section.trim().toLowerCase() : '';
  if (!target || !guiSections.includes(target)) {
    return `<p>Usage: open ${guiSections.join(' | ')}</p>`;
  }
  if (typeof flipWindow === 'function') {
    flipWindow();
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
$(() => {
  registerFullscreenToggle();
  registerMinimizedToggle();
  const cmd = document.getElementById('terminal');

  $.ajaxSetup({ cache: false });
  const pages = [];
  pages.push($.get('pages/about.html'));
  pages.push($.get('pages/contact.html'));
  pages.push($.get('pages/familiar.html'));
  pages.push($.get('pages/help.html'));
  pages.push($.get('pages/proficient.html'));
  pages.push($.get('pages/resume.html'));
  pages.push($.get('pages/home.html'));
  pages.push($.get('pages/skills.html'));
  pages.push($.get('pages/projects.html'));

  $.when
    .apply($, pages)
    .done(
      (
        aboutData,
        contactData,
        familiarData,
        helpData,
        proficientData,
        resumeData,
        homeData,
        skillsData,
        projectsData,
      ) => {
        systemData['about'] = aboutData[0];
        systemData['contact'] = contactData[0];
        systemData['familiar'] = familiarData[0];
        systemData['help'] = helpData[0];
        systemData['proficient'] = proficientData[0];
        systemData['resume'] = resumeData[0];
        systemData['home'] = homeData[0];
        systemData['skills'] = skillsData[0];
        systemData['projects'] = projectsData[0];
      },
    )
    .fail(() => {
      systemData['help'] = '<p>Failed to load CLI content. Refresh and try again.</p>';
    })
    .always(() => {
      new Shell(cmd, commands);
    });
});
