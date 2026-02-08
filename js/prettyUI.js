function openSlider() {
  $('#leftcol').addClass('active');;
}

const initGUI = () => {
  $.get("pages/pretty_about.html", function(data) {
    $('.content')[0].innerHTML = data;
  });

  $(document).on('keydown', '.nav-opener', function(evt) {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      openSlider();
    }
  });

  $('.leftcolTab').off('click').on('click', function() {
    $('.leftcolTab').removeClass('active');
    $(this).addClass('active');
    $('#leftcol').removeClass('active'); // close for small screen

    var name = $(this)[0].children[1].innerHTML;
    loadSection(name);
  });
};

function loadSection(name) {
  const key = String(name || '').toLowerCase();

  const setActive = (label) => {
    $('.leftcolTab').removeClass('active');
    $('.leftcolTab').each(function() {
      const text = $(this).find('.name').text().trim().toLowerCase();
      if (text === label) {
        $(this).addClass('active');
      }
    });
  };

  if (key === "about") {
    setActive("about");
    return $.get("pages/pretty_about.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if (key === "education") {
    setActive("education");
    return $.get("pages/pretty_edu.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }
  
  if (key === "skills") {
    setActive("skills");
    return $.get("pages/pretty_skills.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if (key === "experience") {
    setActive("experience");
    return $.get("pages/pretty_exp.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if (key === "projects") {
    setActive("projects");
    return $.get("pages/pretty_projects.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if (key === "resume") {
    setActive("resume");
    return $.get("pages/pretty_resume.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if (key === "contact") {
    setActive("contact");
    return $.get("pages/pretty_contact.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  return null;
}

window.showSection = function(name) {
  return loadSection(name);
};

window.initGUI = initGUI;

// init via window.initGUI after window content loads
