// ============================================================
// SYSTEM MONITOR – Resources & Processes
// ============================================================
(function() {

var monitorWindow = document.getElementById('monitor-window');
var monitorHeader = document.getElementById('monitor-header');
var monitorResizeHandle = document.getElementById('monitor-resize-handle');
var desktopArea = document.getElementById('desktop-area');
var dockIcon = document.querySelector('.dock-icon[data-app="monitor"]');
var monitorBody = document.getElementById('monitor-body');

// ============================================================
// TAB SWITCHING
// ============================================================
var tabs = document.querySelectorAll('.monitor-tab');
var resourcesPanel = document.getElementById('monitor-resources');
var processesPanel = document.getElementById('monitor-processes');

function switchTab(tabName) {
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tabName);
  }
  if (tabName === 'resources') {
    resourcesPanel.style.display = 'flex';
    processesPanel.style.display = 'none';
  } else {
    resourcesPanel.style.display = 'none';
    processesPanel.style.display = 'flex';
  }
}

for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', (function(tab) {
    return function() { switchTab(tab.getAttribute('data-tab')); };
  })(tabs[i]));
}

// ============================================================
// RESOURCES PANEL
// ============================================================
var cpuFill = document.getElementById('cpu-fill');
var cpuValue = document.getElementById('cpu-value');
var cpuDetail = document.getElementById('cpu-detail');
var memFill = document.getElementById('mem-fill');
var memValue = document.getElementById('mem-value');
var memDetail = document.getElementById('mem-detail');
var diskFill = document.getElementById('disk-fill');
var diskValue = document.getElementById('disk-value');
var diskDetail = document.getElementById('disk-detail');

var currentCpu = 35;
var currentMem = 38;

function updateCpu() {
  var delta = (Math.random() - 0.5) * 20;
  currentCpu = Math.max(15, Math.min(65, currentCpu + delta));
  var pct = Math.round(currentCpu);
  cpuFill.style.width = pct + '%';
  cpuValue.textContent = pct + '%';
  var cores = [
    Math.round(Math.random() * 60 + 10),
    Math.round(Math.random() * 50 + 5),
    Math.round(Math.random() * 55 + 8),
    Math.round(Math.random() * 45 + 5)
  ];
  cpuDetail.textContent = 'Intel Core i7-10700K @ 3.80GHz \u2022 ' +
    cores.map(function(c, i) { return 'Core ' + i + ': ' + c + '%'; }).join('  ');
}

function updateMemory() {
  var delta = (Math.random() - 0.5) * 4;
  currentMem = Math.max(34, Math.min(42, currentMem + delta));
  var pct = Math.round(currentMem);
  var used = (currentMem / 100 * 16).toFixed(1);
  memFill.style.width = pct + '%';
  memValue.textContent = pct + '%';
  memDetail.textContent = used + ' GiB / 16 GiB used \u2022 Swap: 0.4 GiB / 2 GiB';
}

function initDisk() {
  diskFill.style.width = '61%';
  diskValue.textContent = '61%';
  diskDetail.textContent = '142 GB / 234 GB used \u2022 ext4 \u2022 /dev/sda1';
}

// Initial render
updateCpu();
updateMemory();
initDisk();

// Intervals
var cpuInterval = setInterval(updateCpu, 1500);
var memInterval = setInterval(updateMemory, 1500);

// ============================================================
// PROCESSES PANEL
// ============================================================
var processListEl = document.getElementById('process-list');

var processTemplates = [
  { name: 'systemd', minCpu: 0, maxCpu: 1, minMem: 12, maxMem: 25, status: 'Running' },
  { name: 'gnome-shell', minCpu: 2, maxCpu: 12, minMem: 180, maxMem: 320, status: 'Running' },
  { name: 'firefox', minCpu: 3, maxCpu: 15, minMem: 280, maxMem: 500, status: 'Running' },
  { name: 'code', minCpu: 1, maxCpu: 10, minMem: 200, maxMem: 450, status: 'Running' },
  { name: 'node', minCpu: 0.5, maxCpu: 8, minMem: 80, maxMem: 250, status: 'Running' },
  { name: 'python3', minCpu: 0, maxCpu: 6, minMem: 40, maxMem: 180, status: 'Running' },
  { name: 'bash', minCpu: 0, maxCpu: 1, minMem: 10, maxMem: 30, status: 'Sleeping' },
  { name: 'Xorg', minCpu: 1, maxCpu: 7, minMem: 90, maxMem: 160, status: 'Running' },
  { name: 'pulseaudio', minCpu: 0, maxCpu: 2, minMem: 20, maxMem: 50, status: 'Running' },
  { name: 'snapd', minCpu: 0, maxCpu: 1, minMem: 30, maxMem: 60, status: 'Sleeping' },
  { name: 'cron', minCpu: 0, maxCpu: 0.5, minMem: 10, maxMem: 20, status: 'Sleeping' },
  { name: 'nginx', minCpu: 0, maxCpu: 3, minMem: 15, maxMem: 45, status: 'Sleeping' },
  { name: 'dockerd', minCpu: 0.5, maxCpu: 5, minMem: 100, maxMem: 280, status: 'Running' },
  { name: 'containerd', minCpu: 0, maxCpu: 3, minMem: 50, maxMem: 120, status: 'Running' },
  { name: 'gdm3', minCpu: 0, maxCpu: 1, minMem: 25, maxMem: 55, status: 'Running' },
  { name: 'NetworkManager', minCpu: 0, maxCpu: 1, minMem: 18, maxMem: 40, status: 'Sleeping' },
  { name: 'thermald', minCpu: 0, maxCpu: 0.5, minMem: 10, maxMem: 20, status: 'Sleeping' },
  { name: 'dbus-daemon', minCpu: 0, maxCpu: 1, minMem: 10, maxMem: 25, status: 'Running' }
];

