// ============================================================
// SNAKE GAME
// Canvas-based classic snake with score tracking
// ============================================================
(function() {

var snakeWindow   = document.getElementById('snake-window');
var snakeHeader   = document.getElementById('snake-header');
var snakeResize   = document.getElementById('snake-resize-handle');
var canvas        = document.getElementById('snake-canvas');
var ctx           = canvas.getContext('2d');
var scoreEl       = document.getElementById('snake-score');
var highScoreEl   = document.getElementById('snake-highscore');
var gameoverEl    = document.getElementById('snake-gameover');
var gameoverScore = document.getElementById('snake-gameover-score');
var restartBtn    = document.getElementById('snake-restart-btn');
var startOverlay  = document.getElementById('snake-start');
var desktopArea   = document.getElementById('desktop-area');
var dockIcon      = document.querySelector('.dock-icon[data-app="games"]');

// ============================================================
// CONSTANTS
// ============================================================
var GRID_SIZE = 20;
var CELL_SIZE = 18;
var CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 360

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// ============================================================
// STATE
// ============================================================
var snake, direction, nextDirection, food, score, highScore, gameState, loopInterval;

highScore = 0;
// gameState: 'start', 'playing', 'gameover'

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = 'right';
  nextDirection = 'right';
  score = 0;
  updateScoreDisplay();
  placeFood();
}

function placeFood() {
  var occupied;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    occupied = false;
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === food.x && snake[i].y === food.y) {
        occupied = true;
        break;
      }
    }
  } while (occupied);
}

function updateScoreDisplay() {
  scoreEl.textContent = score;
  highScoreEl.textContent = highScore;
}

// ============================================================
// GAME LOOP
// ============================================================
function getSpeed() {
  // Start at 150ms, decrease as score grows, minimum 70ms
  return Math.max(70, 150 - Math.floor(score / 50) * 10);
}

function startLoop() {
  stopLoop();
  loopInterval = setInterval(tick, getSpeed());
}

function stopLoop() {
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
}

function tick() {
  direction = nextDirection;

  // Calculate new head
  var head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'up')    head.y--;
  if (direction === 'down')  head.y++;
  if (direction === 'left')  head.x--;
  if (direction === 'right') head.x++;

  // Wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    endGame();
    return;
  }

  // Self collision
  for (var i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score > highScore) highScore = score;
    updateScoreDisplay();
    placeFood();
    // Restart loop at new speed
    startLoop();
  } else {
    snake.pop();
  }

  draw();
}

// ============================================================
// RENDERING
// ============================================================
function draw() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw grid lines (subtle)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;
  for (var i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
    ctx.stroke();
  }

  // Draw snake
  for (var j = 0; j < snake.length; j++) {
    var seg = snake[j];
    if (j === 0) {
      ctx.fillStyle = '#33ff55'; // head brighter
    } else {
      ctx.fillStyle = '#00ff41';
    }
    ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }

  // Draw food
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#e95420';
  ctx.beginPath();
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// ============================================================
// GAME STATES
// ============================================================
function startGame() {
  gameState = 'playing';
  startOverlay.classList.remove('active');
  gameoverEl.classList.remove('active');
  initGame();
  draw();
  startLoop();
}

function endGame() {
  gameState = 'gameover';
  stopLoop();
  gameoverScore.textContent = 'Score: ' + score + (score >= highScore ? '  (New High!)' : '');
  gameoverEl.classList.add('active');
}

function showStart() {
  gameState = 'start';
  stopLoop();
  initGame();
  draw();
  startOverlay.classList.add('active');
  gameoverEl.classList.remove('active');
}

// ============================================================
// INPUT
// ============================================================
var directionMap = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right'
};

var opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };

document.addEventListener('keydown', function(e) {
  // Only respond when snake window is visible and in front
  if (snakeWindow.classList.contains('minimized')) return;
  if (parseInt(snakeWindow.style.zIndex) !== 30) return;

  // Space to start/restart
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'start' || gameState === 'gameover') {
      startGame();
    }
    return;
  }

  // Direction keys
  var newDir = directionMap[e.key];
  if (newDir) {
    // Prevent arrow keys from scrolling the page
    if (e.key.indexOf('Arrow') === 0) {
      e.preventDefault();
    }
    if (gameState === 'playing' && newDir !== opposites[direction]) {
      nextDirection = newDir;
    }
  }
});

