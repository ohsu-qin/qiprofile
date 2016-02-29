net = require 'net'
forever = require 'forever-monitor'

# Starts the given server command if its port is not yet active.
#
# @param command the server command to spawn
# @param port the server port
# @param callback the function to call after the port is active
# @param options additional foverver-monitor Monitor options,
#   e.g. {silent: true} to suppress output 
module.exports = (command, port, callback, options={}) ->
  # @param command the execution command
  start = (command) ->
    child = new forever.Monitor([command], options)
    child.on 'exit', ->
      console.log "The #{ command } server exited."
    child.on 'error', (error) ->
      console.error "Error executing #{ command }: #{ error }."

    console.log "Starting #{ command }..."
    child.start()

  # @param port the port to ping
  # @callback the function to call if the port is active
  # @fallback the function to call if the connection is refused
  ping = (port, callback, fallback) ->
    sock = new net.Socket()
    sock.setTimeout 3000
    sock
      .on 'connect', ->
        sock.end()
        callback()
      .on 'error', (error) ->
        if error.toString().indexOf('ECONNREFUSED') != -1
          fallback()
        else
          console.error "Error connecting to port #{port}: #{ error }"
      .on 'timeout', ->
        console.error "Timeout accessing port #{port}"
      .connect port

  # Checks the port after 200 milliseconds. If the port
  # is active, then call the callback. Otherwise, check
  # back again.
  #
  # @param n the number of times to retry the connection
  checkback = (n) ->
    if n
      setTimeout(
        -> ping(port, callback, -> checkback(n - 1)),
        200)
    else
      console.error("The port #{ port } is not active.")

  # If the port is active, then call the callback.
  # Otherwise, execute the command and wait until the port
  # is active before calling the callback.
  ping port, callback, ->
    start(command)
    # Give the server roughly 3 seconds to listen on the port.
    checkback(15)
