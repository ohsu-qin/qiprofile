sharedConfig = require './karma_shared.conf'

module.exports = (config) ->
  cfg = sharedConfig(config)
  
  # end-to-end is done with the Angular scenario framework.
  cfg.frameworks = ['ng-scenario']
  
  cfg.files = cfg.files.concat [
    '_public/test/e2e/**/*.js'
  ]

  # The the web server proxy.
  cfg.proxies =
    '/': 'http://localhost:3001/'
  
  cfg.urlRoot = '/test/'

  config.set cfg
