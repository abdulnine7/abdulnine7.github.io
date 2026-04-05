// ============================================================
// FILES / NAUTILUS – File Browser Window
// Uses the global FS object & fs* helpers from terminal.js
// ============================================================
(function() {

var filesWindow   = document.getElementById('files-window');
var filesHeader   = document.getElementById('files-header');
var filesResize   = document.getElementById('files-resize-handle');
var filesContent  = document.getElementById('files-content');
var filesStatusbar= document.getElementById('files-statusbar');
var filesPreview  = document.getElementById('files-preview');
var previewName   = document.querySelector('.files-preview-name');
var previewBody   = document.getElementById('files-preview-body');
var previewClose  = document.getElementById('files-preview-close');
var pathbar       = document.getElementById('files-pathbar');
var btnBack       = document.getElementById('files-btn-back');
var btnForward    = document.getElementById('files-btn-forward');
var btnUp         = document.getElementById('files-btn-up');
var btnGrid       = document.getElementById('files-view-grid');
var btnList       = document.getElementById('files-view-list');
var desktopArea   = document.getElementById('desktop-area');
var dockFilesIcon = document.querySelector('.dock-icon[data-app="files"]');

// State
var currentPath = '/home/' + (typeof PROFILE !== 'undefined' && PROFILE.terminal ? PROFILE.terminal.promptUser : 'user');
var history = [currentPath];
var historyIdx = 0;
var viewMode = 'grid'; // 'grid' | 'list'
var selected = null;

// ============================================================
// SVG ICONS
// ============================================================
var ICONS = {
  folder: '<svg viewBox="0 0 24 24" fill="#5B9BD5"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="#aaa"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="#8bc34a"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/><path d="M8 12h8v1.5H8zm0 3h8v1.5H8zm0-6h5v1.5H8z" fill="#fff" opacity="0.5"/></svg>',
  script: '<svg viewBox="0 0 24 24" fill="#e95420"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/><path d="M8 14l2 2-2 2" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.7"/><line x1="12" y1="18" x2="16" y2="18" stroke="#fff" stroke-width="1.2" opacity="0.5"/></svg>',
  markdown: '<svg viewBox="0 0 24 24" fill="#42a5f5"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/><text x="8" y="17" font-size="7" font-weight="bold" fill="#fff" opacity="0.7">MD</text></svg>',
  hidden: '<svg viewBox="0 0 24 24" fill="#666"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
  desktop: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/></svg>',
  documents: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
  downloads: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  root: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'
};

function getFileIcon(name, node) {
  if (node.type === 'dir') return ICONS.folder;
  if (name.startsWith('.')) return ICONS.hidden;
  if (name.endsWith('.sh')) return ICONS.script;
  if (name.endsWith('.md')) return ICONS.markdown;
  if (name.endsWith('.txt') || name.endsWith('.bashrc') || name.endsWith('.secret')) return ICONS.text;
  if (node.perm && node.perm.includes('x')) return ICONS.script;
  return ICONS.file;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// NAVIGATION
// ============================================================
function navigate(path) {
  var node = fsGet(path);
  if (!node || node.type !== 'dir') return;

  // Close preview if open
  filesPreview.classList.remove('active');

  currentPath = path;
  selected = null;

  // Update history
  if (historyIdx < history.length - 1) {
    history = history.slice(0, historyIdx + 1);
  }
  if (history[history.length - 1] !== path) {
    history.push(path);
    historyIdx = history.length - 1;
  }

  render();
}

function goBack() {
  if (historyIdx > 0) {
    historyIdx--;
    currentPath = history[historyIdx];
    selected = null;
    filesPreview.classList.remove('active');
    render();
  }
}

function goForward() {
  if (historyIdx < history.length - 1) {
    historyIdx++;
    currentPath = history[historyIdx];
    selected = null;
    filesPreview.classList.remove('active');
    render();
  }
}

function goUp() {
  if (currentPath === '/') return;
  var parent = currentPath.split('/').slice(0, -1).join('/') || '/';
  navigate(parent);
}

// ============================================================
// RENDER
// ============================================================
function render() {
  renderPathbar();
  renderSidebar();
  renderContent();
  renderStatus();
  updateNavButtons();
}

function updateNavButtons() {
  btnBack.classList.toggle('disabled', historyIdx <= 0);
  btnForward.classList.toggle('disabled', historyIdx >= history.length - 1);
  btnUp.classList.toggle('disabled', currentPath === '/');
}

function renderPathbar() {
  var parts = currentPath === '/' ? [''] : currentPath.split('/');
  var html = '';
  var home = '/home/' + (typeof PROFILE !== 'undefined' && PROFILE.terminal ? PROFILE.terminal.promptUser : 'user');

  if (currentPath === home || currentPath.startsWith(home + '/')) {
    // Show as Home > ...
    html += '<span class="files-crumb" data-path="' + escHtml(home) + '">Home</span>';
    var rest = currentPath.slice(home.length);
    if (rest) {
      var subParts = rest.split('/').filter(Boolean);
      var built = home;
      for (var i = 0; i < subParts.length; i++) {
        built += '/' + subParts[i];
        html += '<span class="files-crumb-sep">/</span>';
        html += '<span class="files-crumb' + (i === subParts.length - 1 ? ' active' : '') + '" data-path="' + escHtml(built) + '">' + escHtml(subParts[i]) + '</span>';
      }
    } else {
      // At home root
      html = '<span class="files-crumb active" data-path="' + escHtml(home) + '">Home</span>';
    }
  } else {
    // Show full path
    html += '<span class="files-crumb" data-path="/">/</span>';
    var built2 = '';
    var pathParts = currentPath.split('/').filter(Boolean);
    for (var j = 0; j < pathParts.length; j++) {
      built2 += '/' + pathParts[j];
      html += '<span class="files-crumb-sep">/</span>';
      html += '<span class="files-crumb' + (j === pathParts.length - 1 ? ' active' : '') + '" data-path="' + escHtml(built2) + '">' + escHtml(pathParts[j]) + '</span>';
    }
  }

  pathbar.innerHTML = html;

  // Breadcrumb clicks
  pathbar.querySelectorAll('.files-crumb').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      navigate(el.getAttribute('data-path'));
    });
  });
}

