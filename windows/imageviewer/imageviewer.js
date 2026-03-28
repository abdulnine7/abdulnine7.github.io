// ============================================================
// IMAGE VIEWER (Eye of GNOME style)
// Collects images from PROFILE data and displays them
// ============================================================
(function() {

var win        = document.getElementById('imageviewer-window');
var header     = document.getElementById('imageviewer-header');
var titleEl    = document.getElementById('imageviewer-title');
var toolbar    = document.getElementById('imageviewer-toolbar');
var display    = document.getElementById('imageviewer-display');
var strip      = document.getElementById('imageviewer-strip');
var statusBar  = document.getElementById('imageviewer-status');
var resizeHandle = document.getElementById('imageviewer-resize-handle');
var desktopArea  = document.getElementById('desktop-area');
var dockIcon     = document.querySelector('.dock-icon[data-app="imageviewer"]');

// ============================================================
// COLLECT IMAGES FROM PROFILE
// ============================================================
var images = [];

if (typeof PROFILE !== 'undefined') {
  // Profile image
  if (PROFILE.about && PROFILE.about.profileImage) {
    images.push({
      src: PROFILE.about.profileImage,
      name: PROFILE.about.profileImage.split('/').pop()
    });
  }
  // Experience logos
  if (PROFILE.experience && Array.isArray(PROFILE.experience)) {
    PROFILE.experience.forEach(function(exp) {
      if (exp.logo) {
        images.push({
          src: exp.logo,
          name: exp.logo.split('/').pop()
        });
      }
    });
  }
}

// ============================================================
// STATE
// ============================================================
var currentIndex = 0;
var zoomLevel = 100;      // percentage
var rotation = 0;         // degrees
var preMaxState = null;

// Placeholder colors for missing images
var placeholderColors = ['#e95420', '#772953', '#2c5f2d', '#2d5f8b', '#8b5f2d', '#5f2d8b'];

// ============================================================
// BUILD TOOLBAR
// ============================================================
toolbar.innerHTML =
  '<button class="iv-tool-btn" data-action="prev" title="Previous">' +
    '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>' +
  '</button>' +
  '<button class="iv-tool-btn" data-action="next" title="Next">' +
    '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' +
  '</button>' +
  '<div class="iv-tool-sep"></div>' +
  '<button class="iv-tool-btn" data-action="zoom-in" title="Zoom In">' +
    '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>' +
  '</button>' +
  '<button class="iv-tool-btn" data-action="zoom-out" title="Zoom Out">' +
    '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7V9z"/></svg>' +
  '</button>' +
  '<button class="iv-tool-btn" data-action="zoom-reset" title="Fit to Window">' +
    '<svg viewBox="0 0 24 24"><path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/></svg>' +
  '</button>' +
  '<div class="iv-tool-sep"></div>' +
  '<button class="iv-tool-btn" data-action="rotate-left" title="Rotate Left">' +
    '<svg viewBox="0 0 24 24"><path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/></svg>' +
  '</button>' +
  '<button class="iv-tool-btn" data-action="rotate-right" title="Rotate Right">' +
    '<svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"/></svg>' +
  '</button>';

// ============================================================
// BUILD THUMBNAIL STRIP
// ============================================================
function buildStrip() {
  strip.innerHTML = '';
  if (images.length === 0) return;

  images.forEach(function(img, i) {
    var thumb = document.createElement('div');
    thumb.className = 'iv-thumb' + (i === currentIndex ? ' active' : '');
    thumb.setAttribute('data-index', i);

    var imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.alt = img.name;
    imgEl.draggable = false;

    // If the image fails to load, replace with a placeholder
    imgEl.onerror = function() {
      thumb.innerHTML = '';
      var placeholder = document.createElement('div');
      placeholder.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
        'background:' + placeholderColors[i % placeholderColors.length] + ';' +
        'font-size:8px;color:#fff;text-align:center;padding:2px;word-break:break-all;';
      placeholder.textContent = img.name;
      thumb.appendChild(placeholder);
    };

    thumb.appendChild(imgEl);

    thumb.addEventListener('click', function() {
      showImage(i);
    });

    strip.appendChild(thumb);
  });
}

// ============================================================
// SHOW IMAGE
// ============================================================
function showImage(index) {
  if (images.length === 0) {
    showEmptyState();
    return;
  }

  currentIndex = index;
  zoomLevel = 100;
  rotation = 0;

  var img = images[currentIndex];

  // Build display content
  display.innerHTML = '';

  var imgEl = document.createElement('img');
  imgEl.id = 'imageviewer-img';
  imgEl.src = img.src;
  imgEl.alt = img.name;
  imgEl.draggable = false;

  imgEl.onload = function() {
    titleEl.textContent = img.name + ' (' + imgEl.naturalWidth + '\u00d7' + imgEl.naturalHeight + ') \u2014 Image Viewer';
    updateStatus();
  };

  imgEl.onerror = function() {
    // Replace with a colored placeholder
    display.innerHTML = '';
    var placeholder = document.createElement('div');
    placeholder.id = 'imageviewer-img';
    placeholder.style.cssText = 'width:300px;height:250px;display:flex;align-items:center;justify-content:center;' +
      'flex-direction:column;gap:10px;border-radius:8px;' +
      'background:' + placeholderColors[currentIndex % placeholderColors.length] + ';' +
      'font-size:14px;color:#fff;text-align:center;padding:20px;transition:transform 0.2s;';
    placeholder.innerHTML =
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>' +
      '<span>' + escHtml(img.name) + '</span>';
    display.appendChild(placeholder);
    titleEl.textContent = img.name + ' \u2014 Image Viewer';
    updateStatus();
  };

  display.appendChild(imgEl);

  // Update strip active state
  strip.querySelectorAll('.iv-thumb').forEach(function(t, i) {
    t.classList.toggle('active', i === currentIndex);
  });

  updateStatus();
}

function showEmptyState() {
  display.innerHTML =
    '<div id="imageviewer-empty">' +
      '<svg class="iv-empty-icon" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>' +
      '<span style="font-size:14px;">No images available</span>' +
    '</div>';
  titleEl.textContent = 'Image Viewer';
  statusBar.innerHTML = '<span>No images</span><span></span>';
}

// ============================================================
// ZOOM & ROTATE
// ============================================================
function applyTransform() {
  var el = display.querySelector('#imageviewer-img');
  if (!el) return;
  el.style.transform = 'scale(' + (zoomLevel / 100) + ') rotate(' + rotation + 'deg)';
}

function zoomIn() {
  zoomLevel = Math.min(400, zoomLevel + 25);
  applyTransform();
  updateStatus();
}

function zoomOut() {
  zoomLevel = Math.max(25, zoomLevel - 25);
  applyTransform();
  updateStatus();
}

function zoomReset() {
  zoomLevel = 100;
  rotation = 0;
  applyTransform();
  updateStatus();
}

function rotateLeft() {
  rotation = (rotation - 90) % 360;
  applyTransform();
}

function rotateRight() {
  rotation = (rotation + 90) % 360;
  applyTransform();
}

function prevImage() {
  if (images.length === 0) return;
  showImage((currentIndex - 1 + images.length) % images.length);
}

function nextImage() {
  if (images.length === 0) return;
  showImage((currentIndex + 1) % images.length);
}

// ============================================================
// STATUS BAR
// ============================================================
function updateStatus() {
  if (images.length === 0) return;
  statusBar.innerHTML =
    '<span>' + (currentIndex + 1) + ' of ' + images.length + '</span>' +
    '<span>' + zoomLevel + '%</span>';
}

// ============================================================
// TOOLBAR ACTIONS
// ============================================================
toolbar.addEventListener('click', function(e) {
  var btn = e.target.closest('.iv-tool-btn');
  if (!btn) return;
  e.stopPropagation();
  var action = btn.getAttribute('data-action');
  if (action === 'prev') prevImage();
  if (action === 'next') nextImage();
  if (action === 'zoom-in') zoomIn();
  if (action === 'zoom-out') zoomOut();
  if (action === 'zoom-reset') zoomReset();
  if (action === 'rotate-left') rotateLeft();
  if (action === 'rotate-right') rotateRight();
});

// ============================================================
// KEYBOARD NAVIGATION
// ============================================================
win.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevImage(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); nextImage(); }
  if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
  if (e.key === '-') { e.preventDefault(); zoomOut(); }
  if (e.key === '0') { e.preventDefault(); zoomReset(); }
});

