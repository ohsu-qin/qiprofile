_ = require 'lodash'

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
class Page
  # @param selector the search condition
  # @returns the By locator object
  locatorFor = (selector) -> 
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

  # @param from the WebElement to search from, or this Page
  #   to search from the document root
  # @param selectors the search criteria
  # @returns a promise which resolves to the target
  #   ElementFinder, or null if no such element exists
  chainedSelect = (from, selectors...) ->
    # @param parent the ElementFinder to search from, or this
    #   Page to search from the document root
    # @param locator the protractor By object
    # @returns the result of calling element on the from
    #   parent with the given locator
    next = (parent, locator) ->
      parent.element(locator)

    # Convert the selectors to locators.
    locators = ((locatorFor(selector) for selector in selectors))
    # Chain the selects.
    target = _.reduce(locators, next, from)

    # Return a promise which guards the result with an existence
    # check.
    target.isPresent().then (exists) ->
      if exists then target else null
  
  # @param from the ElementArrayFinder to search from, or
  #   this Page to search from the document root
  # @param selectors the search criteria
  # @returns a promise which resolves to the target
  #   ElementFinder array
  chainedAll = (from, selectors...) ->
    # @param parent the ElementArrayFinder to search from, or
    #   this Page to search from the document root
    # @param locator the protractor By object
    # @returns the search result WebElement array
    next = (parent, locator) ->
      parent.all(locator)

    # Convert the selectors to locators.
    locators = ((locatorFor(selector) for selector in selectors))
    # Chain the search.
    _.reduce(locators, next, from)

  ## The Page functions. ##

  # @param url the page request URL
  constructor: (url) ->
    # Fire off the browser request.
    browser.get(url)

  # Search from the document root.
  element: element

  # Search from the document root.
  all: element.all

  # Finds the element with the given search selection chain.
  # Each selector is either a Protractor By object or a search
  # condition string. The search condition string can be CSS,
  # an id or an xpath, determined as follows:
  #
  # * If the string contains a '/' or equals '..', then the
  #   string is assumed to be an xpath.
  #
  # * Otherwise, if the string starts with '#' the search
  #   is on the id following the hash.
  #
  # * Otherwise, the search argument is assumed to be CSS.
  #
  # For example,
  #
  #     page.find('.qi-billboard', 'h3', '..')
  #
  # returns the parent of the h3 element within the .qi-billboard
  # element on the page.
  #
  # The ElementFinder result is extended with a find function
  # for chaining, so the above example is equivalent to:
  #
  #     page.find('.qi-billboard').find('h3').find('..')
  #
  # @param selectors the search conditions
  # @returns a promise which resolves to the target
  #   ElementFinder, or null if no such element exists
  find: (selectors...) ->
    # Chain the selects...
    chainedSelect(this, selectors...).then (target) ->
      # ...and add the search functions.
      if target?
        target.find = _.partial(chainedSelect, target)
        target.findAll = _.partial(chainedAll, target)
      # Return the result.
      target
  
  # Finds the elements with the given search selection.
  # The selectors are described in the find function.
  # Unlike the find function, findAll only accepts one
  # selector argument.
  #
  # Each ElementFinder in the array result is extended
  # with a find function for chaining.
  #
  # @param selector the search condition
  # @returns a promise which resolves to the target
  #   ElementFinder array
  findAll: (selectors...) ->
    # Chain the selects...
    chainedAll(this, selectors...).then (targets) ->
      # ...and add the search functions.
      for target in targets
        target.find = _.partial(chainedSelect, target)
        target.findAll = _.partial(chainedAll, target
        )
      # Return the result.
      targets

  # @param selectors the target search conditions
  # @returns a promise which resolves to the element's visible
  #   text, or null if the search result does not exist
  text: (selectors...) ->
    # Find the element.
    @find(selectors...).then (target) ->
      if target? then target.getText() else null

  # Finds the table WebElements for the given Page.findAll()
  # selector. The return value is an array of table promises.
  # Each table promise resolves to an object {header, body},
  # where:
  # * header is a promise which resolves to an array of table
  #   heading text value promises
  # * body is a promise which resolves to an array of row promises
  #
  # Each row promise resolves to an array of column text promises.
  #
  # If the function argument is provided, then it is applied to
  # each table cell text value promise.
  #
  # @param selector the Protractor CSS locator argument
  # @returns the table promises
  findTables: (selectors...) ->
    headings = (table) ->
      table.all(By.tagName('th'))

    rows = (table) ->
      body = table.element(By.tagName('tbody'))
      body.all(By.tagName('tr'))

    columns = (row) ->
      row.all(By.tagName('td'))

    text = (col) ->
      col.getText().then (text) ->
        text

    mapTables = (tables) ->
      mapTable = (table) ->
        mapHeader = ->
          # Return the [heading values] promise.
          hdgs = headings(table)
          hdgs.map(text)

        mapBody = ->
          mapRow = (row) ->
            # Return the [column values] promise.
            columns(row).map(text)

          # Return the [rows] promise.
          rows(table).map(mapRow)

        # Return the {header, body}
        header: mapHeader()
        body: mapBody()

      # Return the [{header, body}, ...] promise.
      tables.map(mapTable)

    # Return the [tables] promise.
    @findAll(selectors...).then(mapTables)

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
  # @throws an expectation error if the home button is missing
  home:
    get: ->
      # Finds the home button.
      findButton = =>
        # The home button is the parent of the home icon.
        @find('button .glyphicon-home', '..')

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
        @find('button .glyphicon-question-sign', '..').then (button) ->
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
