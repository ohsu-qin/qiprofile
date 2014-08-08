define ['angular', 'lodash', 'moment'], (ng, _, moment) ->
  helpers = ng.module 'qiprofile.helpers', []

  helpers.factory 'Helpers', ->
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
        Object.keys(obj).filter (prop) -> obj[prop]? and prop[0] != '_'
      
      # Copy the detail properties into the parent object.
      srcProps = nonNullPublicProperties(source)
      destProps = nonNullPublicProperties(dest)
      copyProps = _.difference(srcProps, destProps)
      for prop in copyProps
        dest[prop] = source[prop]

    # If the value of the given property is a string, then this
    # function resets it to the parsed date.
    #
    # @param obj the object containing the date property
    # @param property the date property
    fixDate: (obj, property) ->
      date = obj[property]
      obj[property] = moment(date) if _.isString(date)