// Make window focusable for keyboard events
win.setAttribute('tabindex', '-1');

// ============================================================
// HELPERS
// ============================================================
function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

header.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons') || e.target.closest('.iv-tool-btn')) return;
  if (win.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - win.offsetLeft;
  dragOffsetY = e.clientY - win.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - win.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    win.style.left = x + 'px';
    win.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(400, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(320, resizeStartH + (e.clientY - resizeStartY));
    win.style.width = newW + 'px';
    win.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

if (resizeHandle) {
  resizeHandle.addEventListener('mousedown', function(e) {
    if (win.classList.contains('maximized')) return;
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = win.offsetWidth;
    resizeStartH = win.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });
}

// Minimize
win.querySelector('.iv-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  win.classList.add('minimized');
});

// Maximize
win.querySelector('.iv-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

// Close
win.querySelector('.iv-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  win.classList.add('minimized');
  if (dockIcon) dockIcon.classList.remove('active');
});

// Double-click header to toggle maximize
header.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    if (preMaxState) {
      win.style.top = preMaxState.top;
      win.style.left = preMaxState.left;
      win.style.width = preMaxState.width;
      win.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: win.style.top || win.offsetTop + 'px',
      left: win.style.left || win.offsetLeft + 'px',
      width: win.style.width || win.offsetWidth + 'px',
      height: win.style.height || win.offsetHeight + 'px'
    };
    win.classList.add('maximized');
  }
}

// Dock icon
if (dockIcon) {
  dockIcon.addEventListener('click', function() {
    if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
      dockIcon.classList.add('active');
      bringWindowToFront('imageviewer-window');
      win.focus();
    } else {
      win.classList.add('minimized');
    }
  });
}

// Bring to front on click
win.addEventListener('mousedown', function() {
  bringWindowToFront('imageviewer-window');
});

// ============================================================
// CENTER ON LOAD
// ============================================================
function centerWindow() {
  var rect = desktopArea.getBoundingClientRect();
  var w = win.offsetWidth;
  var h = win.offsetHeight;
  win.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  win.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerWindow); });

// ============================================================
// PUBLIC API - open a specific image from other apps
// ============================================================
window.imageviewerOpen = function(src, name) {
  win.classList.remove('minimized');
  if (dockIcon) dockIcon.classList.add('active');
  bringWindowToFront('imageviewer-window');

  // Check if image already in list
  var found = -1;
  images.forEach(function(img, i) {
    if (img.src === src) found = i;
  });
  if (found >= 0) {
    showImage(found);
  } else {
    images.push({ src: src, name: name || src.split('/').pop() });
    buildStrip();
    showImage(images.length - 1);
  }
};

// ============================================================
// INIT
// ============================================================
buildStrip();
if (images.length > 0) {
  showImage(0);
} else {
  showEmptyState();
}

})();
