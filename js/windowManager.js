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
  const isMobileLayout = () => window.matchMedia('(max-width: 900px)').matches;

  const bringToFront = (win) => {
    zIndex = zIndex >= MAX_WINDOW_Z ? 100 : zIndex + 1;
    win.style.zIndex = zIndex;
  };

  const showWindow = (win) => {
    const id = win.dataset.windowId;
    const dockItem = document.querySelector(`.dock-item[data-window="${id}"]`);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = !reduceMotion && dockItem;
    win.classList.remove('hidden');
    win.classList.remove('minimized');
    win.classList.remove('minimizing');
    win.style.opacity = '';
    win.style.transform = '';
    win.style.transition = '';
    win.style.display = 'block';
    bringToFront(win);
    if (shouldAnimate) {
      const winRect = win.getBoundingClientRect();
      const dockRect = dockItem.getBoundingClientRect();
      const targetX = dockRect.left + dockRect.width / 2;
      const targetY = dockRect.top + dockRect.height / 2;
      const startX = winRect.left + winRect.width / 2;
      const startY = winRect.top + winRect.height / 2;
      const dx = targetX - startX;
      const dy = targetY - startY;
      win.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
      win.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
      win.style.opacity = '0.1';
      requestAnimationFrame(() => {
        win.style.transform = '';
        win.style.opacity = '';
      });
    }
  };

  const hideWindow = (win) => {
    win.classList.add('hidden');
    win.style.display = 'none';
  };

  const animateMinimize = (win) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = win.dataset.windowId;
    const dockItem = document.querySelector(`.dock-item[data-window="${id}"]`);
    if (reduceMotion || !dockItem) {
      hideWindow(win);
      setDockActive(id, false);
      return;
    }

    const winRect = win.getBoundingClientRect();
    const dockRect = dockItem.getBoundingClientRect();
    const targetX = dockRect.left + dockRect.width / 2;
    const targetY = dockRect.top + dockRect.height / 2;
    const startX = winRect.left + winRect.width / 2;
    const startY = winRect.top + winRect.height / 2;
    const dx = targetX - startX;
    const dy = targetY - startY;

    win.classList.add('minimizing');
    win.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
    win.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
    win.style.opacity = '0.1';

    const onDone = () => {
      win.removeEventListener('transitionend', onDone);
      win.style.transition = '';
      win.style.transform = '';
      win.style.opacity = '';
      win.classList.remove('minimizing');
      hideWindow(win);
      setDockActive(id, false);
    };

    win.addEventListener('transitionend', onDone);
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
    if (isMobileLayout()) return;
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
    if (isMobileLayout()) return;
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
    if (win.classList.contains('hidden') || win.style.display === 'none') {
      showWindow(win);
      setDockActive(id, true);
    } else {
      animateMinimize(win);
    }
  };

  const onControlClick = (evt) => {
    const btn = evt.target.closest('.win-btn');
    if (!btn) return;
    const win = btn.closest('.window');
    if (!win) return;
    const id = win.dataset.windowId;
    if (btn.classList.contains('minimize')) {
      animateMinimize(win);
    } else if (btn.classList.contains('maximize')) {
      toggleMaximize(win);
      setDockActive(id, true);
    } else if (btn.classList.contains('close')) {
      if (id === 'terminal' && typeof window.resetTerminal === 'function') {
        window.resetTerminal();
      }
      if (id === 'gui' && typeof window.showSection === 'function') {
        window.showSection('about');
      }
      hideWindow(win);
      setDockActive(id, false);
    }
  };

  const onOpenWindowClick = (evt) => {
    const trigger = evt.target.closest('[data-open-window]');
    if (!trigger) return;
    const id = trigger.getAttribute('data-open-window');
    if (!id) return;
    const win = document.querySelector(`.window[data-window-id="${id}"]`);
    if (!win) return;
    showWindow(win);
    setDockActive(id, true);
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

    if (isMobileLayout()) {
      const terminalWin = document.querySelector('.window[data-window-id="terminal"]');
      if (terminalWin) {
        hideWindow(terminalWin);
        setDockActive('terminal', false);
      }
      const alertWin = document.querySelector('.window[data-window-id="alert"]');
      if (alertWin) {
        showWindow(alertWin);
        bringToFront(alertWin);
      }
    }

    const notepad = document.getElementById('notepad-editor');
    if (notepad) {
      const status = document.getElementById('notepad-status');
      const wordCount = document.getElementById('notepad-wordcount');
      const lineNumbers = document.getElementById('notepad-lines');
      const storageKey = 'notepad.content';
      const updateStatus = (text) => {
        if (status) status.textContent = text;
      };
      const updateWordCount = () => {
        if (!wordCount) return;
        const text = notepad.value.trim();
        const count = text ? text.split(/\s+/).length : 0;
        wordCount.textContent = `${count} word${count === 1 ? '' : 's'}`;
      };

      const updateLineNumbers = () => {
        if (!lineNumbers) return;
        const lines = notepad.value.split('\n').length || 1;
        lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
      };

      const save = () => {
        localStorage.setItem(storageKey, notepad.value);
        updateStatus('Saved');
      };
      const debouncedSave = (() => {
        let timer;
        return () => {
          updateStatus('Saving...');
          clearTimeout(timer);
          timer = setTimeout(save, 500);
        };
      })();

      notepad.value = localStorage.getItem(storageKey) || '';
      updateStatus('Saved');
      updateWordCount();
      updateLineNumbers();

      notepad.addEventListener('input', debouncedSave);
      notepad.addEventListener('input', updateWordCount);
      notepad.addEventListener('input', updateLineNumbers);
      notepad.addEventListener('scroll', () => {
        if (lineNumbers) lineNumbers.scrollTop = notepad.scrollTop;
      });
      document.addEventListener('click', (evt) => {
        const btn = evt.target.closest('.notepad-btn');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'clear') {
          notepad.value = '';
          save();
        } else if (action === 'download') {
          const blob = new Blob([notepad.value], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'notes.txt';
          link.click();
          URL.revokeObjectURL(url);
        }
      });
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
  document.addEventListener('click', onOpenWindowClick);
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
