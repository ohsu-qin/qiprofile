request = require 'superagent'

module.exports = (host='localhost', port=5000) ->
  # Forward the request to the REST server and handle the
  # response. This is a request end point, i.e. the next
  # middleware is not executed to further process the
  # request.
  #
  # @param req the HTTP request object
  # @param res the HTTP response object that Express sends
  # @param next the Express middleware to execute when the
  #   request is received (unused since this function is a
  #   request end point)
  (req, res, next) ->
    # The REST server URL.
    path = "#{ host }:#{ port }#{ req.path }"
    # Send the request to the REST server.
    # When a successful REST response is received, then parse
    # the REST response body as a JSON object.
    # If the REST request was unsuccessful, then pass on the
    # REST response error status and a message.
    request[req.method.toLowerCase()](path)
      .query(req.query)
      .accept('json')
      .send(req.body)
      .end (restRes) ->
        if restRes.ok
          res.json restRes.body
        else
          res.status(restRes.status)
            .send("The requested resource #{req.host}:#{port}#{req.path}" +
                  " was not found: #{ restRes.reason } (#{ restRes.status })")
