// ============================================================
// PHOTO BOOTH (Webcam with Filters)
// ============================================================
(function() {

var pbWindow    = document.getElementById('photobooth-window');
var pbHeader    = document.getElementById('photobooth-header');
var pbResize    = document.getElementById('photobooth-resize-handle');
var videoArea   = document.getElementById('photobooth-video-area');
var videoEl     = document.getElementById('photobooth-video');
var canvasEl    = document.getElementById('photobooth-canvas');
var flashEl     = document.getElementById('photobooth-flash');
var noCameraEl  = document.getElementById('photobooth-no-camera');
var filtersEl   = document.getElementById('photobooth-filters');
var controlsEl  = document.getElementById('photobooth-controls');
var galleryEl   = document.getElementById('photobooth-gallery');
var desktopArea = document.getElementById('desktop-area');
var dockIcon    = document.querySelector('.dock-icon[data-app="photobooth"]');

// ============================================================
// STATE
// ============================================================
var stream         = null;
var cameraActive   = false;
var currentFilter  = 'none';
var capturedPhotos = [];
var viewingPhoto   = false;
var previewImg     = null;

// ============================================================
// FILTERS DEFINITION
// ============================================================
var filters = [
  { name: 'Normal',     css: 'none',                                    gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { name: 'Grayscale',  css: 'grayscale(100%)',                         gradient: 'linear-gradient(135deg, #333, #999)' },
  { name: 'Sepia',      css: 'sepia(100%)',                             gradient: 'linear-gradient(135deg, #704214, #c8a96e)' },
  { name: 'Invert',     css: 'invert(100%)',                            gradient: 'linear-gradient(135deg, #000, #fff)' },
  { name: 'Blur',       css: 'blur(2px)',                               gradient: 'linear-gradient(135deg, #a8c0ff, #3f2b96)' },
  { name: 'Bright',     css: 'brightness(1.5)',                         gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { name: 'Contrast',   css: 'contrast(1.8)',                           gradient: 'linear-gradient(135deg, #0f0c29, #e0e0e0)' },
  { name: 'Hue',        css: 'hue-rotate(90deg)',                       gradient: 'linear-gradient(135deg, #00f260, #0575e6)' },
  { name: 'Saturate',   css: 'saturate(3)',                             gradient: 'linear-gradient(135deg, #ff0844, #ffb199)' },
  { name: 'Vintage',    css: 'sepia(50%) contrast(1.2) brightness(0.9)', gradient: 'linear-gradient(135deg, #8e6b3e, #d4a76a)' }
];

// ============================================================
// BUILD FILTER STRIP
// ============================================================
function buildFilters() {
  filtersEl.innerHTML = '';
  filters.forEach(function(f, i) {
    var el = document.createElement('div');
    el.className = 'pb-filter' + (i === 0 ? ' active' : '');
    el.setAttribute('data-filter-index', i);

    var preview = document.createElement('div');
    preview.className = 'pb-filter-preview';
    preview.style.background = f.gradient;

    var label = document.createElement('div');
    label.className = 'pb-filter-label';
    label.textContent = f.name;

    el.appendChild(preview);
    el.appendChild(label);

    el.addEventListener('click', function(e) {
      e.stopPropagation();
      selectFilter(i);
    });

    filtersEl.appendChild(el);
  });
}

function selectFilter(index) {
  currentFilter = filters[index].css;

  // Update active class
  var allFilters = filtersEl.querySelectorAll('.pb-filter');
  allFilters.forEach(function(f) { f.classList.remove('active'); });
  allFilters[index].classList.add('active');

  // Apply filter to video
  applyFilter();
}

function applyFilter() {
  if (currentFilter === 'none') {
    videoEl.style.filter = '';
  } else {
    videoEl.style.filter = currentFilter;
  }
}

// ============================================================
// CAMERA MANAGEMENT
// ============================================================
function startCamera() {
  if (cameraActive && stream) return;

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(mediaStream) {
      stream = mediaStream;
      videoEl.srcObject = stream;
      videoEl.play();
      cameraActive = true;
      noCameraEl.style.display = 'none';
      videoEl.style.display = 'block';
      applyFilter();
    })
    .catch(function(err) {
      console.warn('Photo Booth: Camera access denied or unavailable', err);
      showNoCameraMessage('Camera access denied. Please allow camera permissions and try again.');
    });
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(function(track) {
      track.stop();
    });
    stream = null;
  }
  cameraActive = false;
  videoEl.srcObject = null;
}

function showNoCameraMessage(msg) {
  noCameraEl.style.display = 'flex';
  var msgEl = noCameraEl.querySelector('.pb-no-camera-text');
  if (msgEl) msgEl.textContent = msg || 'Camera is off';
  videoEl.style.display = 'none';
}

// ============================================================
// BUILD NO-CAMERA OVERLAY
// ============================================================
function buildNoCameraOverlay() {
  noCameraEl.innerHTML = '';

  // Camera icon SVG
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'pb-no-camera-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z');
  svg.appendChild(path);
  noCameraEl.appendChild(svg);

  var text = document.createElement('div');
  text.className = 'pb-no-camera-text';
  text.textContent = 'Camera is off';
  text.style.fontSize = '13px';
  noCameraEl.appendChild(text);

  var btn = document.createElement('button');
  btn.className = 'pb-enable-btn';
  btn.textContent = 'Enable Camera';
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    startCamera();
  });
  noCameraEl.appendChild(btn);
}

