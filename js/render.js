(function() {
  const renderAbout = (data) => {
    const bio = data.about.bio.map((p) => `<p class="row-subtitle">${p}</p>`).join('');
    return `
      <div class="settings-hero">
        <img class="profile-image" src="${data.about.profileImage}" alt="${data.about.name}" loading="lazy" decoding="async">
        <div>
          <div class="hero-name">${data.about.name}</div>
          <div class="hero-subtitle">${data.about.headline}</div>
          <div class="pill">${data.site.domain}</div>
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Role</span>
            <span class="row-subtitle">Backend developer and open-source contributor</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Email</span>
            <span class="row-subtitle">${data.contact.email}</span>
          </div>
          <a class="btn" href="mailto:${data.contact.email}">Message</a>
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Bio</span>
            ${bio}
          </div>
        </div>
      </div>
    `;
  };

  const renderEducation = (data) => {
    const rows = data.education.map((item) => `
      <div class="settings-row">
        <div class="label-group">
          <span class="row-title">${item.school}</span>
          <span class="row-subtitle">${item.degree} • ${item.period} • ${item.grade}</span>
        </div>
      </div>
    `).join('');
    return `<div class="settings-group">${rows}</div>`;
  };

  const renderSkills = (data) => {
    const proficient = data.skills.proficient.map((s) => `<span class="tag">${s}</span>`).join('');
    const familiar = data.skills.familiar.map((s) => `<span class="tag">${s}</span>`).join('');
    const summary = data.skills.summary.map((s) => `<span class="row-subtitle">${s}</span>`).join('<br>');
    return `
      <div class="settings-group">
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Summary</span>
            ${summary}
          </div>
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Proficient</span>
            <div class="tag-list">${proficient}</div>
          </div>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Familiar</span>
            <div class="tag-list">${familiar}</div>
          </div>
        </div>
      </div>
    `;
  };

  const renderExperience = (data) => {
    const rows = data.experience.map((item) => `
      <div class="settings-row">
        <div class="label-group">
          <span class="row-title">${item.company} — ${item.role}</span>
          <span class="row-subtitle">${item.period} • ${item.location}</span>
        </div>
      </div>
    `).join('');
    return `<div class="settings-group">${rows}</div>`;
  };

  const renderProjects = (data) => {
    const rows = data.projects.map((p) => `
      <div class="settings-row">
        <div class="label-group">
          <span class="row-title">${p.name}</span>
          <span class="row-subtitle">${p.description}</span>
          <span class="row-subtitle">Tech: ${p.tech}</span>
        </div>
        <a class="btn" target="_blank" rel="noopener noreferrer" href="${p.url}">Open</a>
      </div>
    `).join('');
    return `<div class="settings-group">${rows}</div>`;
  };

  const renderResume = (data) => {
    return `
      <div class="settings-group">
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Resume PDF</span>
            <span class="row-subtitle">Download or view the latest resume</span>
          </div>
          <button class="btn" data-open-window="resume">Open</button>
        </div>
      </div>
    `;
  };

  const renderContact = (data) => {
    return `
      <div class="settings-group">
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">GitHub</span>
            <span class="row-subtitle">${data.contact.github}</span>
          </div>
          <a class="btn" target="_blank" rel="noopener noreferrer" href="${data.contact.github}">Open</a>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">LinkedIn</span>
            <span class="row-subtitle">${data.contact.linkedin}</span>
          </div>
          <a class="btn" target="_blank" rel="noopener noreferrer" href="${data.contact.linkedin}">Open</a>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Instagram</span>
            <span class="row-subtitle">${data.contact.instagram}</span>
          </div>
          <a class="btn" target="_blank" rel="noopener noreferrer" href="${data.contact.instagram}">Open</a>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Email</span>
            <span class="row-subtitle">${data.contact.email}</span>
          </div>
          <a class="btn" href="mailto:${data.contact.email}">Message</a>
        </div>
      </div>
    `;
  };

  const renderAboutDesktop = (data) => {
    const target = document.querySelector('#about-desktop-content .content-body');
    if (!target) return;
    target.innerHTML = `
      <div class="about-hero">
        <img class="about-logo" src="${data.aboutDesktop.logo}" alt="Ubuntu Logo" loading="lazy" decoding="async">
        <div class="about-os-title">${data.aboutDesktop.osName}</div>
        <div class="about-os-version">${data.aboutDesktop.osVersion}</div>
      </div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Desktop</span>
            <span class="row-subtitle">${data.aboutDesktop.inspiredBy}</span>
          </div>
          <span class="pill">GNOME</span>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Made With</span>
            <span class="row-subtitle">${data.aboutDesktop.madeWith}</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Domain</span>
            <span class="row-subtitle">${data.aboutDesktop.domain}</span>
          </div>
          <a class="btn" target="_blank" rel="noopener noreferrer" href="https://${data.aboutDesktop.domain}">Visit</a>
        </div>
        <div class="settings-row">
          <div class="label-group">
            <span class="row-title">Copyright</span>
            <span class="row-subtitle">${data.aboutDesktop.copyright}</span>
          </div>
        </div>
      </div>
    `;
  };

  const renderSection = (section, data) => {
    switch (section) {
      case 'about': return renderAbout(data);
      case 'education': return renderEducation(data);
      case 'skills': return renderSkills(data);
      case 'experience': return renderExperience(data);
      case 'projects': return renderProjects(data);
      case 'resume': return renderResume(data);
      case 'contact': return renderContact(data);
      default: return renderAbout(data);
    }
  };

  const buildCliData = (data) => {
    const lines = (arr) => arr.map((s) => `<p>${s}</p>`).join('');
    return {
      about: lines(data.about.bio),
      education: data.education.map((e) => `<p><strong>${e.school}</strong> (${e.period})<br>${e.degree} — ${e.grade}</p>`).join(''),
      experience: data.experience.map((e) => `<p><strong>${e.company}</strong> — ${e.role}<br>${e.location} (${e.period})</p>`).join(''),
      contact: `
        <p>Email: ${data.contact.email}</p>
        <p>GitHub: ${data.contact.github}</p>
        <p>LinkedIn: ${data.contact.linkedin}</p>
        <p>Instagram: ${data.contact.instagram}</p>
      `,
      projects: data.projects.map((p) => `<p><strong>${p.name}</strong> - ${p.url}<br>${p.description}<br><strong>Tech:</strong> ${p.tech}</p>`).join(''),
      resume: `<p><button class="title-link" data-open-window="resume">Open Resume Viewer</button></p>`,
      skills: lines(data.skills.summary),
      proficient: `<ul>${data.skills.proficient.map((s) => `<li>${s}</li>`).join('')}</ul>`,
      familiar: `<ul>${data.skills.familiar.map((s) => `<li>${s}</li>`).join('')}</ul>`,
      help: `
        <div>
          <ul>
            <li><strong>whoami</strong> - display a quick profile summary</li>
            <li><strong>stats</strong> - show highlights (projects, experience, top skills)</li>
            <li><strong>path</strong> - display current directory</li>
            <li><strong>cat FILENAME</strong> - display FILENAME in window</li>
            <li><strong>cd DIRECTORY</strong> - move into DIRECTORY or just cd to return to home</li>
            <li><strong>ls</strong> - show files in current directory</li>
            <li><strong>theme NAME</strong> - set terminal theme (default|amber|green|mono)</li>
            <li><strong>open SECTION</strong> - open GUI section (about, education, skills, experience, projects, resume, contact)</li>
            <li><strong>gui</strong> - open the profile window</li>
            <li><strong>help COMMAND</strong> - get help for a command</li>
            <li><strong>history</strong> - see your command history</li>
            <li><strong>login</strong> - fetch login IP/location (opt-in)</li>
            <li><strong>clear</strong> - clear current window</li>
          </ul>
        </div>
      `
    };
  };

  const initGUI = async () => {
    const container = document.querySelector('#rightcol .content');
    const header = document.querySelector('.section-title');
    if (!container) return;
    let data;
    try {
      data = await window.profileReady;
    } catch (err) {
      container.innerHTML = '<p style="color:#fff;padding:12px;">Failed to load profile data.</p>';
      return;
    }

    const activate = (name) => {
      const tabs = document.querySelectorAll('.leftcolTab');
      tabs.forEach((tab) => tab.classList.remove('active'));
      tabs.forEach((tab) => {
        const label = tab.querySelector('.name');
        if (label && label.textContent.trim().toLowerCase() === name) {
          tab.classList.add('active');
        }
      });
    };

    const show = (name) => {
      const key = String(name || '').toLowerCase();
      container.innerHTML = renderSection(key, data);
      if (header) header.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      activate(key);
    };

    document.addEventListener('click', (evt) => {
      const tab = evt.target.closest('.leftcolTab');
      if (!tab) return;
      const label = tab.querySelector('.name');
      if (!label) return;
      show(label.textContent.trim().toLowerCase());
    });

    window.showSection = show;
    show('about');
    renderAboutDesktop(data);
  };

  window.profileReady = fetch('data/profile.json', { cache: 'no-store' })
    .then((res) => res.json())
    .then((data) => {
      window.profileData = data;
      return data;
    });

  window.renderSection = renderSection;
  window.buildCliData = buildCliData;
  window.renderAboutDesktop = renderAboutDesktop;
  window.initGUI = initGUI;
})();
