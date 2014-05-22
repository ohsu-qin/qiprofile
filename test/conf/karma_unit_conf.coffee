sharedConfig = require './karma_shared_conf'

module.exports = (config) ->
  cfg = sharedConfig()
  
  cfg.files = cfg.files.concat ['test/unit/**/*Spec.coffee']
  
  config.set cfg
