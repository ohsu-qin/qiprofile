define ['angular'], (ng) ->
  ctlrs = ng.module 'qiprofile.controllers', []

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
      $rootScope.toggleHelp = () ->
        $rootScope.showHelp = !$rootScope.showHelp
    
      # Unconditionally hide help when the location changes.
      $scope.$on '$locationChangeStart', (event, next, current) ->
        # Set the showHelp flag on the parent scope, since the
        # flag is shared with the sibling view scope.
        $rootScope.showHelp = false
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
  
      # The format button action.
      $scope.toggleModelingFormat = ->
        if $scope.modelingFormat is 'Chart'
          $scope.modelingFormat = 'Table'
        else if $scope.modelingFormat is 'Table'
          $scope.modelingFormat ='Chart'
        else
          throw new Error "Modeling format is not recognized:" +
                          " #{ $scope.modelingFormat }"
  
      # The modeling format is 'Chart' if the subject has
      # more than one session, 'Table' otherwise.
      if subject.isMultiSession
        $scope.modelingFormat = 'Chart'
      else
        $scope.modelingFormat = 'Table'
  
      # Place the subject in scope.
      $scope.subject = subject
      
      # If the project is the default, then remove it from the URL.
      ControllerHelper.cleanBrowserUrl($rootScope.project)
  ]
  
  
  ctlrs.controller 'AccordionGroupCtrl', ['$scope',
    ($scope) ->
      # The accordion group is initially open.
      $scope.isOpen = true
  ]
  
  
  ctlrs.controller 'PathologyCtrl', ['$scope',
    ($scope) ->
      $scope.pathology = $scope.encounter.evaluation
  ]
  
  
  ctlrs.controller 'PathologyEstrogenCtrl', ['$scope',
    ($scope) ->
      $scope.receptorStatus = $scope.pathology.estrogen
  ]
  
  
  ctlrs.controller 'PathologyProgestrogenCtrl', ['$scope',
    ($scope) ->
      $scope.receptorStatus = $scope.pathology.progestrogen
  ]
  
  
  ctlrs.controller 'HormoneReceptorCtrl', ['$scope',
    ($scope) ->
      # The parent of a generic HormoneReceptor is a
      # generic evaluation outcome iterator.
      $scope.receptorStatus = $scope.outcome
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


  ctlrs.controller 'EvaluationCtrl', ['$scope',
    ($scope) ->
      $scope.evaluation = $scope.encounter.evaluation
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
      $scope.overlayModelingResults = _.keys(image.overlays)
      
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
      if $scope.overlayModelingResults.length == 1
        mdlResult = $scope.overlayModelingResults[0]
        $scope.selectModelingResult(mdlResult.name)

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

