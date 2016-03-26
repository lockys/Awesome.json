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
// console.log('Do The Crob Job! Awesome :)');
// new CronJob('00 00 * * */3 *', function() {
  
// }
