var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var buildAwesome = 'npm run awesome';
var buildAllRepo = 'npm run build';
var pushToGithub = 'npm run push';

console.log('Do The Crob Job! Awesome :)');
<<<<<<< HEAD
new CronJob('* * */6 * * *', function() {
=======
new CronJob('00 00 09 * * *', function() {
>>>>>>> 1552c54539664a4f1a538e1a017ca5b59772ba4d
  try {
    exec(buildAwesome, finishAwesome);
  } catch (e) {
    console.error(e);
  }
}, false, 'Asia/Taipei');

new CronJob('00 51 22 * * *', function() {
  try {
    exec(buildAllRepo, finishBuild);
  } catch(e) {
    console.error(e);
  }
}, true, 'Asia/Taipei');

new CronJob('00 57 22 * * *', function() {
  try {
    exec(pushToGithub, function(err, stdout, stderr) {
      if (err) {
        console.log(stderr);
      } else {
        console.log(stdout);
      }
    });
  } catch (e) {
    console.error(e); 
  }
}, false, 'Asia/Taipei');

function finishAwesome(err, stdout, stderr) {
  if (err) {
    console.log(stderr);
  } else {
    console.log(stdout);
  }
}

function finishBuild(err, stdout, stderr) {
  if (err) {
    console.log(stderr);
  } else {
    console.log(stdout);
  }
}