// Generate stable PIDs
var processes = processTemplates.map(function(t) {
  return {
    name: t.name,
    pid: Math.floor(Math.random() * 8999) + 1000,
    cpu: +(t.minCpu + Math.random() * (t.maxCpu - t.minCpu)).toFixed(1),
    mem: Math.round(t.minMem + Math.random() * (t.maxMem - t.minMem)),
    status: t.status,
    minCpu: t.minCpu,
    maxCpu: t.maxCpu
  };
});

function renderProcesses() {
  // Sort by CPU descending
  processes.sort(function(a, b) { return b.cpu - a.cpu; });

  var html = '';
  for (var i = 0; i < processes.length; i++) {
    var p = processes[i];
    var statusClass = p.status === 'Running' ? 'status-running' : 'status-sleeping';
    html += '<div class="process-row">';
    html += '<span class="proc-name">' + p.name + '</span>';
    html += '<span class="proc-pid">' + p.pid + '</span>';
    html += '<span class="proc-cpu">' + p.cpu.toFixed(1) + '%</span>';
    html += '<span class="proc-mem">' + p.mem + ' MB</span>';
    html += '<span class="proc-status ' + statusClass + '">' + p.status + '</span>';
    html += '</div>';
  }
  processListEl.innerHTML = html;
}

function updateProcessCpu() {
  for (var i = 0; i < processes.length; i++) {
    var p = processes[i];
    var delta = (Math.random() - 0.5) * 3;
    p.cpu = Math.max(p.minCpu, Math.min(p.maxCpu, p.cpu + delta));
    p.cpu = +p.cpu.toFixed(1);
  }
  renderProcesses();
}

renderProcesses();
var procInterval = setInterval(updateProcessCpu, 2000);

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

// --- Drag ---
monitorHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (monitorWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - monitorWindow.offsetLeft;
  dragOffsetY = e.clientY - monitorWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - monitorWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    monitorWindow.style.left = x + 'px';
    monitorWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(500, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(350, resizeStartH + (e.clientY - resizeStartY));
    monitorWindow.style.width = newW + 'px';
    monitorWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

// --- Resize ---
monitorResizeHandle.addEventListener('mousedown', function(e) {
  if (monitorWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = monitorWindow.offsetWidth;
  resizeStartH = monitorWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

// --- Window Buttons ---
document.querySelector('.monitor-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  monitorWindow.classList.add('minimized');
});

document.querySelector('.monitor-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('.monitor-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  monitorWindow.classList.add('minimized');
  dockIcon.classList.remove('active');
});

function toggleMaximize() {
  if (monitorWindow.classList.contains('maximized')) {
    monitorWindow.classList.remove('maximized');
    if (preMaxState) {
      monitorWindow.style.top = preMaxState.top;
      monitorWindow.style.left = preMaxState.left;
      monitorWindow.style.width = preMaxState.width;
      monitorWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: monitorWindow.style.top || monitorWindow.offsetTop + 'px',
      left: monitorWindow.style.left || monitorWindow.offsetLeft + 'px',
      width: monitorWindow.style.width || monitorWindow.offsetWidth + 'px',
      height: monitorWindow.style.height || monitorWindow.offsetHeight + 'px'
    };
    monitorWindow.classList.add('maximized');
  }
}

// --- Dock icon click ---
dockIcon.addEventListener('click', function() {
  if (monitorWindow.classList.contains('minimized')) {
    monitorWindow.classList.remove('minimized');
    dockIcon.classList.add('active');
    bringWindowToFront('monitor-window');
  } else {
    monitorWindow.classList.add('minimized');
  }
});

// --- Bring to front on click ---
monitorWindow.addEventListener('mousedown', function() {
  bringWindowToFront('monitor-window');
});

// --- Center monitor window ---
function centerMonitor() {
  var rect = desktopArea.getBoundingClientRect();
  var w = monitorWindow.offsetWidth;
  var h = monitorWindow.offsetHeight;
  monitorWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  monitorWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerMonitor); });

})();
