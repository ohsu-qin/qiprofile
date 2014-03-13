app = angular.module 'qiprofile', [
  'ngRoute', 'ui.bootstrap', 'angularCharts',
  'qiprofile.services', 'qiprofile.controllers', 'qiprofile.filters', 'qiprofile.directives'
]

app.config ['$routeProvider', '$locationProvider',
  ($routeProvider, $locationProvider) ->
    $routeProvider
      .when '/qiprofile',
        templateUrl: '/partials/subject_list.html'
        controller:  'SubjectListCtrl'
      .when '/qiprofile/:collection/subject/:subject',
        templateUrl: '/partials/subject_detail.html'
        controller:  'SubjectDetailCtrl'

    $locationProvider.html5Mode true
]
