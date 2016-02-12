define ['angular', 'lodash', 'underscore.string', 'moment'], (ng, _, _s, moment) ->
  helpers = ng.module 'qiprofile.helpers', []

  helpers.factory 'StringHelper', ->
    # Improves on underscore.string dasherize by converting each
    # sequence of two or more capital letters to lowercase without
    # dashes, e.g.:
    #     StringHelper.dasherize('TNM')
    # returns 'tnm' rather than the underscore.string result '-t-n-m'.
    # 
    # @param s the input string
    # @returns the lowercase dashed conversion
    dasherize: (s) ->
      # Prepares the given match for underscore.string dasherize.
      prep = (match) ->
        first = match[0]
        rest = match.substring(1)
        last = match[match.length - 1]
        if last == last.toUpperCase()
          first + rest.toLowerCase()
        else
          first + rest[...-2].toLowerCase() + rest[-2..]

      # Prepare the input string.
      prepped = s.replace(/[A-Z]{2,}.?/g, prep)
      # Delegate to underscore.string.
      sdashed = _s.dasherize(prepped)
      # Remove a bogus leading dash, if necessary.
      if sdashed[0] == '-' and s[0] != '-'
        sdashed.substring(1)
      else
        sdashed

  helpers.factory 'ObjectHelper', ->
    # Define here for reuse below. 
    _sortValuesByKey = (obj) ->
      if obj?
        # The sorted keys.
        keys = _.keys(obj).sort()
        # Return the values sorted by key.
        (obj[key] for key in keys)
      else
        []
    
    # @param key the property name
    # @param value the property value
    # @returns the {key, value} object
    associate: (key, value) ->
      obj = {}
      obj[key] = value
      obj

    # @param objects the delegate objects
    # @returns a new object with properties from the given objects
    delegate: (objects...) ->
      _.reduce(objects, _.defaults, {})

    # Pretty prints the given object in a readable format. This function
    # handles cycles by substituting an elipsis ('...') if a referenced
    # object has already been visited.
    #
    # @param obj the object to print
    # @returns the string representation
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

    # @param obj the associative object
    # @returns the concatenated values array
    sortValuesByKey: _sortValuesByKey
    
    # @param objects the objects from which to collect the values
    # @param accessor the associative object accessor callback or
    #   property name
    # @returns the concatenated value objects
    collectValues: (objects, accessor) ->
      # Concatenates the given current associative object
      # values sorted by the associative keys to the given
      # accumulator array.
      # 
      # @param accumulator the previous result array
      # @param current the current associative object
      # @returns the concatenated results array
      concatValues = (accumulator, current) ->
        values = _sortValuesByKey(current)
        accumulator.concat(values)

      # The associative objects.
      assocObjs = _.map(objects, accessor)
      # Accumulate the values.
      assocObjs.reduce(concatValues, [])

    # @param obj the first object to compare
    # @param other the second object to compare
    # @returns whether both objects have the same properties and
    #   the corresponding property values are equal
    propertiesEqual: (obj, other) ->
      # Group by property name.
      props = _.unique(_.keys(obj).concat(_.keys(other)))
      pairs = ([obj[prop], other[prop]] for prop in props)
      # Return whether all value pairs are equal.
      _.every(pairs, (pair) -> pair[0] == pair[1])

    # Aliases the source object properties which are not already
    # defined in the destination object.
    #
    # @param source the copy source object
    # @param dest the copy destination object
    # @param filter an optional function that filters the
    #   properties to alias
    aliasProperties: (source, dest, filter=null) ->
      # @param prop the source property to alias in the destination
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

    # Aliases the source object properties which are not already
    # defined in the destination object and satisfy thew following
    # conditions:
    # * the property name does not begin with an underscore (_)
    #   or dollar sign ($)
    # * the source property value is not a function
    #
    # @param source the copy source object
    # @param dest the copy destination object
    aliasPublicDataProperties: (source, dest) ->
      # Filters the given property to select only non-functions
      # whose names do not begin with _ or $.
      filter = (prop) ->
        prop[0] not in '_$' and not _.isFunction(source[prop])
      # Delegate to aliasProperties with the property filter.
      @aliasProperties(source, dest, filter)

    # Parses the JSON data into a Javascript object and creates
    # camelCase property aliases for underscore property names.
    # If the input data is an array Eve REST result, signified
    # by the presence of an _items array property, then this
    # method returns an array of Javascript objects, each of
    # which is recursively transformed by this function.
    #
    # @param data the REST JSON data
    # @returns the Javascript object
    fromJson: (data) ->
      # Aliases the given underscore property. 
      #
      # @param obj the input object to modify
      # @param property the input property to alias
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

      # Aliases underscore properties with camelCase properties. 
      #
      # @param obj the input object to modify
      # @returns the input object
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
      obj = ng.fromJson(data)
      # If the object is a REST array with _items, then return
      # the camelized items. Otherwise, returns the camelized
      # object.
      if obj.hasOwnProperty('_items')
        visited = []
        camelizeProperties(item, visited) for item in obj._items
      else
        camelizeProperties(obj)


  helpers.factory 'DateHelper', ['ObjectHelper', (ObjectHelper) ->
    # Converts the input to a moment. The input can be a date string,
    # e.g. '07 Sep 1986', or the number of milliseconds since
    # the Unix Epoch (Jan 1 1970 12AM UTC).
    #
    # A string input must contain the date in the format
    # DD MMM YYYY, e.g. 'Tue, 03 Feb 2012 00:00:00 GMT'.
    # Otherwise, an error is thrown. Note that the time in
    # the example input is ignored.
    #
    # @param date the date integer or string
    # @returns the parsed moment date, or the input date
    #    if the input date is undefined or null
    asMoment: (date) ->
      if date?
        if _.isString(date)
          match = /(\d{2}) ([A-Z][a-z]{2}) (\d{4})/.exec(date)
          if match
            moment(match[1..3].join(' '), 'DD MMM YYYY')
          else
            throw new Error("Input string does not contain a date" +
                            " formatted as DD MMM YYYY: #{ date }")
        else
          moment(date)
      else
        date

    # Anonymizes the given date by changing the month and day to
    # July 7.
    #
    # @param date the date to anonymize
    # @returns the new anonymized date, or undefined
    #    if the input date is undefined or null
    anonymize: (date) ->
      # The quirky Javascript Date month is zero-based but the
      # day of month ('date' in Javascript Date's equally quirky
      # naming convention) is one-based.
      if date?
        moment([date.year(), 6, 7])
      else
        date
  ]