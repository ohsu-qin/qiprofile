###*
 * The test helper module.
 *
 * @module testing
 * @main testing
###

_ = require 'lodash'
expect = require('./expect')()
Findable = require './findable'
require 'coffee-errors'
require './object'

# The regexp to match a page that ends at home.
URL_PAT_PREFIX = "http://[-\\w]+:\\d+"


###*
 * The E2E page base encapsulation. Page folows the PageObject pattern
 * (https://code.google.com/p/selenium/wiki/PageObjects). If the Page
 * is instantiated with an url argument, then the given url is visited.
 * The Page class has accessors for the common qiprofile layout elements,
 * e.g. the title text and help pane.
 *
 * Page is intended to encapsulate structural HTML access. Extend Page
 * for each partial to be tested. Each Page accessor function should
 * validate that an element which should always be present exists,
 * but should not validate that the element content reflects the model.
 * Element content validation is the responsibility of the Mocha 'it'
 * clauses.
 *
 * @example
 *     Page = require '../testing/page'
 *     class LoginPage extends Page
 *       constructor: ->
 *         super('/login.html')
 *       ...
 *     login = new LoginPage()
 *     expect(login.title).to.eventually.equal('Login')
 *
 * @module testing
 * @class Page
 * @extends Findable
###
class Page extends Findable
  ###*
   * @method constructor
   * @param url the page request URL
   * @param helpShown flag indicating whether the help box is
   *   initially shown (default false)
  ###
  constructor: (@url, @helpShown=false) ->
    # Call the Findable superclass initializer. Findable wraps
    # a node which responds to the methods element and all.
    # Thus, Finder can wrap both this Page object as well as
    # any WebElement search result.
    super()

    # Fire off the browser request.
    browser.get(@url)

  # Search from the document root.
  element: element

  # Search from the document root.
  all: element.all

  ###*
   * @method url_pattern
   * @param url the URL without host or port
   *   (default this page's URL)
   * @return the full URL matcher
  ###
  url_pattern: (url) ->
    if not url
      url = @url
    pat_str = URL_PAT_PREFIX + url + '$'
    new RegExp(pat_str)

  # @return the title text
  @property title: ->
    browser.getTitle()

  # @return the title text
  @property title: ->
    @text('h6.qi-title', 'h3')

  # Find the partial content. The page is loaded if and and only if
  # the return value is not null.
  #
  # @return the qi-content WebElement holding the partial content
  @property content: ->
    @find('.qi-content')

  # Navigate to the home page by clicking the home button.
  #
  # @return the home URL
  # @throws an expectation error if the home button is missing
  @property home: ->
    ###*
     * @method findHomeButton
     * @return the Home button
    ###
    findHomeButton = =>
      # The home button is the parent of the home icon.
      @find('qi-home', 'button')

    findHomeButton().then (btn) ->
      expect(btn, 'The home button is missing').to.exist
      btn.visit()

  # @return the help text
  @property help: ->
    # Finds the help button.
    findButton = =>
      @find('qi-toggle-help', 'button')

    if @helpShown
      @find('.qi-help').then (helpBox) ->
        expect(helpBox, 'The help box is missing').to.exist
        helpBox.getInnerHtml()
    else
      findButton().then (btn) =>
        expect(btn, 'The help button is missing').to.exist
        # Open the help box...
        btn.click().then =>
          # Verify that the help is toggled.
          @find('.qi-help').then (helpBox) ->
            expect(helpBox, "The help box is not shown after click")
              .to.exist
            help = helpBox.getInnerHtml()
            # Click again to restore the initial state.
            btn.click().then ->
              help


# The help suggestion box hyperlink constant.
Page.SUGGESTION_BOX_URL = 'http://qiprofile.idea.informer.com'

# The landing page and app URL root.
Page.HOME = '/qiprofile/QIN_Test'

# The regexp to match a page that ends at home.
Page.HOME_URL_PAT = new RegExp(URL_PAT_PREFIX + "#{ Page.HOME }$")

module.exports = Page
