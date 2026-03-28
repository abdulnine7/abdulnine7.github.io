// ============================================================
// PDF VIEWER
// Uses PROFILE.resume.pdf for the PDF path
// ============================================================
(function() {

var pdfWindow    = document.getElementById('pdf-window');
var pdfHeader    = document.getElementById('pdf-header');
var pdfResize    = document.getElementById('pdf-resize-handle');
var pdfContent   = document.getElementById('pdf-content');
var pdfEmbed     = document.getElementById('pdf-embed');
var pdfFallback  = document.getElementById('pdf-fallback');
var filenameEl   = pdfWindow.querySelector('.pdf-filename');
var desktopArea  = document.getElementById('desktop-area');
var dockIcon     = document.querySelector('.dock-icon[data-app="pdf-viewer"]');

// PDF path from global profile
var pdfPath = (typeof PROFILE !== 'undefined' && PROFILE.resume && PROFILE.resume.pdf) ? PROFILE.resume.pdf : '';
var pdfFilename = pdfPath ? pdfPath.split('/').pop() : 'Resume.pdf';

// Zoom state
var zoomLevel = 1.0;
var ZOOM_STEP = 0.15;
var ZOOM_MIN = 0.5;
var ZOOM_MAX = 3.0;

// ============================================================
// INIT PDF EMBED
// ============================================================
function initPdf() {
  filenameEl.textContent = pdfFilename;

  if (!pdfPath) {
    showFallback();
    return;
  }

  // Try to embed the PDF via iframe
  pdfEmbed.src = pdfPath;
  pdfEmbed.style.display = 'block';
  pdfFallback.style.display = 'none';

  pdfEmbed.addEventListener('load', function() {
    // If iframe loaded successfully, keep it visible
    pdfEmbed.style.display = 'block';
    pdfFallback.style.display = 'none';
  });

  pdfEmbed.addEventListener('error', function() {
    showFallback();
  });
}

function showFallback() {
  pdfEmbed.style.display = 'none';
  pdfFallback.style.display = 'flex';
}

// ============================================================
// ZOOM
// ============================================================
function applyZoom() {
  pdfEmbed.style.transform = 'scale(' + zoomLevel + ')';
  pdfEmbed.style.transformOrigin = 'top left';
  pdfEmbed.style.width = (100 / zoomLevel) + '%';
  pdfEmbed.style.height = (100 / zoomLevel) + '%';
}

function zoomIn() {
  if (zoomLevel < ZOOM_MAX) {
    zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
    applyZoom();
  }
}

function zoomOut() {
  if (zoomLevel > ZOOM_MIN) {
    zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    applyZoom();
  }
}

function zoomReset() {
  zoomLevel = 1.0;
  applyZoom();
}

// ============================================================
// OPEN IN NEW TAB
// ============================================================
function openExternal() {
  if (pdfPath) {
    window.open(pdfPath, '_blank');
  }
}

// ============================================================
// TOOLBAR BUTTONS
// ============================================================
pdfWindow.querySelectorAll('.pdf-tool-btn').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var action = btn.getAttribute('data-action');
    if (action === 'zoom-in') zoomIn();
    if (action === 'zoom-out') zoomOut();
    if (action === 'zoom-reset') zoomReset();
  });
});

var openExternalBtn = pdfWindow.querySelector('.pdf-open-external');
if (openExternalBtn) {
  openExternalBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    openExternal();
  });
}

// Fallback open button
var fallbackOpenBtn = pdfWindow.querySelector('.pdf-fallback-open');
if (fallbackOpenBtn) {
  fallbackOpenBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    openExternal();
  });
}

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

pdfHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons') || e.target.closest('.pdf-tool-btn')) return;
  if (pdfWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - pdfWindow.offsetLeft;
  dragOffsetY = e.clientY - pdfWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - pdfWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    pdfWindow.style.left = x + 'px';
    pdfWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(500, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(400, resizeStartH + (e.clientY - resizeStartY));
    pdfWindow.style.width = newW + 'px';
    pdfWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

if (pdfResize) {
  pdfResize.addEventListener('mousedown', function(e) {
    if (pdfWindow.classList.contains('maximized')) return;
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = pdfWindow.offsetWidth;
    resizeStartH = pdfWindow.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });
}

// Window buttons
var btnMin = pdfWindow.querySelector('.pdf-btn-min');
var btnMax = pdfWindow.querySelector('.pdf-btn-max');
var btnClose = pdfWindow.querySelector('.pdf-btn-close');

if (btnMin) {
  btnMin.addEventListener('click', function(e) {
    e.stopPropagation();
    pdfWindow.classList.add('minimized');
  });
}

if (btnMax) {
  btnMax.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMaximize();
  });
}

if (btnClose) {
  btnClose.addEventListener('click', function(e) {
    e.stopPropagation();
    pdfWindow.classList.add('minimized');
    dockIcon.classList.remove('active');
  });
}

pdfHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (pdfWindow.classList.contains('maximized')) {
    pdfWindow.classList.remove('maximized');
    if (preMaxState) {
      pdfWindow.style.top = preMaxState.top;
      pdfWindow.style.left = preMaxState.left;
      pdfWindow.style.width = preMaxState.width;
      pdfWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: pdfWindow.style.top || pdfWindow.offsetTop + 'px',
      left: pdfWindow.style.left || pdfWindow.offsetLeft + 'px',
      width: pdfWindow.style.width || pdfWindow.offsetWidth + 'px',
      height: pdfWindow.style.height || pdfWindow.offsetHeight + 'px'
    };
    pdfWindow.classList.add('maximized');
  }
}

// Dock icon
if (dockIcon) {
  dockIcon.addEventListener('click', function() {
    if (pdfWindow.classList.contains('minimized')) {
      pdfWindow.classList.remove('minimized');
      dockIcon.classList.add('active');
      bringWindowToFront('pdf-window');
    } else {
      pdfWindow.classList.add('minimized');
    }
  });
}

// Bring to front on click
pdfWindow.addEventListener('mousedown', function() {
  bringWindowToFront('pdf-window');
});

// Center on load
function centerPdfWindow() {
  var rect = desktopArea.getBoundingClientRect();
  var w = pdfWindow.offsetWidth;
  var h = pdfWindow.offsetHeight;
  pdfWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  pdfWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerPdfWindow); });

// ============================================================
// INIT
// ============================================================
initPdf();

})();
