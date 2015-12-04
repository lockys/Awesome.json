awesome.json
==
A curated list in JSON format.  
Necessary files for https://awesomelists.me
```
output/*.json
name-map/awesome.json
awesome/awesome.json
```
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

var plugin = function(cb) {
  var get = require('simple-get');
  var awesome = 'sindresorhus/awesome';
  var AWESOME_URL = `https://raw.githubusercontent.com/${awesome}/master/readme.md`;
  var finalJson;

  get.concat(AWESOME_URL, (err, data, res) => {
    if (err && res.statusCode !== 200) {
      console.log(new Error('Unable to get the response.'));
    }

    cb(parseContent(data.toString().replace(/\n/g, '')));
  });
};

function parseContent(rawBody) {
  var length = rawBody.split('##').length;
  var cateArr = rawBody.split('##');
  var cnt = 0;
  var match = [];
  var awesomeJson = {};
  var REGEX = /(\*|-) \[(.*?)\]\((.*?)\)/g;

  for (let e of cateArr) {
    let category = e.split('- ')[0].trim();
    if (!category.startsWith('#')) {
      awesomeJson[category] = [];
    }

    while ((match = REGEX.exec(e))) {
      if (!match[3].startsWith('#')) {
        let obj = {
          name: match[2],
          url:  match[3],
          description: match[4],
          cate: category,
        };
        awesomeJson[category].push(obj);
      }
    }
  }

  return awesomeJson;
};

var w = new AwesomeWorker('awesome');
plugin((json) => {
  w.save(json);
});
```
