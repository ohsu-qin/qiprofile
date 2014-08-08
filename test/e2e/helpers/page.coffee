_ = require 'lodash'

_.str = require 'underscore.string'

expect = require('./expect')()

# Page is the PageObject pattern
# (https://code.google.com/p/selenium/wiki/PageObjects)
# base class. If the Page is instantiated with an url argument,
# then the given url is visited. The Page class has accessors for
# the common qiprofile layout elements, e.g. the billboard text and
# help alert.
#
# Page is intended to encapsulate structural HTML access. Extend Page
# for each partial to be tested. Each Page accessor function should
# validate that an element which should always be present exists,
# but should not validate that the element content reflects the model.
# Element content validation is the responsibility of the Mocha 'it'
# clauses.
#
# Example:
#   Page = require('../helpers/page')()
#   class LoginPage extends Page
#     ...
#   login = LoginPage('/login')
#   expect(login.billboard).to.evantually.equal('Login')
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
        # An xpath selector string has a slash or equals.
        # An id selector starts with # and doesn't have a space.
        # Anything else is assumed to be CSS.
        if selector is '..' or '/' in selector
          locator = By.xpath(selector)
        else if selector[0] is '#' and not ' ' in selector
          locator = By.id(selector[1..-1])
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
      # in this module's outer scope.
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
      @select('button .glyphicon-home', '..').then (button) =>
        expect(button, 'The home button is missing').to.exist
        # Go home...
        button.click().then =>
          # ...grab the URL...
          home_url = browser.getLocationAbsUrl()
          # ...go back...
          browser.navigate().back().then ->
            # ...and resolve to the URL.
            home_url
    
    # @returns whether the help view has content
    help: () ->
      @select('.qi-help').then (block) =>
        # Help is initially hidden.
        expect(block.isDisplayed(), 'The help element is not initially hidden')
          .to.eventually.be.false
        # The help button is the parent of the question mark icon.
        @select('button .glyphicon-question-sign', '..').then (button) =>
          expect(button, 'The help button is missing').to.exist
          # Open the help view...
          button.click().then =>
            # ...verify that the help is displayed...
            expect(block.isDisplayed(), 'The help element is hidden after click')
              .to.eventually.be.true
            # ...find the element...
            @select('.qi-main .qi-help-text').then (content) =>
              # ...resolve to the formatted help content.
              content.getInnerHtml()
