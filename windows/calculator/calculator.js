// ============================================================
// CALCULATOR (GNOME-style)
// ============================================================
(function() {

var calcWindow   = document.getElementById('calculator-window');
var calcHeader   = document.getElementById('calculator-header');
var calcResize   = document.getElementById('calculator-resize-handle');
var expressionEl = document.getElementById('calc-expression');
var resultEl     = document.getElementById('calc-result');
var buttonsEl    = document.getElementById('calc-buttons');
var desktopArea  = document.getElementById('desktop-area');
var dockIcon     = document.querySelector('.dock-icon[data-app="calculator"]');

// ============================================================
// STATE
// ============================================================
var currentInput = '0';
var expression   = '';
var result       = null;
var shouldReset  = false;
var lastOperator = '';
var accumulator  = null;

// ============================================================
// DISPLAY
// ============================================================
function updateDisplay() {
  expressionEl.textContent = expression;
  resultEl.textContent = currentInput;
}

function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Error';
  if (!isFinite(num)) return 'Error';
  var str = String(num);
  // Limit decimal places to avoid floating point noise
  if (str.indexOf('.') !== -1 && str.length > 14) {
    str = String(parseFloat(num.toPrecision(12)));
  }
  return str;
}

// ============================================================
// BUILD BUTTONS
// ============================================================
var buttonLayout = [
  { label: 'C',  type: 'clear'    },
  { label: '±', type: 'negate'   },
  { label: '%',  type: 'percent'  },
  { label: '÷',  type: 'operator', op: '÷' },
  { label: '7',  type: 'digit'   },
  { label: '8',  type: 'digit'   },
  { label: '9',  type: 'digit'   },
  { label: '×',  type: 'operator', op: '×' },
  { label: '4',  type: 'digit'   },
  { label: '5',  type: 'digit'   },
  { label: '6',  type: 'digit'   },
  { label: '−',  type: 'operator', op: '−' },
  { label: '1',  type: 'digit'   },
  { label: '2',  type: 'digit'   },
  { label: '3',  type: 'digit'   },
  { label: '+',  type: 'operator', op: '+' },
  { label: '0',  type: 'digit',  cls: 'zero' },
  { label: '.',  type: 'decimal' },
  { label: '=',  type: 'equals'  }
];

buttonLayout.forEach(function(btn) {
  var el = document.createElement('button');
  el.className = 'calc-btn';
  el.textContent = btn.label;
  if (btn.type === 'operator') el.classList.add('operator');
  if (btn.type === 'equals')   el.classList.add('equals');
  if (btn.type === 'clear')    el.classList.add('clear');
  if (btn.cls)                 el.classList.add(btn.cls);

  el.addEventListener('click', function(e) {
    e.stopPropagation();
    handleButton(btn);
  });

  buttonsEl.appendChild(el);
});

// ============================================================
// CALCULATOR LOGIC
// ============================================================
function handleButton(btn) {
  switch (btn.type) {
    case 'digit':
      inputDigit(btn.label);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'operator':
      inputOperator(btn.op);
      break;
    case 'equals':
      evaluate();
      break;
    case 'clear':
      clearAll();
      break;
    case 'negate':
      toggleSign();
      break;
    case 'percent':
      applyPercent();
      break;
  }
  updateDisplay();
}

function inputDigit(digit) {
  if (shouldReset) {
    currentInput = digit;
    shouldReset = false;
  } else {
    currentInput = currentInput === '0' ? digit : currentInput + digit;
  }
}

function inputDecimal() {
  if (shouldReset) {
    currentInput = '0.';
    shouldReset = false;
    return;
  }
  if (currentInput.indexOf('.') === -1) {
    currentInput += '.';
  }
}

function inputOperator(op) {
  var current = parseFloat(currentInput);

  if (accumulator !== null && !shouldReset) {
    // Chain: compute intermediate result
    var intermediate = compute(accumulator, current, lastOperator);
    if (intermediate === null) {
      currentInput = 'Error';
      expression = '';
      accumulator = null;
      lastOperator = '';
      shouldReset = true;
      return;
    }
    accumulator = intermediate;
    currentInput = formatNumber(intermediate);
    expression = currentInput + ' ' + op;
  } else if (shouldReset && lastOperator) {
    // Pressing operator again just changes it
    expression = formatNumber(accumulator) + ' ' + op;
  } else {
    accumulator = current;
    expression = currentInput + ' ' + op;
  }

  lastOperator = op;
  shouldReset = true;
}

function evaluate() {
  if (lastOperator === '' || accumulator === null) return;

  var current = parseFloat(currentInput);
  var res = compute(accumulator, current, lastOperator);

  expression = formatNumber(accumulator) + ' ' + lastOperator + ' ' + currentInput + ' =';

  if (res === null) {
    currentInput = 'Error';
  } else {
    currentInput = formatNumber(res);
  }

  accumulator = null;
  lastOperator = '';
  shouldReset = true;
}

function compute(a, b, operator) {
  switch (operator) {
    case '+':  return a + b;
    case '−':  return a - b;
    case '×':  return a * b;
    case '÷':
      if (b === 0) return null;
      return a / b;
    default:   return b;
  }
}

function clearAll() {
  currentInput = '0';
  expression   = '';
  result       = null;
  shouldReset  = false;
  lastOperator = '';
  accumulator  = null;
}

function toggleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  if (currentInput.charAt(0) === '-') {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = '-' + currentInput;
  }
}

