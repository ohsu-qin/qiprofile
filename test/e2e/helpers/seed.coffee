# Calls the qiprofile-rest test seed utilty.
path = require 'path'
fs = require 'fs'
exec = require('child_process').exec

option = 'from qiprofile_rest.test.helpers import seed; seed.seed()'

cmd = "python -c '#{ option }'"

exec cmd, (error) ->
  if error
    throw "Test preparation seed script unsuccessful: #{ error }"
