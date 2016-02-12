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

  # @returns the title text
  title: ->
    browser.getTitle()

  # @returns the billboard text
  billboard: ->
    @text('.qi-billboard', 'h3')

  # Find the partial content. The page is loaded if and and only if
  # the return value is not null.
  #
  # @returns the qi-content WebElement holding the partial content
  content: ->
    @find('.qi-content')

  # Navigate to the home page by clicking the home button.
  #
  # @returns the home URL
  # @throws an expectation error if the home button is missing
  home: ->
    # @returns the Home button
    findHomeButton = =>
      # The home button is the parent of the home icon.
      @find('button .glyphicon-home', '..')

    # Navigates to the previous page, if necessary.
    #
    # @param prev_url the previous location
    # @returns the page navigated from
    restore = (prev_url) ->
      # The current URL.
      browser.getLocationAbsUrl().then (curr_url) ->
        # If the location changed, then navigate back to
        # the previous page.
        if curr_url == prev_url
          curr_url
        else
          browser.navigate().back().then ->
            # Resolve to the page navigated from.
            curr_url

    findHomeButton().then (btn) ->
      expect(btn, 'The home button is missing').to.exist
      # Capture the current location.
      browser.getLocationAbsUrl().then (url) ->
        # Click the button and resolve to the home page.
        btn.click().then -> restore(url)

  # @returns the help text
  help: ->
    # Finds the help button.
    findButton = =>
      @find("[ng-controller='HelpCtrl']")
    
    @find('.qi-help').then (elt) ->
      expect(elt, 'The help element is missing').to.exist
      # Help is initially hidden.
      expect(elt.isDisplayed(), 'The help element is not initially hidden')
        .to.eventually.be.false
      findButton().then (btn) ->
        expect(btn, 'The help button is missing').to.exist
        # Open the help view...
        btn.click().then ->
          # Verify that the help is displayed.
          expect(elt.isDisplayed(), 'The help element is hidden after click')
            .to.eventually.be.true
          # Click again to hide the help.
          btn.click().then ->
            elt.getInnerHtml()

# The help suggestion box hyperlink constant.
Page.SUGGESTION_BOX_URL = 'http://qiprofile.idea.informer.com'

# The home page hyperlink pattern.
Page.HOME_URL_PAT = /.*\/quip\?project=QIN_Test$/

module.exports = Page
