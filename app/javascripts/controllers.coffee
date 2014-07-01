ctlrs = angular.module 'qiprofile.controllers', ['qiprofile.services']

# The controller helper methods.
ctlrs.factory 'ControllerHelper', ['$location', ($location) ->
  # Replaces the browser URL search parameters to include at most
  # a non-default project, since all other search parameters are
  # redundant.
  cleanBrowserUrl: (project) ->
    searchParams = {}
    if project != 'QIN'
      searchParams.project = project
    $location.replace()
    $location.search(searchParams)
]


ctlrs.controller 'GoHomeCtrl', ['$rootScope', '$scope', '$state',
  ($rootScope, $scope, $state) ->
    $scope.goHome = () ->
      project = $rootScope.project or 'QIN'
      $state.go('quip.home', project: project)
]


ctlrs.controller 'HelpCtrl', ['$scope',
  ($scope) ->
    $scope.$on '$locationChangeStart', (event, next, current) ->
      # Set the showHelp flag on the parent scope, since the
      # flag is shared with the sibling view scope.
      $scope.$parent.showHelp = false
]


ctlrs.controller 'SubjectListCtrl', ['$rootScope', '$scope', 'project',
  'subjects', 'collections',
  ($rootScope, $scope, project, subjects, collections) ->
    # Capture the current project.
    $rootScope.project = project
    # Place the subjects and collections in the scope.
    $scope.subjects = subjects
    $scope.collections = collections
]


ctlrs.controller 'SubjectDetailCtrl', ['$rootScope', '$scope', 'subject',
  'detail', 'ControllerHelper', 'Chart',
  ($rootScope, $scope, subject, detail, ControllerHelper, Chart) ->
    # Capture the current project.
    $rootScope.project = subject.project

    # The format button action.
    $scope.toggleModelingFormat = ->
      if $scope.modelingFormat == 'Chart'
        $scope.modelingFormat = 'Table'
      else if $scope.modelingFormat == 'Table'
        $scope.modelingFormat ='Chart'
      else
        throw "Modeling format is not recognized: " +
          $scope.modelingFormat

    # The modeling format is 'Chart' if the subject has
    # more than one session, 'Table' otherwise
    if subject.isMultiSession
      $scope.modelingFormat = 'Chart'
    else
      $scope.modelingFormat = 'Table'

    # Place the subject in the scope.
    $scope.subject = subject

    ControllerHelper.cleanBrowserUrl(subject.project)
]


ctlrs.controller 'ClinicalProfileCtrl', ['$scope', '$stateParams',
  ($scope, $stateParams) ->
]


ctlrs.controller 'SessionDetailCtrl', ['$rootScope', '$scope',
  'session', 'detail', 'Image', 'ControllerHelper', 'Helpers',
  ($rootScope, $scope, session, detail, Image, ControllerHelper, Helpers) ->
    # Capture the current project.
    $rootScope.project = session.subject.project
    
    # Opens the series image display page.
    #
    # @param image the Image object
    $scope.openImage = (image) ->
      # TODO - Route to the image open page.
      window.alert("Image open is not yet supported.")

    # Place the session in the scope.
    $scope.session = session

    ControllerHelper.cleanBrowserUrl(session.subject.project)
]


ctlrs.controller 'SeriesDetailCtrl', ['$rootScope', '$scope', 'series',
  ($rootScope, $scope, series) ->
    # Capture the current project.
    $rootScope.project = series.session.subject.project

    # Place the series in the scope.
    $scope.series = series

    ControllerHelper.cleanBrowserUrl(series.session.subject.project)
]
