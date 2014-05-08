sharedConfig = require './karma_shared.conf'

module.exports = (config) ->
  conf = sharedConfig(config)
  
  conf.files = conf.files.concat [
    'test/conf/mocha.conf.coffee'
    'test/unit/**/*
    .coffee'
  ]
  
  config.set conf
