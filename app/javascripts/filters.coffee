define ['angular', 'moment', 'underscore.string'], (ng, moment, _s) ->
  filters = ng.module 'qiprofile.filters', []

  filters.filter 'capitalize', ->
    (s) -> _s.capitalize(s)

  filters.filter 'moment', ->
    (s) -> moment(s).format('MM/DD/YYYY')

  filters.filter 'visitDates', ->
    (sessions) ->
      sess.acquisition_date() for sess in sessions
