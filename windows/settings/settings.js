// ============================================================
// SETTINGS WINDOW
// ============================================================
(function() {

var settingsWindow = document.getElementById('settings-window');
var settingsHeader = document.getElementById('settings-header');
var settingsContent = document.getElementById('settings-content');
var dockSettingsIcon = document.querySelector('.dock-icon[data-app="settings"]');
var desktopArea = document.getElementById('desktop-area');

// ============================================================
// STATE
// ============================================================
var state = {
  theme: localStorage.getItem('shell-theme') || 'dark',
  accent: localStorage.getItem('shell-accent') || '#e95420',
  wallpaper: localStorage.getItem('shell-wallpaper') || 'noble-numbat',
  dockIconSize: parseInt(localStorage.getItem('shell-dock-icon-size')) || 50,
  dockPosition: localStorage.getItem('shell-dock-position') || 'left',
  fontSize: localStorage.getItem('shell-font-size') || 'medium',
  animationsEnabled: localStorage.getItem('shell-animations') !== 'false'
};

// Wallpaper definitions
var wallpapers = [
  { id: 'focal-fossa', name: 'Focal Fossa', type: 'image',
    value: 'assets/wallpapers/focal-fossa.jpg' },
  { id: 'jammy-jellyfish', name: 'Jammy Jellyfish', type: 'image',
    value: 'assets/wallpapers/jammy-jellyfish.jpg' },
  { id: 'noble-numbat', name: 'Noble Numbat', type: 'image',
    value: 'assets/wallpapers/noble-numbat.jpg' },
  { id: 'oracular-oriole', name: 'Oracular Oriole', type: 'image',
    value: 'assets/wallpapers/oracular-oriole.jpg' },
  { id: 'oracular-oriole-light', name: 'Oracular Oriole Light', type: 'image',
    value: 'assets/wallpapers/oracular-oriole-light.jpg' },
  { id: 'plucky-puffin', name: 'Plucky Puffin', type: 'image',
    value: 'assets/wallpapers/plucky-puffin.jpg' },
  { id: 'plucky-puffin-light', name: 'Plucky Puffin Light', type: 'image',
    value: 'assets/wallpapers/plucky-puffin-light.jpg' }
];

var accentColors = [
  { id: 'ubuntu-orange', color: '#e95420' },
  { id: 'blue',          color: '#3584e4' },
  { id: 'teal',          color: '#2190a4' },
  { id: 'green',         color: '#3a944a' },
  { id: 'yellow',        color: '#c88800' },
  { id: 'red',           color: '#e74c3c' },
  { id: 'purple',        color: '#9b59b6' },
  { id: 'pink',          color: '#e91e63' }
];

// ============================================================
// SECTION RENDERERS
// ============================================================
var sections = {
  appearance: function() {
    var html = '<div class="settings-section-title">Appearance</div>';

    // Theme
    html += '<div class="settings-section-subtitle">Style</div>';
    html += '<div class="settings-theme-options">';
    html += '<div class="settings-theme-card theme-dark' + (state.theme === 'dark' ? ' active' : '') + '" data-theme="dark">';
    html += '<div class="settings-theme-preview"></div>';
    html += '<div class="settings-theme-label">Dark</div></div>';
    html += '<div class="settings-theme-card theme-light' + (state.theme === 'light' ? ' active' : '') + '" data-theme="light">';
    html += '<div class="settings-theme-preview"></div>';
    html += '<div class="settings-theme-label">Light</div></div>';
    html += '</div>';

    // Accent color
    html += '<div class="settings-section-subtitle">Accent Color</div>';
    html += '<div class="settings-accent-colors">';
    accentColors.forEach(function(ac) {
      html += '<div class="settings-accent-swatch' + (state.accent === ac.color ? ' active' : '') + '" data-color="' + ac.color + '" style="background:' + ac.color + '"></div>';
    });
    html += '</div>';

    // Animations toggle
    html += '<div class="settings-section-subtitle">Effects</div>';
    html += '<div class="settings-row">';
    html += '<div><div class="settings-row-label">Enable Animations</div>';
    html += '<div class="settings-row-desc">Window transitions and hover effects</div></div>';
    html += '<label class="settings-toggle"><input type="checkbox" data-setting="animations"' + (state.animationsEnabled ? ' checked' : '') + '>';
    html += '<span class="settings-toggle-slider"></span></label></div>';

    return html;
  },

  wallpaper: function() {
    var html = '<div class="settings-section-title">Wallpaper</div>';
    html += '<div class="settings-wallpaper-grid">';
    wallpapers.forEach(function(wp) {
      var style = '';
      if (wp.type === 'gradient') {
        style = 'background:' + wp.value;
      } else {
        style = 'background-image:url(' + wp.value + ')';
      }
      html += '<div class="settings-wallpaper-item' + (state.wallpaper === wp.id ? ' active' : '') + (wp.type === 'gradient' ? ' gradient-wp' : '') + '" data-wallpaper="' + wp.id + '" style="' + style + '">';
      html += '<div class="settings-wallpaper-label">' + wp.name + '</div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  },

  dock: function() {
    var html = '<div class="settings-section-title">Dock</div>';

    // Icon size
    html += '<div class="settings-section-subtitle">Icon Size</div>';
    html += '<div class="settings-slider-row">';
    html += '<label>Size</label>';
    html += '<input type="range" min="36" max="64" value="' + state.dockIconSize + '" data-setting="dock-icon-size">';
    html += '<span class="settings-slider-value">' + state.dockIconSize + 'px</span>';
    html += '</div>';

    // Dock position
    html += '<div class="settings-section-subtitle">Position</div>';
    html += '<div class="settings-row">';
    html += '<div class="settings-row-label">Dock Position</div>';
    html += '<select class="settings-select" data-setting="dock-position">';
    html += '<option value="left"' + (state.dockPosition === 'left' ? ' selected' : '') + '>Left</option>';
    html += '<option value="bottom"' + (state.dockPosition === 'bottom' ? ' selected' : '') + '>Bottom</option>';
    html += '</select></div>';

    return html;
  },

  fonts: function() {
    var html = '<div class="settings-section-title">Fonts & Display</div>';

    // Font size
    html += '<div class="settings-section-subtitle">Interface Font Size</div>';
    html += '<div class="settings-font-sizes">';
    var sizes = [
      { id: 'small', label: 'Small' },
      { id: 'medium', label: 'Medium' },
      { id: 'large', label: 'Large' }
    ];
    sizes.forEach(function(s) {
      html += '<div class="settings-font-size-option' + (state.fontSize === s.id ? ' active' : '') + '" data-size="' + s.id + '">';
      html += '<span class="settings-font-size-label">' + s.label + '</span>';
      html += '</div>';
    });
    html += '</div>';

    // Preview
    html += '<div class="settings-section-subtitle">Preview</div>';
    html += '<div class="settings-font-preview">';
    html += 'The quick brown fox jumps over the lazy dog.<br>';
    html += '<span style="color:#888;">Ubuntu Desktop — Shellfolio</span>';
    html += '</div>';

    return html;
  },

  about: function() {
    var html = '';
    html += '<div class="settings-about-logo">';
    html += '<svg viewBox="0 0 24 24" fill="#e95420"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="#fff"/><circle cx="12" cy="5" r="2" fill="#fff"/><circle cx="5.5" cy="16" r="2" fill="#fff"/><circle cx="18.5" cy="16" r="2" fill="#fff"/></svg>';
    html += '</div>';
    html += '<div class="settings-about-info">';
    html += '<h2>Shellfolio Desktop</h2>';
    html += '<p>A web-based Ubuntu desktop experience</p>';
    html += '</div>';
    html += '<div class="settings-about-details">';
    html += '<div class="settings-about-row"><span>Version</span><span>1.0.0</span></div>';
    html += '<div class="settings-about-row"><span>Desktop</span><span>GNOME Shell (Web)</span></div>';
    html += '<div class="settings-about-row"><span>Windowing</span><span>HTML / CSS / JS</span></div>';
    html += '<div class="settings-about-row"><span>Kernel</span><span>Browser ' + navigator.userAgent.split(' ').pop() + '</span></div>';
    html += '<div class="settings-about-row"><span>Resolution</span><span>' + window.screen.width + ' x ' + window.screen.height + '</span></div>';
    html += '<div class="settings-about-row"><span>Theme</span><span>' + (state.theme === 'dark' ? 'Dark' : 'Light') + '</span></div>';
    html += '</div>';
    return html;
  }
};

// ============================================================
// RENDER & BIND
// ============================================================
var activeSection = 'appearance';

function renderSection(section) {
  activeSection = section;
  settingsContent.innerHTML = sections[section]();
  bindSectionEvents();
  // Update sidebar active
  settingsWindow.querySelectorAll('.settings-nav-item').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-section') === section);
  });
}

function bindSectionEvents() {
  // Theme cards
  settingsContent.querySelectorAll('.settings-theme-card').forEach(function(card) {
    card.addEventListener('click', function() {
      state.theme = card.getAttribute('data-theme');
      applyTheme();
      renderSection('appearance');
    });
  });

  // Accent swatches
  settingsContent.querySelectorAll('.settings-accent-swatch').forEach(function(swatch) {
    swatch.addEventListener('click', function() {
      state.accent = swatch.getAttribute('data-color');
      applyAccent();
      renderSection('appearance');
    });
  });

  // Wallpaper items
  settingsContent.querySelectorAll('.settings-wallpaper-item').forEach(function(item) {
    item.addEventListener('click', function() {
      state.wallpaper = item.getAttribute('data-wallpaper');
      applyWallpaper();
      renderSection('wallpaper');
    });
  });

  // Toggle switches
  settingsContent.querySelectorAll('.settings-toggle input').forEach(function(toggle) {
    toggle.addEventListener('change', function() {
      var setting = toggle.getAttribute('data-setting');
      if (setting === 'animations') {
        state.animationsEnabled = toggle.checked;
        applyAnimations();
      }
    });
  });

  // Range sliders
  settingsContent.querySelectorAll('input[type="range"]').forEach(function(slider) {
    slider.addEventListener('input', function() {
      var setting = slider.getAttribute('data-setting');
      var val = parseInt(slider.value);
      var display = slider.parentNode.querySelector('.settings-slider-value');
      if (display) display.textContent = val + 'px';

      if (setting === 'dock-icon-size') {
        state.dockIconSize = val;
        applyDockSize();
      }
    });
  });

  // Font size options
  settingsContent.querySelectorAll('.settings-font-size-option').forEach(function(opt) {
    opt.addEventListener('click', function() {
      state.fontSize = opt.getAttribute('data-size');
      applyFontSize();
      renderSection('fonts');
    });
  });

  // Select dropdowns
  settingsContent.querySelectorAll('.settings-select').forEach(function(sel) {
    sel.addEventListener('change', function() {
      var setting = sel.getAttribute('data-setting');
      if (setting === 'dock-position') {
        state.dockPosition = sel.value;
        applyDockPosition();
      }
    });
  });
}

// ============================================================
// APPLY SETTINGS
// ============================================================
function applyTheme() {
  if (state.theme === 'light') {
    document.body.classList.add('light-theme');
    document.body.style.background = '#e8e8e8';
  } else {
    document.body.classList.remove('light-theme');
    document.body.style.background = '';
  }
  localStorage.setItem('shell-theme', state.theme);
}

function applyAccent() {
  document.documentElement.style.setProperty('--accent-color', state.accent);
  localStorage.setItem('shell-accent', state.accent);
}

function applyWallpaper() {
  var wp = wallpapers.find(function(w) { return w.id === state.wallpaper; });
  if (!wp) return;
  if (wp.type === 'gradient') {
    desktopArea.style.background = wp.value;
    desktopArea.style.backgroundImage = '';
  } else {
    desktopArea.style.background = '';
    desktopArea.style.backgroundImage = 'url(' + wp.value + ')';
    desktopArea.style.backgroundSize = 'cover';
    desktopArea.style.backgroundPosition = 'center';
  }
  localStorage.setItem('shell-wallpaper', state.wallpaper);
}

function applyDockSize() {
  var dock = document.getElementById('dock');
  dock.style.setProperty('--dock-icon-size', state.dockIconSize + 'px');
  // Apply directly to icons
  var icons = dock.querySelectorAll('.dock-icon');
  icons.forEach(function(icon) {
    icon.style.width = state.dockIconSize + 'px';
    icon.style.height = state.dockIconSize + 'px';
  });
  var svgs = dock.querySelectorAll('.dock-icon svg');
  var svgSize = Math.round(state.dockIconSize * 0.68);
  svgs.forEach(function(svg) {
    svg.style.width = svgSize + 'px';
    svg.style.height = svgSize + 'px';
  });
  localStorage.setItem('shell-dock-icon-size', state.dockIconSize);
}

function applyDockPosition() {
  var desktop = document.getElementById('ubuntu-desktop');
  if (state.dockPosition === 'bottom') {
    desktop.classList.add('dock-bottom');
  } else {
    desktop.classList.remove('dock-bottom');
  }
  localStorage.setItem('shell-dock-position', state.dockPosition);
}

function applyFontSize() {
  document.body.classList.remove('font-small', 'font-medium', 'font-large');
  document.body.classList.add('font-' + state.fontSize);
  localStorage.setItem('shell-font-size', state.fontSize);
}

function applyAnimations() {
  if (state.animationsEnabled) {
    document.body.classList.remove('no-animations');
  } else {
    document.body.classList.add('no-animations');
  }
  localStorage.setItem('shell-animations', state.animationsEnabled);
}

// Apply all saved settings on load
function applyAllSettings() {
  applyTheme();
  applyAccent();
  applyWallpaper();
  applyDockSize();
  applyDockPosition();
  applyFontSize();
  applyAnimations();
}

applyAllSettings();

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
settingsWindow.querySelectorAll('.settings-nav-item').forEach(function(item) {
  item.addEventListener('click', function() {
    renderSection(item.getAttribute('data-section'));
  });
});

// Initial render
renderSection('appearance');

// ============================================================
// WINDOW CHROME: DRAG, RESIZE, BUTTONS
// ============================================================
var isDragging = false, dragOffX = 0, dragOffY = 0;
var preMax = null;

settingsHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (settingsWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffX = e.clientX - settingsWindow.offsetLeft;
  dragOffY = e.clientY - settingsWindow.offsetTop;
  bringWindowToFront('settings-window');
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  var rect = desktopArea.getBoundingClientRect();
  var x = Math.max(rect.left - settingsWindow.offsetWidth + 100, Math.min(e.clientX - dragOffX, rect.right - 100));
  var y = Math.max(0, Math.min(e.clientY - dragOffY, rect.bottom - rect.top - 40));
  settingsWindow.style.left = x + 'px';
  settingsWindow.style.top = y + 'px';
  e.preventDefault();
});

document.addEventListener('mouseup', function() { isDragging = false; });

// Resize
var isResizing = false, rsX, rsY, rsW, rsH;
var resizeHandle = document.getElementById('settings-resize-handle');

resizeHandle.addEventListener('mousedown', function(e) {
  if (settingsWindow.classList.contains('maximized')) return;
  isResizing = true;
  rsX = e.clientX; rsY = e.clientY;
  rsW = settingsWindow.offsetWidth; rsH = settingsWindow.offsetHeight;
  e.preventDefault(); e.stopPropagation();
});

document.addEventListener('mousemove', function(e) {
  if (!isResizing) return;
  settingsWindow.style.width = Math.max(520, rsW + e.clientX - rsX) + 'px';
  settingsWindow.style.height = Math.max(380, rsH + e.clientY - rsY) + 'px';
  e.preventDefault();
});

document.addEventListener('mouseup', function() { isResizing = false; });

// Buttons
settingsWindow.querySelector('.settings-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  settingsWindow.classList.add('minimized');
});

settingsWindow.querySelector('.settings-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMax();
});

