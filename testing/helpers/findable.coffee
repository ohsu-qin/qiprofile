_ = require 'lodash'

webdriver = require 'selenium-webdriver'

expect = require('./expect')()

require './object'

# The WebElement extension for finding subelts.
class Findable
  # Finds the elt with the given search selection chain.
  # Each selector is either a Protractor By object or a search
  # condition string. The search condition string can be CSS,
  # an id or an xpath, determined as follows:
  #
  # * If the string contains a '/' or equals '..', then the
  #   string is assumed to be an xpath.
  #
  # * Otherwise, if the string starts with '#', then the search
  #   is on the id following the hash.
  #
  # * Otherwise, if the search argument starts with '.', then
  #   the search is by CSS. 
  #
  # * Otherwise, the search is by tag name.
  #
  # For example,
  #
  #     page.find('.qi-billboard', 'h3', '..')
  #
  # returns the parent of the h3 elt within the .qi-billboard
  # elt on the page.
  #
  # The ElementFinder result is extended with a find function
  # for chaining, so the above example is equivalent to:
  #
  #     page.element(By.css('.qi-billboard'))
  #       .then (bb) ->
  #         bb.element(By.tagName('h3'))
  #       .then (h3) ->
  #         h3.element(By.xpath('..'))
  #
  # @param selectors the search conditions
  # @returns a promise which resolves to the target
  #   Findable, or null if no such WebElement exists
  find: (selectors...) ->
    @_find(selectors...).then (elt) ->
      if elt? then addFindableMixin(elt) else elt
  
  # @param selectors the search conditions
  # @returns a promise which resolves to the target
  #   ElementFinder, or null if no such elt exists
  _find: (selectors...) ->
    # @param current the Findable to search from, or this
    #   Page to search from the document root
    # @param locator the protractor By object
    # @returns the result of calling *elt* on the current
    #   object with the given locator
    next = (current, locator) ->
      current.element(locator)

    # Convert the selectors to locators.
    locators = (@_locatorFor(selector) for selector in selectors)
    # Chain the selects and return a promise which adds the
    # Findable methods to the result, if it exists.
    target = locators.reduce(next, this)
    target.isPresent().then (exists) ->
      if exists then target else null
  
  # Finds the elts with the given search selection.
  # The selectors are described in the find function.
  # Unlike the find function, findAll only accepts one
  # selector argument.
  #
  # Each Findable in the array result is extended
  # with a find function for chaining.
  #
  # @param selectors the search condition
  # @returns a promise which resolves to the target
  #   Findable array
  findAll: (selectors...) ->
    elts = @_findAll(selectors...)
    # Work around the following bug:
    # * Protractor 3.x all(...).map(...) hangs after the first
    #   element is mapped. The work-around is to get the
    #   all(...).count() and get each element by index.
    # Thus, the following hangs:
    #    @_findAll(selectors...).map(addFindableMixin)
    # TODO - revisit this in 2017.
    elts.count().then (n) ->
      (addFindableMixin(elts.get(i)) for i in _.range(n))

  # @param selectors the search condition
  # @returns a promise which resolves to the target
  #   WebElement array
  _findAll: (selectors...) ->
    # @param parent the Findable to search from, or
    #   this Page to search from the document root
    # @param locator the protractor By object
    # @returns the search result WebElement array
    next = (current, locator) ->
      current.all(locator)

    # Convert the selectors to locators.
    locators = (@_locatorFor(selector) for selector in selectors)
    # Chain the search.
    locators.reduce(next, this)

  # @param selectors the search condition
  # @returns a promise which resolves to this WebElement's visible
  #   text, or null if either:
  #   * the search result does not exist
  #   * the element is not displayed
  #   * the text content is empty
  text: (selectors...) ->
    @find(selectors...)
      .then (target) ->
        if target?
          target.isDisplayed().then (shown) ->
            if shown then target else null
        else
          null
      .then (target) ->
        if target? then target.getText() else null
      .then (text) ->
        if text? and text.length then text else null

  # Clicks on this element, captures the visited URL,
  # and returns.
  #
  # @returns the visited URL
  visit: ->
    # Navigates to the previous page, if necessary.
    #
    # @param prev_url the previous location
    # @returns the URL of the page navigated from
    restore = (prev_url) ->
      # The current URL.
      browser.getCurrentUrl().then (curr_url) ->
        # If the location changed, then navigate back to
        # the previous page.
        if curr_url == prev_url
          curr_url
        else
          browser.navigate().back().then ->
            # Resolve to the page navigated from.
            curr_url

    # Capture the current location.
    browser.getCurrentUrl().then (url) =>
      url
      # Click the button and resolve to the home page.
      @click().then -> restore(url)
  
  # Finds a nested hyperlink. The hyperlink is the href
  # attribute of an anchor element (<a href=...></a>) contained
  # within this Findable's HTML.
  #
  # @param selectors the search condition
  # @returns a promise which resolves to the hyperlink URL
  hyperlink: (selectors...) ->
    selectors.push('a')
    @_find(selectors...).then (anchor) ->
      if anchor then anchor.getAttribute('href') else null

  # Finds all nested hyperlinks.
  # See the hyperlink method.
  #
  # @param selectors the search condition
  # @returns a promise which resolves to the hyperlink URLs
  hyperlinks: (selectors...) ->
    selectors.push('a')
    @_findAll(selectors...).then (anchors) ->
      anchors.map (anchor) ->
        anchor.getAttribute('href')

  # Finds the table WebElement for the given find() selector.
  # The return value is a promisr resolving to a Table object.
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
  # @param bindings the table  {field: ng-bind expression}
  #   bindings
  # @param selectors the table elt find selectors
  # @returns a promise resolving to the table WebElement
  #   with the field properties, or null if the table
  #   does not exist
  findTable: (selectors...) ->
    finder = @_find(selectors...).then (table) ->
      # Add the Table methods to the elt.
      if table? then addTableMixin(table) else table

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
  # @returns a promise resolving to the Table array
  findTables: (selectors...) ->
    @_findAll(selectors...).then (tables) ->
      # Add the Table prototype to each WebElement in the result.
      tables.map(addTableMixin)

  # @param selector the search condition
  # @returns the By locator object
  _locatorFor: (selector) ->
    # If the selector is a string, then make a By locator.
    # Otherwise, the selector is assumed to already be a
    # By locator.
    if _.isString(selector)
      # An xpath selector string has a slash or equals.
      # An id selector starts with # and doesn't have a space.
      # Anything else is assumed to be CSS.
      if selector == '..' or '/' in selector
        By.xpath(selector)
      else if selector[0] == '#' and not ' ' in selector
        By.id(selector[1..-1])
      else if selector.match('in ')
        By.repeater(selector)
      else if selector.match(/^\w[\w-]*$/)
        By.tagName(selector)
      else
        By.css(selector)
    else if selector?
      # Pass through a non-string selector.
      selector
    else
      throw new Error("The selector is not defined")


