// ============================================================
// PROFILE WINDOW – Rendering & Window Management
// Uses global PROFILE from data/profile.js
// ============================================================
(function() {

// HELPER: escape HTML
function h(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// SECTION RENDERERS
// ============================================================

function renderAbout() {
  var initials = PROFILE.about.name.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2);
  var html = '';
  html += '<div class="profile-profile">';
  html += '  <div class="profile-avatar">' + h(initials) + '</div>';
  html += '  <div class="profile-profile-info">';
  html += '    <h2>' + h(PROFILE.about.name) + '</h2>';
  html += '    <p>' + h(PROFILE.about.headline) + '</p>';
  html += '    <p style="color:#e95420;margin-top:2px">' + h(PROFILE.site.domain) + '</p>';
  html += '  </div>';
  html += '</div>';
  html += '<div class="profile-card"><div class="profile-bio">';
  PROFILE.about.bio.forEach(function(p) {
    html += '<p>' + h(p) + '</p>';
  });
  html += '</div></div>';
  // Quick stats (driven by PROFILE.quickStats)
  html += '<div class="profile-card">';
  PROFILE.quickStats.forEach(function(stat) {
    html += '<div class="profile-row"><span class="profile-row-label">' + h(stat.label) + '</span><span class="profile-row-value">' + h(stat.value) + '</span></div>';
  });
  html += '</div>';
  if (PROFILE.resume.pdf) {
    html += '<div class="profile-card" style="text-align:center;padding:14px">';
    html += '<a href="' + h(PROFILE.resume.pdf) + '" target="_blank" style="color:#e95420;text-decoration:none;font-size:14px;font-weight:500">';
    html += '\u2913 Download Resume (PDF)</a></div>';
  }
  return html;
}

function renderExperience() {
  var html = '<div class="profile-section-title">Experience</div>';
  html += '<div class="profile-section-subtitle">' + PROFILE.experience.length + ' positions</div>';
  PROFILE.experience.forEach(function(job) {
    var initial = job.company[0];
    html += '<div class="profile-card">';
    html += '<div class="profile-exp-header">';
    html += '  <div class="profile-exp-logo">' + h(initial) + '</div>';
    html += '  <div class="profile-exp-title">';
    html += '    <h3>' + h(job.role) + '</h3>';
    html += '    <div class="profile-exp-sub">' + h(job.company) + ' &bull; ' + h(job.location) + '</div>';
    html += '  </div>';
    html += '  <div class="profile-exp-period">' + h(job.period) + '</div>';
    html += '</div>';
    html += '<ul class="profile-exp-bullets">';
    job.bullets.forEach(function(b) {
      html += '<li>' + h(b) + '</li>';
    });
    html += '</ul></div>';
  });
  return html;
}

function renderEducation() {
  var html = '<div class="profile-section-title">Education</div>';
  html += '<div class="profile-section-subtitle">Academic background</div>';
  PROFILE.education.forEach(function(edu) {
    html += '<div class="profile-card">';
    html += '<div class="profile-exp-header">';
    html += '  <div class="profile-exp-logo" style="font-size:14px">\ud83c\udf93</div>';
    html += '  <div class="profile-exp-title">';
    html += '    <h3>' + h(edu.degree) + '</h3>';
    html += '    <div class="profile-exp-sub">' + h(edu.school) + '</div>';
    html += '  </div>';
    html += '  <div class="profile-exp-period">' + h(edu.period) + '</div>';
    html += '</div>';
    html += '<div style="padding-left:54px;font-size:13px;color:#aaa">' + h(edu.grade) + '</div>';
    html += '</div>';
  });
  return html;
}

function renderSkills() {
  var html = '<div class="profile-section-title">Skills</div>';
  html += '<div class="profile-section-subtitle">';
  PROFILE.skills.summary.forEach(function(s) { html += h(s) + ' '; });
  html += '</div>';
  html += '<div class="profile-card">';
  html += '<div class="profile-row-label" style="margin-bottom:10px;width:auto">Proficient</div>';
  html += '<div class="profile-tags">';
  PROFILE.skills.proficient.forEach(function(s) {
    html += '<span class="profile-tag proficient">' + h(s) + '</span>';
  });
  html += '</div></div>';
  html += '<div class="profile-card">';
  html += '<div class="profile-row-label" style="margin-bottom:10px;width:auto">Familiar</div>';
  html += '<div class="profile-tags">';
  PROFILE.skills.familiar.forEach(function(s) {
    html += '<span class="profile-tag">' + h(s) + '</span>';
  });
  html += '</div></div>';
  return html;
}

function renderProjects() {
  var html = '<div class="profile-section-title">Projects</div>';
  html += '<div class="profile-section-subtitle">Personal &amp; side projects</div>';
  PROFILE.projects.forEach(function(proj) {
    html += '<div class="profile-card">';
    html += '<div class="profile-project-title"><h3>' + h(proj.name) + '</h3>';
    if (proj.url) {
      html += ' <a href="' + h(proj.url) + '" target="_blank">\u2197 Visit</a>';
    }
    html += '</div>';
    html += '<div class="profile-project-desc">' + h(proj.description) + '</div>';
    html += '<div class="profile-project-tech">Tech: ' + h(proj.tech) + '</div>';
    html += '</div>';
  });
  return html;
}

function renderContact() {
  var html = '<div class="profile-section-title">Contact</div>';
  html += '<div class="profile-section-subtitle">Get in touch</div>';
  html += '<div class="profile-card" style="padding:8px 6px">';

  // GitHub
  html += '<a class="profile-contact-link" href="' + h(PROFILE.contact.github) + '" target="_blank">';
  html += '<svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';
  html += '<span class="profile-contact-label">GitHub</span>';
  html += '<span class="profile-contact-value">' + h(PROFILE.contact.github.replace('https://github.com/','')) + '</span>';
  html += '</a>';

  // LinkedIn
  html += '<a class="profile-contact-link" href="' + h(PROFILE.contact.linkedin) + '" target="_blank">';
  html += '<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
  html += '<span class="profile-contact-label">LinkedIn</span>';
  html += '<span class="profile-contact-value">' + h(PROFILE.contact.linkedin.replace('https://www.linkedin.com/in/','')) + '</span>';
  html += '</a>';

  // Instagram
  html += '<a class="profile-contact-link" href="' + h(PROFILE.contact.instagram) + '" target="_blank">';
  html += '<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>';
  html += '<span class="profile-contact-label">Instagram</span>';
  html += '<span class="profile-contact-value">@' + h(PROFILE.contact.instagramHandle) + '</span>';
  html += '</a>';

  // Email
  html += '<a class="profile-contact-link" href="mailto:' + h(PROFILE.contact.email) + '">';
  html += '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';
  html += '<span class="profile-contact-label">Email</span>';
  html += '<span class="profile-contact-value">' + h(PROFILE.contact.email) + '</span>';
  html += '</a>';

  // Source Code
  html += '<a class="profile-contact-link" href="' + h(PROFILE.contact.repo) + '" target="_blank">';
  html += '<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>';
  html += '<span class="profile-contact-label">Source</span>';
  html += '<span class="profile-contact-value">View on GitHub</span>';
  html += '</a>';

  html += '</div>';
  return html;
}

function renderDesktop() {
  var d = PROFILE.aboutDesktop;
  var html = '';
  html += '<div class="profile-desktop-logo">';
  html += '<div class="ubuntu-circle"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="5" r="2.2" fill="#fff"/><circle cx="5.5" cy="15.5" r="2.2" fill="#fff"/><circle cx="18.5" cy="15.5" r="2.2" fill="#fff"/></svg></div>';
  html += '<h2>' + h(d.osName) + '</h2>';
  html += '<p>' + h(d.osVersion) + '</p>';
  html += '</div>';
  html += '<div class="profile-card">';
  html += '<div class="profile-row"><span class="profile-row-label">Domain</span><span class="profile-row-value">' + h(d.domain) + '</span></div>';
  html += '<div class="profile-row"><span class="profile-row-label">Made With</span><span class="profile-row-value">' + h(d.madeWith) + '</span></div>';
  html += '<div class="profile-row"><span class="profile-row-label">Inspired By</span><span class="profile-row-value">' + h(d.inspiredBy) + '</span></div>';
  html += '<div class="profile-row"><span class="profile-row-label">Copyright</span><span class="profile-row-value">' + h(d.copyright) + '</span></div>';
  html += '</div>';
  return html;
}

// ============================================================
// NAVIGATION & RENDERING
// ============================================================
var sections = {
  about: renderAbout,
  experience: renderExperience,
  education: renderEducation,
  skills: renderSkills,
  projects: renderProjects,
  contact: renderContact,
  desktop: renderDesktop
};

var contentEl = document.getElementById('profile-content');
var navItems = document.querySelectorAll('.profile-nav-item');

function showSection(name) {
  navItems.forEach(function(item) {
    item.classList.toggle('active', item.getAttribute('data-section') === name);
  });
  if (sections[name]) {
    contentEl.innerHTML = sections[name]();
  }
  contentEl.scrollTop = 0;
}

navItems.forEach(function(item) {
  item.addEventListener('click', function() {
    showSection(item.getAttribute('data-section'));
  });
});

// Render initial section
showSection('about');

// ============================================================
// PROFILE WINDOW MANAGEMENT (drag, resize, buttons)
// ============================================================
var profileWindow = document.getElementById('profile-window');
var profileHeader = document.getElementById('profile-header');
var profileResizeHandle = document.getElementById('profile-resize-handle');
var desktopArea = document.getElementById('desktop-area');
var dockProfileIcon = document.querySelector('.dock-icon[data-app="profile"]');

var preMaxState = null;
var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
var isResizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;

// --- Drag ---
profileHeader.addEventListener('mousedown', function(e) {
  if (e.target.closest('.title-buttons')) return;
  if (profileWindow.classList.contains('maximized')) return;
  isDragging = true;
  dragOffsetX = e.clientX - profileWindow.offsetLeft;
  dragOffsetY = e.clientY - profileWindow.offsetTop;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var rect = desktopArea.getBoundingClientRect();
    var x = Math.max(rect.left - profileWindow.offsetWidth + 100, Math.min(e.clientX - dragOffsetX, rect.right - 100));
    var y = Math.max(0, Math.min(e.clientY - dragOffsetY, rect.bottom - rect.top - 40));
    profileWindow.style.left = x + 'px';
    profileWindow.style.top = y + 'px';
    e.preventDefault();
  }
  if (isResizing) {
    var newW = Math.max(520, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(350, resizeStartH + (e.clientY - resizeStartY));
    profileWindow.style.width = newW + 'px';
    profileWindow.style.height = newH + 'px';
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

// --- Resize ---
profileResizeHandle.addEventListener('mousedown', function(e) {
  if (profileWindow.classList.contains('maximized')) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = profileWindow.offsetWidth;
  resizeStartH = profileWindow.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

// --- Window Buttons ---
document.querySelector('.profile-btn-min').addEventListener('click', function(e) {
  e.stopPropagation();
  profileWindow.classList.add('minimized');
});

document.querySelector('.profile-btn-max').addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMaximize();
});

document.querySelector('.profile-btn-close').addEventListener('click', function(e) {
  e.stopPropagation();
  profileWindow.classList.add('minimized');
  dockProfileIcon.classList.remove('active');
});

profileHeader.addEventListener('dblclick', function(e) {
  if (e.target.closest('.title-buttons')) return;
  toggleMaximize();
});

function toggleMaximize() {
  if (profileWindow.classList.contains('maximized')) {
    profileWindow.classList.remove('maximized');
    if (preMaxState) {
      profileWindow.style.top = preMaxState.top;
      profileWindow.style.left = preMaxState.left;
      profileWindow.style.width = preMaxState.width;
      profileWindow.style.height = preMaxState.height;
      preMaxState = null;
    }
  } else {
    preMaxState = {
      top: profileWindow.style.top || profileWindow.offsetTop + 'px',
      left: profileWindow.style.left || profileWindow.offsetLeft + 'px',
      width: profileWindow.style.width || profileWindow.offsetWidth + 'px',
      height: profileWindow.style.height || profileWindow.offsetHeight + 'px'
    };
    profileWindow.classList.add('maximized');
  }
}

// --- Dock icon click ---
dockProfileIcon.addEventListener('click', function() {
  if (profileWindow.classList.contains('minimized')) {
    profileWindow.classList.remove('minimized');
    dockProfileIcon.classList.add('active');
    bringWindowToFront('profile-window');
  } else {
    profileWindow.classList.add('minimized');
  }
});

// --- Bring to front on click ---
profileWindow.addEventListener('mousedown', function() {
  bringWindowToFront('profile-window');
});

// --- Center profile window ---
function centerProfile() {
  var rect = desktopArea.getBoundingClientRect();
  var w = profileWindow.offsetWidth;
  var h = profileWindow.offsetHeight;
  profileWindow.style.left = Math.max(0, (rect.width - w) / 2) + 'px';
  profileWindow.style.top = Math.max(0, (rect.height - h) / 2) + 'px';
}
requestAnimationFrame(function() { requestAnimationFrame(centerProfile); });

})();
