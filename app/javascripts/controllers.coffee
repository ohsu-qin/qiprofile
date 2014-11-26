define ['angular', 'modeling'], (ng) ->
  ctlrs = ng.module 'qiprofile.controllers', ['qiprofile.modeling']

  # The local controller helper methods.
  ctlrs.factory 'ControllerHelper', ['$location', ($location) ->
    # Resets the browser URL search parameters to include at most
    # a non-default project, since all other search parameters are
    # redundant.
    cleanBrowserUrl: (project) ->
      searchParams = {}
      if project != 'QIN'
        searchParams.project = project
      $location.search(searchParams)
  ]


  ctlrs.controller 'HomeCtrl', ['$rootScope', '$scope', '$state',
    ($rootScope, $scope, $state) ->
      $scope.goHome = () ->
        project = $rootScope.project or 'QIN'
        $state.go('quip.home', project: project)
  ]


  ctlrs.controller 'HelpCtrl', ['$rootScope', '$scope',
    ($rootScope, $scope) ->
      # Toggles the root scope showHelp flag.
      # This method and the showHelp flag are defined in the root
      # scope in order to share them with the partial template
      # home alert attribute directives.
      $rootScope.toggleHelp = ->
        $rootScope.showHelp = !$rootScope.showHelp

      # Unconditionally hide help when the location changes.
      $scope.$on '$locationChangeStart', (event, next, current) ->
        # Set the showHelp flag on the parent scope, since the
        # flag is shared with the sibling view scope.
        $rootScope.showHelp = false
  ]


  ctlrs.controller 'AccordionGroupCtrl', ['$scope',
    ($scope) ->
      # The accordion group is initially open.
      $scope.isOpen = true
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
    'ControllerHelper',
    ($rootScope, $scope, subject, ControllerHelper) ->
      # Capture the current project.
      $rootScope.project = subject.project

      # Place the subject in scope.
      $scope.subject = subject

      # If the project is the default, then remove it from the URL.
      ControllerHelper.cleanBrowserUrl($rootScope.project)
  ]


  ctlrs.controller 'SubjectModelingCtrl', ['$scope',
    ($scope) ->
      # The format button action.
      $scope.toggleModelingFormat = ->
        if $scope.modelingFormat is 'chart'
          $scope.modelingFormat = 'table'
        else if $scope.modelingFormat is 'table'
          $scope.modelingFormat = 'chart'
        else
          throw new Error "Modeling format is not recognized:" +
                          " #{ $scope.modelingFormat }"

      # The modeling format is 'chart' if the subject has
      # more than one session, 'table' otherwise.
      if $scope.subject.isMultiSession
        $scope.modelingFormat = 'chart'
      else
        $scope.modelingFormat = 'table'

      # The default modeling results index is the first.
      $scope.modelingIndex = 0
      # Place the selection modeling results array in scope.
      $scope.$watch 'modelingIndex', (modelingIndex) ->
        $scope.modeling = $scope.subject.modeling[modelingIndex]
  ]


  ctlrs.controller 'ModelingInfoCtrl', ['$scope', '$modal'
    ($scope, $modal) ->
      mdl = $scope.subject.modeling[$scope.modelingIndex]
      # The modeling info includes the source and the input properties.
      modelingInfo =



        # TODO - adapt to new data model.
        # The modeling source is determined by the subject
        # reg config or scan set.
        # If a reg source, then the source is the reg title,
        # which is 'Realigned' if only one reg,
        # or the reg algorithm e.g. 'ANTS' if only one
        # reg for the algorithm, or append index + 1 in
        # reg key order, e.g. 'ANTS 1' .


        source: mdl.source
        inputProperties: mdl.inputProperties

      # Open a modal window to display the modeling input properties.
      $scope.open = ->
        $modal.open(
          controller: 'ModelingInfoModalCtrl'
          templateUrl: '/partials/modeling-info.html'
          size: 'sm'
          resolve:
            modelingInfo: -> modelingInfo
        )
  ]


  ctlrs.controller 'ModelingInfoModalCtrl', ['$scope', '$modalInstance'
    ($scope, $modalInstance, modelingInfo) ->
      # Place the modeling input properties in scope.
      $scope.modelingInfo = modelingInfo

      # Open a modal window to display the modeling input properties.
      $scope.open = ->
        $modal.open(
          controller: 'ModelingInfoModalCtrl'
          templateUrl: 'partials/modeling-info.html'
          size: 'sm'
        )

      $scope.ok = -> $modalInstance.close()

      $scope.cancel = -> $modalInstance.dismiss('cancel')
  ]


  ctlrs.controller 'ModelingChartCtrl', ['$scope', 'Modeling',
    ($scope, Modeling) ->
      # The d3 chart configuration.
      $scope.config = Modeling.configureChart($scope.modeling.results,
                                              $scope.dataSeriesConfig)
  ]


  ## The modeling parameter controllers. ##
  #
  # Each controller is required to set the following scope variable:
  # * dataSeriesConfig - the Modeling.configureChart dataSeriesSpec
  #     argument
  #
  # Note: The modeling parameter controllers defined below somewhat abuse
  # Controller-View separation of control, since the controller places
  # formatting details like the label and color in a scope variable. This
  # is necessary evil to accomodate d3 charting. A preferable solution is
  # to specify the color in a style sheet and the data series label in a
  # transcluded partial. However, that solution appears to go against the
  # grain of d3. In general, the modeling chart partial/controller pattern
  # should not be used as an example for building a non-d3 charting
  # component.

  ctlrs.controller 'KTransCtrl', ['$scope', 'Modeling',
    ($scope, Modeling) ->
      $scope.dataSeriesConfig = Modeling.kTrans.dataSeriesConfig
  ]


  ctlrs.controller 'VeCtrl', ['$scope', 'Modeling',
    ($scope, Modeling) ->
      $scope.dataSeriesConfig = Modeling.vE.dataSeriesConfig
  ]


  ctlrs.controller 'TauICtrl', ['$scope', 'Modeling',
    ($scope, Modeling) ->
      $scope.dataSeriesConfig = Modeling.tauI.dataSeriesConfig
  ]


  ctlrs.controller 'PathologyCtrl', ['$scope',
    ($scope) ->
      $scope.pathology = $scope.encounter.pathology
  ]


  ctlrs.controller 'AssessmentCtrl', ['$scope',
    ($scope) ->
      $scope.assessment = $scope.encounter.assessment
  ]


  ctlrs.controller 'TNMCtrl', ['$scope',
    ($scope) ->
      # The parent can either be a pathology evaluation or
      # a generic evaluation outcome iterator.
      path = $scope.pathology
      $scope.tnm = if path then path.tnm else $scope.outcome 
  ]


  ctlrs.controller 'GradeCtrl', ['$scope',
    ($scope) ->
      $scope.grade = $scope.tnm.grade 
  ]


  ctlrs.controller 'HormoneReceptorCtrl', ['$scope',
    ($scope) ->
      # The parent of a generic HormoneReceptor is a
      # generic evaluation outcome iterator.
      $scope.receptorStatus = $scope.outcome
  ]


  ctlrs.controller 'EstrogenCtrl', ['$scope',
    ($scope) ->
      $scope.hormone = 'Estrogen'
      $scope.receptorStatus = $scope.pathology.estrogen
  ]


  ctlrs.controller 'ProgestrogenCtrl', ['$scope',
    ($scope) ->
      $scope.hormone = 'Progestrogen'
      $scope.receptorStatus = $scope.pathology.progestrogen
  ]


  ctlrs.controller 'SessionDetailCtrl', ['$rootScope', '$scope', '$state',
    'session', 'ControllerHelper',
    ($rootScope, $scope, $state, session, ControllerHelper) ->
      # Opens the series image display page.
      #
      # @param image the Image object
      $scope.openImage = (image) ->
        # The parent scan or registration image container.
        container = image.parent

        # The common parameters.
        params =
          project: container.session.subject.project
          subject: container.session.subject.number
          session: container.session.number
          detail: container.session.detail
          timePoint: image.timePoint

        # The target route, a prefix for now.
        route = 'quip.subject.session.scan.'
        if container._cls == 'Scan'
          params.scan = container.name
          route += 'image'
        else if container._cls == 'Registration'
          params.scan = container.scan.name
          params.registration = container.name
          route += 'registration.image'
        else
          throw new TypeError("Unsupported image container type:" +
                              " #{ container._cls }")

        # Route to the image detail page.      
        $state.go(route, params)

      # Capture the current project.
      $rootScope.project = session.subject.project
      # Place the session in the scope.
      $scope.session = session

      # If the project is the default, then remove it from the URL.
      ControllerHelper.cleanBrowserUrl($rootScope.project)
  ]


  ctlrs.controller 'ImageDetailCtrl', ['$rootScope', '$scope', 'image', 'Image'
    'ControllerHelper',
    ($rootScope, $scope, image, Image, ControllerHelper) ->
      # Capture the current project.
      $rootScope.project = image.parent.session.subject.project
      # Place the image in the scope.
      $scope.image = image
      # The names of modeling results with an overlay.
      $scope.overlayModelingNames = _.keys(image.overlays)

      # Selects the overlays for the modeling result with the given
      # name.
      #
      # @param the modeling result name
      # @throws ReferenceError if there is no modeling result by that
      #   name
      $scope.selectModelingResult = (name) ->
        $scope.overlays = image.overlays[name] or
          throw new ReferenceError("The modeling result was not found:" +
                                   " #{ name }")

      # If there is only one overlay modeling result, then set the
      # selected modeling result to that modeling result name.
      if $scope.overlayModelingNames.length == 1
        mdlResult = $scope.overlayModelingNames[0]
        $scope.selectModelingResult(mdlResult)

      # Delegate deselectOverlay to the image.
      $scope.deselectOverlay = $scope.image.deselectOverlay

      # Selects the current selected modeling result's label map object
      # for the given PK parameter property name.
      #
      # @param paramName the PK modeling parameter property name
      # @throws ReferenceError if there is no current scope modeling
      #   result or the scope modeling result does not have a label map
      #   for the given modeling parameter
      $scope.selectOverlay = (paramName) ->
        if not $scope.overlays?
          throw new ReferenceError("There is no selected modeling result")
        overlay = $scope.overlays[paramName]
        # If no such overlay, then complain.
        if not overlay?
          throw new ReferenceError("The selected modeling parameter does" +
                                   " not have an overlay: #{ paramName }")
        # Show the overlay.
        $scope.image.selectOverlay(overlay)

      # If the project is the default, then remove it from the URL.
      ControllerHelper.cleanBrowserUrl($rootScope.project)
  ]

