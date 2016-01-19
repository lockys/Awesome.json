/**
* This js is aimed to generate all JSON files of all awesome repos.
**/
'use strict';
const Awesome = require('awesomelists-index');
const jsonfile = require('jsonfile');
const url = require('url');

const nameMapArray = jsonfile.readFileSync('../all-github-path/sindresorhus-awesome.json');
const opt = {
  token: process.env.TOKEN || 'GITHUB_TOKE',
};

for (let i of nameMapArray) {
  if (url.parse(i.url).hostname === 'github.com') {
    opt.repo = `${i.url.split('/')[3]}/${i.url.split('/')[4]}`;
    if (opt.repo) {
      let a = new Awesome(opt);
      a.makeIndexJson((err, res) => {
        console.log(res);
      });
    }
  }
}
