sharedConfig = require './karma_
shared.conf'

module.exports = (config) ->
  conf = sharedConfig(config)
  
  # end-to-end is done with the Angular scenario framework.
  conf.frameworks = ['ng-scenario']
  
  conf.files = conf.files.concat [
    '_public/test/e2e/**/*.js'
  ]

  # The the web server proxy.
  conf.proxies =
    '/': 'http:#localhost:3001/quip'
  
  conf.urlRoot = '/__karma__/'

  config.set conf
