define ['angular', 'lodash', 'helpers', 'breast', 'sarcoma'], (ng, _) ->
  tnm = ng.module 'qiprofile.tnm', ['qiprofile.helpers', 'qiprofile.breast',
                                    'qiprofile.sarcoma']

  tnm.factory 'TNM', ['Breast', 'Sarcoma',
    (Breast, Sarcoma) ->
      # The supported helper factories.
      HELPERS =
        Breast: Breast
        Sarcoma: Sarcoma

      # @param tumorType the tumor type name, e.g. 'Breast'
      # @returns the helper factory for that tumor type
      helper = (tumorType) ->
        HELPERS[tumorType] or
          throw new ReferenceError("Unsupported tumor type: #{ tumorType }")

      # Define here for reuse below. 
      _summaryGrade = (tnm) ->
        # Calculates the cumulative grade as the sum of the component
        # tumor type factory SCORES property values.
        #
        # @param tnm the TNM object
        # @returns the cumulative grade, or null if a score is missing
        cumulativeGrade = ->
          accumulate = (sum, prop) ->
            sum + grade[prop]

          return null unless grade?
          props = helper(tnm.tumorType).Grade.SCORES
          if _.every(props, (prop) -> grade[prop]?)
            _.reduce(props, accumulate, 0)
          else
            null

        grade = tnm.grade
        if not grade?
          return null
        # The sum of the relevant grade properties.
        cGrade = cumulativeGrade()
        if not cGrade? then return null
        # The tumor type grade ranges.
        ranges = helper(tnm.tumorType).Grade.RANGES
        inRange = (range) -> cGrade in range
        index = _.findIndex(ranges, inRange)
        if index < 0
          throw new ReferenceError("Unsupported #{ tnm.tumorType }" +
                                   " cumulative grade: #{ cGrade }")

        # Return the one-based summary grade value.
        1 + index

      # @param size the size composite object
      # @returns the standard size string, e.g. 'p2b'
      # @throws Error if the tumorSize property value is missing
      formatSize: (size) ->
        sizeSuffix = ->
          inSituSuffix = (inSitu) ->
            if size.inSitu.invasiveType is 'ductal' 
              'is(DCIS)'
            else if size.inSitu.invasiveType is 'lobular'
              'is(LCIS)'
            else
              'is'

          # The size suffix can be a, b, c or is.
          # in situ (is) can be modified with the invasive
          # type (ductal or lobular).
          if size.inSitu?
            inSituSuffix(size.inSitu)
          else if size.suffix?
            size.suffix
          else
            ''

        if not size.tumorSize?
          throw new Error("The TNM tumor size is missing")
        prefix = size.prefix or ''
        suffix  = sizeSuffix()
        "#{ prefix }#{ size.tumorSize }#{ suffix }"

      # Calculates the summary grade based on the cumulative grade
      # as defined in the tumor type factory RANGES lookup table.
      #
      # @param grade the grade composite object
      # @returns the summary grade
      # @throws ReferenceError if the grade scores are not supported
      summaryGrade: _summaryGrade

      # Calculates the tumor stage for the given TNM composite
      # object.
      #
      # This function returns the cancer stage as a string
      # consisting of a digit in the range 1 to 4 optionally
      # followed by a suffix A, B or C. This facilitates
      # accurate comparison, in contrast to the roman numeral
      # grade, e.g. '1A' < '2B' , but 'IA' > 'IIB'.
      # The romanize filter can be used to display the stage
      # in the standard archaic medical format.
      #
      # @param tnm the TNM object.
      # @returns the cancer stage object
      stage: (tnm) ->
        g = _summaryGrade(tnm)
        # Delegate to the tumor type helper.
        helper(tnm.tumorType).stage(tnm, g)
  ]
