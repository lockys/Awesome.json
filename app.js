var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var buildCMD = 'npm run awesome && npm run build && npm run push';

console.log('Do The Crob Job! Awesome :)');
new CronJob('* */1 * * * *', function() {
  try {
    exec(buildCMD, function(error, stdout, stderr) {
      console.log('executing ...');
      if (!error) {
        console.log(stdout);
        console.log(stderr);
      }
    });
  } catch (e) {
    console.error(e);
  }
}, true, 'Asia/Taipei');
