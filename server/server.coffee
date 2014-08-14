#
# The Imaging Profile Express server application.
#
express = require 'express'
http = require 'http'
path = require 'path'
net = require 'net'
forever = require 'forever-monitor'
authenticate = require 'authenticate'
spawn = require './spawn'

server = express()

PORT = 3000
PORT_TEST = PORT + 1

MONGODB_PORT = 27017

EVE_PORT = 5000

# The grunt build tasks place all compiled and copied files within
# the _public directory.
root = path.join(__dirname, '..', '_public')

# Rewrite all server /api requests to the REST server
# on the default REST host and port.
api = require './api'

# Set the port.
server.set 'port', process.env.PORT or PORT

# Enable the middleware.
server.use express.logger('dev') if server.get('env') is 'development'
server.use express.favicon()
server.use express.json()
server.use express.urlencoded()
server.use express.methodOverride()
server.use express.static(root)
server.use authenticate.middleware(
  encrypt_key: 'Pa2#a'
  validate_key: 'Fir@n2e'
)

# Authenticate.
server.get '/login', (req, res) ->
  # TODO - Authenticate against XNAT.
  res.writeHead 200, ContentType: 'application/json'
  res.write JSON.stringify(
    'access_token': authenticate.serializeToken(req.data.client_id, req.data.user_id)
  )
  res.end

# The API route.
server.use '/api', api()

# Serve the static files from root.
server.get '/static/*', (req, res) ->
  path = root + req.path.replace('/static', '')
  res.sendfile path

  # Serve the partial HTML files.
server.get '/partials/*', (req, res) ->
  res.sendfile "#{root}/#{req.path}.html"

# Since qiprofile is an Angular Single-Page Application,
# serve index for all quip routes. The qiprofile
# application then resolves the URL on the client
# and requests the partial.
server.get '/quip*', (req, res) ->
  res.sendfile "#{root}/index.html"

# The run environment.
env = server.get('env')

# Development error handling.
if env is 'development'
  server.use express.errorHandler()
  server.set 'pretty', true

# The test port.
if env is 'test'
  server.set 'port', PORT_TEST

# Start MongoDB, if necessary...
spawn 'mongod', MONGODB_PORT, ->
  # ...then the REST app...
  cmd = if env? then "qirest --#{ env }" else 'qirest'
  spawn cmd, EVE_PORT, ->
    #...then the Express server.
    port = server.get 'port'
    http.createServer(server).listen port, ->
      env = server.settings.env
      console.log "The qiprofile server is listening on port #{port} in #{env} mode."

module.exports = server
