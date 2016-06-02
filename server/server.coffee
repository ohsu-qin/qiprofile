#
# The Quantitative Imaging Profile Express server application.
#
express = require 'express'
http = require 'http'
path = require 'path'
mkdirp = require 'mkdirp'
net = require 'net'
fs = require 'fs'
logger = require 'express-bunyan-logger'
authenticate = require 'authenticate'
spawn = require './spawn'
favicon = require 'serve-favicon'
bodyParser = require 'body-parser'
serveStatic = require 'serve-static'
methodOverride = require 'method-override'
errorHandler = require 'errorhandler'
watcher = require 'chokidar-socket-emitter'

# The port assignments.
PORT = 3000
PORT_TEST = PORT + 1
MONGODB_PORT = 27017
EVE_PORT = 5000

# The grunt build tasks place all compiled and copied files within
# the public directory.
root = path.join(__dirname, '..')

# The REST request handler.
rest = require './rest'

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
server.use favicon(root + '/static/media/favicon.ico')
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

# The REST API route.
restUrl = process.env.QIREST_HOST or 'localhost'
server.use '/qirest', rest(restUrl)

# # Serve the static files from root.
# server.get '/static/*', (req, res) ->
#   path = root + req.path.replace('/static', '')
#   res.sendFile path
#
# # Serve the partial HTML files.
# server.get '/partials/*', (req, res) ->
#   res.sendFile "#{root}/#{req.path}.html"
#
# # The app javascript files.
# server.get '/javascripts*', (req, res) ->
#   res.sendFile(root + req.path)
#
# # Since qiprofile is an Angular Single-Page Application,
# # serve the landing page for all qiprofile routes.
# # The qiprofile application then resolves the URL on the
# # client and requests the partial.
# # TODO - is this necessary with Angular 2?
# server.get '/qiprofile', (req, res) ->
#   res.sendFile "#{root}/index.html"


# Strip the app prefix from the request URL and serve up the
# file in the root directory.
server.get '/qiprofile(/*)?', (req, res) ->
  tail = req.path.substr('/qiprofile'.length)
  if not tail then tail = '/index.html'
  res.sendFile "#{ root }#{ tail }"

# Work around the following jspm beta bug:
#   jspm internally tries to fetch .json files by file path
#   rather than web app url, e.g.:
#      /public/lib/npm/typescript@1.8.10.json
#   rather than:
#      /javascripts/lib/npm/typescript@1.8.10.json
# The work-around is to match on public in the server
# request.
# TODO - isolate and resolve or report this bug to jspm.
# server.get '/public(/*)?', (req, res) ->
#   tail = req.path.substr('/public'.length)
#   res.sendFile "#{ root }#{ tail }"

# Kludge to work around repeat requests. See the app
# error.coffee FIXME.
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

# Callback invoked after MongoDB is started.
mongod_callback = ->
  # The REST server start mode, production or development.
  restMode = if env is 'test' then 'development' else env
  # The REST server command.
  cmd = if restMode? then "qirest --#{ restMode }" else 'qirest'
  
  # The callback after the REST server is started.
  eve_callback = ->
    # The server port.
    port = server.get 'port'
    # Make the server.
    srv = http.createServer(server)
    # The watcher hot reloads modules.
    watcher({app: srv})
    # Start the server.
    srv.listen port, ->
      env = server.settings.env
      console.log "The qiprofile server is listening on port #{ port }" +
                  " in #{ env } mode."
  
  # Start the REST app without logging to the console.
  spawn(cmd, EVE_PORT, eve_callback, {silent: true})

# Start MongoDB, if necessary, and forward to the callback.
spawn('mongod', MONGODB_PORT, mongod_callback, {silent: true})

module.exports = server
