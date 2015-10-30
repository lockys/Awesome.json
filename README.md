awesome.json
==
A curated list in JSON format.

Clone
==
```shell
$ git clone https://github.com/lockys/awesome.json.git awesome-json && cd awesome-json
```

Parser Example 
==
Create awesome-xxx.js in `parser` folder.
```javascript
'use strict';

var AwesomeWorker = require('../index');

// a plugin function
var plugin = function(cb) {
  var get = require('simple-get');
  var AWESOME_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/master/readme.md';
  var REGEX = /(\*|-) \[(.*?)\]\((.*?)\)/g;

  get.concat(AWESOME_URL, (err, data, res) => {
    if (err && res.statusCode !== 200) {
      console.log(new Error('Unable to get the response.'));
    }

    let rawBody = data.toString().replace(/\n/g, '');
    let awesomeJson = {};

    // Parse content
    let parseContent = (resolve, reject) => {
      let length = rawBody.split('##').length;
      let cnt = 0;
      rawBody.split('##').forEach((e) => {
        let category = e.split('- ')[0].trim();
        let match;
        if (!category.startsWith('#')) {
          awesomeJson[category] = [];
        }

        while ((match = REGEX.exec(e))) {
          if (!match[3].startsWith('#')) {
            awesomeJson[category].push({
              name: match[2],
              url:  match[3],
              description: match[4],
              cate: category,
            });

          }
        }

        cnt++;
        if (cnt === length) {
          // Finish parsing
          resolve();
        }
      });
    };

    let p = new Promise(parseContent);

    p.then(() => {
      // Callback with object parsed from awesome list.
      cb(awesomeJson);
    });
  });
};

var w = new AwesomeWorker('JsonFileName');
plugin((json) => {
  //save to .json file
  w.save(json);
});
```
