// ============================================================
// MUSIC PLAYER – Classical Music (Real Audio)
// ============================================================
(function() {

// ============================================================
// PLAYLIST DATA (actual MP3 files)
// ============================================================
var playlist = [
  { title: 'Für Elise',           artist: 'Ludwig van Beethoven',  album: 'Bagatelles',           src: 'assets/music/fur-elise.mp3',         gradient: 'linear-gradient(135deg, #e95420, #f7a541)' },
  { title: 'Moonlight Sonata',    artist: 'Ludwig van Beethoven',  album: 'Piano Sonata No. 14',  src: 'assets/music/moonlight-sonata.mp3',  gradient: 'linear-gradient(135deg, #1a1a3e, #4a4a8a)' },
  { title: 'Clair de Lune',       artist: 'Claude Debussy',        album: 'Suite Bergamasque',    src: 'assets/music/clair-de-lune.mp3',     gradient: 'linear-gradient(135deg, #3a86ff, #8338ec)' },
  { title: 'Prelude in C Major',  artist: 'Johann Sebastian Bach', album: 'Well-Tempered Clavier',src: 'assets/music/prelude-in-c.mp3',      gradient: 'linear-gradient(135deg, #06d6a0, #118ab2)' },
  { title: 'Nocturne No. 2',      artist: 'Frédéric Chopin',       album: 'Nocturnes, Op. 9',     src: 'assets/music/nocturne-no2.mp3',      gradient: 'linear-gradient(135deg, #7209b7, #f72585)' },
  { title: 'Gymnopédie No. 1',    artist: 'Erik Satie',            album: 'Trois Gymnopédies',    src: 'assets/music/gymnopedie.mp3',        gradient: 'linear-gradient(135deg, #9b5de5, #00bbf9)' },
  { title: 'Minute Waltz',        artist: 'Frédéric Chopin',       album: 'Waltzes, Op. 64',      src: 'assets/music/minute-waltz.mp3',      gradient: 'linear-gradient(135deg, #ef476f, #ffd166)' },
  { title: 'Air on the G String', artist: 'Johann Sebastian Bach', album: 'Orchestral Suite No. 3',src: 'assets/music/air-on-g-string.mp3',  gradient: 'linear-gradient(135deg, #ffbe0b, #fb5607)' },
  { title: 'Winter',              artist: 'Antonio Vivaldi',       album: 'The Four Seasons',     src: 'assets/music/winter.mp3',            gradient: 'linear-gradient(135deg, #00bbf9, #00f5d4)' },
  { title: 'Ave Verum Corpus',    artist: 'Wolfgang A. Mozart',    album: 'K. 618',               src: 'assets/music/ave-verum-corpus.mp3',  gradient: 'linear-gradient(135deg, #f15bb5, #fee440)' }
];

var currentIndex = 0;
var isPlaying = false;
var shuffleOn = false;
var repeatOn = false;

// ============================================================
// AUDIO ELEMENT
// ============================================================
var audio = new Audio();
audio.preload = 'auto';

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
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  var s = Math.floor(seconds);
  var m = Math.floor(s / 60);
  s = s % 60;
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
          '<span id="music-time-total">' + formatTime(audio.duration) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Attach progress bar click + drag (seek)
  var bar = document.getElementById('music-progress-bar');
  if (bar) {
    var seeking = false;

    function seekTo(e) {
      if (!audio.duration) return;
      var rect = bar.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      var targetTime = pct * audio.duration;
      // Only seek within buffered range to avoid restart
      if (audio.buffered.length > 0) {
        var buffEnd = audio.buffered.end(audio.buffered.length - 1);
        targetTime = Math.min(targetTime, buffEnd - 0.1);
      }
      try { audio.currentTime = Math.max(0, targetTime); } catch(err) {}
      updateProgress();
    }

    bar.addEventListener('mousedown', function(e) {
      seeking = true;
      seekTo(e);
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (seeking) {
        seekTo(e);
        e.preventDefault();
      }
    });

    document.addEventListener('mouseup', function() {
      seeking = false;
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
        '<span class="music-playlist-duration"></span>' +
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
    loadTrack();
    if (!isPlaying) togglePlay();
  });
}

// ============================================================
// AUDIO PLAYBACK
// ============================================================
function updateProgress() {
  var fill = document.getElementById('music-progress-fill');
  var elapsedEl = document.getElementById('music-time-elapsed');
  var totalEl = document.getElementById('music-time-total');
  if (fill && audio.duration) {
    fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
  }
  if (elapsedEl) elapsedEl.textContent = formatTime(audio.currentTime);
  if (totalEl && audio.duration) totalEl.textContent = formatTime(audio.duration);
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    // Load source if not set
    if (!audio.src || audio.src === location.href) {
      audio.src = currentTrack().src;
    }
    audio.play().catch(function() {});
    isPlaying = true;
  }
  renderControls();
}

function loadTrack() {
  var wasPlaying = isPlaying;
  audio.src = currentTrack().src;
  audio.load();
  renderNowPlaying();
  renderControls();
  renderPlaylist();
  if (wasPlaying) {
    audio.play().catch(function() {});
  }
}

function advanceTrack() {
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
        renderControls();
        return;
      }
    }
  }
  loadTrack();
  audio.play().catch(function() {});
  isPlaying = true;
  renderControls();
}

function nextTrack() {
  if (shuffleOn) {
    var next = Math.floor(Math.random() * playlist.length);
    if (next === currentIndex) next = (next + 1) % playlist.length;
    currentIndex = next;
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }
  loadTrack();
  if (isPlaying) {
    audio.play().catch(function() {});
  }
}

function prevTrack() {
  if (audio.currentTime > 3) {
    // Restart current track if more than 3 seconds in
    audio.currentTime = 0;
  } else {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack();
    if (isPlaying) {
      audio.play().catch(function() {});
    }
  }
}

// Audio events
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', advanceTrack);
audio.addEventListener('loadedmetadata', function() {
  var totalEl = document.getElementById('music-time-total');
  if (totalEl) totalEl.textContent = formatTime(audio.duration);
});

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
      audio.pause();
      isPlaying = false;
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
function positionMusic() { randomPositionWindow(musicWindow); }
requestAnimationFrame(function() { requestAnimationFrame(positionMusic); });

// ============================================================
// INIT
// ============================================================
audio.src = currentTrack().src;
renderNowPlaying();
renderControls();
renderPlaylist();

})();
