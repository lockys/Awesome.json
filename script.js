var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var buildCMD = 'npm run awesome && npm run build && npm run push';

exec(buildCMD, function(error, stdout, stderr) {
  if (!error) {
    console.log(stdout);
  }
});

new CronJob('* 38 12 * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'Asia/Taipei');
