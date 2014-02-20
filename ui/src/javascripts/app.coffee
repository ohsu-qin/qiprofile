# This Angular module defines the app routes.
angular.module('qiprofile', ['qiprofileServices', 'djangoRESTResources']).config(
  '$routeProvider',
  ($routeProvider) -> $routeProvider.
		when('/qiprofile'
		     templateUrl: 'partials/subjects.html'
		     controller: SubjectListCtrl).
		when('/qiprofile/:collection/:subject'
		     templateUrl: 'partials/subject-detail.html'
		     controller: SubjectDetailCtrl).
		# If the route is invalid, then go home.
		otherwise(redirectTo: '/home')
)
