var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var buildAwesome = 'npm run awesome';
var buildAllRepo = 'npm run build';
var pushCmd = 'npm run push';

console.log('Do The Crob Job! Awesome :)');
new CronJob('* * */2 * * *', function() {
  try {
    exec(buildAwesome, finishAwesome);
  } catch (e) {
    console.error(e);
  }
}, true, 'Asia/Taipei');

function finishAwesome(err, stdout, stderr) {
  if (err) {
    console.log(stderr);
  } else {
    console.log(stdout);
    exec(buildAllRepo, finishBuild);
  }
}

function finishBuild(err, stdout, stderr) {
  if (err) {
    console.log(stderr);
  } else {
    console.log(stdout);
    //exec(pushCmd, function(err, stdout, stderr) {
    // if (err) {
    //   console.log(stderr);
    // } else {
    //   console.log(stdout); 
    // }
    //});
  }
}
