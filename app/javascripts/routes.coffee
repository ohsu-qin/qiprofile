routes = angular.module 'qiprofile.routes', ['ngRoute']

routes.config ['$routeProvider', '$locationProvider',
  ($routeProvider, $locationProvider) ->
    $routeProvider
      .when '/quip',
        templateUrl: '/partials/subject-list.html'
        controller:  'SubjectListCtrl'
      .when '/quip/:collection/subject/:subject',
        templateUrl: '/partials/subject-detail.html'
        controller:  'SubjectDetailCtrl'
        reloadOnSearch: false
      .when '/quip/:collection/subject/:subject/session/:session',
        templateUrl: '/partials/session-detail.html'
        controller:  'SessionDetailCtrl'
        reloadOnSearch: false
      .when '/quip/:collection/subject/:subject/session/:session/:image_container/series/:series',
        templateUrl: '/partials/series-detail.html'
        controller:  'SeriesDetailCtrl'
        reloadOnSearch: false

    $locationProvider.html5Mode true
]
