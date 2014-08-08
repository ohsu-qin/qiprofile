request = require 'superagent'

module.exports = (host='localhost', port=5000) ->
  (req, res, next) ->
    # The REST server URL.
    path = "#{ host }:#{ port }#{ req.path }"
    # Send the request.
    request[req.method.toLowerCase()](path)
      .query(req.query)
      .accept('json')
      .send(req.body)
      .end (restRes) ->
        if restRes.ok
          res.json restRes.body
        else
          res.status(404).send("The requested resource
                                #{req.host}:#{port}#{req.path}
                                was not found.")
