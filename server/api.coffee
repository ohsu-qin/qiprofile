request = require 'superagent'

module.exports = (hostname='localhost', port=5000) ->
  # Forward the request to the REST server and handle the
  # response. This is a request end point, i.e. the next
  # middleware is not executed to further process the
  # request.
  #
  # @param request the HTTP request object
  # @param response the HTTP response object that Express sends
  # @param next the Express middleware to execute when the
  #   request is received (unused since this function is a
  #   request end point)
  (request, response, next) ->
    # The REST server URL.
    path = "#{ hostname }:#{ port }#{ request.path }"
    # Send the request to the REST server.
    # When a successful REST response is received, then parse
    # the REST response body as a JSON object.
    # If the REST request was unsuccessful, then pass on the
    # REST response error status and a message.
    request[request.method.toLowerCase()](path)
      .query(request.query)
      .accept('json')
      .send(request.body)
      .end (error, restResponse) ->
        if restResponse.ok
          restResponse.json restResponse.body
        else
          response.status(restResponse.status)
            .send("The requested resource #{ hostname }:#{ port }" +
                  "#{ request.path } request was unsuccessful:" +
                  " #{ restResponse.reason } (#{ restResponse.status })")
