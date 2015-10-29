'use strict';
var fs = require('fs');

class AwesomeSearcher {
  constructor(awesomeName) {
    this.name = awesomeName;
  }

  save(awesomeJson) {
    Object.keys(awesomeJson).forEach((e) => {
      if (!awesomeJson[e].length) {
        delete awesomeJson[e];
      }
    });

    fs.writeFile('../output/' + this.name + '.json', JSON.stringify(awesomeJson, null, 2), (err) => {
      if (!err) {
        console.log('Finish to save the json file!');
      } else {
        console.error(err);
      }
    });
  }
}

module.exports = exports = AwesomeSearcher;
