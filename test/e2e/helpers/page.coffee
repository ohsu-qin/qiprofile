_ = require 'lodash'

# The PageObject pattern (https://code.google.com/p/selenium/wiki/PageObjects)
# base class. If the Page is instantiated with an url argument, then the
# given url is visited. The Page has accessors for the common qiprofile
# layout elements, e.g. the billboard text and help alert.
#
# Example:
#   Page = require('../helpers/page')()
#   class LoginPage extends Page
#     ...
#   login = LoginPage('/login')
#   expect(login.billboard).to.equal('Login')
module.exports = ->
  # @param the parent Page or WebElement
  # @param selectors the CSS selectors
  # @returns the search target, or null if none found
  selectFrom = (parent, selectors...) ->
    # The next selector.
    next = selectors.shift()
    
    if next
      # The next element.
      try
        if parent instanceof Page
          elt = $(next)
        else
          elt = parent.$(next)
      catch error
        if error instanceof NoSuchElementError
          return null
        else
          throw error
      # If the search target exists, then continue to apply
      # the selectors until they run out. Otherwise, return
      # null.
      elt.isPresent().then (exists) ->
        if exists
          if selectors.length
            # Recurse.
            return selectFrom(elt, selectors...)
          else
            # Return the search target element.
            elt
        else
          # Not found.
          null
    else
      # No selector.
      parent

  class Page
    constructor: (url) ->
      # Fire off the browser request.
      browser.get(url)
      # The title is resolved when the page is loaded.
      @title = browser.getTitle()
      # The billboard text.
      @billboard = this.text('.qi-billboard', 'h3')
      # The help text.
      @help = this.text('.qi-help-text')

    # @param selectors the CSS selectors
    # @returns the search target WebElement, or null
    #   if none found
    select: (selectors...) ->
      selectFrom(this, selectors...)

    # @param selectors the CSS selectors
    # @returns the element HTML text, or null if the
    #   element was not found
    text: (selectors...) ->
      elt = this.select(selectors...).then (elt) ->
        if elt then elt.getText() else null
