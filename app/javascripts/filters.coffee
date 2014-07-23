filters = angular.module 'qiprofile.filters', []

filters.filter 'capitalize', ->
  (s) -> _.str.capitalize(s)

filters.filter 'moment', ->
  (s) -> moment(s).format('MM/DD/YYYY')

filters.filter 'visitDates', ->
  (sessions) ->
    sess.acquisition_date() for sess in sessions


# Clinical profile custom filters.

filters.filter 'testResult', ->
  (s) ->
  	TEST_RESULTS =
      {
        false: 'negative'
        true: 'positive'
      }
  	TEST_RESULTS[s]

filters.filter 'asPercent', ->
  (s) ->
  	s.toString().concat('%')

filters.filter 'asTumorScore', ->
  (s) ->
  	TUMOR_SCORES =
      {
        false: '0'
        true: '1'
      }
    TUMOR_SCORES[s]

filters.filter 'asReactionScore', ->
  (s) ->
  	if s > 0
  	  s.toString().concat('+')
  	else
  	  s