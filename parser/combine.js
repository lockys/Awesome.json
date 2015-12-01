var awesomeJSON = require('../name-map/awesome.json');
var fs = require('fs');

var nameToURL = {};
var e = Object.keys(awesomeJSON);

for (var i = 0, len = e.length; i < len; ++i) {
  nameToURL[e[i].replace(/\W/g, '').toLowerCase()] = awesomeJSON[e[i]];
}

fs.writeFile('../test-output/name-to-url.json', JSON.stringify(nameToURL, null, 2), function(err) {
  if (!err) {
    console.log('success');
  }
});
