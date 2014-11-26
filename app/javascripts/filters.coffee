define ['angular', 'moment', 'underscore.string', 'roman', 'helpers',
        'demographics', 'tnm', 'image'],
  (ng, moment, _s, roman) ->
    filters = ng.module 'qiprofile.filters',
                        ['qiprofile.helpers', 'qiprofile.demographics',
                         'qiprofile.tnm', 'qiprofile.image']

    filters.filter 'capitalize', ->
      (s) -> _s.capitalize(s)


    filters.filter 'romanize', ['StringHelper', (StringHelper) ->
      # @param value the input number or string
      # @returns a string with the leading digit sequence converted
      #    to a roman numeral
      (value) ->
        value.toString().replace(/^\d+/, roman.romanize)
    ]


    filters.filter 'moment', ->
      (s) -> moment(s).format('MM/DD/YYYY')


    filters.filter 'notSpecified', ->
      # @param value the input value
      # @returns 'Not Specified' if the value is null,
      #   otherwise the input value
      (value) ->
        if value? then value else 'Not Specified'


    filters.filter 'relativeDifference', ->
      (objects, index, property=null) ->
        evaluate = (object, property) ->
          apply = (object, property) ->
            if property then object[property] else object

          props = property.split('.')
          _.reduce(props, apply, object)

        current = objects[index]
        if index
          previous = objects[index - 1]
          prevValue = evaluate(previous, property)
          currValue = evaluate(current, property)
          (currValue - prevValue) / prevValue


    filters.filter 'percent', ->
      (value) -> value * 100

    filters.filter 'imageContainerTitle', ->
      # If the image container name is 
      (value) ->
        if value.startsWith('reg')
          'Registration ' + value
        else
          _s.capitalize(value) + ' scan'

    # Returns the string representation of the given input value as follows:
    # * true => 'True'
    # * false => 'False'
    # * null or undefined => 'Not Specified'
    #
    # @param value the boolean or null input
    # @param trueStr the true conversion
    # @param falseStr the false conversion
    # @returns the string representation
    # @throws TypeError if the value is not boolean, null or undefined
    booleanFilter = (value, trueStr='True', falseStr='False') ->
      if value == true
        trueStr
      else if value == false
        falseStr
      else if not value?
        'Not Specified'
      else
        throw new TypeError("The input value is not boolean, null or" +
                            " undefined: #{ value }")

    filters.filter 'boolean', ->
      # Returns the string representation of the given input value as follows:
      # * true => 'True'
      # * false => 'False'
      # * null or undefined => 'Not Specified'
      #
      # @param value the boolean or null input
      # @returns the string representation
      # @throws TypeError if the value is not boolean, null or undefined
      (value) ->
        booleanFilter(value)


    filters.filter 'presentAbsent', ->
      # Returns the string representation of the given input value as follows:
      # * true => 'Present'
      # * false => 'Absent'
      # * null or undefined => 'Not Specified'
      #
      # @param value the boolean or null input
      # @returns the string representation
      # @throws TypeError if the value is not boolean, null or undefined
      (value) ->
        booleanFilter(value, 'Present', 'Absent')


    filters.filter 'positiveNegative', ->
      # Returns the string representation of the given input value as follows:
      # * true => 'Positive'
      # * false => 'Negative'
      # * null or undefined => 'Not Specified'
      #
      # @param value the boolean or null input
      # @returns the string representation
      # @throws TypeError if the value is not boolean, null or undefined
      (value) ->
        booleanFilter(value, 'Positive', 'Negative')


    filters.filter 'percentSign', ->
      # If there is a value, then append the percent sign to the value.
      #
      # @param value the input number
      # @returns the string with a percent sign, or null if no value
      (value) ->
        if value? then value.toString().concat('%') else value


    filters.filter 'visitDates', ->
      (sessions) ->
        sess.acquisitionDate() for sess in sessions


    filters.filter 'imageContainerTitle', ['Image', (Image) ->
      # Formats the given container display title as follows:
      # * If the container is a scan, then 'Scan' preceded by the
      #   scan name, e.g. 'T1 Scan'.
      # * If the container is a registration, then 'Registration'
      #   preceded by the source scan name and followed by the 
      #  registration name, e.g. 'T1 Registration pY3x'.
      (container) ->
        Image.containerTitle(container)
    ]

    filters.filter 'age', ['DateHelper', (DateHelper) ->
      (birthDate) ->
        # July 7 of this year.
        nowish = DateHelper.anonymize(moment())
        # The year difference from the birth date.
        nowish.diff(birthDate, 'years')
    ]


    filters.filter 'races', ['Race', (Race) ->
      (races) ->
        dspValues =
          Race.toDisplayValue(race) for race in races
        dspValues.join(', ')
    ]


    filters.filter 'ethnicity', ['Ethnicity', (Ethnicity) ->
      (ethnicity) ->
        Ethnicity.toDisplayValue(ethnicity)
    ]


    filters.filter 'tnmSize', ['TNM', (TNM) ->
      (size) ->
        TNM.formatSize(size)
    ]


    filters.filter 'tnmStage', ['TNM', (TNM) ->
      (tnm) ->
        TNM.stage(tnm)
    ]
