'use strict';
const AwesomeWorker = require('../index');
const request = require('request');
const cheerio = require('cheerio');
const w = new AwesomeWorker('awesome');

getAwesomeReadMe((json) => {
  w.save(json);
});

function getAwesomeReadMe(cb) {
  let options = {
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
      console.log(
        `Can not get this repos's README form github. Reason: ${body}`
      );
    }
  });
}

function processReadMe(error, originalContent, cb) {
  // temporay solution to trim #readme in url.
  let content = originalContent.replace(/#readme/g, '');
  // Retrieve the big topic
  let $ = cheerio.load(content);
  let headingArray = $('h2', content);
  let category = ['prefix'];
  let awesomeJson = {};

  for (let i = 0, len = headingArray.length; i < len; ++i) {
    if (
      $(headingArray[i]).text() !== 'Contents' &&
      $(headingArray[i]).text() !== 'License' &&
      $(headingArray[i]).text() !==
        '\n\t\tMy color picker app is on Product Hunt\n\t'
    ) {
      category.push($(headingArray[i]).text());
      awesomeJson[$(headingArray[i]).text()] = [];
    }
  }

  console.log(category);
  // Get all list html under every topic.
  let topicList = $('h2 ~ ul', content);

  for (let i = 1, len = topicList.length; i < len; ++i) {
    // Iterate every list under every topic.
    let listUnderTopic = $('div > li', `<div>${$(topicList[i]).html()}</div>`);

    for (let j = 0, listLen = listUnderTopic.length; j < listLen; ++j) {
      let links = $('div > a', `<div>${$(listUnderTopic[j]).html()}</div>`);
      let subCategoryList = $(
        'li > a',
        `<div>${$(listUnderTopic[j]).html()}</div>`
      );
      let masterCategory = '';

      if (links.length) {
        masterCategory = $(links[0]).text();
        let awesomeTopic = {
          name: $(links[0]).text(),
          url: $(links[0]).attr('href'),
          repo: `${$(links[0]).attr('href').split('/')[3]}/${
            $(links[0]).attr('href').split('/')[4]
          }`,
          cate: category[i],
        };

        awesomeJson[category[i]].push(awesomeTopic);
      } else {
        masterCategory = $(listUnderTopic[j]).text().split('-')[0].trim();
      }

      for (
        let k = 0, subCateLen = subCategoryList.length;
        k < subCateLen;
        ++k
      ) {
        let subCateName = masterCategory + ' - ' + $(subCategoryList[k]).text();
        let awesomeTopic = {
          name: subCateName,
          url: $(subCategoryList[k]).attr('href'),
          repo: `${$(subCategoryList[k]).attr('href').split('/')[3]}/${
            $(subCategoryList[k]).attr('href').split('/')[4]
          }`,
          cate: category[i],
        };

        awesomeJson[category[i]].push(awesomeTopic);
      }
    }
  }

  cb(awesomeJson);
}
