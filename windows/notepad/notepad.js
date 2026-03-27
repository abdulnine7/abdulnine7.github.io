// ============================================================
// NOTEPAD / TEXT EDITOR
// Uses the global FS object & fs* helpers from terminal.js
// ============================================================
(function() {

var notepadWindow  = document.getElementById('notepad-window');
var notepadHeader  = document.getElementById('notepad-header');
var notepadResize  = document.getElementById('notepad-resize-handle');
var notepadTitle   = document.getElementById('notepad-title');
var textarea       = document.getElementById('notepad-textarea');
var linesEl        = document.getElementById('notepad-lines');
var statusLeft     = notepadWindow.querySelector('.notepad-status-left');
var statusRight    = notepadWindow.querySelector('.notepad-status-right');
var fileListEl     = document.getElementById('notepad-file-list');
var saveDialog     = document.getElementById('notepad-save-dialog');
var saveInput      = document.getElementById('notepad-save-input');
var dialogOverlay  = document.getElementById('notepad-dialog-overlay');
var desktopArea    = document.getElementById('desktop-area');
var dockIcon       = document.querySelector('.dock-icon[data-app="text-editor"]');

// State
var currentFile = null;   // full path of open file, null = untitled
var savedContent = '';     // content at last save (to detect changes)
var home = '/home/' + (typeof PROFILE !== 'undefined' && PROFILE.terminal ? PROFILE.terminal.promptUser : 'user');

// ============================================================
// LINE NUMBERS
// ============================================================
function updateLineNumbers() {
  var lines = textarea.value.split('\n').length;
  var html = '';
  for (var i = 1; i <= lines; i++) {
    html += i + '\n';
  }
  linesEl.textContent = html;
}

function syncScroll() {
  linesEl.scrollTop = textarea.scrollTop;
}

textarea.addEventListener('input', function() {
  updateLineNumbers();
  updateTitle();
  updateStatus();
});

textarea.addEventListener('scroll', syncScroll);

// ============================================================
// TITLE BAR
// ============================================================
function updateTitle() {
  var name = currentFile ? currentFile.split('/').pop() : 'Untitled';
  var modified = textarea.value !== savedContent;
  notepadTitle.innerHTML = (modified ? '<span class="notepad-unsaved">\u25cf </span>' : '') + escHtml(name) + ' \u2014 Text Editor';
}

function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// STATUS BAR
// ============================================================
function updateStatus() {
  var val = textarea.value;
  var lines = val.split('\n').length;
  var chars = val.length;

  // Cursor position
  var pos = textarea.selectionStart;
  var before = val.substring(0, pos);
  var line = before.split('\n').length;
  var col = pos - before.lastIndexOf('\n');

  statusLeft.innerHTML = '<span>Ln ' + line + ', Col ' + col + '</span><span>' + chars + ' characters</span>';
  statusRight.innerHTML = '<span>' + lines + ' lines</span><span>UTF-8</span>';
}

textarea.addEventListener('click', updateStatus);
textarea.addEventListener('keyup', updateStatus);

// ============================================================
// NEW FILE
// ============================================================
function newFile() {
  currentFile = null;
  savedContent = '';
  textarea.value = '';
  updateLineNumbers();
  updateTitle();
  updateStatus();
  textarea.focus();
}

// ============================================================
// OPEN FILE – dropdown of all text files in FS
// ============================================================
function toggleFileList() {
  if (fileListEl.classList.contains('active')) {
    fileListEl.classList.remove('active');
    return;
  }
  // Collect all files from FS
  var files = [];
  function walk(path, node) {
    if (node.type === 'dir' && node.children) {
      for (var name in node.children) {
        var childPath = path === '/' ? '/' + name : path + '/' + name;
        walk(childPath, node.children[name]);
      }
    } else if (node.type === 'file') {
      files.push(path);
    }
  }
  walk('/', fsGet('/'));

  // Sort: home files first, then others
  files.sort(function(a, b) {
    var aHome = a.startsWith(home) ? 0 : 1;
    var bHome = b.startsWith(home) ? 0 : 1;
    if (aHome !== bHome) return aHome - bHome;
    return a.localeCompare(b);
  });

  var html = '';
  if (files.length === 0) {
    html = '<div class="notepad-file-option" style="color:#888;cursor:default">No files found</div>';
  } else {
    files.forEach(function(f) {
      var name = f.split('/').pop();
      var dir = f.split('/').slice(0, -1).join('/') || '/';
      // Display path relative to home if applicable
      var displayDir = dir;
      if (dir.startsWith(home)) {
        displayDir = '~' + dir.slice(home.length);
      }
      html += '<div class="notepad-file-option" data-path="' + escHtml(f) + '">';
      html += '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>';
      html += '<span>' + escHtml(name) + '</span>';
      html += '<span class="notepad-file-path">' + escHtml(displayDir) + '</span>';
      html += '</div>';
    });
  }
  fileListEl.innerHTML = html;
  fileListEl.classList.add('active');

  // Bind clicks
  fileListEl.querySelectorAll('.notepad-file-option[data-path]').forEach(function(el) {
    el.addEventListener('click', function() {
      openFile(el.getAttribute('data-path'));
      fileListEl.classList.remove('active');
    });
  });
}

function openFile(path) {
  var node = fsGet(path);
  if (!node || node.type !== 'file') return;
  currentFile = path;
  savedContent = node.content || '';
  textarea.value = savedContent;
  updateLineNumbers();
  updateTitle();
  updateStatus();
  textarea.focus();
}

// Close file list when clicking elsewhere
notepadWindow.addEventListener('click', function(e) {
  if (!e.target.closest('#notepad-file-list') && !e.target.closest('[data-action="open"]')) {
    fileListEl.classList.remove('active');
  }
});

// ============================================================
// SAVE FILE
// ============================================================
function saveFile() {
  if (currentFile) {
    // Save directly
    doSave(currentFile);
  } else {
    // Show Save As dialog
    showSaveDialog();
  }
}

function saveFileAs() {
  showSaveDialog();
}

function showSaveDialog() {
  var suggestion = currentFile || home + '/';
  saveInput.value = suggestion;
  dialogOverlay.classList.add('active');
  saveDialog.classList.add('active');
  saveInput.focus();
  // Select just the filename part
  var lastSlash = suggestion.lastIndexOf('/');
  if (lastSlash < suggestion.length - 1) {
    saveInput.setSelectionRange(lastSlash + 1, suggestion.length);
  }
}

function hideSaveDialog() {
  dialogOverlay.classList.remove('active');
  saveDialog.classList.remove('active');
}

function doSave(path) {
  // Ensure parent directory exists
  var parentPath = path.split('/').slice(0, -1).join('/') || '/';
  var parent = fsGet(parentPath);
  if (!parent) {
    // Try to create parent dirs
    fsMkdir(parentPath, false);
  }
  fsWriteFile(path, textarea.value, false);
  currentFile = path;
  savedContent = textarea.value;
  updateTitle();
}

document.getElementById('notepad-save-confirm').addEventListener('click', function() {
  var path = saveInput.value.trim();
  if (path && path.length > 1) {
    doSave(path);
    hideSaveDialog();
    textarea.focus();
  }
});

document.getElementById('notepad-save-cancel').addEventListener('click', function() {
  hideSaveDialog();
  textarea.focus();
});

saveInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('notepad-save-confirm').click();
  }
  if (e.key === 'Escape') {
    hideSaveDialog();
    textarea.focus();
  }
});

