define ['angular', 'lodash', 'moment'], (ng, _, moment) ->
  helpers = ng.module 'qiprofile.helpers', []

  helpers.factory 'ObjectHelper', ->
    # The exists implementation is defined as a local variable,
    # since it is used in the copyNonNullPublicProperties function.
    _exists = (value) ->
      typeof value != 'undefined' and value != null

    # Tests the given value for existence.
    #
    # @param value the value to test
    # @returns whether the value is neither undefined nor null
    exists: _exists

    # Copies the given source object properties into the
    # destination object, with the following exceptions:
    # * properties which begin with an underscore are not copied
    #   (including the _id field)
    # * null source property values are not copied
    #
    # @param source the copy source object
    # @param dest the copy destination object
    copyNonNullPublicProperties: (source, dest) ->
      # @param obj the object to check
      # @returns the properties which do not begin with an
      #   underscore and have a non-null value
      nonNullPublicProperties = (obj) ->
        Object.getOwnPropertyNames(obj).filter (prop) ->
          prop[0] != '_' and _exists(obj[prop])
      
      # Copy the detail properties into the parent object.
      srcProps = nonNullPublicProperties(source)
      destProps = nonNullPublicProperties(dest)
      copyProps = _.difference(srcProps, destProps)
      for prop in copyProps
        dest[prop] = source[prop]
    
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
      camelizeProperties = (obj) ->
        camelizeProperty = (obj, prop) ->
          alias = prop[0] + _.camelize(prop[1..-1])
          Object.addProperty obj, alias,
            get: -> this[prop]
            set: (value) -> this[prop] = value
        
        for key of obj
          # If the key has a non-leading underscore and is not
          # a function, then the key is an underscore property
          # name.
          if key.lastIndexOf('_') > 0 and not _.isFunction(obj.prop)
            camelizeProperty(obj, prop)
       
      obj = ng.fromJson(data)
      if '_items' in obj
        [camelizeProperties(item) for item in obj._items]
      else
        camelizeProperties(obj)
      obj


  helpers.factory 'DateHelper', ['ObjectHelper', (ObjectHelper) ->
    # Converts the input to a moment. The input can be a date string,
    # e.g. 'September 7, 1986', or the number of milliseconds since
    # the Unix Epoch (Jan 1 1970 12AM UTC).
    #
    # @param date the date integer or string
    # @returns the parsed moment date, or the input date
    #    if the input date is undefined or null
    asMoment: (date) ->
      if ObjectHelper.exists(date)
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
      if ObjectHelper.exists(date)
        # The quirky Javascript Date month is zero-based but the
        # day of month ('date' in Javascript Date's equally quirky
        # naming convention) is one-based.
        moment([date.year(), 6, 7])
      else
        date
  ]