function renderSidebar() {
  var home = '/home/' + (typeof PROFILE !== 'undefined' && PROFILE.terminal ? PROFILE.terminal.promptUser : 'user');
  var places = document.querySelectorAll('.files-place');
  places.forEach(function(el) {
    var p = el.getAttribute('data-path');
    el.classList.toggle('active', p === currentPath);
  });
}

function renderContent() {
  var node = fsGet(currentPath);
  if (!node || node.type !== 'dir' || !node.children) {
    filesContent.innerHTML = '<div class="files-empty"><svg viewBox="0 0 24 24" fill="#444"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg><span>Folder not found</span></div>';
    return;
  }

  var entries = Object.keys(node.children).sort(function(a, b) {
    var aDir = node.children[a].type === 'dir';
    var bDir = node.children[b].type === 'dir';
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.localeCompare(b);
  });

  if (entries.length === 0) {
    filesContent.innerHTML = '<div class="files-empty"><svg viewBox="0 0 24 24" fill="#444"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg><span>Empty folder</span></div>';
    return;
  }

  if (viewMode === 'grid') {
    renderGrid(entries, node);
  } else {
    renderList(entries, node);
  }
}

function renderGrid(entries, parentNode) {
  var html = '<div class="files-grid">';
  entries.forEach(function(name) {
    var child = parentNode.children[name];
    var icon = getFileIcon(name, child);
    var isHidden = name.startsWith('.') ? ' hidden-file' : '';
    var fullPath = currentPath === '/' ? '/' + name : currentPath + '/' + name;
    html += '<div class="files-grid-item" data-name="' + escHtml(name) + '" data-path="' + escHtml(fullPath) + '" data-type="' + child.type + '">';
    html += '<div class="files-icon">' + icon + '</div>';
    html += '<div class="files-name' + isHidden + '">' + escHtml(name) + '</div>';
    html += '</div>';
  });
  html += '</div>';
  filesContent.innerHTML = html;
  bindContentEvents();
}

function renderList(entries, parentNode) {
  var html = '<div class="files-list">';
  html += '<div class="files-list-header"><span>Name</span><span>Size</span><span>Permissions</span></div>';
  entries.forEach(function(name) {
    var child = parentNode.children[name];
    var icon = getFileIcon(name, child);
    var isHidden = name.startsWith('.') ? ' hidden-file' : '';
    var fullPath = currentPath === '/' ? '/' + name : currentPath + '/' + name;
    var size = child.type === 'dir' ? '--' : formatSize(child.size || 0);
    var perm = child.perm || '-rw-r--r--';
    html += '<div class="files-list-item" data-name="' + escHtml(name) + '" data-path="' + escHtml(fullPath) + '" data-type="' + child.type + '">';
    html += '<div class="files-icon">' + icon + '</div>';
    html += '<div class="files-name' + isHidden + '">' + escHtml(name) + '</div>';
    html += '<div class="files-size">' + size + '</div>';
    html += '<div class="files-perm">' + escHtml(perm) + '</div>';
    html += '</div>';
  });
  html += '</div>';
  filesContent.innerHTML = html;
  bindContentEvents();
}

function bindContentEvents() {
  var items = filesContent.querySelectorAll('.files-grid-item, .files-list-item');
  items.forEach(function(el) {
    // Single click to select
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      items.forEach(function(i) { i.classList.remove('selected'); });
      el.classList.add('selected');
      selected = el.getAttribute('data-path');
    });
    // Double click to open
    el.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      var type = el.getAttribute('data-type');
      var path = el.getAttribute('data-path');
      if (type === 'dir') {
        navigate(path);
      } else if (typeof window.notepadOpenFile === 'function') {
        window.notepadOpenFile(path);
      } else {
        openPreview(path, el.getAttribute('data-name'));
      }
    });
  });

  // Click empty area to deselect
  filesContent.addEventListener('click', function() {
    items.forEach(function(i) { i.classList.remove('selected'); });
    selected = null;
  });
}

