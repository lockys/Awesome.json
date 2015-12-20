var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var buildCMD = 'npm run awesome && npm run build && npm run push';

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

//new CronJob('00 42 12 * * 1-7', function() {
//  console.log('You will see this message every second');
//}, null, true, 'Asia/Taipei');
