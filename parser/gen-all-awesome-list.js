/**
* This js is aimed to generate all JSON files of all awesome repos.
**/

'use strict';
let Awesome = require('awesomelists-index');
let jsonfile = require('jsonfile');

let nameMapArray = jsonfile.readFileSync('../name-map/awesome-detailed-info.json');
let opt = {
  // token is optional parameter
  token: process.env.TOKEN || 'GITHUB_TOKE',
};
for (let i of nameMapArray) {
  opt.repo = i.githubPath;
  if (opt.repo) {
    let a = new Awesome(opt);
    a.makeIndexJson((err, res) => {console.log(res);});
  }
}
