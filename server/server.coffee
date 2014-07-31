#
# The Imaging Profile Express server application.
#
express = require 'express'
http = require 'http'
path = require 'path'
authenticate = require 'authenticate'

server = express()

PORT = 3000
PORT_TEST = PORT + 1

# Grunt places all compiled and copied files in the _public directory.
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

# Serve static and partial files directly.
server.get '/static/*', (req, res) ->
  path = root + req.path.replace('/static', '')
  res.sendfile path
server.get '/partials/*', (req, res) ->
  res.sendfile "#{root}/#{req.path}.html"

# Serve index for all qiprofile routes.
server.get '/quip*', (req, res) ->
  res.sendfile "#{root}/index.html"

# Development error handling.
if server.get('env') is 'development'
  server.use express.errorHandler()
  server.set 'pretty', true

# The test port.
if server.get('env') is 'test'
  server.set 'port', PORT_TEST

# Start the server.
port = server.get 'port'
http.createServer(server).listen port, ->
  env = server.settings.env
  console.log "The qiprofile server is listening on port #{port} in #{env} mode."

module.exports = server
