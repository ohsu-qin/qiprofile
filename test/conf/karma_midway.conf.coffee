sharedConfig = require './karma_shared.conf'

module.exports = (config) ->
  conf = sharedConfig(config)
  
  conf.files = conf.files.concat [
    'test/midway/**/appSpec.coffee'
  ]

  # The the web server proxy.
  conf.proxies =
    '/': 'http//localhost:3001/quip/'

  config.set conf

