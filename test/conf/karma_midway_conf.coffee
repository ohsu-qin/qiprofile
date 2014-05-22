sharedConfig = require './karma_shared_conf'

module.exports = (config) ->
  cfg = sharedConfig()
  
  cfg.files = cfg.files.concat ['test/midway/**/*Spec.coffee']

  # The test server proxy.
  cfg.proxies =
    '/': 'http://localhost:3001/'

  cfg.urlRoot = '/test/'
  
  config.set cfg

