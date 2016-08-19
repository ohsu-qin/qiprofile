###*
 * Object utilities.
 *
 * @module object
 * @main object
###

`import * as _ from "lodash"`
`import * as _s from "underscore.string"`

# Define here for reuse below.
_sortValuesByKey = (obj) ->
  if obj?
    # The sorted keys.
    keys = _.keys(obj).sort()
    # Return the values sorted by key.
    (obj[key] for key in keys)
  else
    []

###*
 * The static ObjectHelper utility.
 *
 * @class ObjectHelper
 * @static
###
ObjectHelper =
  ###*
   * @method associate
   * @param key the property name
   * @param value the property value
   * @return {Object} the {key, value} object
  ###
  associate: (key, value) ->
    obj = {}
    obj[key] = value
    obj

  ###*
   * @method delegate
   * @param objects the delegate objects
   * @return a new object with properties from the given objects
  ###
  delegate: (objects...) ->
    _.reduce(objects, _.defaults, {})

  ###*
   * Pretty prints the given object in a readable format. This function
   * handles cycles by substituting an elipsis ('...') if a referenced
   * object has already been visited.
   *
   * @method prettyPrint
   * @param obj the object to print
   * @return the string representation
  ###
  prettyPrint: (obj) ->
    # Adapted from
    # http://stackoverflow.com/questions/957537/how-can-i-print-a-javascript-object
    # and
    # //http://stackoverflow.com/questions/9382167/serializing-object-that-contains-cyclic-object-value.
    visited = []
    replace = (key, val) ->
      elideCycles = (val) ->
        if _.isObject(val)

          if  _.isFunction(val) or val in visited
            '...'
          else
            visited.push(val)
            val
        else
          val

      elideCycles(val)

    JSON.stringify(obj, replace, 2)

  ###*
   * @method sortValuesByKey
   * @param obj the associative object
   * @return the concatenated values array
  ###
  sortValuesByKey: _sortValuesByKey

  ###*
   * @method collectValues
   * @param objects the objects from which to collect the values
   * @param accessor the associative object accessor callback or
   *   property name
   * @return the concatenated value objects
  ###
  collectValues: (objects, accessor) ->
    ###*
     * Concatenates the given current associative object
     * values sorted by the associative keys to the given
     * accumulator array.
     *
     * @method concatValues
     * @param accumulator the previous result array
     * @param current the current associative object
     * @return the concatenated results array
    ###
    concatValues = (accumulator, current) ->
      values = _sortValuesByKey(current)
      accumulator.concat(values)

    # The associative objects.
    assocObjs = _.map(objects, accessor)
    # Accumulate the values.
    assocObjs.reduce(concatValues, [])

  ###*
   * @method propertiesEqual
   * @param obj the first object to compare
   * @param other the second object to compare
   * @return whether both objects have the same properties and
   *   the corresponding property values are equal
  ###
  propertiesEqual: (obj, other) ->
    # Group by property name.
    props = _.unique(_.keys(obj).concat(_.keys(other)))
    pairs = ([obj[prop], other[prop]] for prop in props)
    # Return whether all value pairs are equal.
    _.every(pairs, (pair) -> pair[0] == pair[1])

  ###*
   * Aliases the source object properties which are not already
   * defined in the destination object.
   *
   * @method aliasProperties
   * @param source the copy source object
   * @param dest the copy destination object
   * @param filter an optional function that filters the
   *   properties to alias
  ###
  aliasProperties: (source, dest, filter=null) ->
    ###*
     * @method defineAlias
     * @param prop the source property to alias in the destination
    ###
    defineAlias = (prop) ->
      Object.defineProperty dest, prop,
        enumerable: true
        get: -> source[prop]
        set: (val) -> source[prop] = val

    # The properties to alias.
    srcProps = Object.getOwnPropertyNames(source)
    destProps = Object.getOwnPropertyNames(dest)
    aliasProps = _.difference(srcProps, destProps)
    if filter
      aliasProps = aliasProps.filter(filter)
    # Make the virtual properties.
    # Note: each property must be defined in a call to the defineAlias
    # function. That function body cannot be inlined in the loop below
    # since CoffeeScript defines the iteration variable prop in a scope
    # outside of the loop, which in turn implies that the alias getter
    # and setter have a function closure which refers to a shared prop
    # variable which will resolve to the last iteration value.
    for prop in aliasProps
      defineAlias(prop)

  ###*
   * Aliases the source object properties which are not already
   * defined in the destination object and satisfy thew following
   * conditions:
   * * the property name does not begin with an underscore (_)
   *   or dollar sign ($)
   * * the source property value is not a function
   *
   * @method aliasPublicDataProperties
   * @param source the copy source object
   * @param dest the copy destination object
  ###
  aliasPublicDataProperties: (source, dest) ->
    # Filters the given property to select only non-functions
    # whose names do not begin with _ or $.
    filter = (prop) ->
      prop[0] not in '_$' and not _.isFunction(source[prop])
    # Delegate to aliasProperties with the property filter.
    @aliasProperties(source, dest, filter)

  ###*
   * Parses the JSON data into a Javascript object and creates
   * camelCase property aliases for underscore property names.
   * If the input data is an array Eve REST result, signified
   * by the presence of an _items array property, then this
   * method returns an array of Javascript objects, each of
   * which is recursively transformed by this function.
   *
   * @method fromJson
   * @param data the REST JSON data
   * @return the Javascript object
  ###
  fromJson: (data) ->
    ###*
     * Aliases the given underscore property.
     *
     * @method camelizeProperty
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
    obj = JSON.parse(data)
    # If the object is a REST array with _items, then return
    # the camelized items. Otherwise, returns the camelized
    # object.
    if obj.hasOwnProperty('_items')
      visited = []
      camelizeProperties(item, visited) for item in obj._items
    else
      camelizeProperties(obj)

`export { ObjectHelper as default }`
