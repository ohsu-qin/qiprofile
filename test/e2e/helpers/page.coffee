_ = require 'lodash'

expect = require('./expect')()

Findable = require './findable'

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
class Page extends Findable
  # @param url the page request URL
  constructor: (url) ->
    # Call the Findable superclass initializer. Findable wraps
    # a node which responds to the methods element and all.
    # Thus, Finder can wrap both this Page object as well as
    # any WebElement search result.
    super this
    # Fire off the browser request.
    browser.get(url)

  # Search from the document root.
  element: element

  # Search from the document root.
  all: element.all

# Add the virtual properties.
Object.defineProperties Page.prototype,
  # @returns the title text
  title:
    get: ->
      browser.getTitle()

  # @returns the billboard text
  billboard:
    get: ->
      @text('.qi-billboard', 'h3')

  # Find the partial content. The page is loaded if and and only if
  # the return value is not null.
  #
  # @returns the qi-content WebElement holding the partial content
  content:
    get: ->
      @find('.qi-content')

  # Navigate to the home page by clicking the home button.
  #
  # @returns the home URL
  # @returns an expectation error if the home button is missing
  home:
    get: ->
      # Finds the home button.
      findButton = =>
        # The home button is the parent of the home icon.
        @find('button .glyphicon-home', '..')

      # Validates the home button.
      #
      # @returns expectation error if the button is missing
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

      findButton()
        .then(validate)
        .then(click)
        .then(pop)

  # @returns the help content
  help:
    get: ->
      @find('.qi-help').then (elt) =>
        # Help is initially hidden.
        expect(elt, 'The help element is missing').to.exist
        expect(elt.isDisplayed(), 'The help element is not initially hidden')
          .to.eventually.be.false
        # The help button is the parent of the question mark icon.
        @find("[ng-controller='HelpCtrl']").then (button) ->
          expect(button, 'The help button is missing').to.exist
          # Open the help view...
          button.click().then =>
            # ...verify that the help is displayed...
            expect(elt.isDisplayed(), 'The help element is hidden after click')
              .to.eventually.be.true
            # ...find the help text element...
            elt.find('.qi-help-text').then (content) ->
              # ...resolve to the formatted help content.
              content.getInnerHtml() if content?

  # @returns the contact information
  contactInfo:
    get: ->
      @find('.qi-contact-info').then (content) ->
        content.getInnerHtml() if content?

module.exports = Page
