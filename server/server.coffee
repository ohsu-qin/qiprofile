#
# The Imaging Profile Express server application.
#
express = require 'express'
http = require 'http'
path = require 'path'
mkdirp = require 'mkdirp'
net = require 'net'
fs = require 'fs'
logger = require 'express-bunyan-logger'
forever = require 'forever-monitor'
authenticate = require 'authenticate'
spawn = require './spawn'
favicon = require 'serve-favicon'
bodyParser = require 'body-parser'
serveStatic = require 'serve-static'
methodOverride = require 'method-override'
errorHandler = require 'errorhandler'

# The port assignments.
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

# The Express server.
server = express()
# Set the port.
server.set 'port', process.env.PORT or PORT
# The run environment.
env = server.get('env') or 'production'

# @returns /var/log/qiprofile.log, if it is writable,
#   ./log/qiprofile.log otherwise
defaultLogFile = ->
  try
    fd = fs.openSync('/var/log/qiprofile.log', 'w')
    fs.closeSync(fd)
    '/var/log/qiprofile.log'
  catch err
    './log/qiprofile.log'
 
# The log file is either set in the environment or defaults to
# log/qiprofile.log in the current directory.
relLogFile = server.get('log') or defaultLogFile()
logFile = path.resolve(relLogFile)
logDir = path.dirname(logFile)
mkdirp(logDir)

# If the server has the debug flag set, then the log level is debug.
# Otherwise, the log level is inferred from the environment.
if server.get('debug') or env is not 'production'
  logLevel = 'debug'
else
  logLevel = 'info'

# The logger configuration.
logConfig =
  name: 'qiprofile'
  streams: [
    level: logLevel, path: logFile
  ]

# Enable the middleware.
server.use favicon(root + '/media/favicon.ico')
server.use bodyParser.json()
server.use bodyParser.urlencoded(extended: true)
server.use methodOverride()
server.use logger(logConfig)
server.use serveStatic(root)
server.use authenticate.middleware(
  encrypt_key: 'Pa2#a'
  validate_key: 'Fir@n2e'
)

# Authenticate.
# Note: authentication is not enabled by default.
server.get '/login', (req, res) ->
  res.writeHead 200, ContentType: 'application/json'
  res.write JSON.stringify(
    'access_token': authenticate.serializeToken(req.data.client_id,
                                                req.data.user_id)
  )
  res.end

# The API route.
restUrl = process.env.QIREST_HOST or 'localhost'
server.use '/api', api(restUrl)

# Serve the static files from root.
server.get '/static/*', (req, res) ->
  path = root + req.path.replace('/static', '')
  res.sendFile path

# Serve the partial HTML files.
server.get '/partials/*', (req, res) ->
  res.sendFile "#{root}/#{req.path}.html"

# Since qiprofile is an Angular Single-Page Application,
# serve index for all quip routes. The qiprofile
# application then resolves the URL on the client
# and requests the partial.
server.get '/quip*', (req, res) ->
  res.sendFile "#{root}/index.html"

# Kludge to work around repeat requests. See the error.coffee FIXME.
lastErrorMsg = null
server.post '/error', (req, res) ->
  # Print the error.
  if req.body.message != lastErrorMsg
    console.log("Client error: #{ req.body.message }")
    console.log("See the log at #{ logFile }")
    # Log the error.
    req.log.info(req.body)
    # Send default status code 200 with a 'Logged' message.
  lastErrorMsg = req.body.message
  res.send('Logged')

# Development error handling.
if env is 'development'
  server.use errorHandler()
  server.set 'pretty', true

# The test port.
if env is 'test'
  server.set 'port', PORT_TEST

# Start MongoDB, if necessary...
spawn 'mongod', MONGODB_PORT, ->
  # ...then the REST app...
  restMode = env is 'test' ? 'development' : env
  cmd = if restMode? then "qirest --#{ restMode }" else 'qirest'
  
  spawn cmd, EVE_PORT, ->
    #...then the Express server.
    port = server.get 'port'
    http.createServer(server).listen port, ->
      env = server.settings.env
      console.log "The qiprofile server is listening on port #{port}" +
                  " in #{env} mode."

module.exports = server