function getMaxZ() {
  var maxZ = 0;
  document.querySelectorAll('.desktop-window').forEach(function(w) {
    var z = parseInt(w.style.zIndex) || 0;
    if (z > maxZ) maxZ = z;
  });
  return maxZ;
}

restartBtn.addEventListener('click', function() {
  startGame();
});

startOverlay.addEventListener('click', function() {
  startGame();
});

// ============================================================
// PAUSE ON MINIMIZE / UNFOCUS
// ============================================================
var wasPausedByMinimize = false;

// Watch for minimize class changes
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(m) {
    if (m.attributeName === 'class') {
      if (snakeWindow.classList.contains('minimized')) {
        if (gameState === 'playing') {
          stopLoop();
          wasPausedByMinimize = true;
        }
      } else {
        if (wasPausedByMinimize && gameState === 'playing') {
          startLoop();
          wasPausedByMinimize = false;
        }
      }
    }
  });
});
observer.observe(snakeWindow, { attributes: true });

// Pause on window/tab blur
window.addEventListener('blur', function() {
  if (gameState === 'playing') {
    stopLoop();
    wasPausedByMinimize = true;
  }
});
window.addEventListener('focus', function() {
  if (wasPausedByMinimize && gameState === 'playing') {
    startLoop();
    wasPausedByMinimize = false;
  }
});

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

snakeHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (snakeWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - snakeWindow.offsetLeft;
  dragOffsetY = e.clientY - snakeWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - snakeWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    snakeWindow.style.left = x + 'px';
    snakeWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(360, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(460, resizeStartH + (e.clientY - resizeStartY));
    snakeWindow.style.width = newW + 'px';
    snakeWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

snakeResize.addEventListener('mousedown', function(e) {
  if (snakeWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = snakeWindow.offsetWidth;
  resizeStartH = snakeWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

document.querySelector('#snake-window .snake-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  snakeWindow.classList.add('minimized');
  if (gameState === 'playing') {
    stopLoop();
    wasPausedByMinimize = true;
  }
});

document.querySelector('#snake-window .snake-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('#snake-window .snake-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  snakeWindow.classList.add('minimized');
  dockIcon.classList.remove('active');
  stopLoop();
  gameState = 'start';
});

snakeHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (snakeWindow.classList.contains('maximized')) {
    snakeWindow.classList.remove('maximized');
    if (preMaxState) {
      snakeWindow.style.top = preMaxState.top;
      snakeWindow.style.left = preMaxState.left;
      snakeWindow.style.width = preMaxState.width;
      snakeWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: snakeWindow.style.top || snakeWindow.offsetTop + 'px',
      left: snakeWindow.style.left || snakeWindow.offsetLeft + 'px',
      width: snakeWindow.style.width || snakeWindow.offsetWidth + 'px',
      height: snakeWindow.style.height || snakeWindow.offsetHeight + 'px'
    };
    snakeWindow.classList.add('maximized');
  }
}

// Dock icon
dockIcon.addEventListener('click', function() {
  if (snakeWindow.classList.contains('minimized')) {
    snakeWindow.classList.remove('minimized');
    dockIcon.classList.add('active');
    bringWindowToFront('snake-window');
    if (wasPausedByMinimize && gameState === 'playing') {
      startLoop();
      wasPausedByMinimize = false;
    }
  } else {
    snakeWindow.classList.add('minimized');
    if (gameState === 'playing') {
      stopLoop();
      wasPausedByMinimize = true;
    }
  }
});

// Bring to front on click
snakeWindow.addEventListener('mousedown', function() {
  bringWindowToFront('snake-window');
});

// ============================================================
// CENTER ON LOAD
// ============================================================
function positionSnake() { randomPositionWindow(snakeWindow); }
requestAnimationFrame(function() { requestAnimationFrame(positionSnake); });

// ============================================================
// INIT
// ============================================================
showStart();

})();
