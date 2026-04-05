// ============================================================
// GNOME CALENDAR APP
// ============================================================
(function() {

var calendarWindow = document.getElementById('calendar-window');
var calendarHeader = document.getElementById('calendar-header');
var calendarResize = document.getElementById('calendar-resize-handle');
var monthYearEl    = document.getElementById('cal-month-year');
var gridEl         = document.getElementById('cal-grid');
var eventsEl       = document.getElementById('cal-events');
var desktopArea    = document.getElementById('desktop-area');
var dockIcon       = document.querySelector('.dock-icon[data-app="calendar"]');

// State
var now = new Date();
var currentMonth = now.getMonth();
var currentYear  = now.getFullYear();
var selectedDate = null; // { year, month, day }

var MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

var DAY_LABELS = ['SU','MO','TU','WE','TH','FR','SA'];

// Mock events – career milestones
var EVENTS = [
  { year: 2024, month: 9,  day: 15, title: 'Started at AbbVie',   time: 'Career milestone' },
  { year: 2024, month: 4,  day: 20, title: 'Graduated SDSU',      time: 'B.S. Commencement' },
  { year: 2022, month: 7,  day: 22, title: 'Started MS at SDSU',  time: 'Graduate school' }
];

// ============================================================
// RENDER
// ============================================================
function render() {
  monthYearEl.textContent = MONTH_NAMES[currentMonth] + ' ' + currentYear;
  renderGrid();
  renderEvents();
}

function renderGrid() {
  gridEl.innerHTML = '';

  var firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
  var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  var prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  var today = new Date();
  var todayYear  = today.getFullYear();
  var todayMonth = today.getMonth();
  var todayDay   = today.getDate();

  // Previous month fill
  for (var p = firstDay - 1; p >= 0; p--) {
    var pDay = prevMonthDays - p;
    var pm = currentMonth - 1;
    var py = currentYear;
    if (pm < 0) { pm = 11; py--; }
    gridEl.appendChild(createDayCell(pDay, py, pm, true));
  }

  // Current month
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = (currentYear === todayYear && currentMonth === todayMonth && d === todayDay);
    var isSelected = selectedDate &&
      selectedDate.year === currentYear &&
      selectedDate.month === currentMonth &&
      selectedDate.day === d;
    gridEl.appendChild(createDayCell(d, currentYear, currentMonth, false, isToday, isSelected));
  }

  // Next month fill (complete last row)
  var totalCells = firstDay + daysInMonth;
  var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  var nm = currentMonth + 1;
  var ny = currentYear;
  if (nm > 11) { nm = 0; ny++; }
  for (var n = 1; n <= remaining; n++) {
    gridEl.appendChild(createDayCell(n, ny, nm, true));
  }
}

function createDayCell(day, year, month, isOther, isToday, isSelected) {
  var cell = document.createElement('button');
  cell.className = 'cal-day';
  cell.textContent = day;
  if (isOther) cell.classList.add('other-month');
  if (isToday) cell.classList.add('today');
  if (isSelected) cell.classList.add('selected');

  cell.addEventListener('click', function() {
    selectedDate = { year: year, month: month, day: day };
    // If clicked on other-month day, navigate to that month
    if (isOther) {
      currentMonth = month;
      currentYear = year;
    }
    render();
  });

  return cell;
}

// ============================================================
// EVENTS
// ============================================================
function renderEvents() {
  if (!selectedDate) {
    eventsEl.innerHTML = '<div class="cal-no-events">Select a day to view events</div>';
    return;
  }

  var dayEvents = EVENTS.filter(function(ev) {
    return ev.year === selectedDate.year &&
           ev.month === selectedDate.month &&
           ev.day === selectedDate.day;
  });

  if (dayEvents.length === 0) {
    eventsEl.innerHTML = '<div class="cal-no-events">No events on ' +
      MONTH_NAMES[selectedDate.month] + ' ' + selectedDate.day + ', ' + selectedDate.year + '</div>';
    return;
  }

  var html = '';
  dayEvents.forEach(function(ev) {
    html += '<div class="cal-event">';
    html += '<div class="cal-event-title">' + escHtml(ev.title) + '</div>';
    html += '<div class="cal-event-time">' + escHtml(ev.time) + '</div>';
    html += '</div>';
  });
  eventsEl.innerHTML = html;
}

function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// NAVIGATION
// ============================================================
document.getElementById('cal-prev').addEventListener('click', function() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  render();
});

document.getElementById('cal-next').addEventListener('click', function() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  render();
});

document.getElementById('cal-today-btn').addEventListener('click', function() {
  var today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  selectedDate = { year: currentYear, month: currentMonth, day: today.getDate() };
  render();
});

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

calendarHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (calendarWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - calendarWindow.offsetLeft;
  dragOffsetY = e.clientY - calendarWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - calendarWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    calendarWindow.style.left = x + 'px';
    calendarWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(340, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(380, resizeStartH + (e.clientY - resizeStartY));
    calendarWindow.style.width = newW + 'px';
    calendarWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

calendarResize.addEventListener('mousedown', function(e) {
  if (calendarWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = calendarWindow.offsetWidth;
  resizeStartH = calendarWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

document.querySelector('#calendar-window .cal-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  calendarWindow.classList.add('minimized');
});

document.querySelector('#calendar-window .cal-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('#calendar-window .cal-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  calendarWindow.classList.add('minimized');
  dockIcon.classList.remove('active');
});

calendarHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (calendarWindow.classList.contains('maximized')) {
    calendarWindow.classList.remove('maximized');
    if (preMaxState) {
      calendarWindow.style.top = preMaxState.top;
      calendarWindow.style.left = preMaxState.left;
      calendarWindow.style.width = preMaxState.width;
      calendarWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: calendarWindow.style.top || calendarWindow.offsetTop + 'px',
      left: calendarWindow.style.left || calendarWindow.offsetLeft + 'px',
      width: calendarWindow.style.width || calendarWindow.offsetWidth + 'px',
      height: calendarWindow.style.height || calendarWindow.offsetHeight + 'px'
    };
    calendarWindow.classList.add('maximized');
  }
}

// Dock icon
dockIcon.addEventListener('click', function() {
  if (calendarWindow.classList.contains('minimized')) {
    calendarWindow.classList.remove('minimized');
    dockIcon.classList.add('active');
    bringWindowToFront('calendar-window');
  } else {
    calendarWindow.classList.add('minimized');
  }
});

// Bring to front on click
calendarWindow.addEventListener('mousedown', function() {
  bringWindowToFront('calendar-window');
});

// Center on load
function positionCalendar() { randomPositionWindow(calendarWindow); }
requestAnimationFrame(function() { requestAnimationFrame(positionCalendar); });

// ============================================================
// INIT
// ============================================================
render();

})();
