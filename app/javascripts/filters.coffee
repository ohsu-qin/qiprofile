filters = angular.module 'qiprofile.filters', []

filters.filter 'capitalize', () ->
  (s) -> _.str.capitalize(s)
