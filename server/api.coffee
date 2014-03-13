request = require 'superagent'

module.exports = (host='localhost', port=8000) ->
  (req, res, next) ->
    # Delegate to the REST server.
    path = "#{host}:#{port}" + req.path
    request[req.method.toLowerCase()](path)
      .query(format: 'json')
      .accept('json')
      .auth('loneyf', '3nigma')
      .end (rest_res) ->
        if rest_res.ok
          res.json rest_res.body
        else
          res.status(404)
            .send("The requested resource #{req.host}:#{port}#{req.path} was not found.")
