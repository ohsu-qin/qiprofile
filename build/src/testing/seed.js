(function() {
  var cmd, dest, exec, fs, path, root, script, src;

  path = require('path');

  fs = require('fs');

  exec = require('child_process').exec;

  script = "from mongoengine import connect;" + "from qirest.test.helpers import seed;" + "connect(db=\"qiprofile_test\");" + "seed.seed()";

  cmd = "python -c '" + script + "'";

  exec(cmd, function(error) {
    if (error) {
      throw new Error("Test preparation seed script unsuccessful: " + error);
    }
  });

  root = __dirname + "/../../public";

  src = '../test/fixtures/data';

  dest = root + "/data";

  if (!fs.existsSync(dest)) {
    if (!fs.existsSync(root)) {
      throw new Error("Web app root not found: " + root);
    }
    fs.symlinkSync(src, dest);
  }

}).call(this);
