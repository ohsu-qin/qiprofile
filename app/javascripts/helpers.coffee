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
    # @return the lowercase dashed conversion
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
  
  helpers.factory 'ArrayHelper', ->
    # This function stands in for the missing lodash v2.4.1 findIndex function.
    #
    # TODO - replace with lodash findIndex when a lodash update includes the
    # function. 
    findIndex: (array, callback=_.identity) ->
      for item, i in array
        if callback(item, i, array) then return i
      -1

  
  helpers.factory 'ObjectHelper', ->
    # Pretty prints the given object in a readable format.
    #
    # @param obj the object to print
    # @returns the string representation
    prettyPrint: (obj) ->
      # Stolen from
      # http://stackoverflow.com/questions/957537/how-can-i-print-a-javascript-object.
      JSON.stringify(obj, null, 4)
    
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
      # since Coffeescript defines the iteration variable prop in a scope
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
      this.aliasProperties(source, dest, filter)
    
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
      # Aliases underscore properties with camelCase properties. 
      #
      # @param obj the input object to modify
      # @returns the input object
      camelizeProperties = (obj, visited={}) ->
        camelizeProperty = (obj, prop) ->
          # The camelCase alias.
          alias = prop[0] + _s.camelize(prop.substring(1))
          # If the camelCase alias is not yet defined, then
          # create the new property.
          if not obj.hasOwnProperty(alias)
            # Make the camelCase property.
            Object.defineProperty obj, alias,
              enumerable: true
              get: -> obj[prop]
              set: (value) -> obj[prop] = value
            obj[alias] = obj[prop]
            # Preserve the underscore property, but remove
            # it from the enumerable list.
            Object.defineProperty obj, prop,
              enumerable: false
              value: obj[prop]
              writable: true
        
        # Only unvisited plain objects are wrapped.
        if obj and obj.constructor is Object and not visited[obj._id]
          # If the object has an id, then mark it as visited.
          visited[obj._id] = true if obj._id
          # Add camelCase aliases to underscore properties.
          for key of obj
            # If the key has a non-leading underscore, then
            # camelize the underscore property.
            if key.lastIndexOf('_') > 0
              camelizeProperty(obj, key)
            # Recurse.
            val = obj[key]
            if _.isArray(val)
              camelizeProperties(item, visited) for item in val
            else
              camelizeProperties(val, visited)
        # Return the input object.
        obj

      # The initial parsed Javascript object.
      obj = ng.fromJson(data)
      # If the object is a REST array with _items, then return
      # the camelized items. Otherwise, returns the camelized
      # object.
      if obj.hasOwnProperty('_items')
        camelizeProperties(item) for item in obj._items
      else
        camelizeProperties(obj)


  helpers.factory 'DateHelper', ['ObjectHelper', (ObjectHelper) ->
    # Converts the input to a moment. The input can be a date string,
    # e.g. 'September 7, 1986', or the number of milliseconds since
    # the Unix Epoch (Jan 1 1970 12AM UTC).
    #
    # @param date the date integer or string
    # @returns the parsed moment date, or the input date
    #    if the input date is undefined or null
    asMoment: (date) ->
      if date?
        moment(date)
      else
        date

    # Anonymizes the given date by changing the month and
    # the day of the month to 7, i.e. July 7.
    #
    # @param date the date to anonymize
    # @returns the new anonymized date, or the input date
    #    if the input date is undefined or null
    anonymize: (date) ->
      if date?
        # The quirky Javascript Date month is zero-based but the
        # day of month ('date' in Javascript Date's equally quirky
        # naming convention) is one-based.
        moment([date.year(), 6, 7])
      else
        date
  ]