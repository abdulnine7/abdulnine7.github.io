function openSlider() {
  $('#leftcol').addClass('active');;
}

$( document ).ready(function() {
  $.get("pages/pretty_about.html", function(data) {
    $('.content')[0].innerHTML = data;
  });
});

//Flip on click
function flipWindow() {
  $("#card").flip('toggle');
  if($('.flip-img').hasClass('animate')) { $('.flip-img').removeClass('animate'); } 
  
  if($(".front").css('z-index') == 1){
    $('.flip-text')[0].innerHTML = "CLI";
    document.title = 'Abdul\s GUI';
  } else {
    $('.flip-text')[0].innerHTML = "GUI";
    document.title = 'Abdul\'s CLI - Terminal';
  }

  $('.flip-img').addClass('animate');
}

$('.leftcolTab').click(function() {
  $('.leftcolTab').removeClass('active');
  $(this).addClass('active');
  $('#leftcol').removeClass('active'); // close for small screen

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

  if(name === "Contact"){
    $.get("pages/pretty_contact.html", function(data) {
      $('.content')[0].innerHTML = data;
    });
  }

});