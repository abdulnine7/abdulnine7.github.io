$.get("http://ip-api.com/json/", function(data) {
  // console.log(data);

  $(document).ready(function() {
    $('.loginInfo').append('<p><strong class="blue">Login IP:</strong> '+ data.query +' <br>' + '<strong class="blue">Location: </strong> '+ data.city + ',' + data.regionName +
    ' ' + data.country + '<br> <strong class="blue">ISP: </strong> ' + data.isp + '<br>' + 
    '<strong class="blue">Date/Time: </strong> ' + new Date() + '</p> ');
  });

});


$('#input').click();