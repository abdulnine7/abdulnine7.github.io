$.get("http://ip-api.com/json/", function(data) {
  // console.log(data);

  $(document).ready(function() {
    // $('.loginInfo').append('<p><strong class="blue">Login IP:</strong> '+ data.query +' <br>' + '<strong class="blue">Location: </strong> '+ data.city + ',' + data.regionName +
    // ' ' + data.country + '<br> <strong class="blue">ISP: </strong> ' + data.isp + '<br>' + 
    // '<strong class="blue">Date/Time: </strong> ' + new Date() + '</p> ');


    $('.loginInfo').append(' \
    <table> \
      <tr> \
        <td><strong class="li-blue">Login IP:</strong> </td> \
        <td>'+ data.query +'</td> \
      </tr> \
      <tr> \
        <td><strong class="li-blue">Location: </strong></td> \
        <td>'+ data.city + ', ' + data.regionName + ' ' + data.country + '</td> \
      </tr> \
      <tr> \
        <td><strong class="li-blue">ISP: </strong></td> \
        <td>' + data.isp + '</td> \
      </tr> \
      <tr> \
        <td><strong class="li-blue">Date/Time: </strong></td> \
        <td>' + new Date() + '</td> \
      </tr> \
    </table> \
    ');
  });

});

$('.input').click();