function renderStatus() {
  var node = fsGet(currentPath);
  if (!node || !node.children) {
    filesStatusbar.textContent = '';
    return;
  }
  var keys = Object.keys(node.children);
  var dirs = 0, files = 0;
  keys.forEach(function(k) {
    if (node.children[k].type === 'dir') dirs++;
    else files++;
  });
  var parts = [];
  if (dirs > 0) parts.push(dirs + (dirs === 1 ? ' folder' : ' folders'));
  if (files > 0) parts.push(files + (files === 1 ? ' item' : ' items'));
  filesStatusbar.textContent = parts.join(', ') || 'Empty folder';
}

// ============================================================
// FILE PREVIEW
// ============================================================
function openPreview(path, name) {
  var node = fsGet(path);
  if (!node || node.type === 'dir') return;
  previewName.textContent = name;
  previewBody.textContent = node.content || '(empty file)';
  filesPreview.classList.add('active');
}

previewClose.addEventListener('click', function() {
  filesPreview.classList.remove('active');
});

// ============================================================
// VIEW TOGGLE
// ============================================================
btnGrid.addEventListener('click', function() {
  viewMode = 'grid';
  btnGrid.classList.add('active');
  btnList.classList.remove('active');
  renderContent();
});
btnList.addEventListener('click', function() {
  viewMode = 'list';
  btnList.classList.add('active');
  btnGrid.classList.remove('active');
  renderContent();
});

// ============================================================
// NAV BUTTONS
// ============================================================
btnBack.addEventListener('click', goBack);
btnForward.addEventListener('click', goForward);
btnUp.addEventListener('click', goUp);

// ============================================================
// SIDEBAR PLACES
// ============================================================
document.querySelectorAll('.files-place').forEach(function(el) {
  el.addEventListener('click', function() {
    navigate(el.getAttribute('data-path'));
  });
});

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

// Drag
filesHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons') || e.target.closest('.files-nav-btn') || e.target.closest('.files-view-btn') || e.target.closest('#files-pathbar')) return;
  if (filesWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - filesWindow.offsetLeft;
  dragOffsetY = e.clientY - filesWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - filesWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    filesWindow.style.left = x + 'px';
    filesWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(480, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(320, resizeStartH + (e.clientY - resizeStartY));
    filesWindow.style.width = newW + 'px';
    filesWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

// Resize
filesResize.addEventListener('mousedown', function(e) {
  if (filesWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = filesWindow.offsetWidth;
  resizeStartH = filesWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

// Window buttons
document.querySelector('.files-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  filesWindow.classList.add('minimized');
});

document.querySelector('.files-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('.files-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  filesWindow.classList.add('minimized');
  dockFilesIcon.classList.remove('active');
});

filesHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons') || e.target.closest('.files-nav-btn') || e.target.closest('.files-view-btn') || e.target.closest('#files-pathbar')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (filesWindow.classList.contains('maximized')) {
    filesWindow.classList.remove('maximized');
    if (preMaxState) {
      filesWindow.style.top = preMaxState.top;
      filesWindow.style.left = preMaxState.left;
      filesWindow.style.width = preMaxState.width;
      filesWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: filesWindow.style.top || filesWindow.offsetTop + 'px',
      left: filesWindow.style.left || filesWindow.offsetLeft + 'px',
      width: filesWindow.style.width || filesWindow.offsetWidth + 'px',
      height: filesWindow.style.height || filesWindow.offsetHeight + 'px'
    };
    filesWindow.classList.add('maximized');
  }
}

// Dock icon
dockFilesIcon.addEventListener('click', function() {
  if (filesWindow.classList.contains('minimized')) {
    filesWindow.classList.remove('minimized');
    dockFilesIcon.classList.add('active');
    bringWindowToFront('files-window');
  } else {
    filesWindow.classList.add('minimized');
  }
});

// Bring to front on click
filesWindow.addEventListener('mousedown', function() { bringWindowToFront('files-window'); });

// Center on load
function positionFiles() { randomPositionWindow(filesWindow); }
requestAnimationFrame(function() { requestAnimationFrame(positionFiles); });

// ============================================================
// INIT – fix sidebar paths to use dynamic username
// ============================================================
var home = '/home/' + (typeof PROFILE !== 'undefined' && PROFILE.terminal ? PROFILE.terminal.promptUser : 'user');
document.querySelectorAll('.files-place').forEach(function(el) {
  var p = el.getAttribute('data-path');
  if (p && p.indexOf('/home/user') === 0) {
    el.setAttribute('data-path', p.replace('/home/user', home));
  }
});

navigate(currentPath);

})();
