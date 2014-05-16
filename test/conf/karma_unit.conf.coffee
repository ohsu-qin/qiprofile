sharedConfig = require './karma_shared.conf'

module.exports = (config) ->
  cfg = sharedConfig(config)
  cfg.files = cfg.files.concat [
    'test/unit/**/*.coffee'
  ]
  
  config.set cfg