#
# Note - The Table class defined below is not defined
#   in it's own file because there is a cyclical Findable
#   dependency.
#

# The Table class represents a table WebElement with the
# following properties:
#
# * header - a promise resolving to the array of <th/>
#     WebElement text values
#
# * rows - a promise resolving to the two-dimensional
#     <tr/> x <td/> cell value array
#
# The header values can be either in a separate *thead*
# row or as the leading *th* element in each *tbody* row,
# e.g.:
#
#   <table id="t01">
#     <thead>
#       <tr>
#         <th>Name</th>
#         <th>Gender</th>
#       </tr>
#     </thead>
#     <tbody>
#       <tr>
#         <td>John</td>
#         <td>Male</td>
#       </tr>
#     </tbody>
#   </table>
#
# or:
#
#   <table id="t02">
#     <tbody>
#       <tr>
#         <th>Name</th>
#         <td>John</td>
#       </tr>
#       <tr>
#         <th>Gender</th>
#         <td>Male</td>
#       </tr>
#     </tbody>
#   </table>
#
# In the both cases, the Table *heading* resolves to
# ['Name', 'Gender']. In the first case, the Table
# *rows* resolves to [['John', 'Male]]. In the second
# case, the Table *rows* resolves to [['John'], ['Male]].
#
# If this table contains a <tbody/> subelement, then this
# property includes the rows in the first such body
# subelement. Otherwise, this methods returns all <tr/>
# rows contained in the table.
#
# Note - If there are multiple <tbody/> elements in the
#   table, only the rows of the first <tbody> are returned.
#
# Note - The rows of nested <table/> elements are returned
#   along with the parent rows.
#
# TODO - address the above two notes by adding a Table
#   subTables property for subtables and include only the
#   direct rows in a parent Table.
#
class Table extends Findable
  # Adds *field* properties to this table which resolve to the
  # the value given by the corresponding AngularJS binding
  # expression.
  #
  # @param bindings the {field: binding} object, where *binding*
  #   is the AngularJS expression to which the field element is
  #   bound
  # @returns this table WebElement
  addBindings: (bindings) ->
    for field, binding of bindings
      locator = By.binding(binding)
      this[field] = @find(locator).then (elt) ->
        if elt? then elt.text() else elt
    this

  # @returns a promise which resolves to the [[cell, ...], ...]
  #   row x column Finder array
  @property rows: ->
    # Chain the finder to preferably look for rows in a tbody tag,
    # otherwise look in the table itself.
    @find(By.tagName('tbody'))
      .then (body) ->
        # The parent element is the table child tbody, if it exists,
        # otherwise the table itself.
        if body? then body else this
      .then (parent) ->
        # Find the rows...
        parent.findAll(By.tagName('tr'))
      .then (rows) ->
        rows.map (row) ->
          # ...then find the cells...
          row.findAll(By.tagName('td'))
      .then (rows) ->
        webdriver.promise.all(rows)

  # @returns a promise which resolves to a header text array
  @property header: ->
    @findAll(By.tagName('th'))
      .then (headings) ->
        headings.map (heading) ->
          heading.text()
      .then (headings) ->
        webdriver.promise.all(headings)


#
# Findable utility functions.
#

# The following mix-ins return a new mix-in instance which
# delegates to the mixin argument, e.g.:
#   extended = addFindableMixin(result)
#   expect(extended).to.be.an.instanceOf(Findable)
#   expect(_.functionsIn(extended).to.include.members(_.functionsIn(result))
#

# @param mixin the mix-in class
# @param obj the source object
# @return an empty new mixin object which delegates to
#   the given object
addMixin = (mixin, obj) ->
  extended = _.extend(new mixin(obj), obj)
  # Work around the following bug:
  # * lodash only copies the functions defined in the superclass
  #   WebdriverWebElement of an ElementFinder. The functions defined
  #   in the ElementFinder class itself are ignored.
  #   This is a bizarre behavior that only occurs in this case and
  #   is inexplicable from inspected the lodash source code.
  # TODO - file and track a lodash bug.
  for key of obj
    if _.isUndefined(extended[key])
      extended[key] = obj[key]

  extended

# Adds Findable methods to the given WebElement.
addFindableMixin = _.partial(addMixin, Findable)

# Adds Table methods to the given WebElement.
addTableMixin = _.partial(addMixin, Table)

module.exports = Findable
