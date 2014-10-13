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
  class Page
    # @param url the page request URL
    constructor: (url) ->
      # Fire off the browser request.
      browser.get(url)
      
      # The title is resolved when the page is loaded.
      @title = browser.getTitle()
      
      # The billboard text.
      @billboard = @text('.qi-billboard', 'h3')
      
    # Finds the element with the given search selection chain.
    # Each selector is a By locator or search string. The search
    # string can be CSS or xpath. If the string contains a '/' or
    # equals '..', then the string is assumed to be an xpath,
    # otherwise, it is assumed to be CSS.
    #
    # For example,
    #
    #     page.select('.qi-billboard', 'h3', '..')
    #
    # returns the parent of the h3 element within the .qi-billboard
    # element on the page.
    #
    # @param selectors the selectors
    # @returns a promise which resolves to the target
    #   ElementFinder, or null if no such element exists
    select: (selectors...) ->
      # @param selectors the search chain conditions
      # @returns the By locator object
      locator = (selector) -> 
        # If the selector is a string, then make a By locator.
        # Otherwise, the selector is assumed to already be a
        # By locator.
        if _.isString(selector)
          # An xpath selector string has a slash or equals.
          # An id selector starts with # and doesn't have a space.
          # Anything else is assumed to be CSS.
          if selector is '..' or '/' in selector
            By.xpath(selector)
          else if selector[0] is '#' and not ' ' in selector
            By.id(selector[1..-1])
          else
            By.css(selector)
        else
          selector

      # @param parent the ElementFinder wrapper to search, or
      #   null if no parent
      # @param locator the protractor By object
      # @returns the result of calling element on the locator
      #   relative to the given parent finder
      find = (parent, locator) ->
        parent.element(locator)

      # Convert the selectors to locators.
      locators = ((locator(selector) for selector in selectors))
      # The initial locator.
      locator = locators.shift()
      # The initial ElementFinder.
      finder = element(locator)
      # Chain the selects.
      target = _.reduce(locators, find, finder)
      
      # Return a promise which guards the result with an
      # existence check.
      target.isPresent().then (exists) ->
        if exists then target else null

    # @param selectors the target search selectors
    # @returns a promise which resolves to the element's visible
    #   text, or null if the search result does not exist
    text: (selectors...) ->
      # Find the element.
      @select(selectors...).then (target) ->
        if target? then target.getText() else null
    
    # Navigate to the home page by clicking the home button.
    #
    # @returns the home URL
    # @throws an expectation error if the home button is missing
    home: () ->
      # Finds the home button.
      find = =>
        # The home button is the parent of the home icon.
        @select('button .glyphicon-home', '..')
      
      # Validates the home button.
      #
      # @throws expectation error if the button is missing
      validate = (button) ->
        expect(button, 'The home button is missing').to.exist
        button
      
      # Clicks the given button.
      click = (button) ->
        button.click()

      # Navigates to the previous page.
      #
      # @returns the page navigated from
      pop = ->
        # Grab the URL.
        home_url = browser.getLocationAbsUrl()
        # Go back.
        browser.navigate().back().then ->
          # Resolve to the URL.
          home_url
      
      find()
        .then(validate)
        .then(click)
        .then(pop)
    
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
