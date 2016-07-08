/**
* This js is aimed to generate all JSON files of all awesome repos.
**/
'use strict';
const Awesome = require('awesomelists-index');
const jsonfile = require('jsonfile');
const url = require('url');

const nameMapObject = jsonfile.readFileSync('../awesome/awesome.json');
const opt = {
  token: process.env.TOKEN || 'GITHUB_TOKE',
};

Object.keys(nameMapObject).forEach((k) => {
  nameMapObject[k].forEach((repo) => {
    if (url.parse(repo.url).hostname === 'github.com') {
    opt.repo = `${repo.url.split('/')[3]}/${repo.url.split('/')[4]}`;
      if (opt.repo) {
        let a = new Awesome(opt);
        a.makeIndexJson((err, res) => {
          console.log(res);
        });
      }
    }
  });
});
