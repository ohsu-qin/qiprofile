define ['angular', 'moment', 'underscore.string', 'helpers', 'demographics'], (ng, moment, _s) ->
  filters = ng.module 'qiprofile.filters', ['qiprofile.helpers', 'qiprofile.demographics']

  filters.filter 'capitalize', ->
    (s) -> _s.capitalize(s)

  filters.filter 'moment', ->
    (s) -> moment(s).format('MM/DD/YYYY')

  filters.filter 'visitDates', ->
    (sessions) ->
      sess.acquisitionDate() for sess in sessions

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
