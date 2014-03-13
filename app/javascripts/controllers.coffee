ctlrs = angular.module 'qiprofile.controllers', ['qiprofile.services']

ctlrs.controller 'HelpCtrl', ['$scope',
  ($scope) ->
    $scope.$on '$locationChangeStart', (event, next, current) ->
      # Set the showHelp flag on the parent scope, since the
      # flag is shared with the sibling view scope.
      $scope.$parent.showHelp = false
]

ctlrs.controller 'SubjectListCtrl', ['$scope', 'Subjects',
  ($scope, Subjects) ->
    # Import the lodash utility library.
    _ = window._
    
    # Export the deferred subjects REST promise to the scope.
    $scope.subjects = Subjects.query()

    # When the subjects are loaded. then export the collections
    # to the scope.
    $scope.subjects.$promise.then (subjects) ->
      # The unique subject collections.
      $scope.collections = _.uniq _.map(
        $scope.subjects,
        (subject) -> subject.collection
      )
]

ctlrs.controller 'SubjectDetailCtrl', ['$scope', '$routeParams', 'SubjectDetail',
  ($scope, $routeParams, SubjectDetail) ->
    $scope.subject_detail = SubjectDetail.get()
]
