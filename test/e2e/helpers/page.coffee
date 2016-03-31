_ = require 'lodash'

expect = require('./expect')()

Findable = require './findable'

require 'coffee-errors'

require './object'


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
#   Page = require '../helpers/page'
#   class LoginPage extends Page
#     constructor: ->
#       super('/login.html')
#     ...
#   login = new LoginPage()
#   expect(login.billboard).to.eventually.equal('Login')
class Page extends Findable
  # @param url the page request URL
  # @param helpShown flag indicating whether the help box is
  #   initially shown (default false)
  constructor: (url, @helpShown=false) ->
    # Call the Findable superclass initializer. Findable wraps
    # a node which responds to the methods element and all.
    # Thus, Finder can wrap both this Page object as well as
    # any WebElement search result.
    super()
    
    # Fire off the browser request.
    browser.get(url)

  # Search from the document root.
  element: element

  # Search from the document root.
  all: element.all

  # @returns the title text
  @property title: ->
    browser.getTitle()

  # @returns the billboard text
  @property billboard: ->
    @text('.qi-billboard', 'h3')

  # Find the partial content. The page is loaded if and and only if
  # the return value is not null.
  #
  # @returns the qi-content WebElement holding the partial content
  @property content: ->
    @find('.qi-content')

  # Navigate to the home page by clicking the home button.
  #
  # @returns the home URL
  # @throws an expectation error if the home button is missing
  @property home: ->
    # @returns the Home button
    findHomeButton = =>
      # The home button is the parent of the home icon.
      @find('button .glyphicon-home', '..')

    findHomeButton().then (btn) ->
      expect(btn, 'The home button is missing').to.exist
      btn.visit()

  # @returns the help text
  @property help: ->
    # Finds the help button.
    findButton = =>
      @find("[ng-controller='HelpCtrl']")
    
    @find('.qi-help').then (helpBox) =>
      expect(helpBox, 'The help box is missing').to.exist
      # Help is initially hidden or shown, depending on the
      # helpShown property.
      state = if @helpShown then 'shown' else 'hidden'
      expect(helpBox.isDisplayed(), "The help box is initially #{ state }")
        .to.eventually.equal(@helpShown)
      findButton().then (btn) ->
        expect(btn, 'The help button is missing').to.exist
        # Open the help box...
        btn.click().then =>
          # Verify that the help is toggled.
          state = if @helpShown then 'hidden' else 'shown'
          expect(helpBox.isDisplayed(), "The help box is #{ state } after click")
            .to.eventually.not.equal(@helpShown)
          # Click again to restore the initial state.
          btn.click().then ->
            helpBox.getInnerHtml()

# The help suggestion box hyperlink constant.
Page.SUGGESTION_BOX_URL = 'http://qiprofile.idea.informer.com'

# The home page hyperlink pattern.
Page.HOME_URL_PAT = /.*\/quip\?project=QIN_Test$/

module.exports = Page
