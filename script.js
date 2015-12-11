var schedule = require('node-schedule');
var exec = require('child_process').exec;
var buildCMD = 'npm run build && npm run push';

var j = schedule.scheduleJob('* * * * *', function(){
  exec(buildCMD, function(error, stdout, stderr) {
    if (!error) {
      console.log(stdout);
    }
  });
});

