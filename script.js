var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var buildCMD = 'npm run awesome && npm run build && npm run push';

new CronJob('00 08 13 * * 0-6', function() {
  console.log('Do');
  try {
    exec(buildCMD, function(error, stdout, stderr) {
      if (!error) {
        console.log(stdout);
        console.log(stderr);
      }
    });
  } catch (e) {
    console.error(e);
  }
}, null, true, 'Asia/Taipei');

