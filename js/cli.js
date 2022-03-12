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
  home: ['about', 'resume', 'contact', 'projects'],
  skills: ['proficient', 'familiar'],
};

const commands = {};
let systemData = {};
const homePath = '/home/abdul';

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
  // console.log(systemData);
  if (directory === '..' || directory === '~') {
    return systemData['home'];
  }

  if (directory in struct) {
    return systemData[directory];
  }

  return systemData[getDirectory()];
};

// View list of possible commands.
commands.help = () => systemData.help;

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

// Move into specified directory.
commands.cd = (newDirectory) => {
  const currDir = getDirectory();
  const dirs = Object.keys(struct);
  const newDir = newDirectory ? newDirectory.trim() : '';

  if (dirs.includes(newDir) && currDir !== newDir) {
    setDirectory(newDir);
  } else if (newDir === '' || newDir === '~' || (newDir === '..' && dirs.includes(currDir))) {
    setDirectory('home');
  } else {
    return errors.invalidDirectory;
  }
  return null;
};

// Display contents of specified file.
commands.cat = (filename) => {
  if (!filename) return errors.fileNotSpecified;

  const isADirectory = (filename) => struct.hasOwnProperty(filename);
  const hasValidFileExtension = (filename, extension) => filename.includes(extension);
  const isFileInDirectory = (filename) => (filename.split('/').length === 1 ? false : true);
  const isFileInSubdirectory = (filename, directory) => struct[directory].includes(filename);

  if (isADirectory(filename)) return errors.invalidFile;

  if (!isFileInDirectory(filename)) {
    const fileKey = filename.split('.')[0];
    const isValidFile = (filename) => systemData.hasOwnProperty(filename);

    if (isValidFile(fileKey) && hasValidFileExtension(filename, '.txt')) {
      return systemData[fileKey];
    }
  }

  if (isFileInDirectory(filename)) {
    if (hasValidFileExtension(filename, '.txt')) {
      const directories = filename.split('/');
      const directory = directories.slice(0, 1).join(',');
      const fileKey = directories.slice(1, directories.length).join(',').split('.')[0];
      if (directory === 'home' || !struct.hasOwnProperty(directory))
        return errors.noSuchFileOrDirectory;

      return isFileInSubdirectory(fileKey, directory)
        ? systemData[fileKey]
        : errors.noSuchFileOrDirectory;
    }

    return errors.noSuchFileOrDirectory;
  }

  return errors.fileNotFound;
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
    );

  const terminal = new Shell(cmd, commands);
});
