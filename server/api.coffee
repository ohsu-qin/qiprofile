request = require 'superagent'

module.exports = (host='localhost', port=8000) ->
  (req, res, next) ->
    # Delegate to the REST server.
    path = "#{host}:#{port}" + req.path
    request[req.method.toLowerCase()](path)
      .query(format: 'json')
      .query(req.query)
      .accept('json')
      .send(req.body)
      .end (rest_res) ->
        if rest_res.ok
          res.json rest_res.body
        else
          res.status(404)
            .send("The requested resource #{req.host}:#{port}#{req.path} was not found.")
