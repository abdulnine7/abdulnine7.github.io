// ============================================================
// WEATHER APP – GNOME Weather Style (Mock Data)
// ============================================================
(function() {

// ============================================================
// MOCK WEATHER DATA
// ============================================================
var weatherData = {
  'San Diego': {
    temp: 72,
    condition: 'Sunny',
    icon: '\u2600\uFE0F',
    humidity: 45,
    wind: 8,
    uv: 6,
    visibility: 10
  },
  'New York': {
    temp: 58,
    condition: 'Partly Cloudy',
    icon: '\uD83C\uDF24\uFE0F',
    humidity: 62,
    wind: 12,
    uv: 3,
    visibility: 8
  },
  'London': {
    temp: 52,
    condition: 'Rainy',
    icon: '\uD83C\uDF27\uFE0F',
    humidity: 78,
    wind: 15,
    uv: 2,
    visibility: 5
  },
  'Tokyo': {
    temp: 65,
    condition: 'Clear',
    icon: '\uD83C\uDF19',
    humidity: 55,
    wind: 6,
    uv: 4,
    visibility: 12
  },
  'Mumbai': {
    temp: 88,
    condition: 'Humid',
    icon: '\uD83C\uDF2B\uFE0F',
    humidity: 85,
    wind: 10,
    uv: 8,
    visibility: 7
  }
};

var cities = Object.keys(weatherData);
var activeCity = cities[0];

// ============================================================
// DOM REFERENCES
// ============================================================
var weatherWindow = document.getElementById('weather-window');
var weatherHeader = document.getElementById('weather-header');
var weatherResize = document.getElementById('weather-resize-handle');
var desktopArea   = document.getElementById('desktop-area');
var dockIcon      = document.querySelector('.dock-icon[data-app="weather"]');

// ============================================================
// BUILD CITY TABS
// ============================================================
var cityBar = document.getElementById('weather-city-bar');

function buildCityTabs() {
  var html = '';
  cities.forEach(function(city) {
    var cls = city === activeCity ? 'weather-city-btn active' : 'weather-city-btn';
    html += '<button class="' + cls + '" data-city="' + city + '">' + city + '</button>';
  });
  cityBar.innerHTML = html;
}

cityBar.addEventListener('click', function(e) {
  var btn = e.target.closest('.weather-city-btn');
  if (!btn) return;
  activeCity = btn.getAttribute('data-city');
  buildCityTabs();
  renderWeather();
});

// ============================================================
// RENDER WEATHER DISPLAY
// ============================================================
var weatherMain    = document.getElementById('weather-main');
var weatherDetails = document.getElementById('weather-details');

function renderWeather() {
  var data = weatherData[activeCity];
  if (!data) return;

  var now = new Date();
  var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  weatherMain.innerHTML =
    '<div class="weather-icon">' + data.icon + '</div>' +
    '<div class="weather-temp">' + data.temp + '\u00B0F</div>' +
    '<div class="weather-condition">' + data.condition + '</div>' +
    '<div class="weather-location">' + activeCity + '</div>' +
    '<div class="weather-updated">Last updated ' + timeStr + '</div>';

  weatherDetails.innerHTML =
    '<div class="weather-detail-card">' +
      '<div class="weather-detail-label">Humidity</div>' +
      '<div class="weather-detail-value">' + data.humidity + '%</div>' +
    '</div>' +
    '<div class="weather-detail-card">' +
      '<div class="weather-detail-label">Wind</div>' +
      '<div class="weather-detail-value">' + data.wind + ' mph</div>' +
    '</div>' +
    '<div class="weather-detail-card">' +
      '<div class="weather-detail-label">UV Index</div>' +
      '<div class="weather-detail-value">' + data.uv + '</div>' +
    '</div>' +
    '<div class="weather-detail-card">' +
      '<div class="weather-detail-label">Visibility</div>' +
      '<div class="weather-detail-value">' + data.visibility + ' mi</div>' +
    '</div>';
}

// ============================================================
// AUTO-UPDATE TIMESTAMP (every 60 seconds)
// ============================================================
setInterval(function() {
  renderWeather();
}, 60000);

// ============================================================
// WINDOW MANAGEMENT (drag, resize, minimize/maximize/close, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

// --- Drag ---
weatherHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (weatherWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - weatherWindow.offsetLeft;
  dragOffsetY = e.clientY - weatherWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - weatherWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    weatherWindow.style.left = x + 'px';
    weatherWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(380, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(320, resizeStartH + (e.clientY - resizeStartY));
    weatherWindow.style.width = newW + 'px';
    weatherWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

// --- Resize handle ---
if (weatherResize) {
  weatherResize.addEventListener('mousedown', function(e) {
    if (weatherWindow.classList.contains('maximized')) return;
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = weatherWindow.offsetWidth;
    resizeStartH = weatherWindow.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });
}

// --- Minimize ---
var btnMin = weatherWindow.querySelector('.weather-btn-min');
if (btnMin) {
  btnMin.addEventListener('click', function(e) {
    e.stopPropagation();
    weatherWindow.classList.add('minimized');
  });
}

// --- Maximize ---
var btnMax = weatherWindow.querySelector('.weather-btn-max');
if (btnMax) {
  btnMax.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMaximize();
  });
}

// --- Close ---
var btnClose = weatherWindow.querySelector('.weather-btn-close');
if (btnClose) {
  btnClose.addEventListener('click', function(e) {
    e.stopPropagation();
    weatherWindow.classList.add('minimized');
    if (dockIcon) dockIcon.classList.remove('active');
  });
}

// --- Double-click header to maximize ---
weatherHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (weatherWindow.classList.contains('maximized')) {
    weatherWindow.classList.remove('maximized');
    if (preMaxState) {
      weatherWindow.style.top = preMaxState.top;
      weatherWindow.style.left = preMaxState.left;
      weatherWindow.style.width = preMaxState.width;
      weatherWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: weatherWindow.style.top || weatherWindow.offsetTop + 'px',
      left: weatherWindow.style.left || weatherWindow.offsetLeft + 'px',
      width: weatherWindow.style.width || weatherWindow.offsetWidth + 'px',
      height: weatherWindow.style.height || weatherWindow.offsetHeight + 'px'
    };
    weatherWindow.classList.add('maximized');
  }
}

// --- Dock icon ---
if (dockIcon) {
  dockIcon.addEventListener('click', function() {
    if (weatherWindow.classList.contains('minimized')) {
      weatherWindow.classList.remove('minimized');
      dockIcon.classList.add('active');
      bringWindowToFront('weather-window');
    } else {
      weatherWindow.classList.add('minimized');
    }
  });
}

// --- Bring to front on click ---
weatherWindow.addEventListener('mousedown', function() {
  bringWindowToFront('weather-window');
});

// --- Center on load ---
function positionWeather() { randomPositionWindow(weatherWindow); }
requestAnimationFrame(function() { requestAnimationFrame(positionWeather); });

// ============================================================
// INIT
// ============================================================
buildCityTabs();
renderWeather();

})();
