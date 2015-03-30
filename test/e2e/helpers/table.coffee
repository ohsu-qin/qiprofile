# The Table class represents a table WebElement as the
# following properties:
# * header - the list of *th* element text values
# * body - the two-dimensional tbody cell value array
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
#    _.defaults(table, Table.prototype)
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
class Table
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
      this[field] = text(@find(By.binding(binding)))
    this

  body: ->
    @find(By.tagName('tbody')).then(mapRows)
  
  header: ->
    @findAll(By.tagName('th')).then (headings) ->
      headings.map(text)

mapRows = (body) ->
  body.findAll(By.tagName('tr')).then (rows) ->
    protractor.promise.all(rows.map(mapColumns))

mapColumns = (row) ->
  row.findAll(By.tagName('td')).then (cols) ->
    protractor.promise.all(cols.map(text))

text = (element) ->
  if element?
    element.isDisplayed().then (shown) ->
      element.getText() if shown

module.exports = Table
