define ['angular', 'modeling', 'breast'], (ng) ->
  ctlrs = ng.module 'qiprofile.controllers',
                    ['qiprofile.modeling', 'qiprofile.resources', 'qiprofile.breast']

  # The local controller helper methods.
  ctlrs.factory 'ControllerHelper', [
    '$location',
    ($location) ->
      # Resets the browser URL search parameters to include at most
      # a non-default project, since all other search parameters are
      # redundant.
      cleanBrowserUrl: (project) ->
        searchParams = {}
        if project != 'QIN'
          searchParams.project = project
        $location.search(searchParams)
  ]


  ctlrs.controller 'HomeCtrl', [
    '$rootScope', '$scope', '$state',
    ($rootScope, $scope, $state) ->
      $scope.goHome = () ->
        project = $rootScope.project or 'QIN'
        $state.go('quip.home', project: project)
  ]


  ctlrs.controller 'HelpCtrl', [
    '$rootScope', '$scope',
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


  ctlrs.controller 'AccordionGroupCtrl', [
    '$scope',
    ($scope) ->
      # The accordion group is initially open.
      $scope.isOpen = true
  ]


  ctlrs.controller 'SubjectListCtrl', [
    '$rootScope', '$scope', 'project', 'subjects', 'collections',
    ($rootScope, $scope, project, subjects, collections) ->
      # Capture the current project.
      $rootScope.project = project
      # Place the subjects and collections in the scope.
      $scope.subjects = subjects
      $scope.collections = collections
  ]


  ## The Subject Detail page controllers.

  ctlrs.controller 'SubjectDetailCtrl', [
    '$rootScope', '$scope', 'subject', 'ControllerHelper',
    ($rootScope, $scope, subject, ControllerHelper) ->
      # Capture the current project.
      $rootScope.project = subject.project
      # Place the subject in scope.
      $scope.subject = subject
      # If the project is the default, then remove it from the URL.
      ControllerHelper.cleanBrowserUrl($rootScope.project)
  ]


  ctlrs.controller 'ScanVolumeSelectCtrl', [
    '$scope',
    ($scope) ->
      # Place the scan protocol id in scope.
      $scope.protocolId = $scope.scan.protocol
  ]


  ctlrs.controller 'RegistrationVolumeSelectCtrl', [
    '$scope',
    ($scope) ->
      # Place the registration protocol id in scope.
      $scope.protocolId = $scope.registration.protocol
  ]


  ctlrs.controller 'ScanProtocolCtrl', [
    '$scope', '$modal', 'ScanProtocol',
    ($scope, $modal, ScanProtocol) ->      
      # Open a modal window to display the scan procedure properties.
      $scope.open = ->
        $modal.open
          controller: 'ProtocolModalCtrl'
          templateUrl: '/partials/scan-protocol.html'
          size: 'sm'
          resolve:
            # Fetch the scan protocol.
            protocol: ->
              ScanProtocol.find(id: $scope.protocolId).$promise
  ]


  ctlrs.controller 'RegistrationProtocolCtrl', [
    '$scope', '$modal', 'RegistrationProtocol',
    ($scope, $modal, RegistrationProtocol) ->      
      # Open a modal window to display the registration properties.
      $scope.open = ->
        $modal.open
          controller: 'ProtocolModalCtrl'
          templateUrl: '/partials/registration-protocol.html'
          size: 'sm'
          resolve:
            # Fetch the registration protocol.
            protocol: ->
              RegistrationProtocol.find(id: $scope.protocolId).$promise
  ]


  ctlrs.controller 'ProtocolModalCtrl', [
    '$scope', '$modalInstance', 'protocol',
    ($scope, $modalInstance, protocol) ->
      # Place the protocol object in the modal scope.
      $scope.protocol = protocol
      $scope.close = ->
        $modalInstance.close()
  ]


  ## The Imaging Profile pane controllers.
  
  ctlrs.controller 'SubjectModelingCtrl', [
    '$scope',
    ($scope) ->
      # Place the modelings in scope.
      # Note: modelings is a subject property that is calculated
      # on the fly. Since the partials reference the modelings in
      # ng-switch and ng-repeat models, AngularJS sets up hidden
      # watches on this variable and redigests the partials whenever
      # the property value is calculated. If subject.modelings were
      # used instead of modelings, then AngularJS would enter an
      # infinite digest cycle. Placing the modelings variable in
      # scope here avoids this trap by fixing the value for the
      # course of the AngularJS page formatting.
      $scope.modelings = $scope.subject.modelings
      
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
      # Place the selected modeling in scope.
      $scope.$watch 'modelingIndex', (modelingIndex) ->
        $scope.selModeling = $scope.modelings[modelingIndex]
  ]


  ctlrs.controller 'ModelingInfoCtrl', [
    '$scope', '$modal', 'ModelingProtocol',
    ($scope, $modal, ModelingProtocol) ->
      # Open a modal window to display the modeling input properties.
      $scope.open = ->
        $modal.open
          controller: 'ModelingInfoModalCtrl'
          templateUrl: '/partials/modeling-info.html'
          size: 'sm'
          resolve:
            # Make modeling injectable in the modal controller.
            # See the ModelingInfoModalCtrl comment.
            modeling: ->
              $scope.modeling
            # Fetch the modeling protocol.
            protocol: ->
              ModelingProtocol.find(id: $scope.modeling.protocol).$promise
  ]


  ctlrs.controller 'ModelingInfoModalCtrl', [
    '$scope', '$modalInstance', 'modeling', 'protocol',
    ($scope, $modalInstance, modeling, protocol) ->
      # Since the modal is not contained in the application page, this
      # modal controller scope does not inherit the application page
      # scope. Therefore, the application scope modeling variable is
      # not visible to the modal scope. Hence, it is necessary to
      # transfer the modeling object as a $modal.open function resolve
      # property into this controller's injection list.
      # The assignment below then places the modeling object in the
      # modal scope for use in the modal template partial.
      $scope.modeling = modeling
      $scope.protocol = protocol
      $scope.close = ->
        $modalInstance.close()
  ]


  ctlrs.controller 'ModelingSourceProtocolCtrl', [
    '$scope',
    ($scope) ->
      # The modeling source is either a scan or registration protocol.
      if $scope.modeling.source.scan?
        $scope.sourceType = 'scan'
        $scope.protocolId = $scope.modeling.source.scan
      else if $scope.modeling.source.registration?
        $scope.sourceType = 'registration'
        $scope.protocolId = $scope.modeling.source.registration
      else
        throw new Error("The modeling source has neither a scan" +
                        " nor a registration protocol reference")
  ]


  ctlrs.controller 'ModelingChartCtrl', [
    '$scope', 'Modeling',
    ($scope, Modeling) ->
      # The d3 chart configuration.
      if $scope.selModeling?
        $scope.config = Modeling.configureChart($scope.selModeling.results,
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

  ctlrs.controller 'KTransCtrl', [
    '$scope', 'Modeling',
    ($scope, Modeling) ->
      $scope.dataSeriesConfig = Modeling.kTrans.dataSeriesConfig
  ]


  ctlrs.controller 'VeCtrl', [
    '$scope', 'Modeling',
    ($scope, Modeling) ->
      $scope.dataSeriesConfig = Modeling.vE.dataSeriesConfig
  ]


  ctlrs.controller 'TauICtrl', [
    '$scope', 'Modeling',
    ($scope, Modeling) ->
      $scope.dataSeriesConfig = Modeling.tauI.dataSeriesConfig
  ]


  ## The Clinical Profile pane controllers. ##

  ctlrs.controller 'PathologyCtrl', [
    '$scope',
    ($scope) ->
      $scope.pathology = $scope.encounter.pathology
  ]


  ctlrs.controller 'BreastHormoneReceptorsCtrl', [
    '$scope',
    ($scope) ->
      $scope.hormoneReceptors = $scope.pathology.hormoneReceptors
  ]


  ctlrs.controller 'BreastGeneticExpressionCtrl', [
    '$scope',
    ($scope) ->
      $scope.geneticExpression = $scope.pathology.geneticExpression
  ]


  ctlrs.controller 'BreastGeneAssayCtrl', [
    '$scope', 'Breast',
    ($scope, Breast) ->
      $scope.assay = $scope.geneticExpression.normalizedAssay
      $scope.recurrenceScore = Breast.recurrenceScore($scope.assay)
  ]


  ctlrs.controller 'RecurrenceScoreHelpCtrl', [
    '$scope', '$modal',
    ($scope, $modal) ->
      # Open a modal window to display the modeling input properties.
      $scope.open = ->
        $modal.open
          controller: 'RecurrenceScoreHelpModalCtrl'
          templateUrl: '/partials/recurrence-score-help.html'
          size: 'sm'
  ]


  ctlrs.controller 'RecurrenceScoreHelpModalCtrl', [
    '$scope', '$modalInstance',
    ($scope, $modalInstance) ->
      $scope.close = ->
        $modalInstance.close()
  ]


  ctlrs.controller 'AssessmentCtrl', [
    '$scope',
    ($scope) ->
      $scope.assessment = $scope.encounter.assessment
  ]


  ctlrs.controller 'TNMCtrl', [
    '$scope',
    ($scope) ->
      # The parent can either be a pathology evaluation or a
      # generic evaluation outcome iterator.
      path = $scope.pathology
      $scope.tnm = if path then path.tnm else $scope.outcome 
  ]


  ctlrs.controller 'GradeCtrl', [
    '$scope',
    ($scope) ->
      $scope.grade = $scope.tnm.grade 
  ]


  ctlrs.controller 'HormoneReceptorCtrl', [
    '$scope',
    ($scope) ->
      # The parent of a generic HormoneReceptor is a generic
      # evaluation outcome iterator.
      $scope.receptorStatus = $scope.outcome
  ]


  ctlrs.controller 'EstrogenCtrl', [
    '$scope',
    ($scope) ->
      $scope.hormone = 'Estrogen'
      $scope.receptorStatus = $scope.hormoneReceptors.estrogen
  ]


  ctlrs.controller 'ProgesteroneCtrl', [
    '$scope',
    ($scope) ->
      $scope.hormone = 'Progesterone'
      $scope.receptorStatus = $scope.hormoneReceptors.progesterone
  ]


  ## The Session Detail page controller. ##
  
  ctlrs.controller 'SessionDetailCtrl', [
    '$rootScope', '$scope', '$state', 'session', 'ControllerHelper',
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
          volume: image.volume.number

        # The target route, a prefix for now.
        route = 'quip.subject.session.scan.'
        if container._cls == 'Scan'
          params.scan = container.scan_type
          route += 'image'
        else if container._cls == 'Registration'
          params.scan = container.scan.name
          params.registration = container.name
          route += 'registration.image'
        else
          throw new TypeError("Unsupported image container type:" +
                              " #{ container._cls }")

        # Route to the volume page.      
        $state.go(route, params)

      # Capture the current project.
      $rootScope.project = session.subject.project
      # Place the session in the scope.
      $scope.session = session

      # If the project is the default, then remove it from the URL.
      ControllerHelper.cleanBrowserUrl($rootScope.project)
  ]


  ## The Image Detail page controller. ##

  ctlrs.controller 'VolumeCtrl', [
    '$rootScope', '$scope', 'image', 'Image', 'ControllerHelper',
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

      # Selects the current modeling result's label map object
      # for the given modeling parameter property name.
      #
      # @param paramName the modeling modeling parameter property name
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


  ctlrs.controller 'VolumeImageCtrl', [
    '$scope', 'state',
    ($scope, $state) ->
      # Create the image object on demand for the element scope.
      $scope.image = $scope.volume.image
      $scope.openImage = ->
        route = 'quip.subject.session.scan.'
  ]
