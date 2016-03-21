request = require 'superagent'

module.exports = (hostname='localhost', port=5000) ->
  # Forward the request to the REST server and handle the
  # response. This is a request end point, i.e. the next
  # middleware is not executed to further process the
  # request.
  #
  # @param httpRequest the HTTP request object
  # @param httpResponse the HTTP response object that Express
  #   sends
  # @param next the Express middleware to execute when the
  #   request is received (unused since this function is a
  #   request end point)
  (httpRequest, httpResponse, next) ->
    # The REST server URL.
    path = "#{ hostname }:#{ port }#{ httpRequest.path }"
    # Send the request to the REST server.
    # When a successful REST response is received, then parse
    # the REST response body as a JSON object.
    # If the REST request was unsuccessful, then pass on the
    # REST response error status and a message.
    method = httpRequest.method.toLowerCase()
    request[method](path)
      .query(httpRequest.query)
      .accept('json')
      .send(httpRequest.body)
      .end (error, restResponse) ->
        if restResponse.ok
          httpResponse.json restResponse.body
        else
          httpResponse.status(restResponse.status)
            .send("The requested resource #{ hostname }:#{ port }" +
                  "#{ httpRequest.path } request was unsuccessful:" +
                  " #{ restResponse.reason } (#{ restResponse.status })")