dialogOverlay.addEventListener('click', function() {
  hideSaveDialog();
  textarea.focus();
});

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
textarea.addEventListener('keydown', function(e) {
  // Ctrl+S / Cmd+S = Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveFile();
  }
  // Ctrl+Shift+S / Cmd+Shift+S = Save As
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    saveFileAs();
  }
  // Ctrl+N / Cmd+N = New
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    newFile();
  }
  // Ctrl+O / Cmd+O = Open
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    toggleFileList();
  }
  // Tab = insert tab
  if (e.key === 'Tab') {
    e.preventDefault();
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 4;
    updateLineNumbers();
    updateTitle();
  }
});

// ============================================================
// TOOLBAR BUTTONS
// ============================================================
notepadWindow.querySelectorAll('.notepad-tool-btn').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var action = btn.getAttribute('data-action');
    if (action === 'new') newFile();
    if (action === 'open') toggleFileList();
    if (action === 'save') saveFile();
    if (action === 'save-as') saveFileAs();
  });
});

// ============================================================
// OPEN FROM FILES APP (public API)
// ============================================================
window.notepadOpenFile = function(path) {
  // Show the notepad window
  notepadWindow.classList.remove('minimized');
  dockIcon.classList.add('active');
  bringWindowToFront('notepad-window');
  openFile(path);
};

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

notepadHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons') || e.target.closest('.notepad-tool-btn')) return;
  if (notepadWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - notepadWindow.offsetLeft;
  dragOffsetY = e.clientY - notepadWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - notepadWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    notepadWindow.style.left = x + 'px';
    notepadWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(400, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(280, resizeStartH + (e.clientY - resizeStartY));
    notepadWindow.style.width = newW + 'px';
    notepadWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

notepadResize.addEventListener('mousedown', function(e) {
  if (notepadWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = notepadWindow.offsetWidth;
  resizeStartH = notepadWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

document.querySelector('.notepad-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  notepadWindow.classList.add('minimized');
});

document.querySelector('.notepad-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('.notepad-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  notepadWindow.classList.add('minimized');
  dockIcon.classList.remove('active');
});

notepadHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (notepadWindow.classList.contains('maximized')) {
    notepadWindow.classList.remove('maximized');
    if (preMaxState) {
      notepadWindow.style.top = preMaxState.top;
      notepadWindow.style.left = preMaxState.left;
      notepadWindow.style.width = preMaxState.width;
      notepadWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: notepadWindow.style.top || notepadWindow.offsetTop + 'px',
      left: notepadWindow.style.left || notepadWindow.offsetLeft + 'px',
      width: notepadWindow.style.width || notepadWindow.offsetWidth + 'px',
      height: notepadWindow.style.height || notepadWindow.offsetHeight + 'px'
    };
    notepadWindow.classList.add('maximized');
  }
}

// Dock icon
dockIcon.addEventListener('click', function() {
  if (notepadWindow.classList.contains('minimized')) {
    notepadWindow.classList.remove('minimized');
    dockIcon.classList.add('active');
    bringWindowToFront('notepad-window');
    textarea.focus();
  } else {
    notepadWindow.classList.add('minimized');
  }
});

// Bring to front on click
notepadWindow.addEventListener('mousedown', function() {
  bringWindowToFront('notepad-window');
});

// Center on load
function centerNotepad() {
  var rect = desktopArea.getBoundingClientRect();
  var w = notepadWindow.offsetWidth;
  var h = notepadWindow.offsetHeight;
  notepadWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  notepadWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerNotepad); });

// ============================================================
// INIT
// ============================================================
newFile();

})();
