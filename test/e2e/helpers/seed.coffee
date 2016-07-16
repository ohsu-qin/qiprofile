# Calls the qirest test seed utilty.
path = require 'path'
fs = require 'fs'
exec = require('child_process').exec

script = "from mongoengine import connect;" +
         "from qirest.test.helpers import seed;" +
         "connect(db=\"qiprofile_test\");" +
         "seed.seed()"

cmd = "python -c '#{ script }'"

exec cmd, (error) ->
  if error
    throw new Error "Test preparation seed script unsuccessful: #{ error }"

# The web app partials root.
root = "#{ __dirname }/../../../public"

# The relative link source test images.
src = '../test/fixtures/data'

# The link destination.
dest = "#{ root }/data"

# Link the source images.
# Note: contrary to the Node.js API
# (http://nodejs.org/api/fs.html#fs_class_fs_stats),
# this is a proper use case for the exists method.
unless fs.existsSync(dest)
  unless fs.existsSync(root)
    throw new Error "Web app root not found: #{ root }"
  fs.symlinkSync(src, dest)
