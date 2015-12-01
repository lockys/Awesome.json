'use strict';
var awesome = require('../output/awesome.json');
var fs = require('fs');
var keyArr = Object.keys(awesome);
var nammingMap = {};

for (let i = 0, len = keyArr.length; i < len; ++i) {
  let listArr = awesome[keyArr[i]];
  for (let j = 0, lenList = listArr.length; j < lenList; ++j) {
    nammingMap[listArr[j].name] = listArr[j].name.replace(/\W/g, '').toLowerCase();
    nammingMap[listArr[j].name.replace(/\W/g, '').toLowerCase()] = listArr[j].name;
  }

}

fs.writeFile('../name-map/name-map.json', JSON.stringify(nammingMap, null, 2), (err) => {
  if (!err) {
    console.log('Success!');
  } else {
    console.error(err);
  }
});
