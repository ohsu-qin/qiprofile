# Calls the qiprofile-rest test seed utilty.
path = require 'path'
fs = require 'fs'
exec = require('child_process').exec

restHome = path.normalize(path.join(__dirname, '../../../../qiprofile-rest'))

seed = path.join(restHome, 'qiprofile_rest/test/helpers/seed.py')

fs.statSync seed, (error, stats) ->
  if error
      throw "Test preparation seed script not found: #{ seed }"

exec seed, (error) ->
  if error
    throw "Test preparation seed script unsuccessful: #{ error }"
