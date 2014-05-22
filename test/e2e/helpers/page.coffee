# The PageObject pattern (https://code.google.com/p/selenium/wiki/PageObjects)
# base class. If the Page is instantiated with an url argument, then the
# given url is visited.
#
# Example:
#   Page = require('../helpers/page')()
#   class LoginPage extends Page
#     ...
#   login = LoginPage('/login')
#   expect(login.title).to.equal('Login')
module.exports = ->
  class Page
    constructor: (url) ->
      if url
        browser.get(url)
  
    title: ->
      browser.getTitle()

    help: ->
      elt = element(`by`.css('qi-help-text'))
      elt and elt.getText()
