// ============================================================
// BROWSER (FIREFOX) WINDOW
// Mock browser with URL bar, bookmarks, shortcuts, and iframe
// ============================================================
(function() {

var browserWindow = document.getElementById('browser-window');
var browserHeader = document.getElementById('browser-header');
var browserResize = document.getElementById('browser-resize-handle');
var urlInput      = document.getElementById('browser-url-input');
var iframeEl      = document.getElementById('browser-iframe');
var landingEl     = document.getElementById('browser-landing');
var errorEl       = document.getElementById('browser-error');
var tabLabel      = document.getElementById('browser-tab-label');
var desktopArea   = document.getElementById('desktop-area');
var dockIcon      = document.querySelector('.dock-icon[data-app="firefox"]');

// Navigation history
var history = [];
var historyIndex = -1;
var currentUrl = '';

// Bookmarks from PROFILE
var bookmarks = [];
if (typeof PROFILE !== 'undefined' && PROFILE.contact) {
  var c = PROFILE.contact;
  if (c.github)   bookmarks.push({ label: 'GitHub',   url: c.github });
  if (c.linkedin) bookmarks.push({ label: 'LinkedIn', url: c.linkedin });
  if (c.repo)     bookmarks.push({ label: 'Portfolio Repo', url: c.repo });
}
if (typeof PROFILE !== 'undefined' && PROFILE.projects) {
  PROFILE.projects.forEach(function(p) {
    if (p.url && p.name === 'JobsExplorer.in') {
      bookmarks.push({ label: p.name, url: p.url });
    }
  });
}

// Shortcut items for landing page
var shortcuts = [
  { label: 'GitHub',     url: (PROFILE && PROFILE.contact && PROFILE.contact.github) || 'https://github.com',     icon: '', bg: '#24292e' },
  { label: 'LinkedIn',   url: (PROFILE && PROFILE.contact && PROFILE.contact.linkedin) || 'https://linkedin.com', icon: '', bg: '#0077b5' },
  { label: 'Portfolio',  url: (PROFILE && PROFILE.contact && PROFILE.contact.repo) || 'https://github.com',       icon: '', bg: '#6e40c9' },
  { label: 'JobsExplorer', url: 'https://jobsexplorer.in/',                                                        icon: '', bg: '#e95420' }
];

// SVG icons for shortcuts
var shortcutSVGs = [
  // GitHub
  '<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>',
  // LinkedIn
  '<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  // Portfolio / Code
  '<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  // JobsExplorer
  '<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>'
];

// Bookmark SVG (star)
var starSVG = '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';

// ============================================================
// BUILD LANDING PAGE
// ============================================================
function buildLanding() {
  var html = '<div class="browser-landing-title">New Tab</div>';
  html += '<div class="browser-landing-subtitle">Quick access to your favorite sites</div>';
  html += '<div class="browser-shortcuts">';
  shortcuts.forEach(function(s, i) {
    html += '<div class="browser-shortcut" data-url="' + escHtml(s.url) + '">';
    html += '<div class="browser-shortcut-icon" style="background:' + s.bg + '">' + shortcutSVGs[i] + '</div>';
    html += '<div class="browser-shortcut-label">' + escHtml(s.label) + '</div>';
    html += '</div>';
  });
  html += '</div>';
  landingEl.innerHTML = html;

  // Bind shortcut clicks
  landingEl.querySelectorAll('.browser-shortcut').forEach(function(el) {
    el.addEventListener('click', function() {
      navigateTo(el.getAttribute('data-url'));
    });
  });
}

// ============================================================
// BUILD BOOKMARKS BAR
// ============================================================
function buildBookmarks() {
  var bar = document.getElementById('browser-bookmarks');
  var html = '';
  bookmarks.forEach(function(b) {
    html += '<div class="browser-bookmark" data-url="' + escHtml(b.url) + '">';
    html += starSVG;
    html += '<span>' + escHtml(b.label) + '</span>';
    html += '</div>';
  });
  bar.innerHTML = html;

  bar.querySelectorAll('.browser-bookmark').forEach(function(el) {
    el.addEventListener('click', function() {
      navigateTo(el.getAttribute('data-url'));
    });
  });
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(url) {
  if (!url) return;

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    // If it looks like a domain, add https
    if (/^[a-zA-Z0-9].*\.[a-zA-Z]{2,}/.test(url)) {
      url = 'https://' + url;
    } else {
      // Treat as search (just show error since we can't actually search)
      url = 'https://' + url;
    }
  }

  currentUrl = url;
  urlInput.value = url;

  // Trim history forward if we navigated back then go somewhere new
  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }
  history.push(url);
  historyIndex = history.length - 1;

  // Update tab label
  updateTabLabel(url);

  // Hide landing, show iframe
  landingEl.style.display = 'none';
  errorEl.classList.remove('active');
  errorEl.style.display = 'none';
  iframeEl.style.display = 'block';

  // Try to load in iframe
  try {
    iframeEl.src = url;
  } catch (e) {
    showError(url);
  }
}

function showLanding() {
  currentUrl = '';
  urlInput.value = '';
  iframeEl.style.display = 'none';
  iframeEl.src = 'about:blank';
  errorEl.classList.remove('active');
  errorEl.style.display = 'none';
  landingEl.style.display = '';
  updateTabLabel('');
}

function showError(url) {
  iframeEl.style.display = 'none';
  iframeEl.src = 'about:blank';
  landingEl.style.display = 'none';
  errorEl.style.display = '';
  errorEl.classList.add('active');

  var errorLink = errorEl.querySelector('.browser-error-link');
  if (errorLink) {
    errorLink.setAttribute('data-url', url);
    errorLink.textContent = 'Open ' + getDomain(url) + ' in a new tab';
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch(e) {
    return url;
  }
}

function updateTabLabel(url) {
  if (!url) {
    tabLabel.textContent = 'New Tab';
  } else {
    tabLabel.textContent = getDomain(url);
  }
}

function goBack() {
  if (historyIndex > 0) {
    historyIndex--;
    var url = history[historyIndex];
    currentUrl = url;
    urlInput.value = url;
    updateTabLabel(url);
    landingEl.style.display = 'none';
    errorEl.classList.remove('active');
    errorEl.style.display = 'none';
    iframeEl.style.display = 'block';
    try { iframeEl.src = url; } catch(e) { showError(url); }
  } else {
    showLanding();
  }
}

function goForward() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    var url = history[historyIndex];
    currentUrl = url;
    urlInput.value = url;
    updateTabLabel(url);
    landingEl.style.display = 'none';
    errorEl.classList.remove('active');
    errorEl.style.display = 'none';
    iframeEl.style.display = 'block';
    try { iframeEl.src = url; } catch(e) { showError(url); }
  }
}

