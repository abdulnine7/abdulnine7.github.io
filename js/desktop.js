// ============================================================
// UBUNTU DESKTOP - Window Management & UI
// ============================================================

(function() {
  const terminalWindow = document.getElementById('terminal-window');
  const titleBar = document.getElementById('title-bar');
  const desktopArea = document.getElementById('desktop-area');
  const contextMenu = document.getElementById('desktop-context-menu');
  const resizeHandle = document.getElementById('resize-handle');
  const terminalInput = document.getElementById('input');
  const dockTerminalIcon = document.querySelector('.dock-icon[data-app="terminal"]');

  // Store window state before maximize
  let preMaxState = null;

  // ============================================================
  // PANEL CLOCK
  // ============================================================
  function updatePanelClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
    document.getElementById('panel-clock').textContent = dateStr + '  ' + timeStr;
  }
  setInterval(updatePanelClock, 1000);
  updatePanelClock();

  // ============================================================
  // WINDOW DRAGGING
  // ============================================================
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  titleBar.addEventListener('mousedown', function(e) {
    if (e.target.closest('.title-buttons')) return;
    if (terminalWindow.classList.contains('maximized')) return;
    isDragging = true;
    dragOffsetX = e.clientX - terminalWindow.offsetLeft;
    dragOffsetY = e.clientY - terminalWindow.offsetTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      const rect = desktopArea.getBoundingClientRect();
      let x = e.clientX - dragOffsetX;
      let y = e.clientY - dragOffsetY;
      // Constrain within desktop area
      x = Math.max(rect.left - terminalWindow.offsetWidth + 100, Math.min(x, rect.right - 100));
      y = Math.max(0, Math.min(y, rect.bottom - rect.top - 40));
      terminalWindow.style.left = x + 'px';
      terminalWindow.style.top = y + 'px';
      e.preventDefault();
    }
    if (isResizing) {
      handleResize(e);
      e.preventDefault();
    }
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
    isResizing = false;
  });

  // ============================================================
  // WINDOW RESIZING
  // ============================================================
  let isResizing = false;
  let resizeStartX, resizeStartY, resizeStartW, resizeStartH;

  resizeHandle.addEventListener('mousedown', function(e) {
    if (terminalWindow.classList.contains('maximized')) return;
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = terminalWindow.offsetWidth;
    resizeStartH = terminalWindow.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });

  function handleResize(e) {
    const newW = Math.max(400, resizeStartW + (e.clientX - resizeStartX));
    const newH = Math.max(250, resizeStartH + (e.clientY - resizeStartY));
    terminalWindow.style.width = newW + 'px';
    terminalWindow.style.height = newH + 'px';
  }

  // ============================================================
  // WINDOW BUTTONS: MINIMIZE, MAXIMIZE, CLOSE
  // ============================================================
  document.querySelector('.btn-min').addEventListener('click', function(e) {
    e.stopPropagation();
    terminalWindow.classList.add('minimized');
  });

  document.querySelector('.btn-max').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMaximize();
  });

  document.querySelector('.btn-close').addEventListener('click', function(e) {
    e.stopPropagation();
    terminalWindow.classList.add('minimized');
    dockTerminalIcon.classList.remove('active');
  });

  // Double-click title bar to toggle maximize
  titleBar.addEventListener('dblclick', function(e) {
    if (e.target.closest('.title-buttons')) return;
    toggleMaximize();
  });

  function toggleMaximize() {
    if (terminalWindow.classList.contains('maximized')) {
      terminalWindow.classList.remove('maximized');
      if (preMaxState) {
        terminalWindow.style.top = preMaxState.top;
        terminalWindow.style.left = preMaxState.left;
        terminalWindow.style.width = preMaxState.width;
        terminalWindow.style.height = preMaxState.height;
        preMaxState = null;
      }
    } else {
      preMaxState = {
        top: terminalWindow.style.top || terminalWindow.offsetTop + 'px',
        left: terminalWindow.style.left || terminalWindow.offsetLeft + 'px',
        width: terminalWindow.style.width || terminalWindow.offsetWidth + 'px',
        height: terminalWindow.style.height || terminalWindow.offsetHeight + 'px',
      };
      terminalWindow.classList.add('maximized');
    }
  }

  // ============================================================
  // DOCK INTERACTIONS
  // ============================================================
  dockTerminalIcon.addEventListener('click', function() {
    if (terminalWindow.classList.contains('minimized')) {
      terminalWindow.classList.remove('minimized');
      dockTerminalIcon.classList.add('active');
      bringWindowToFront('terminal-window');
      terminalInput.focus();
    } else {
      terminalWindow.classList.add('minimized');
    }
  });

  // Bring terminal to front on click
  terminalWindow.addEventListener('mousedown', function() {
    bringWindowToFront('terminal-window');
  });

  // Trash icon — no real app, just a brief visual feedback
  document.querySelectorAll('.dock-icon[data-app="trash"]').forEach(function(icon) {
    icon.addEventListener('click', function() {
      icon.style.opacity = '0.5';
      setTimeout(function() { icon.style.opacity = ''; }, 300);
    });
  });

  // ============================================================
  // RIGHT-CLICK CONTEXT MENU
  // ============================================================
  desktopArea.addEventListener('contextmenu', function(e) {
    // Only show on desktop background, not on the window
    if (e.target === desktopArea) {
      e.preventDefault();
      var rect = desktopArea.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      // Keep menu within bounds
      if (x + 220 > rect.width) x = rect.width - 225;
      if (y + 120 > rect.height) y = rect.height - 125;
      contextMenu.style.left = x + 'px';
      contextMenu.style.top = y + 'px';
      contextMenu.classList.remove('hidden');
    }
  });

  document.addEventListener('click', function() {
    contextMenu.classList.add('hidden');
  });

  contextMenu.addEventListener('click', function(e) {
    var action = e.target.getAttribute('data-action');
    if (action === 'new-terminal') {
      terminalWindow.classList.remove('minimized');
      dockTerminalIcon.classList.add('active');
      terminalInput.focus();
    }
    if (action === 'change-wallpaper') {
      cycleWallpaper();
    }
    if (action === 'display-settings') {
      terminalWindow.classList.remove('minimized');
      dockTerminalIcon.classList.add('active');
      terminalInput.focus();
    }
    contextMenu.classList.add('hidden');
  });

  // ============================================================
  // WALLPAPER CYCLING
  // ============================================================
  var wallpapers = [
    // Default Ubuntu
    'radial-gradient(ellipse at 20% 50%, #e95420 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #772953 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #2c001e 0%, transparent 60%), linear-gradient(160deg, #e95420 0%, #772953 40%, #2c001e 100%)',
    // Midnight blue
    'radial-gradient(ellipse at 30% 40%, #1a3a5c 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #0a1628 0%, transparent 60%), linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #0a1628 100%)',
    // Forest green
    'radial-gradient(ellipse at 40% 30%, #2d5016 0%, transparent 50%), radial-gradient(ellipse at 60% 70%, #1a3a0a 0%, transparent 60%), linear-gradient(150deg, #1a2f0a 0%, #2d5016 50%, #0a1f05 100%)',
    // Sunset warm
    'radial-gradient(ellipse at 20% 80%, #e95420 0%, transparent 40%), radial-gradient(ellipse at 80% 30%, #ffb347 0%, transparent 40%), linear-gradient(135deg, #2c001e 0%, #8b2252 30%, #e95420 60%, #ffb347 100%)',
    // Dark minimal
    'radial-gradient(ellipse at 50% 50%, #1e1e1e 0%, #0a0a0a 100%)',
  ];
  var currentWallpaper = 0;

  function cycleWallpaper() {
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
    desktopArea.style.background = wallpapers[currentWallpaper];
  }

  // ============================================================
  // CENTER WINDOW ON LOAD
  // ============================================================
  function centerWindow() {
    var rect = desktopArea.getBoundingClientRect();
    var winW = terminalWindow.offsetWidth;
    var winH = terminalWindow.offsetHeight;
    var x = Math.max(0, (rect.width - winW) / 2);
    var y = Math.max(0, (rect.height - winH) / 2);
    terminalWindow.style.left = x + 'px';
    terminalWindow.style.top = y + 'px';
  }

  // Wait a tick for layout to settle, then center
  requestAnimationFrame(function() {
    requestAnimationFrame(centerWindow);
  });

})();
