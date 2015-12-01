var osx = require('../output/osx.json');
var fs = require('fs');
console.log(osx);
var newOSXArr = [];
var e = Object.keys(osx);

for (var i = 0, len = e.length; i < len; ++i) {
  var tmp = osx[e[i]];

  for (var j = 0, leng = tmp.length; j < leng; ++j) {
    var newOSX = {};
    newOSX.name = tmp[j].name;
    newOSX.url = tmp[j].url;
    newOSX.description = tmp[j].description;
    newOSXArr.push(newOSX);
  }
}

fs.writeFile('../test-output/osx.json', JSON.stringify(newOSXArr, null, 2), function(err) {
  if (!err) {
    console.log('success');
  }
});
