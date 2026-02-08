(function() {
  const MIN_WIDTH = 320;
  const MIN_HEIGHT = 240;
  let activeWindow = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let startWidth = 0;
  let startHeight = 0;
  let zIndex = 100;
  const MAX_WINDOW_Z = 9000;

  const bringToFront = (win) => {
    zIndex = zIndex >= MAX_WINDOW_Z ? 100 : zIndex + 1;
    win.style.zIndex = zIndex;
  };

  const showWindow = (win) => {
    win.classList.remove('hidden');
    win.classList.remove('minimized');
    win.style.display = 'block';
    bringToFront(win);
  };

  const hideWindow = (win) => {
    win.classList.add('hidden');
    win.style.display = 'none';
  };

  const setDockActive = (id, active) => {
    const item = document.querySelector(`.dock-item[data-window="${id}"]`);
    if (item) item.classList.toggle('active', active);
  };

  const toggleMaximize = (win) => {
    win.classList.toggle('fullscreen');
    bringToFront(win);
  };

  const onMouseMove = (evt) => {
    if (!activeWindow) return;
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    if (activeWindow.dataset.dragging === 'true') {
      // Keep the window within the viewport while dragging.
      const maxX = window.innerWidth - activeWindow.offsetWidth;
      const maxY = window.innerHeight - activeWindow.offsetHeight;
      const nextLeft = Math.max(0, Math.min(maxX, startLeft + dx));
      const nextTop = Math.max(0, Math.min(maxY, startTop + dy));
      activeWindow.style.left = `${nextLeft}px`;
      activeWindow.style.top = `${nextTop}px`;
      return;
    }
    if (activeWindow.dataset.resizing === 'true') {
      const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - startLeft);
      const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - startTop);
      const newWidth = Math.min(maxWidth, Math.max(MIN_WIDTH, startWidth + dx));
      const newHeight = Math.min(maxHeight, Math.max(MIN_HEIGHT, startHeight + dy));
      activeWindow.style.width = `${newWidth}px`;
      activeWindow.style.height = `${newHeight}px`;
    }
  };

  const stopDragResize = () => {
    if (!activeWindow) return;
    delete activeWindow.dataset.dragging;
    delete activeWindow.dataset.resizing;
    activeWindow = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopDragResize);
  };

  const startDrag = (evt) => {
    const header = evt.target.closest('.window-header');
    if (!header) return;
    const win = header.closest('.window');
    if (!win || win.classList.contains('fullscreen')) return;
    evt.preventDefault();
    activeWindow = win;
    bringToFront(win);
    win.dataset.dragging = 'true';
    startX = evt.clientX;
    startY = evt.clientY;
    startLeft = win.offsetLeft;
    startTop = win.offsetTop;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopDragResize);
  };

  const startResize = (evt) => {
    const handle = evt.target.closest('.resize-handle');
    if (!handle) return;
    const win = handle.closest('.window');
    if (!win || win.classList.contains('fullscreen') || win.classList.contains('minimized')) return;
    evt.preventDefault();
    activeWindow = win;
    bringToFront(win);
    win.dataset.resizing = 'true';
    startX = evt.clientX;
    startY = evt.clientY;
    startWidth = win.offsetWidth;
    startHeight = win.offsetHeight;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopDragResize);
  };

  const onDockClick = (evt) => {
    const item = evt.target.closest('.dock-item');
    if (!item) return;
    const id = item.dataset.window;
    const win = document.querySelector(`.window[data-window-id="${id}"]`);
    if (!win) return;
    showWindow(win);
    setDockActive(id, true);
  };

  const onControlClick = (evt) => {
    const btn = evt.target.closest('.win-btn');
    if (!btn) return;
    const win = btn.closest('.window');
    if (!win) return;
    const id = win.dataset.windowId;
    if (btn.classList.contains('minimize')) {
      hideWindow(win);
      setDockActive(id, false);
    } else if (btn.classList.contains('maximize')) {
      toggleMaximize(win);
      setDockActive(id, true);
    } else if (btn.classList.contains('close')) {
      hideWindow(win);
      setDockActive(id, false);
    }
  };

  const onWindowFocus = (evt) => {
    const win = evt.target.closest('.window');
    if (win) bringToFront(win);
  };

  const loadWindowContent = async () => {
    const windows = document.querySelectorAll('.window[data-window-src]');
    for (const win of windows) {
      const src = win.getAttribute('data-window-src');
      if (!src) continue;
      try {
        // Load window HTML fragments and run the correct init hook.
        win.innerHTML = '<div style="padding:12px;color:#fff;">Loading…</div>';
        const res = await fetch(src, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load ${src} (${res.status})`);
        }
        const html = await res.text();
        win.innerHTML = html;
        const id = win.getAttribute('data-window-id');
        if (id === 'gui' && typeof window.initGUI === 'function') {
          window.initGUI();
        }
      } catch (err) {
        console.error(err);
        win.innerHTML = `<div style="padding:16px;color:#fff;">Failed to load window: ${src}</div>`;
      }
    }

    if (typeof window.initCLI === 'function') {
      window.initCLI();
    }
    if (window.profileReady && typeof window.renderAboutDesktop === 'function') {
      window.profileReady.then((data) => window.renderAboutDesktop(data));
    }
  };

  const initDockHover = () => {
    const dock = document.querySelector('.dock');
    if (!dock) return;
    const items = Array.from(dock.querySelectorAll('.dock-item'));
    const maxScale = 1.2;
    const minScale = 0.9;
    const radius = 120;
    const clearStates = () => {
      items.forEach((item) => {
        item.style.setProperty('--dock-scale', 1);
      });
    };

    dock.addEventListener('mousemove', (evt) => {
      const dockRect = dock.getBoundingClientRect();
      const y = evt.clientY - dockRect.top;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top - dockRect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - y);
        const influence = Math.max(0, 1 - distance / radius);
        const scale = minScale + (maxScale - minScale) * influence;
        item.style.setProperty('--dock-scale', scale.toFixed(3));
      });
    });

    dock.addEventListener('mouseleave', clearStates);
  };

  document.addEventListener('mousedown', startDrag);
  document.addEventListener('mousedown', startResize);
  document.addEventListener('mousedown', onWindowFocus);
  document.addEventListener('click', onControlClick);
  document.addEventListener('click', onDockClick);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadWindowContent();
      initDockHover();
    });
  } else {
    loadWindowContent();
    initDockHover();
  }

  window.showWindowById = function(id) {
    const win = document.querySelector(`.window[data-window-id="${id}"]`);
    if (win) {
      showWindow(win);
      setDockActive(id, true);
    }
  };
})();
