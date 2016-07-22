`import * as _ from "lodash"`
`import * as _s from "underscore.string"`

###*
 * REST utility functions.
 *
 * @module rest
 * @class RestService
 * @static
###
RestService =
  ###*
   * Formats the {where: condition} Eve REST query parameter. Each key
   * in the condition parameters is quoted. The condition value is
   * unquoted for numbers, escape-quoted otherwise. A non-numeric
   * condition value is converted to a string before being quoted.
   *
   * Examples:
   *     where({number: 2}) => {where:"{\"number: 2}"
   *
   *     where({project: QIN}) => {where:"{\"project: \"QIN\"}"
   *
   * TODO - add moment parameter date conversion.
   *
   * TODO - add object parameter embedded document conversion, e.g.:
   *   where({session: {number: 3}}) => {where:"{\"session.number\": 3}"
   *
   * @method where
   * @param params the input parameters
   * @return the REST condition query parameter
  ###
  where: (params) ->
    ###*
     * @method formatFieldCondition
     * @private
     * @param field the request field
     * @param value the request value
     * @return the formatted Eve {where: condition}
    ###
    formatFieldCondition = (field, value) ->
      if typeof value is 'number'
        condValue = value
      else
        condValue = "\"#{ value }\""
      # Return the field condition.
      "\"#{ field }\":#{ condValue }"

    # Format the field conditions.
    fieldConds = (formatFieldCondition(pair...) for pair in _.toPairs(params))
    cond = fieldConds.join(',')

    # Return the {where: condition} object.
    where: "{#{ cond }}"

  ###*
   * Formats the {field: flag} Eve REST query projection parameter.
   * The fields argument can be a single field name or an array of
   * field names.
   *
   * @method map
   * @param fields the Javascript camelCase data properties to select
   * @return the formatted Eve {projection: critierion}
  ###
  map: (fields) ->
    # The input can be a single field name.
    if _.isString(fields)
      fields = [fields]
    # Format the field name: flag entries.
    flags = fields.map (field) -> "\"#{ field }\": 1"
    criterion = flags.join(',')

    # Return the {projection: critierion} object.
    projection: "{#{ criterion }}"

  ###*
   * Formats the {field: flag} Eve REST query projection parameter.
   *
   * @method omit
   * @param fields the Javascript camelCase data properties to exclude
   * @return the formatted Eve {projection: critierion}
  ###
  omit: (fields) ->
    # Format the field name: flag entries.
    flags = fields.map (field) -> "\"#{ field }\": 0"
    critierion = flags.join(',')

    # Return the {projection: critierion} object.
    projection: "{#{ critierion }}"

  ###*
   * Parses the JSON data into a Javascript object and creates
   * camelCase property aliases for underscore property names.
   * If the input data is an array Eve REST result, signified
   * by the presence of an _items array property, then this
   * method returns an array of Javascript objects, each of
   * which is recursively transformed by this function.
   *
   * @method transformResponse
   * @param res the HTTP response object
   * @return the Javascript object
  ###
  transformResponse: (response) ->
    ###*
     * Aliases the given underscore property.
     *
     * @method camelizeProperty
     * @private
     * @param obj the input object to modify
     * @param property the input property to alias
    ###
    camelizeProperty = (obj, property) ->
      # The camelCase alias.
      alias = property[0] + _s.camelize(property.substring(1))
      # If the camelCase alias is not yet defined, then
      # create the new property.
      if _.isObject(obj) and not obj.hasOwnProperty(alias)
        # Make the camelCase property.
        Object.defineProperty obj, alias,
          enumerable: true
          get: -> obj[property]
          set: (value) -> obj[property] = value
        # Preserve the underscore property, but remove
        # it from the enumerable list.
        Object.defineProperty obj, property,
          enumerable: false
          value: obj[property]
          writable: true

    ###*
     * Aliases underscore properties with camelCase properties.
     *
     * @method camelizeProperties
     * @private
     * @param obj the input object to modify
     * @return the input object
    ###
    camelizeProperties = (obj, visited=[]) ->
      # Add camelCase aliases to underscore properties.
      # Only unvisited plain objects are aliased.
      if _.isObject(obj) and obj not in visited
        # Mark the object as visited.
        visited.push(obj)
        for key, val of obj
          # If the key has a non-leading underscore, then
          # camelize the underscore property.
          if key.lastIndexOf('_') > 0
            camelizeProperty(obj, key)
          # Recurse.
          if _.isArray(val)
            camelizeProperties(item, visited) for item in val
          else
            camelizeProperties(val, visited)

      # Return the input object.
      obj
      # End of camelizeProperties.

    # The initial parsed Javascript object.
    obj = response.json()
    # If the object is a REST array with _items, then return
    # the camelized items. Otherwise, returns the camelized
    # object.
    if obj.hasOwnProperty('_items')
      visited = []
      camelizeProperties(item, visited) for item in obj._items
    else
      camelizeProperties(obj)

`export { RestService as default }`
