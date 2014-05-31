_ = require 'lodash'

_.str = require 'underscore.string'

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
    # @param parent the parent Page or WebElement
    # @param selector the By locator or css search string
    # @returns the WebElement search target
    find = (parent, selector) ->
      # If the selector is a string, then make a By locator.
      # Otherwise, the selector is assumed to already be a
      # By locator.
      if _.isString(selector)
        locator = By.css(selector)
      else
        locator = selector
      # The finder function.
      if parent instanceof Page
        finder = element
      else
        finder = parent.element
      # Find the element.
      finder(locator)

    # The next selector.
    next = selectors.shift()
    # If no selector, then the target is trivially the parent.
    if not next
      return parent
    # The next element.
    elt = find(parent, next)
    # If the search target exists, then continue to apply
    # the selectors until they run out.
    elt.isPresent().then (exists) ->
      if exists
        if selectors.length
          # Recurse.
          selectFrom(elt, selectors...)
        else
          # Return the search target element.
          elt
      else
        # No such element.
        null

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
