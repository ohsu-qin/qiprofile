define ['angular'], (ng) ->
  demographics = ng.module 'qiprofile.demographics', []

  DEFAULT_VALUE = 'Not specified'
  
  # The race helper functions.
  demographics.factory 'Race', ->
    # The map of database value to display value.
    # These choices must conform to qiprofile-rest choices.RACE_CHOICES.
    CHOICES =
      White: 'White'
      Black: 'Black or African American'
      Asian: 'Asian'
      AIAN: 'American Indian or Alaska Native'
      NHOPI: 'Native Hawaiian or Other Pacific Islander'
    
    toDisplayValue: (dbValue) ->
      if dbValue?
        CHOICES[dbValue] or
          throw new ReferenceError("Race database value not recognized: #{ dbValue }")
      else
        DEFAULT_VALUE
      
  # The ethnicity helper functions.
  demographics.factory 'Ethnicity', ->
    # The map of database value to display value.
    # These choices must conform to qiprofile-rest choices.ETHNICITY_CHOICES.
    CHOICES =
      Hispanic: 'Hispanic or Latino'
      'Non-Hispanic': 'Not Hispanic or Latino'
    
    toDisplayValue: (dbValue) ->
      if dbValue?
        CHOICES[dbValue] or
          throw new ReferenceError("Ethnicity database value not recognized: #{ dbValue }")
      else
        DEFAULT_VALUE
