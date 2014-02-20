# The REST server resides on this.
url_base = $location.host() + ':8001'

Subject = djResource(':/subject')

# Main application view
exports.index = (req, res) ->
	res.render('index')
