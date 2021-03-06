define [], ->
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
