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
src = process.env.QIPROFILE_DATA
if src
  # The web app root.
  root = "#{ __dirname }/../../../_public"
  if not fs.exists(root)
    fs.mkdir(root)
  dest = "#{ root }/data"
  fs.symlink(src, dest)
