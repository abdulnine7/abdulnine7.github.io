// ============================================================
// WINDOW UTILITIES - Random positioning & shared helpers
// ============================================================
(function() {

var desktopArea = document.getElementById('desktop-area');
var placedPositions = [];

// Position a window randomly within the desktop area,
// trying to avoid overlapping with previously placed windows.
window.randomPositionWindow = function(win) {
  var rect = desktopArea.getBoundingClientRect();

  // If the window is hidden (minimized), temporarily show it to measure
  var wasHidden = win.classList.contains('minimized');
  if (wasHidden) {
    win.style.visibility = 'hidden';
    win.classList.remove('minimized');
  }

  var w = win.offsetWidth || 400;
  var h = win.offsetHeight || 300;

  // Restore hidden state after measuring
  if (wasHidden) {
    win.classList.add('minimized');
    win.style.visibility = '';
  }

  // Ensure the window fits fully within the desktop area
  var padLeft = 10;
  var padTop = 10;
  var padRight = 20;
  var padBottom = 40;

  var maxX = Math.max(padLeft, rect.width - w - padRight);
  var maxY = Math.max(padTop, rect.height - h - padBottom);

  var best = null;
  var bestDist = -1;

  for (var attempt = 0; attempt < 20; attempt++) {
    var x = padLeft + Math.random() * (maxX - padLeft);
    var y = padTop + Math.random() * (maxY - padTop);
    var dist = minDistFromPlaced(x, y);
    if (dist > bestDist) {
      bestDist = dist;
      best = { x: x, y: y };
    }
    if (dist > 150) break;
  }

  // Clamp to ensure title bar is always accessible
  best.x = Math.max(padLeft, Math.min(best.x, maxX));
  best.y = Math.max(padTop, Math.min(best.y, maxY));

  win.style.left = Math.round(best.x) + 'px';
  win.style.top = Math.round(best.y) + 'px';
  placedPositions.push(best);
};

function minDistFromPlaced(x, y) {
  if (placedPositions.length === 0) return Infinity;
  var min = Infinity;
  for (var i = 0; i < placedPositions.length; i++) {
    var dx = x - placedPositions[i].x;
    var dy = y - placedPositions[i].y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < min) min = d;
  }
  return min;
}

})();
