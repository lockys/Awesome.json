'use strict';

var AwesomeWorker = require('../index');
var request = require('request');
var $ = require('cheerio');
var w = new AwesomeWorker('awesome');

function processReadMe(error, content, cb) {
  var headingArray = $('h2', content);
  var category = [];
  var awesomeJson = {};

  for (let i = 1, len = headingArray.length; i < len; ++i) {
    category[i] = $(headingArray[i]).text();
    awesomeJson[$(headingArray[i]).text()] = [];
  }

  var ulArray = $('h2 ~ ul', content);

  for (let i = 1, len = ulArray.length; i < len; ++i) {
    let list = $('div > li', `<div>${$(ulArray[i]).html()}</div>`);

    for (let j = 0, listLen = list.length; j < listLen; ++j) {
      let links = $('div > a', `<div>${$(list[j]).html()}</div>`);
      let subCate = $('li > a', `<div>${$(list[j]).html()}</div>`);
      let singleObj = {
        name: $(links[0]).text(),
        url: $(links[0]).attr('href'),
        repo: `${$(links[0]).attr('href').split('/')[3]}/${$(links[0]).attr('href').split('/')[4]}`,
        cate: category[i],
        filename: $(links[0]).text().replace(/\W/g, '').toLowerCase(),
      };

      awesomeJson[category[i]].push(singleObj);

      console.log('== ' + $(links[0]).attr('href'), $(links[0]).text());

      for (let k = 0, subCateLen = subCate.length; k < subCateLen; ++k) {
        let subCateName = $(links[0]).text() + ', ' + $(subCate[k]).text();
        let singleObj = {
          name: subCateName,
          url: $(subCate[k]).attr('href'),
          repo: `${$(subCate[k]).attr('href').split('/')[3]}/${$(subCate[k]).attr('href').split('/')[4]}`,
          cate: category[i],
          filename: subCateName.replace(/\W/g, '').toLowerCase(),
        };

        awesomeJson[category[i]].push(singleObj);
        console.log(' > ' + $(subCate[k]).attr('href'), subCateName);
      }
    }

  }

  cb(awesomeJson);
}

function getAwesomeReadMe(cb) {
  var options = {
    url: `https://api.github.com/repos/sindresorhus/awesome/readme`,
    headers: {
      'User-Agent': 'awesome-search',
      accept: 'application/vnd.github.v3.html',
      authorization: `token ${process.env.TOKEN}`,
    },
  };

  request(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      processReadMe(null, body, cb);
    } else {
      console.log(`Can not get this repos's README form github. Reason: ${body}`);
    }
  });
}

getAwesomeReadMe((json) => {
  w.save(json);
});
