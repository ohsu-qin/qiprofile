define ['angular', 'lodash', 'helpers'], (ng, _) ->
  clinical = ng.module 'qiprofile.clinical', ['qiprofile.helpers']

  clinical.factory 'Clinical', ['ObjectHelper', (ObjectHelper) ->
    # Lab result categorized as positive or negative.
    POS_NEG_RESULTS =
      false: 'negative'
      true: 'positive'

    # Returns the positive/negative string result for the given boolean
    # value as follows:
    # * true -> 'positive'
    # * false -> 'negative'
    # * null -> 'unspecified'
    #
    # @param value the boolean lab value
    # @returns the corresponding string result
    # @throws TypeError if the value is neither boolean nor null
    positive_negative_result: (value) ->
      result = POS_NEG_RESULTS[value]
      if result?
        result
      else if value?
        throw new TypeError("The positive-negative result is not a boolean: #{ value }") 
      else
        'Unspecified'
  ]
