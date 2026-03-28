// ============================================================
// MUSIC PLAYER – Rhythmbox-style (Mock Data)
// ============================================================
(function() {

// ============================================================
// MOCK PLAYLIST DATA
// ============================================================
var playlist = [
  { title: 'Sudo Make Me a Sandwich', artist: 'The Terminals',     album: 'Root Access',         duration: 222, gradient: 'linear-gradient(135deg, #e95420, #f7a541)' },
  { title: '404 Love Not Found',      artist: 'Null Pointer',      album: 'Exception Handling',  duration: 255, gradient: 'linear-gradient(135deg, #3a86ff, #8338ec)' },
  { title: 'Merge Conflict Blues',     artist: 'Git & The Branches',album: 'Version Control',     duration: 238, gradient: 'linear-gradient(135deg, #06d6a0, #118ab2)' },
  { title: 'Infinite Loop',           artist: 'Stack Overflow',    album: 'Recursion',           duration: 301, gradient: 'linear-gradient(135deg, #ef476f, #ffd166)' },
  { title: 'Hello World',             artist: 'The Compilers',     album: 'First Commit',        duration: 175, gradient: 'linear-gradient(135deg, #7209b7, #f72585)' },
  { title: 'Segfault Serenade',       artist: 'Core Dump',         album: 'Memory Leaks',        duration: 273, gradient: 'linear-gradient(135deg, #fb5607, #ff006e)' },
  { title: 'Binary Sunset',           artist: 'The Algorithms',    album: 'Big O Notation',      duration: 201, gradient: 'linear-gradient(135deg, #ffbe0b, #fb5607)' },
  { title: 'Cache Me Outside',        artist: 'RAM Dynasty',       album: 'Volatile Storage',    duration: 227, gradient: 'linear-gradient(135deg, #00bbf9, #00f5d4)' },
  { title: 'Async Await',             artist: 'Promise.all()',     album: 'Event Loop',          duration: 248, gradient: 'linear-gradient(135deg, #9b5de5, #00bbf9)' },
  { title: 'Deploy on Friday',        artist: 'The Hotfixes',      album: 'Production Down',     duration: 194, gradient: 'linear-gradient(135deg, #f15bb5, #fee440)' }
];

var currentIndex = 0;
var isPlaying = false;
var elapsed = 0;
var playInterval = null;
var shuffleOn = false;
var repeatOn = false;

// ============================================================
// DOM REFERENCES
// ============================================================
var musicWindow   = document.getElementById('music-window');
var musicHeader   = document.getElementById('music-header');
var musicResize   = document.getElementById('music-resize-handle');
var desktopArea   = document.getElementById('desktop-area');
var dockIcon      = document.querySelector('.dock-icon[data-app="music"]');

// ============================================================
// HELPERS
// ============================================================
function formatTime(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function currentTrack() {
  return playlist[currentIndex];
}

// ============================================================
// RENDER NOW PLAYING
// ============================================================
function renderNowPlaying() {
  var track = currentTrack();
  var np = document.getElementById('music-now-playing');
  if (!np) return;

  np.innerHTML =
    '<div class="music-album-art" style="background: ' + track.gradient + ';">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>' +
    '</div>' +
    '<div class="music-track-info">' +
      '<div class="music-track-title">' + track.title + '</div>' +
      '<div class="music-track-artist">' + track.artist + '</div>' +
      '<div class="music-track-album">' + track.album + '</div>' +
      '<div id="music-progress-area">' +
        '<div class="music-progress-bar" id="music-progress-bar">' +
          '<div class="music-progress-fill" id="music-progress-fill"></div>' +
        '</div>' +
        '<div class="music-time">' +
          '<span id="music-time-elapsed">0:00</span>' +
          '<span id="music-time-total">' + formatTime(track.duration) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Attach progress bar click
  var bar = document.getElementById('music-progress-bar');
  if (bar) {
    bar.addEventListener('click', function(e) {
      var rect = bar.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      elapsed = Math.floor(pct * currentTrack().duration);
      updateProgress();
    });
  }
}

// ============================================================
// RENDER CONTROLS
// ============================================================
function renderControls() {
  var controls = document.getElementById('music-controls');
  if (!controls) return;

  controls.innerHTML =
    '<button class="music-ctrl-btn shuffle-btn' + (shuffleOn ? ' active' : '') + '" title="Shuffle">' +
      '<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>' +
    '</button>' +
    '<button class="music-ctrl-btn prev-btn" title="Previous">' +
      '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>' +
    '</button>' +
    '<button class="music-ctrl-btn play-btn" title="Play/Pause">' +
      (isPlaying
        ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>') +
    '</button>' +
    '<button class="music-ctrl-btn next-btn" title="Next">' +
      '<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>' +
    '</button>' +
    '<button class="music-ctrl-btn repeat-btn' + (repeatOn ? ' active' : '') + '" title="Repeat">' +
      '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>' +
    '</button>';

  // Attach button handlers
  controls.querySelector('.play-btn').addEventListener('click', togglePlay);
  controls.querySelector('.prev-btn').addEventListener('click', prevTrack);
  controls.querySelector('.next-btn').addEventListener('click', nextTrack);
  controls.querySelector('.shuffle-btn').addEventListener('click', function() {
    shuffleOn = !shuffleOn;
    renderControls();
  });
  controls.querySelector('.repeat-btn').addEventListener('click', function() {
    repeatOn = !repeatOn;
    renderControls();
  });
}

// ============================================================
// RENDER PLAYLIST
// ============================================================
function renderPlaylist() {
  var pl = document.getElementById('music-playlist');
  if (!pl) return;

  var html = '';
  playlist.forEach(function(track, i) {
    var cls = i === currentIndex ? 'music-playlist-item active' : 'music-playlist-item';
    html +=
      '<div class="' + cls + '" data-index="' + i + '">' +
        '<span class="music-playlist-num">' + (i + 1) + '</span>' +
        '<div class="music-playlist-info">' +
          '<div class="music-playlist-name">' + track.title + '</div>' +
          '<div class="music-playlist-artist">' + track.artist + '</div>' +
        '</div>' +
        '<span class="music-playlist-duration">' + formatTime(track.duration) + '</span>' +
      '</div>';
  });
  pl.innerHTML = html;

  // Attach click handlers
  pl.addEventListener('click', function(e) {
    var item = e.target.closest('.music-playlist-item');
    if (!item) return;
    var idx = parseInt(item.getAttribute('data-index'), 10);
    if (idx === currentIndex && isPlaying) return;
    currentIndex = idx;
    elapsed = 0;
    loadTrack();
    if (!isPlaying) togglePlay();
  });
}

// ============================================================
// PLAYBACK ENGINE
// ============================================================
function updateProgress() {
  var track = currentTrack();
  var fill = document.getElementById('music-progress-fill');
  var elapsedEl = document.getElementById('music-time-elapsed');
  if (fill) fill.style.width = (elapsed / track.duration * 100) + '%';
  if (elapsedEl) elapsedEl.textContent = formatTime(elapsed);
}

function tick() {
  elapsed++;
  if (elapsed >= currentTrack().duration) {
    advanceTrack();
    return;
  }
  updateProgress();
}

function togglePlay() {
  if (isPlaying) {
    isPlaying = false;
    clearInterval(playInterval);
    playInterval = null;
  } else {
    isPlaying = true;
    playInterval = setInterval(tick, 1000);
  }
  renderControls();
}

function loadTrack() {
  elapsed = 0;
  renderNowPlaying();
  renderControls();
  renderPlaylist();
  updateProgress();
}

function advanceTrack() {
  clearInterval(playInterval);
  playInterval = null;

  if (shuffleOn) {
    var next = Math.floor(Math.random() * playlist.length);
    if (next === currentIndex) next = (next + 1) % playlist.length;
    currentIndex = next;
  } else {
    currentIndex++;
    if (currentIndex >= playlist.length) {
      if (repeatOn) {
        currentIndex = 0;
      } else {
        currentIndex = playlist.length - 1;
        isPlaying = false;
        loadTrack();
        return;
      }
    }
  }

  elapsed = 0;
  loadTrack();
  if (isPlaying) {
    playInterval = setInterval(tick, 1000);
  }
}

function nextTrack() {
  var wasPlaying = isPlaying;
  if (isPlaying) {
    clearInterval(playInterval);
    playInterval = null;
  }

  if (shuffleOn) {
    var next = Math.floor(Math.random() * playlist.length);
    if (next === currentIndex) next = (next + 1) % playlist.length;
    currentIndex = next;
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }

  elapsed = 0;
  loadTrack();
  if (wasPlaying) {
    isPlaying = true;
    playInterval = setInterval(tick, 1000);
    renderControls();
  }
}

function prevTrack() {
  var wasPlaying = isPlaying;
  if (isPlaying) {
    clearInterval(playInterval);
    playInterval = null;
  }

  if (elapsed > 3) {
    // Restart current track if more than 3 seconds in
    elapsed = 0;
  } else {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    elapsed = 0;
  }

  loadTrack();
  if (wasPlaying) {
    isPlaying = true;
    playInterval = setInterval(tick, 1000);
    renderControls();
  }
}

// ============================================================
// WINDOW MANAGEMENT (drag, resize, minimize/maximize/close, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

// --- Drag ---
musicHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (musicWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - musicWindow.offsetLeft;
  dragOffsetY = e.clientY - musicWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - musicWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    musicWindow.style.left = x + 'px';
    musicWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(420, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(340, resizeStartH + (e.clientY - resizeStartY));
    musicWindow.style.width = newW + 'px';
    musicWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

// --- Resize handle ---
if (musicResize) {
  musicResize.addEventListener('mousedown', function(e) {
    if (musicWindow.classList.contains('maximized')) return;
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = musicWindow.offsetWidth;
    resizeStartH = musicWindow.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });
}

// --- Minimize ---
var btnMin = musicWindow.querySelector('.music-btn-min');
if (btnMin) {
  btnMin.addEventListener('click', function(e) {
    e.stopPropagation();
    musicWindow.classList.add('minimized');
  });
}

// --- Maximize ---
var btnMax = musicWindow.querySelector('.music-btn-max');
if (btnMax) {
  btnMax.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMaximize();
  });
}

// --- Close ---
var btnClose = musicWindow.querySelector('.music-btn-close');
if (btnClose) {
  btnClose.addEventListener('click', function(e) {
    e.stopPropagation();
    musicWindow.classList.add('minimized');
    if (dockIcon) dockIcon.classList.remove('active');
    // Stop playback on close
    if (isPlaying) {
      isPlaying = false;
      clearInterval(playInterval);
      playInterval = null;
    }
  });
}

// --- Double-click header to maximize ---
musicHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (musicWindow.classList.contains('maximized')) {
    musicWindow.classList.remove('maximized');
    if (preMaxState) {
      musicWindow.style.top = preMaxState.top;
      musicWindow.style.left = preMaxState.left;
      musicWindow.style.width = preMaxState.width;
      musicWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: musicWindow.style.top || musicWindow.offsetTop + 'px',
      left: musicWindow.style.left || musicWindow.offsetLeft + 'px',
      width: musicWindow.style.width || musicWindow.offsetWidth + 'px',
      height: musicWindow.style.height || musicWindow.offsetHeight + 'px'
    };
    musicWindow.classList.add('maximized');
  }
}

// --- Dock icon ---
if (dockIcon) {
  dockIcon.addEventListener('click', function() {
    if (musicWindow.classList.contains('minimized')) {
      musicWindow.classList.remove('minimized');
      dockIcon.classList.add('active');
      bringWindowToFront('music-window');
    } else {
      musicWindow.classList.add('minimized');
    }
  });
}

// --- Bring to front on click ---
musicWindow.addEventListener('mousedown', function() {
  bringWindowToFront('music-window');
});

// --- Center on load ---
function centerMusic() {
  var rect = desktopArea.getBoundingClientRect();
  var w = musicWindow.offsetWidth;
  var h = musicWindow.offsetHeight;
  musicWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  musicWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerMusic); });

// ============================================================
// INIT
// ============================================================
renderNowPlaying();
renderControls();
renderPlaylist();

})();
