function w3_open() {
  $('.w3-sidenav').addClass('active');;
}
function w3_close() {
  $('.w3-sidenav').removeClass('active');
}

$( document ).ready(function() {
  $.get("pages/pretty_about.html", function(data) {
    $('.content')[0].innerHTML = data;
  });
});

$('.leftcolTab').click(function() {
  $('.leftcolTab').removeClass('active');
  $(this).addClass('active');
  // $('.w3-sidenav').removeClass('w3-animate-left');
  $('.w3-sidenav').removeClass('active'); // close for small screen

  var name = $(this)[0].children[1].innerHTML;
  console.log(name);

  if(name === "About"){
    $.get("pages/pretty_about.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if(name === "Education"){
    $.get("pages/pretty_edu.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }
  
  if(name === "Skills"){
    $.get("pages/pretty_skills.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if(name === "Experience"){
    $.get("pages/pretty_exp.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if(name === "Projects"){
    $.get("pages/pretty_projects.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

  if(name === "Resume"){
    $.get("pages/pretty_resume.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

});