// ============================================================
// BUILD SHUTTER BUTTON
// ============================================================
function buildControls() {
  controlsEl.innerHTML = '';

  var shutterBtn = document.createElement('button');
  shutterBtn.className = 'pb-shutter-btn';
  shutterBtn.title = 'Take Photo';
  shutterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    capturePhoto();
  });

  controlsEl.appendChild(shutterBtn);
}

// ============================================================
// CAPTURE PHOTO
// ============================================================
function capturePhoto() {
  if (!cameraActive || viewingPhoto) return;

  // Set canvas to video dimensions
  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;

  var ctx = canvasEl.getContext('2d');

  // Mirror the capture to match the mirrored video
  ctx.translate(canvasEl.width, 0);
  ctx.scale(-1, 1);

  // Apply filter
  if (currentFilter !== 'none') {
    ctx.filter = currentFilter;
  }

  ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

  // Reset transforms
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  var dataUrl = canvasEl.toDataURL('image/png');
  capturedPhotos.push(dataUrl);

  // Flash animation
  triggerFlash();

  // Add to gallery
  addGalleryThumb(dataUrl, capturedPhotos.length - 1);
}

function triggerFlash() {
  flashEl.style.transition = 'none';
  flashEl.style.opacity = '1';
  // Force reflow
  void flashEl.offsetWidth;
  flashEl.style.transition = 'opacity 0.3s ease-out';
  flashEl.style.opacity = '0';
}

// ============================================================
// GALLERY
// ============================================================
function addGalleryThumb(dataUrl, index) {
  var thumb = document.createElement('div');
  thumb.className = 'pb-gallery-thumb';
  thumb.setAttribute('data-photo-index', index);

  var img = document.createElement('img');
  img.src = dataUrl;
  img.alt = 'Photo ' + (index + 1);
  thumb.appendChild(img);

  thumb.addEventListener('click', function(e) {
    e.stopPropagation();
    viewPhoto(index);
  });

  galleryEl.appendChild(thumb);

  // Scroll to the new thumbnail
  galleryEl.scrollLeft = galleryEl.scrollWidth;
}

function viewPhoto(index) {
  if (viewingPhoto) {
    // Already viewing, go back to live feed
    returnToLive();
    return;
  }

  var dataUrl = capturedPhotos[index];
  if (!dataUrl) return;

  viewingPhoto = true;

  // Hide video, show image
  videoEl.style.display = 'none';
  noCameraEl.style.display = 'none';

  if (!previewImg) {
    previewImg = document.createElement('img');
    previewImg.id = 'photobooth-preview';
    previewImg.style.width = '100%';
    previewImg.style.height = '100%';
    previewImg.style.objectFit = 'contain';
    previewImg.style.cursor = 'pointer';
    videoArea.appendChild(previewImg);
  }

  previewImg.src = dataUrl;
  previewImg.style.display = 'block';
}

function returnToLive() {
  viewingPhoto = false;
  if (previewImg) {
    previewImg.style.display = 'none';
  }
  if (cameraActive) {
    videoEl.style.display = 'block';
  } else {
    noCameraEl.style.display = 'flex';
  }
}

// Click video area to return to live feed when viewing photo
videoArea.addEventListener('click', function() {
  if (viewingPhoto) {
    returnToLive();
  }
});

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

pbHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (pbWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - pbWindow.offsetLeft;
  dragOffsetY = e.clientY - pbWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - pbWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    pbWindow.style.left = x + 'px';
    pbWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(440, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(400, resizeStartH + (e.clientY - resizeStartY));
    pbWindow.style.width = newW + 'px';
    pbWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

pbResize.addEventListener('mousedown', function(e) {
  if (pbWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = pbWindow.offsetWidth;
  resizeStartH = pbWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

// Title bar buttons
document.querySelector('.pb-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  pbWindow.classList.add('minimized');
  stopCamera();
});

document.querySelector('.pb-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('.pb-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  pbWindow.classList.add('minimized');
  dockIcon.classList.remove('active');
  stopCamera();
});

pbHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (pbWindow.classList.contains('maximized')) {
    pbWindow.classList.remove('maximized');
    if (preMaxState) {
      pbWindow.style.top = preMaxState.top;
      pbWindow.style.left = preMaxState.left;
      pbWindow.style.width = preMaxState.width;
      pbWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: pbWindow.style.top || pbWindow.offsetTop + 'px',
      left: pbWindow.style.left || pbWindow.offsetLeft + 'px',
      width: pbWindow.style.width || pbWindow.offsetWidth + 'px',
      height: pbWindow.style.height || pbWindow.offsetHeight + 'px'
    };
    pbWindow.classList.add('maximized');
  }
}

// Dock icon
dockIcon.addEventListener('click', function() {
  if (pbWindow.classList.contains('minimized')) {
    pbWindow.classList.remove('minimized');
    dockIcon.classList.add('active');
    bringWindowToFront('photobooth-window');
    // Restart camera when reopened
    if (!cameraActive && stream === null) {
      startCamera();
    }
  } else {
    pbWindow.classList.add('minimized');
    stopCamera();
  }
});

// Bring to front on click
pbWindow.addEventListener('mousedown', function() {
  bringWindowToFront('photobooth-window');
});

// Center on load
function centerWindow() {
  var rect = desktopArea.getBoundingClientRect();
  var w = pbWindow.offsetWidth;
  var h = pbWindow.offsetHeight;
  pbWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  pbWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerWindow); });

// ============================================================
// INIT
// ============================================================
buildNoCameraOverlay();
buildFilters();
buildControls();

})();
