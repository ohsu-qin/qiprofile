# Calls the qiprofile-rest test seed utilty.
path = require 'path'
fs = require 'fs'
exec = require('child_process').exec

script = 'from qiprofile_rest.test.helpers import seed; seed.seed()'

cmd = "python -c '#{ script }'"

exec cmd, (error) ->
  if error
    throw "Test preparation seed script unsuccessful: #{ error }"

# Link test data to _public/data.
# The source image download root directory.
src = process.env.QIPROFILE_DATA
# The web app root.
root = "#{ __dirname }/../../../_public"
# The link destination.
dest = "#{ root }/data"
if src and not fs.exists(dest)
  if not fs.exists(root)
    throw "Web app root not found: #{ root }"
  fs.symlink(src, dest)
