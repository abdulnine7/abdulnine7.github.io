function fetchLoginInfo(targetSelector) {
  const target = targetSelector ? $(targetSelector) : $('.loginInfo').last();
  if (!target.length) {
    return;
  }

  target.html('<p class="gray">Fetching login info...</p>');

  $.get('https://ipapi.co/json/', function(data) {
    target.html(
      ' \
    <table> \
      <tr> \
        <td><strong class="li-blue">Login IP:</strong> </td> \
        <td>' + data.ip + '</td> \
      </tr> \
      <tr> \
        <td><strong class="li-blue">Location: </strong></td> \
        <td>' + data.city + ', ' + data.region + ' ' + data.country_name + '</td> \
      </tr> \
      <tr> \
        <td><strong class="li-blue">Org: </strong></td> \
        <td>' + (data.org || 'N/A') + '</td> \
      </tr> \
      <tr> \
        <td><strong class="li-blue">Date/Time: </strong></td> \
        <td>' + new Date() + '</td> \
      </tr> \
    </table> \
    '
    );
  }).fail(function() {
    target.html('<p class="gray">Unable to fetch login info.</p>');
  });
}
