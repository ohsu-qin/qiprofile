filters = angular.module 'qiprofile.filters', []

filters.filter 'capitalize', ->
  (s) -> _.str.capitalize(s)

filters.filter 'moment', ->
  (s) -> moment(s).format('MM/DD/YYYY')

filters.filter 'visitDates', ->
  (sessions) ->
    sess.acquisition_date() for sess in sessions
