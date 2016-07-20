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
errorHandler = require 'express-error-handler'
watcher = require 'chokidar-socket-emitter'

# The port assignments.
PORT = 3000
PORT_TEST = PORT + 1
MONGODB_PORT = 27017
QIREST_PORT = 5000

# The grunt build tasks place all compiled and copied files within
# the public directory.
root = path.join(__dirname, '..')

# The REST request handler.
rest = require './rest'

# The Express server app.
app = express()
# Set the port.
app.set 'port', process.env.PORT or PORT
# The run environment.
env = app.get('env') or 'production'

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
relLogFile = app.get('log') or defaultLogFile()
logFile = path.resolve(relLogFile)
logDir = path.dirname(logFile)
mkdirp(logDir)

# If the server has the debug flag set, then the log level is debug.
# Otherwise, the log level is inferred from the environment.
if app.get('debug') or env is not 'production'
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
app.use favicon("#{ root }/static/media/favicon.ico")
app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: true)
app.use methodOverride()
app.use logger(logConfig)
app.use serveStatic(root)
app.use authenticate.middleware(
  encrypt_key: 'Pa2#a'
  validate_key: 'Fir@n2e'
)

# Authenticate.
# Note: authentication is not enabled by default.
app.get '/login', (req, res) ->
  res.writeHead 200, ContentType: 'application/json'
  res.write JSON.stringify(
    'access_token': authenticate.serializeToken(req.data.client_id,
                                                req.data.user_id)
  )
  res.end

# The REST API route.
restUrl = process.env.QIREST_HOST or 'localhost'
app.use '/qirest', rest(restUrl)

# Strip the app prefix from the request URL and serve up the
# file in the root directory.
app.get '/qiprofile*', (req, res) ->
  res.sendFile "#{ root }/index.html"

# TODO - enable error handling below.
# # Log the error.
# app.use (err, req, res, next) ->
#   # Print the error.
#   console.log("Server error: #{ req.body.message }")
#   console.log("See the log at #{ logFile }")
#   # Log the error.
#   req.log.info(req.body)
#   # Pass on to the error handler enabled in the Eve callback
#   # below.
#   next(err)
#
# # Nothing else responded; this must be an error.
# app.use errorHandler.httpError(404)
#
# # Enable the error handler.
# errorHandlerConfig =
#   static:
#     '404': "#{ root }/public/html/error/404.html"
# app.use errorHandler(errorHandlerConfig)
#
# # Development error handling.
# if env is 'development'
#   app.use errorHandler()
#   app.set 'pretty', true

# The test port.
if env is 'test'
  app.set 'port', PORT_TEST

# Callback invoked after MongoDB is started.
start_app = ->
  # The REST server start mode, production or development.
  restMode = if env is 'test' then 'development' else env
  # The REST server command.
  qirest = if restMode? then "qirest --#{ restMode }" else 'qirest'
  
  # The callback after the REST server is started.
  start_eve = ->
    # The server port.
    port = app.get 'port'
    # Make the server.
    server = http.createServer(app)
    # The watcher hot reloads modules.
    watcher({app: server})
    # Start the server.
    server.listen port, ->
      env = app.settings.env
      console.log "The qiprofile server is listening on port #{ port }" +
                  " in #{ env } mode."
  
  # Start the REST app without logging to the console.
  spawn(qirest, QIREST_PORT, start_eve, {silent: true})

# Start MongoDB, if necessary, and forward to the callback.
spawn('mongod', MONGODB_PORT, start_app, {silent: true})

module.exports = app
