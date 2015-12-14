var schedule = require('node-schedule');
var exec = require('child_process').exec;
var buildCMD = 'npm run build && npm run push';
console.log('start');
var j = schedule.scheduleJob('*/30 * * * * *', function() {
  console.log('schedule!');
  exec(buildCMD, function(error, stdout, stderr) {
    if (!error) {
      console.log(stdout);
    }
  });
});
