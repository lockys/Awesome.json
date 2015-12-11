var exec = require('child_process').exec;
var buildCMD = 'npm run build';
var pushCMD = 'git add . && git commit -m "updated json" && git push origin master';
exec(buildCMD, function(error, stdout, stderr) {
  if (!error) {
    exec(pushCMD);
  }
});
