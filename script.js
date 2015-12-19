var schedule = require('node-schedule');
var exec = require('child_process').exec;
var buildCMD = 'npm run awesome && npm run build && npm run push';

var j = schedule.scheduleJob('* * */12 * * *', function(){
  console.log('Go!');
  try {
   exec(buildCMD, function(error, stdout, stderr) {
      if (!error) {
        console.log(stdout);
      }
   });
  } catch(e) {
    console.error(e);
  }
});
