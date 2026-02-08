(function() {
  const MIN_WIDTH = 320;
  const MIN_HEIGHT = 240;

  let activeWindow = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const onMouseMove = (evt) => {
    if (!activeWindow) return;
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    const newWidth = Math.max(MIN_WIDTH, startWidth + dx);
    const newHeight = Math.max(MIN_HEIGHT, startHeight + dy);
    activeWindow.style.width = `${newWidth}px`;
    activeWindow.style.height = `${newHeight}px`;
  };

  const stopResize = () => {
    if (!activeWindow) return;
    activeWindow.classList.remove('resizing');
    activeWindow = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  const startResize = (evt) => {
    const handle = evt.target.closest('.resize-handle');
    if (!handle) return;
    const windowEl = handle.closest('.terminal-window');
    if (!windowEl || windowEl.classList.contains('fullscreen') || windowEl.classList.contains('minimized')) {
      return;
    }

    evt.preventDefault();
    activeWindow = windowEl;
    activeWindow.classList.add('resizing');
    startX = evt.clientX;
    startY = evt.clientY;
    startWidth = windowEl.offsetWidth;
    startHeight = windowEl.offsetHeight;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  document.addEventListener('mousedown', startResize);
})();
