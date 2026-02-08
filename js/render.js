(function() {
  const sectionHeader = (title) => {
    return `
      <div>
        <strong class="head-title">${title}</strong>
      </div>
      <svg height="30" class="svg-line" width="100%">
        <line stroke="white" x1="35%" y1="10" y2="10" x2="65%"></line>
        <circle fill="white" cx="35%" cy="10" r="3"></circle>
        <circle fill="white" cx="65%" cy="10" r="3"></circle>
      </svg>
    `;
  };

  const renderAbout = (data) => {
    const bio = data.about.bio.map((p) => `<p class="about-para">${p}</p>`).join('');
    return `
      <div>
        <img class="profile-image" src="${data.about.profileImage}" alt="Abdul Logo" loading="lazy" decoding="async">
        <div class="self-name">
          Hi, my name is <strong class="name">${data.about.name}</strong>,<br>
          ${data.about.headline}
        </div>
        ${sectionHeader('About')}
        ${bio}
      </div>
    `;
  };

  const renderEducation = (data) => {
    const items = data.education.map((item) => {
      return `
        <li class="edu-li">
          <div class="title"><strong>${item.school}</strong></div>
          <div class="year"><strong>${item.period}</strong></div>
          <div class="course"><strong>${item.degree}</strong></div>
          <div class="grade"><strong>${item.grade}</strong></div>
        </li>
        <br><br>
      `;
    }).join('');
    return `
      <div>
        ${sectionHeader('Education')}
        <ul class="edu-ul">${items}</ul>
      </div>
    `;
  };

  const renderSkills = (data) => {
    const summary = data.skills.summary.map((s) => `<li class="about-li">${s}</li>`).join('');
    const icons = (list) => list.map((cls) => `<i class="big ${cls}"></i>`).join('');
    return `
      <div>
        ${sectionHeader('Skills')}
        <ul class="about-ul">
          ${summary}
          <li class="about-li">Some of the tech stack that I have frequently used are,<br><br><br><br>
            <div class="tech-container">
              <div class="tech-lang">
                <strong>Languages & Frameworks:</strong><br><br>
                ${icons(data.skills.icons.languages)}
              </div>
              <br><br>
              <div class="tech-framework">
                <strong>Tools:</strong><br><br>
                ${icons(data.skills.icons.tools)}
              </div>
            </div>
          </li>
        </ul>
      </div>
    `;
  };

  const renderExperience = (data) => {
    const items = data.experience.map((item) => {
      const bullets = item.bullets && item.bullets.length
        ? `<ul class="exp-desc-ul">${item.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
        : '';
      return `
        <div class="exp-item">
          <table class="exp-title-table">
            <tbody>
              <tr>
                <td rowspan="2" class="logo">
                  <img src="${item.logo}" alt="${item.company} logo" loading="lazy" decoding="async">
                </td>
                <td class="title"><strong>${item.company}</strong></td>
                <td class="time"><strong>${item.period}</strong></td>
              </tr>
              <tr>
                <td class="desig"><strong>${item.role}</strong></td>
                <td class="location"><strong>${item.location}</strong></td>
              </tr>
            </tbody>
          </table>
          ${bullets}
        </div>
        <br>
      `;
    }).join('');
    return `
      <div>
        ${sectionHeader('Experience')}
        <div class="exp-section">${items}</div>
      </div>
    `;
  };

  const renderProjects = (data) => {
    const items = data.projects.map((p) => {
      return `
        <div class="project-item">
          <strong><a class="title-link" target="_blank" rel="noopener noreferrer" href="${p.url}">${p.name}</a></strong>
          <p>${p.description}</p>
          <p><strong>Tech:</strong> ${p.tech}</p>
          <br>
        </div>
      `;
    }).join('');
    return `
      <div>
        ${sectionHeader('Projects')}
        <div class="project-list">${items}</div>
      </div>
    `;
  };

  const renderResume = (data) => {
    return `
      <div>
        ${sectionHeader('Resume')}
        <iframe class="resume-frame" src="${data.resume.pdf}" title="Resume"></iframe>
        <p class="helptext" style="margin-top: 20px;">If you cannot view the pdf above click <a href="${data.resume.pdf}" style="display: inline;" class="title-link" target="_blank" rel="noopener noreferrer">here</a> to download the file.</p>
      </div>
    `;
  };

  const renderContact = (data) => {
    return `
      <div>
        ${sectionHeader('Contact')}
        <table class="contact-tbl">
          <tbody>
            <tr>
              <td><i class="devicon-github-original"></i>&nbsp&nbsp</td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="${data.contact.github}">GitHub</a></td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="${data.contact.github}">abdulnine7</a></td>
            </tr>
            <tr>
              <td><i class="devicon-linkedin-plain colored"></i></td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="${data.contact.linkedin}">LinkedIn</a></td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="${data.contact.linkedin}">abdulnine7</a></td>
            </tr>
            <tr>
              <td><i class="fa-solid fa-hashtag insta"></i></td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="${data.contact.instagram}">Instagram</a></td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="${data.contact.instagram}">${data.contact.instagramHandle}</a></td>
            </tr>
            <tr>
              <td><i class="fa-solid fa-at green"></i></td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="mailto:${data.contact.email}">Email</a></td>
              <td><a class="title-link" target="_blank" rel="noopener noreferrer" href="mailto:${data.contact.email}">${data.contact.email}</a></td>
            </tr>
          </tbody>
        </table>
        <p class="helptext" style="margin-top: 40px;">You can find the code for this website <a href="${data.contact.repo}" style="display: inline;" class="title-link" target="_blank" rel="noopener noreferrer">here</a>.</p>
      </div>
    `;
  };

  const renderAboutDesktop = (data) => {
    const target = document.getElementById('about-desktop-content');
    if (!target) return;
    target.innerHTML = `\n      <div class=\"about-panel\">\n        <div class=\"about-panel-title\">About This Desktop</div>\n        <div class=\"about-panel-body\">\n          <div class=\"about-badge\">${data.aboutDesktop.madeWith}</div>\n          <div class=\"about-badge\">${data.aboutDesktop.inspiredBy}</div>\n          <div class=\"about-badge\">Domain: ${data.aboutDesktop.domain}</div>\n        </div>\n        <div class=\"about-panel-footer\">${data.aboutDesktop.copyright}</div>\n      </div>\n    `;\n  };

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
      contact: `
        <p>Email: ${data.contact.email}</p>
        <p>GitHub: ${data.contact.github}</p>
        <p>LinkedIn: ${data.contact.linkedin}</p>
        <p>Instagram: ${data.contact.instagram}</p>
      `,
      projects: data.projects.map((p) => `<p><strong>${p.name}</strong> - ${p.url}<br>${p.description}<br><strong>Tech:</strong> ${p.tech}</p>`).join(''),
      resume: `<p><a class="title-link" target="_blank" rel="noopener noreferrer" href="${data.resume.pdf}">Download Resume</a></p>`,
      skills: lines(data.skills.summary),
      proficient: `<ul>${data.skills.proficient.map((s) => `<li>${s}</li>`).join('')}</ul>`,
      familiar: `<ul>${data.skills.familiar.map((s) => `<li>${s}</li>`).join('')}</ul>`,
      help: `
        <div>
          <ul>
            <li><strong>path</strong> - display current directory</li>
            <li><strong>cat FILENAME</strong> - display FILENAME in window</li>
            <li><strong>cd DIRECTORY</strong> - move into DIRECTORY or just cd to return to home</li>
            <li><strong>ls</strong> - show files in current directory</li>
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
    const data = await window.profileReady;
    const container = document.querySelector('#rightcol .content');
    if (!container) return;
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
      activate(key);
    };

    document.addEventListener('click', (evt) => {
      const tab = evt.target.closest('.leftcolTab');
      if (!tab) return;
      const label = tab.querySelector('.name');
      if (!label) return;
      show(label.textContent.trim().toLowerCase());
    });

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
  window.initGUI = initGUI;
})();
