routes = angular.module 'qiprofile.routes', ['ngRoute']

routes.config ['$routeProvider', '$locationProvider',
  ($routeProvider, $locationProvider) ->
    $routeProvider
      .when '/quip',
        templateUrl: '/partials/subject_list.html'
        controller:  'SubjectListCtrl'
      .when '/quip/:collection/subject/:subject',
        templateUrl: '/partials/subject_detail.html'
        controller:  'SubjectDetailCtrl'
        reloadOnSearch: false
      .when '/quip/:collection/subject/:subject/session/:session',
        templateUrl: '/partials/session_detail.html'
        controller:  'SessionDetailCtrl'
        reloadOnSearch: false

    $locationProvider.html5Mode true
]