function doRefresh() {
  if (currentUrl) {
    try { iframeEl.src = currentUrl; } catch(e) { showError(currentUrl); }
  }
}

// Detect iframe load errors (X-Frame-Options, etc.)
iframeEl.addEventListener('load', function() {
  if (!currentUrl) return;
  try {
    // Try to access iframe content - if blocked, this throws
    var doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
    // If we can access it and it's about:blank but we have a URL, it was blocked
    if (doc && doc.URL === 'about:blank' && currentUrl && currentUrl !== 'about:blank') {
      showError(currentUrl);
    }
  } catch(e) {
    // Cross-origin - most likely blocked or loaded fine
    // We can't tell, so assume loaded for cross-origin frames
  }
});

iframeEl.addEventListener('error', function() {
  if (currentUrl) {
    showError(currentUrl);
  }
});

// ============================================================
// URL BAR
// ============================================================
urlInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    var val = urlInput.value.trim();
    if (val) {
      navigateTo(val);
    }
  }
});

// ============================================================
// NAV BUTTONS
// ============================================================
document.getElementById('browser-btn-back').addEventListener('click', goBack);
document.getElementById('browser-btn-forward').addEventListener('click', goForward);
document.getElementById('browser-btn-refresh').addEventListener('click', doRefresh);

// Error page "open in new tab" link
document.querySelector('#browser-error .browser-error-link').addEventListener('click', function() {
  var url = this.getAttribute('data-url');
  if (url) window.open(url, '_blank');
});

// ============================================================
// UTILITY
// ============================================================
function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

browserHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons') || e.target.closest('.browser-tab-close')) return;
  if (browserWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - browserWindow.offsetLeft;
  dragOffsetY = e.clientY - browserWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - browserWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    browserWindow.style.left = x + 'px';
    browserWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(600, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(400, resizeStartH + (e.clientY - resizeStartY));
    browserWindow.style.width = newW + 'px';
    browserWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

browserResize.addEventListener('mousedown', function(e) {
  if (browserWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = browserWindow.offsetWidth;
  resizeStartH = browserWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

document.querySelector('.browser-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  browserWindow.classList.add('minimized');
});

document.querySelector('.browser-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('.browser-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  browserWindow.classList.add('minimized');
  dockIcon.classList.remove('active');
});

browserHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (browserWindow.classList.contains('maximized')) {
    browserWindow.classList.remove('maximized');
    if (preMaxState) {
      browserWindow.style.top = preMaxState.top;
      browserWindow.style.left = preMaxState.left;
      browserWindow.style.width = preMaxState.width;
      browserWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: browserWindow.style.top || browserWindow.offsetTop + 'px',
      left: browserWindow.style.left || browserWindow.offsetLeft + 'px',
      width: browserWindow.style.width || browserWindow.offsetWidth + 'px',
      height: browserWindow.style.height || browserWindow.offsetHeight + 'px'
    };
    browserWindow.classList.add('maximized');
  }
}

// Dock icon
dockIcon.addEventListener('click', function() {
  if (browserWindow.classList.contains('minimized')) {
    browserWindow.classList.remove('minimized');
    dockIcon.classList.add('active');
    bringWindowToFront('browser-window');
    urlInput.focus();
  } else {
    browserWindow.classList.add('minimized');
  }
});

// Bring to front on click
browserWindow.addEventListener('mousedown', function() {
  bringWindowToFront('browser-window');
});

// Center on load
function centerBrowser() {
  var rect = desktopArea.getBoundingClientRect();
  var w = browserWindow.offsetWidth;
  var h = browserWindow.offsetHeight;
  browserWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  browserWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerBrowser); });

// ============================================================
// INIT
// ============================================================
buildLanding();
buildBookmarks();

// Start on landing page
iframeEl.style.display = 'none';
errorEl.style.display = 'none';

})();
