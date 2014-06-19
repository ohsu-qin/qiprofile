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
  # @param the parent Page or ElementFinder
  # @param selectors the By or string search conditions
  # @returns the search target ElementFinder,
  #   if it exists, null otherwise
  select = (parent, selectors...) ->
    # @param parent the parent Page or WebElement
    # @param selector the By or string search condition
    # @returns the search target ElementFinder
    selectNext = (parent, selector) ->
      # If the selector is a string, then make a By locator.
      # Otherwise, the selector is assumed to already be a
      # By locator.
      if _.isString(selector)
        # An xpath selector string has a slash or equals
        # '..'. Anything else is assumed to be CSS.
        if selector == '..' or '/' in selector
          locator = By.xpath(selector)
        else
          locator = By.css(selector)
      else
        locator = selector
      # The element function.
      if parent instanceof Page
        # Search relative to the page.
        elementFn = element
      else
        # Search relative to the parent ElementFinder.
        elementFn = parent.element
      # Find the element.
      target = elementFn(locator)
      target.isPresent().then (exists) ->
        if exists then target else null

    # The next selector.
    selector = selectors.shift()
    # If no selector, then return the parent.
    if not selector
      return parent
    # The next element.
    selectNext(parent, selector).then (target) ->
      # Recurse.
      if target
        select(target, selectors...)
      else
        null

  # @param the parent Page or WebElement
  # @param selectors the search By or string selectors
  # @returns a promise which resolves to the search target
  #   element HTML text, or null if no element was found
  text = (parent, selectors...) ->
    # Find the element
    select(parent, selectors...).then (target) ->
      if target then target.getText() else null

  class Page
    # @param url the page request URL
    constructor: (url) ->
      # Fire off the browser request.
      browser.get(url)
      
      # The title is resolved when the page is loaded.
      @title = browser.getTitle()
      
      # The billboard text.
      @billboard = this.text('.qi-billboard', 'h3')
      
    # Finds the element in the given search hierarchy.
    # Each selector is a By locator or search string.
    # The search string can be CSS or xpath. If the
    # string contains a '/' or equals '..', then the
    # string is an xpath, otherwise, it is assumed to
    # be CSS. The first selector context is the page.
    # Each successive selector context is the element
    # found by the prior selector.
    #
    # For example,
    #
    #     page.select('.qi-billboard', 'h3', '..')
    #
    # returns the parent of the h3 element within the
    # .qi-billboard element on the page.
    #
    # @param selectors the selectors
    # @returns a promise which resolves to the target search
    #   element, or null if no such element is found
    select: (selectors...) ->
      # page.select(...) delegates to select(page, ...)
      select(this, selectors...)

    # @param selectors the target search selectors
    # @returns the element HTML text, or null if the
    #   target was not found
    text: (selectors...) ->
      # page.text(...) delegates to text(page, ...)
      text(this, selectors...)
    
    # @returns the home URL
    home: () ->
    # The home button is the parent of the home icon.
     this.select('button .glyphicon-home', '..')
      .then (button) ->
        # @param the home button
        # @returns the home URL
        url = (button) ->
          # Go home...
          button.click().then ->
            # ...grab the URL...
            home_url = browser.getLocationAbsUrl()
            # ...go back...
            browser.navigate().back().then ->
              # ...and resolve to the URL.
              home_url
      
        if button then url(button) else null
    
    # @returns whether the help view has content
    hasHelp: () ->
      # The help button is the parent of the question mark icon.
      page = this
      page.select('button .glyphicon-question-sign', '..')
        .then (button) ->
          # @param the help button
          # @returns whether there is a help text parent element
          hasContent = (button) ->
            # Open the help view...
            button.click().then ->
              # ...find the element...
              page.select('.qi-main .qi-help-text').then (content) ->
                # ...close the help view...
                button.click().then ->
                  # ...and resolve to whether there is a target.
                  not not content
        
          if button then hasContent(button) else null