function applyPercent() {
  var val = parseFloat(currentInput);
  if (isNaN(val)) return;
  currentInput = formatNumber(val / 100);
}

// ============================================================
// KEYBOARD INPUT
// ============================================================
document.addEventListener('keydown', function(e) {
  // Only handle when calculator is visible and in front
  if (calcWindow.classList.contains('minimized')) return;
  // Check if calculator is the topmost window
  var allWindows = document.querySelectorAll('.desktop-window:not(.minimized)');
  var maxZ = 0;
  var topWin = null;
  allWindows.forEach(function(w) {
    var z = parseInt(w.style.zIndex) || 0;
    if (z >= maxZ) { maxZ = z; topWin = w; }
  });
  if (topWin !== calcWindow) return;

  var key = e.key;
  var handled = true;

  if (key >= '0' && key <= '9') {
    handleButton({ type: 'digit', label: key });
  } else if (key === '.') {
    handleButton({ type: 'decimal' });
  } else if (key === '+') {
    handleButton({ type: 'operator', op: '+' });
  } else if (key === '-') {
    handleButton({ type: 'operator', op: '−' });
  } else if (key === '*') {
    handleButton({ type: 'operator', op: '×' });
  } else if (key === '/') {
    e.preventDefault();
    handleButton({ type: 'operator', op: '÷' });
  } else if (key === 'Enter' || key === '=') {
    handleButton({ type: 'equals' });
  } else if (key === 'Escape') {
    handleButton({ type: 'clear' });
  } else if (key === 'Backspace') {
    if (currentInput.length > 1 && currentInput !== 'Error') {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = '0';
    }
    updateDisplay();
  } else if (key === '%') {
    handleButton({ type: 'percent' });
  } else {
    handled = false;
  }

  if (handled) {
    e.stopPropagation();
  }
});

// ============================================================
// WINDOW MANAGEMENT (drag, resize, buttons, dock)
// ============================================================
var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

calcHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (calcWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - calcWindow.offsetLeft;
  dragOffsetY = e.clientY - calcWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - calcWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    calcWindow.style.left = x + 'px';
    calcWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(280, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(400, resizeStartH + (e.clientY - resizeStartY));
    calcWindow.style.width = newW + 'px';
    calcWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

calcResize.addEventListener('mousedown', function(e) {
  if (calcWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = calcWindow.offsetWidth;
  resizeStartH = calcWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

document.querySelector('.calc-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  calcWindow.classList.add('minimized');
});

document.querySelector('.calc-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('.calc-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  calcWindow.classList.add('minimized');
  dockIcon.classList.remove('active');
});

calcHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (calcWindow.classList.contains('maximized')) {
    calcWindow.classList.remove('maximized');
    if (preMaxState) {
      calcWindow.style.top = preMaxState.top;
      calcWindow.style.left = preMaxState.left;
      calcWindow.style.width = preMaxState.width;
      calcWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: calcWindow.style.top || calcWindow.offsetTop + 'px',
      left: calcWindow.style.left || calcWindow.offsetLeft + 'px',
      width: calcWindow.style.width || calcWindow.offsetWidth + 'px',
      height: calcWindow.style.height || calcWindow.offsetHeight + 'px'
    };
    calcWindow.classList.add('maximized');
  }
}

// Dock icon
dockIcon.addEventListener('click', function() {
  if (calcWindow.classList.contains('minimized')) {
    calcWindow.classList.remove('minimized');
    dockIcon.classList.add('active');
    bringWindowToFront('calculator-window');
  } else {
    calcWindow.classList.add('minimized');
  }
});

// Bring to front on click
calcWindow.addEventListener('mousedown', function() {
  bringWindowToFront('calculator-window');
});

// Center on load
function centerCalculator() {
  var rect = desktopArea.getBoundingClientRect();
  var w = calcWindow.offsetWidth;
  var h = calcWindow.offsetHeight;
  calcWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  calcWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerCalculator); });

// ============================================================
// INIT
// ============================================================
updateDisplay();

})();