settingsWindow.querySelector('.settings-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  settingsWindow.classList.add('minimized');
  if (dockSettingsIcon) dockSettingsIcon.classList.remove('active');
});

settingsHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMax();
});

function toggleMax() {
  if (settingsWindow.classList.contains('maximized')) {
    settingsWindow.classList.remove('maximized');
    if (preMax) {
      settingsWindow.style.top = preMax.top;
      settingsWindow.style.left = preMax.left;
      settingsWindow.style.width = preMax.width;
      settingsWindow.style.height = preMax.height;
      preMax = null;
    }
  } else {
    preMax = {
      top: settingsWindow.style.top || settingsWindow.offsetTop + 'px',
      left: settingsWindow.style.left || settingsWindow.offsetLeft + 'px',
      width: settingsWindow.style.width || settingsWindow.offsetWidth + 'px',
      height: settingsWindow.style.height || settingsWindow.offsetHeight + 'px'
    };
    settingsWindow.classList.add('maximized');
  }
}

settingsWindow.addEventListener('mousedown', function() {
  bringWindowToFront('settings-window');
});

// Dock icon
if (dockSettingsIcon) {
  dockSettingsIcon.addEventListener('click', function() {
    if (settingsWindow.classList.contains('minimized')) {
      settingsWindow.classList.remove('minimized');
      dockSettingsIcon.classList.add('active');
      bringWindowToFront('settings-window');
    } else {
      settingsWindow.classList.add('minimized');
    }
  });
}

// Position — only pre-position, keep minimized
function positionSettings() {
  randomPositionWindow(settingsWindow);
  // Ensure window stays minimized on load
  settingsWindow.classList.add('minimized');
  if (dockSettingsIcon) dockSettingsIcon.classList.remove('active');
}
requestAnimationFrame(function() { requestAnimationFrame(positionSettings); });

// ============================================================
// EXPOSE: allow context menu wallpaper cycling to use settings
// ============================================================
window.shellSettings = {
  cycleWallpaper: function() {
    var idx = wallpapers.findIndex(function(w) { return w.id === state.wallpaper; });
    idx = (idx + 1) % wallpapers.length;
    state.wallpaper = wallpapers[idx].id;
    applyWallpaper();
  },
  openSettings: function(section) {
    settingsWindow.classList.remove('minimized');
    if (dockSettingsIcon) dockSettingsIcon.classList.add('active');
    bringWindowToFront('settings-window');
    if (section) renderSection(section);
  }
};

})();
