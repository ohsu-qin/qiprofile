define ['angular', 'moment', 'underscore.string', 'roman', 'helpers',
        'demographics', 'tnm', 'imageSequence'],
  (ng, moment, _s, roman) ->
    filters = ng.module 'qiprofile.filters',
                        ['qiprofile.helpers', 'qiprofile.demographics',
                         'qiprofile.tnm', 'qiprofile.imagesequence']

    filters.filter 'capitalize', ->
      (s) -> if s? then _s.capitalize(s) else s


    filters.filter 'underscore', ->
      (s) -> if s? then _s.underscored(s) else s


    filters.filter 'romanize', ['StringHelper', (StringHelper) ->
      # @param value the input number or string
      # @return a string with the leading digit sequence converted
      #    to a roman numeral
      (value) ->
        if value? then value.toString().replace(/^\d+/, roman.romanize) else value
    ]


    filters.filter 'moment', ->
      (date) ->
        # Preferably, every REST date string is already converted
        # to a moment in the router, but convert a string here just
        # in case.
        date = DateHelper.asMoment(date) if _.isString(date)
        if date? then date.format('MM/DD/YYYY') else date


    filters.filter 'notSpecified', ->
      # @param value the input value
      # @throws 'Not Specified' if the value is null,
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
      (value) -> if value? then value * 100 else value


    filters.filter 'percentRounded', ->
      (value) -> Math.round(value * 100) if value?


    filters.filter 'imageContainerTitle', ->
      # If the image sequence name ends with _reg, then it is a registation.
      # Otherwise, it is a scan.
      (value) ->
        if value.startsWith('reg')
          'Registration ' + value
        else
          _s.capitalize(value) + ' scan'

    ###*
     * Returns the string representation of the given input value as follows:
     * * true => 'True'
     * * false => 'False'
     * * null or undefined => 'Not Specified'
     *
     * @method booleanFilter
     * @param value the boolean or null input
     * @param trueStr the true conversion
     * @param falseStr the false conversion
     * @return the string representation
     * @throws TypeError if the value is not boolean, null or undefined
    ###
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
      # @return the string representation
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
      # @return the string representation
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
      # @return the string representation
      # @throws TypeError if the value is not boolean, null or undefined
      (value) ->
        booleanFilter(value, 'Positive', 'Negative')


    filters.filter 'percentSign', ->
      # If there is a value, then append the percent sign to the value.
      #
      # @param value the input number
      # @return the string with a percent sign, or null if no value
      (value) ->
        if value? then value.toString().concat('%') else value


    filters.filter 'percentRange', ->
      # If there is a percent range object, then separate the lower and
      #   upper values with an en dash.
      #
      # @param range the range object
      # @return the string representation of the percent range
      (range) ->
        if range?
          start = range.start.value.toString()
          stop = range.stop.value.toString()
          "#{ start }–#{ stop }"
        else
          range


    filters.filter 'visitDates', ->
      (sessions) ->
        sess.date() for sess in sessions


    filters.filter 'multiVolume', ->
      (imageSequences) ->
        (seq for seq in imageSequences when seq.isMultiVolume())


    filters.filter 'gender', ->
      (gender) ->
        # Expand a gender code.
        if gender is 'F'
          'Female'
        else if gender is 'M'
          'Male'
        else
          gender


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


    filters.filter 'breastRecurrenceScore', ['Breast', (Breast) ->
      (assay) ->
        Breast.recurrenceScore(assay)
    ]


    ###*
     * @method filters
     * @return [<Saggital> ][<Coronal> ]<Body Part>
    ###
    filters.filter 'sarcomaTumorLocation', ->
      # The REST histology fields.
      fields = ['saggitalLocation', 'coronalLocation', 'bodyPart']
      (histology) ->
        words = (histology[prop] for prop in fields when histology[prop])
        words.join(' ')
