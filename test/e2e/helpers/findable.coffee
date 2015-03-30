_ = require 'lodash'

Table = require './table'

# The WebElement extension for finding subelements.
class Findable
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
    # @param current the ElementFinder to search from, or this
    #   Page to search from the document root
    # @param locator the protractor By object
    # @returns the result of calling *element* on the current
    #   object with the given locator
    next = (current, locator) ->
      current.element(locator)

    # Convert the selectors to locators.
    locators = (locatorFor(selector) for selector in selectors)
    # Chain the selects and return a promise which adds the
    # Findable methods to the result, if it exists.
    locators.reduce(next, this).then(addFindableMixin)
  
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
  #   WebElement array
  findAll: (selectors...) ->
    # @param parent the ElementArrayFinder to search from, or
    #   this Page to search from the document root
    # @param locator the protractor By object
    # @returns the search result WebElement array
    next = (current, locator) ->
      current.all(locator)

    # Convert the selectors to locators.
    locators = (locatorFor(selector) for selector in selectors)
    # Chain the search.
    locators.reduce(next, this).map (elt) ->
      # Add the Findable methods to each web element in the result.
      addFindableMixin(elt)

  # @param selectors the target search conditions
  # @returns a promise which resolves to the element's visible
  #   text, or null if the search result does not exist or the
  #   element is not displayed or the text content is empty
  text: (selectors...) ->
    @find(selectors...).then (target) ->
      if target?
        target.isDisplayed().then (shown) ->
          target.getText() if shown

  # Finds the table WebElement for the given find() selector.
  # The return value is an array of table promises.
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
  # @param selectors the table element find selectors
  # @returns a promise resolving to the table WebElement
  #   with the field properties, or null if the table
  #   does not exist
  findTable: (selectors...) ->
    @find(selectors...).then (elt) ->
      # Add the Table methods to the element.
      addTableMixin(elt) if elt?

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
    result = @findAll(selectors...).then (elts) ->
      # Add the Table methods to each web element in the result.
      elts.forEach(addTableMixin)
      # Return the table web element array.
      elts

# @param mixin a mixin class
# @returns a function which adds the given mixin methods to the
#   function argument
mixinInjector = (mixin) -> _.partialRight(_.defaults, mixin)

# Adds the Table methods to the given WebElement search result.
addTableMixin = (element) ->
  _.defaults(element, Table.prototype)

# Adds the Findable methods to the given WebElement search result.
addFindableMixin = (element) ->
  _.defaults(element, Findable.prototype)

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

module.exports = Findable
