define ['angular', 'lodash', 'moment'], (ng, _, moment) ->
  helpers = ng.module 'qiprofile.helpers', []

  helpers.factory 'Helpers', ->
    # Copies the given source detail object properties into the
    # destination object, with the following exception:
    # * fields which begin with an underscore are not copied
    #   (including the _id field)
    copyDetail: (source, dest) ->
      # Copy the detail properties into the parent object.
      srcProps = Object.getOwnPropertyNames(source)
      destProps = Object.getOwnPropertyNames(dest)
      fields = _.difference(srcProps, destProps)
      for field in fields
        if field[0] != '_'
          dest[field] = source[field]

    # If the given attribute value is a string, then this function
    # resets it to the parsed date.
    fixDate: (obj, attr) ->
      date = obj[attr]
      # Silly Javascript idiom for string type testing.
      if typeof date is 'string' or date instanceof String
        # Reset the attribute to a date.
        obj[attr] = moment(date)
