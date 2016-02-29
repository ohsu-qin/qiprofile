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
    @_findAll(selectors...).then (target) ->
      target.map(addFindableMixin)
    
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
  
  # Finds a nested hyperlink. The hyperlink is the href
  # attribute of an anchor element (<a href=...></a>) contained
  # within this Findable's HTML.
  #
  # @param selectors the search condition
  # @returns a promise which resolves to the hyperlink URL
  hyperlink: (selectors...) ->
    @_find(selectors..., 'a').then (elt) ->
      elt.getAttribute('href')

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
# Note - it would be preferable to define the following Table
# class in it's own file, but that causes a circular require
# dependency.
#

# The Table class represents a table WebElement as the
# following properties:
#
# * header - a promise resolving to the array of *th*
#     WebElement text values
#
# * body - a promise resolving to the two-dimensional
#     tbody cell value array
#
# The body resolves to an array [[<cell promise>], ...],
# where TBD.
#
#
# The body captures the cell values if and only if they
# are contained in a *tbody* group.
#
# The header values can either be in a separate *thead*
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
# *body* resolves to [['John', 'Male]]. In the second
# case, the Table *body* resolves to [['John'], ['Male]].
#
# Example:
#  _ =  require 'lodash'
#  element(By.id('t01')).then (table) ->
#    _.assign(table, Tablelttype)
#    expect(table.header.length, 'The header count is incorrect')
#      .to.equal(1)
#    expect(table.header[1],
#           'The second column heading is incorrect')
#      .to.equal('Gender')
#    expect(table.body.length, 'The row count is incorrect')
#      .to.equal(1)
#    expect(table.body[0][1],
#           'The second column of the first row is incorrect')
#      .to.equal('Male')
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

  # Note: it would be preferable to define body and header as
  # properties consistent with Page, but usage of such a property
  # results in several cryptic errors, e.g.:
  #   TypeError: this.find is not a function
  # and:
  #   TypeError: current.element is not a function
  # Many variations on the arcane and ridiculous Javascript
  # prototype/property funhouse have not resolved this anomaly.
  
  # @returns a promise which resolves to the [[cell, ...], ...]
  #   row x column Finder array
  body: ->
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
  header: ->
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
  _.extend(new mixin(), obj)

  # Adds Findable methods to the given WebElement.
addFindableMixin = _.partial(addMixin, Findable)

# Adds Findable methods to the given WebElement.
addTableMixin = _.partial(addMixin, Table)

module.exports = Findable
