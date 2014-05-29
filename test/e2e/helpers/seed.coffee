# Calls the qiprofile-rest test seed utilty.
path = require 'path'
fs = require 'fs'
exec = require('child_process').exec

script = 'from qiprofile_rest.test.helpers import seed; seed.seed()'

# TODO - link small test image file fixtures to destination _public/data.
cmd = "python -c '#{ script }'"

exec cmd, (error) ->
  if error
    throw "Test preparation seed script unsuccessful: #{ error }"
