// ============================================================
// ACTIVITIES / APP GRID OVERLAY
// ============================================================
(function() {

var overlay = document.getElementById('activities-overlay');
var grid = document.getElementById('activities-grid');
var searchInput = document.getElementById('activities-search');
var activitiesBtn = document.getElementById('activities-btn');

// App definitions — id matches data-app on dock icons, window IDs follow pattern
var apps = [
  { id: 'terminal',     name: 'Terminal',        icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" fill="#300A24"/><path d="M6 8l4 4-4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="16" x2="18" y2="16" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>', bg: '#300A24' },
  { id: 'files',        name: 'Files',           icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>', bg: '#5B9BD5' },
  { id: 'text-editor',  name: 'Text Editor',     icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>', bg: '#4A90D9' },
  { id: 'firefox',      name: 'Firefox',         icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFBD4F"/><circle cx="12" cy="12" r="6" fill="#FF6611"/><circle cx="12" cy="12" r="3" fill="#FFBD4F"/></svg>', bg: '#FF6611' },
  { id: 'settings',     name: 'Settings',        icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/><circle cx="12" cy="12" r="3" fill="#666"/></svg>', bg: '#666' },
  { id: 'calculator',   name: 'Calculator',      icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-2h2v2zm0-4h-2v-2h2v2zm-4 4H9v-2h2v2zm0-4H9v-2h2v2zm-4 4H5v-2h2v2zm0-4H5v-2h2v2zm10-4H5V7h12v2z"/></svg>', bg: '#e95420' },
  { id: 'calendar',     name: 'Calendar',        icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>', bg: '#4285F4' },
  { id: 'weather',      name: 'Weather',         icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>', bg: '#FF9800' },
  { id: 'monitor',      name: 'System Monitor',  icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>', bg: '#4CAF50' },
  { id: 'music',        name: 'Music',           icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>', bg: '#9C27B0' },
  { id: 'games',        name: 'Snake',           icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>', bg: '#388E3C' },
  { id: 'imageviewer',  name: 'Image Viewer',    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>', bg: '#00796B' },
  { id: 'pdf-viewer',   name: 'PDF Viewer',      icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2H9v-2H7v-2h2V7h2v2h2v2zm3-3.5V9h-5V3.5L16 7.5z"/></svg>', bg: '#D32F2F' },
  { id: 'photobooth',   name: 'Photo Booth',     icon: '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>', bg: '#7B1FA2' }
];

// Window ID mapping (app id -> window element id)
var windowMap = {
  'terminal':     'terminal-window',
  'files':        'files-window',
  'text-editor':  'notepad-window',
  'firefox':      'browser-window',
  'settings':     'settings-window',
  'calculator':   'calculator-window',
  'calendar':     'calendar-window',
  'weather':      'weather-window',
  'monitor':      'monitor-window',
  'music':        'music-window',
  'games':        'snake-window',
  'imageviewer':  'imageviewer-window',
  'pdf-viewer':   'pdf-window',
  'photobooth':   'photobooth-window'
};

// Build the grid
function buildGrid() {
  var html = '';
  apps.forEach(function(app) {
    html += '<div class="activities-app" data-app="' + app.id + '" data-name="' + app.name.toLowerCase() + '">';
    html += '<div class="activities-app-icon" style="background:' + app.bg + '">' + app.icon + '</div>';
    html += '<div class="activities-app-name">' + app.name + '</div>';
    html += '</div>';
  });
  grid.innerHTML = html;

  // Bind clicks
  grid.querySelectorAll('.activities-app').forEach(function(el) {
    el.addEventListener('click', function() {
      var appId = el.getAttribute('data-app');
      openApp(appId);
      hideOverlay();
    });
  });
}

function openApp(appId) {
  var winId = windowMap[appId];
  if (!winId) return;
  var win = document.getElementById(winId);
  if (!win) return;

  win.classList.remove('minimized');
  bringWindowToFront(winId);

  // Activate dock icon
  var dockIcon = document.querySelector('.dock-icon[data-app="' + appId + '"]');
  if (dockIcon) dockIcon.classList.add('active');

  // Focus terminal input if terminal
  if (appId === 'terminal') {
    var inp = document.getElementById('input');
    if (inp) inp.focus();
  }
}

// Show / Hide
function showOverlay() {
  overlay.classList.add('active');
  searchInput.value = '';
  filterApps('');
  setTimeout(function() { searchInput.focus(); }, 100);
}

function hideOverlay() {
  overlay.classList.remove('active');
}

function toggleOverlay() {
  if (overlay.classList.contains('active')) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

// Search filter
function filterApps(query) {
  var q = query.toLowerCase().trim();
  grid.querySelectorAll('.activities-app').forEach(function(el) {
    var name = el.getAttribute('data-name');
    if (!q || name.indexOf(q) !== -1) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

searchInput.addEventListener('input', function() {
  filterApps(searchInput.value);
});

// Escape to close
searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    hideOverlay();
  }
  if (e.key === 'Enter') {
    // Open first visible app
    var first = grid.querySelector('.activities-app:not(.hidden)');
    if (first) {
      openApp(first.getAttribute('data-app'));
      hideOverlay();
    }
  }
});

// Click backdrop to close
overlay.addEventListener('click', function(e) {
  if (e.target === overlay) {
    hideOverlay();
  }
});

// Activities button in top panel
activitiesBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  toggleOverlay();
});

// Super key (Meta) to toggle
document.addEventListener('keydown', function(e) {
  if (e.key === 'Super_L' || e.key === 'Super_R' || (e.key === 'Meta' && !e.ctrlKey && !e.altKey && !e.shiftKey)) {
    // Only toggle if no input is focused
    var active = document.activeElement;
    if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && !active.isContentEditable)) {
      e.preventDefault();
      toggleOverlay();
    }
  }
});

// Init
buildGrid();

})();
