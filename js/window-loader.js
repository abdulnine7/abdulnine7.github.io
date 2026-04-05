// ============================================================
// WINDOW LOADER - Fetches window HTML fragments and loads JS
// ============================================================
(function() {

// Window definitions: html path and js path
var windows = [
  { html: 'windows/terminal/terminal.html',       js: 'windows/terminal/terminal.js' },
  { html: 'windows/notepad/notepad.html',          js: 'windows/notepad/notepad.js' },
  { html: 'windows/files/files.html',              js: 'windows/files/files.js' },
  { html: 'windows/browser/browser.html',          js: 'windows/browser/browser.js' },
  { html: 'windows/profile/profile.html',          js: 'windows/profile/profile.js' },
  { html: 'windows/calculator/calculator.html',    js: 'windows/calculator/calculator.js' },
  { html: 'windows/calendar/calendar.html',        js: 'windows/calendar/calendar.js' },
  { html: 'windows/weather/weather.html',          js: 'windows/weather/weather.js' },
  { html: 'windows/monitor/monitor.html',          js: 'windows/monitor/monitor.js' },
  { html: 'windows/music/music.html',              js: 'windows/music/music.js' },
  { html: 'windows/snake/snake.html',              js: 'windows/snake/snake.js' },
  { html: 'windows/imageviewer/imageviewer.html',  js: 'windows/imageviewer/imageviewer.js' },
  { html: 'windows/pdfviewer/pdfviewer.html',      js: 'windows/pdfviewer/pdfviewer.js' },
  { html: 'windows/photobooth/photobooth.html',    js: 'windows/photobooth/photobooth.js' }
];

// Additional scripts to load after all window JS
var postScripts = [
  'js/activities.js'
];

var desktopArea = document.getElementById('desktop-area');

// Fetch all HTML fragments in parallel
Promise.all(
  windows.map(function(w) {
    return fetch(w.html).then(function(r) { return r.text(); });
  })
).then(function(htmlFragments) {
  // Inject all HTML into desktop area (after context menu which is already there)
  htmlFragments.forEach(function(html) {
    desktopArea.insertAdjacentHTML('beforeend', html);
  });

  // Load JS scripts sequentially to preserve dependency order
  var allScripts = [
    'js/window-utils.js',
    'js/desktop.js'
  ].concat(
    windows.map(function(w) { return w.js; })
  ).concat(postScripts);

  return loadScriptsSequentially(allScripts);
}).then(function() {
  // All loaded
}).catch(function(err) {
  console.error('Window loader error:', err);
});

function loadScriptsSequentially(urls) {
  return urls.reduce(function(chain, url) {
    return chain.then(function() {
      return loadScript(url);
    });
  }, Promise.resolve());
}

function loadScript(url) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = function() { reject(new Error('Failed to load: ' + url)); };
    document.body.appendChild(script);
  });
}

})();
