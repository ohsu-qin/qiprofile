define ['angular', 'lodash', 'ngsanitize', 'ngnvd3', 'resources', 'modelingChart', 'breast', 
        'sliceDisplay', 'collection'],
  (ng, _) ->
    ctlrs = ng.module(
      'qiprofile.controllers',
      ['ngSanitize', 'nvd3', 'qiprofile.resources', 'qiprofile.modelingchart',
       'qiprofile.breast', 'qiprofile.slicedisplay', 'qiprofile.collection']
    )

    # The local controller helper methods.
    ctlrs.factory 'ControllerHelper', [
      '$location',
      ($location) ->
        # Resets the browser URL search parameters to include at most
        # a non-default project, since all other search parameters are
        # redundant.
        cleanBrowserUrl: (project) ->
          searchParams = {}
          # TODO - get the default project from a config file.
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


    ctlrs.controller 'CollectionListCtrl', [
      '$rootScope', '$scope', 'project', 'collections', '$window',
      ($rootScope, $scope, project, collections, $window) ->
        # Capture the current project.
        $rootScope.project = project
        # Place the collections in the scope.
        $scope.collections = collections
        $scope.open = (url) ->
          $window.location.href = url
        # The help is always open to start with on this landing page.
        $rootScope.showHelp = true
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


    ctlrs.controller 'CollectionDetailCtrl', [
      '$rootScope', '$scope', 'project', 'collection', 'charting', 'Collection', 'ControllerHelper',
      ($rootScope, $scope, project, collection, charting, Collection, ControllerHelper) ->
        # Capture the current project.
        $rootScope.project = project
        # Place the collection in the scope.
        $scope.collection = collection
        # Obtain the valid data series and labels for the current collection
        # and put them in the scope. These comprise the X/Y axis dropdown
        # choices. The X axis choices contain all valid data series. The Y axis
        # choices may only include continuous data types.
        $scope.choices = Collection.dataSeriesChoices(collection)
        # Obtain the formatted scatterplot data.
        data = Collection.chartData(charting, Object.keys $scope.choices.x)
        # Obtain the chart padding for each data series - continuous data types
        # only. The padding for categorical data series is configured in the
        # correlation module chart rendering function.
        padding = Collection.chartPadding(data, Object.keys $scope.choices.y)
        # Put a copy of the default charts (X and Y axes) in the scope.
        # This charts object changes when the user selects a different
        # axis to chart.
        $scope.axes = _.clone(Collection.DEFAULT_AXES[collection])
        # Check the validity of the default chart axes.
        checkAxes = (axis) ->
          axis.x in xAxisChoices or
            throw new Error "Invalid #{ collection } X-axis data series: " +
                            "#{ axis.x }"
          axis.y in yAxisChoices or
            throw new Error "Invalid #{ collection } Y-axis data series: " +
                            "#{ axis.y }"
        xAxisChoices = Object.keys($scope.choices.x)
        yAxisChoices = Object.keys($scope.choices.y)
        checkAxes(axis) for axis in $scope.axes

        # Place the chart configuration object in the scope.
        $scope.config =
          data: data
          padding: padding
          axes: $scope.axes

        # If the user changes any X or Y axis selection, then re-render the
        # charts. The watcher is invoked on initialization and whenever the
        # user changes the axes. On initialization, then the watcher is called
        # with new axes value argument identical (===) to the old value
        # argument. If the user changes the axes, then the watcher is called
        # with different new and old axes objects.
        watcher = (newValue, oldValue) ->
          # If the user changed the axes, then re-render the charts.
          if newValue != oldValue
            Collection.renderCharts($scope.config)
        
        # Since charts is an object, the objectEquality flag is set to true.
        # AngularJS then copies the object for later comparison and uses
        # angular.equals to recursively compare the object properties rather
        # than a simple === test, which is the default.
        $scope.$watch('axes', watcher, true)
        
        # If the project is the default, then remove it from the URL.
        ControllerHelper.cleanBrowserUrl($rootScope.project)
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
      '$scope', '$uibModal', 'Resources',
      ($scope, $uibModal, Resources) ->
        # Open a modal window to display the scan procedure properties.
        $scope.open = ->
          $uibModal.open
            controller: 'ProtocolModalCtrl'
            templateUrl: '/partials/scan-protocol.html'
            size: 'sm'
            resolve:
              # Fetch the scan protocol.
              protocol: ->
                Resources.ScanProtocol.find(id: $scope.protocolId)
    ]


    ctlrs.controller 'RegistrationProtocolCtrl', [
      '$scope', '$uibModal', 'Resources',
      ($scope, $uibModal, Resources) ->
        # Open a modal window to display the registration properties.
        $scope.open = ->
          $uibModal.open
            controller: 'ProtocolModalCtrl'
            templateUrl: '/partials/registration-protocol.html'
            size: 'sm'
            resolve:
              # Fetch the registration protocol.
              protocol: ->
                Resources.RegistrationProtocol.find(id: $scope.protocolId)
    ]


    ctlrs.controller 'ProtocolModalCtrl', [
      '$scope', '$uibModalInstance', 'protocol',
      ($scope, $uibModalInstance, protocol) ->
        # Place the protocol object in the modal scope.
        $scope.protocol = protocol
        $scope.close = ->
          $uibModalInstance.close()
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
        if $scope.subject.isMultiSession()
          $scope.modelingFormat = 'chart'
        else
          $scope.modelingFormat = 'table'

        # The default modeling results index is the first.
        $scope.modelingIndex = 0
        # Place the selected modeling in scope.
        $scope.$watch 'modelingIndex', (modelingIndex) ->
          $scope.selModeling = $scope.modelings[modelingIndex]
    ]


    ctlrs.controller 'PkModelingHelpCtrl', [
      '$scope', '$uibModal',
      ($scope, $uibModal) ->
        $scope.open = ->
          $uibModal.open
            controller: 'PkModelingHelpModalCtrl'
            templateUrl: '/partials/pk-modeling-help.html'
            size: 'med'
    ]


    ctlrs.controller 'PkModelingHelpModalCtrl', [
      '$scope', '$uibModalInstance',
      ($scope, $uibModalInstance) ->
        $scope.close = ->
          $uibModalInstance.close()
    ]


    ctlrs.controller 'ModelingProtocolCtrl', [
      '$scope',
      ($scope) ->
        # Place the protocol id in scope.
        $scope.protocolId = $scope.modeling.protocol
    ]


    ctlrs.controller 'ModelingInfoCtrl', [
      '$scope', '$uibModal', 'Resources',
      ($scope, $uibModal, Resources) ->
        # Open a modal window to display the modeling input properties.
        $scope.open = ->
          $uibModal.open
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
                Resources.ModelingProtocol.find(id: $scope.modeling.protocol)
    ]


    ctlrs.controller 'ModelingInfoModalCtrl', [
      '$scope', '$uibModalInstance', 'modeling', 'protocol',
      ($scope, $uibModalInstance, modeling, protocol) ->
        # Since the modal is not contained in the application page, this
        # modal controller scope does not inherit the application page
        # scope. Therefore, the application scope modeling variable is
        # not visible to the modal scope. Hence, it is necessary to
        # transfer the modeling object as a $uibModal.open function resolve
        # property into this controller's injection list.
        # The assignment below then places the modeling object in the
        # modal scope for use in the modal template partial.
        $scope.modeling = modeling
        $scope.protocol = protocol
        $scope.close = ->
          $uibModalInstance.close()
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


    ctlrs.controller 'TimelineCtrl', [
      '$scope', '$state', '$compile', 'Timeline',
      ($scope, $state, $compile, Timeline) ->
        # The chart {options, data} configuration.
        chartConfig = Timeline.configure($scope.subject)
        $scope.options = chartConfig.options
        $scope.data = chartConfig.data
        # The global configuration. Disable the data watcher since,
        # once built, the data is not changed. Furthermore, the
        # data is the modeling parameter objects, which are complex
        # objects with a circular object graph reference
        # (paramResult -> parent modelingResult -> child paramResult).
        $scope.config = deepWatchData: false
        # The chart decoration callback.
        $scope.decorate = (scope, element) ->
          # Note: since the nvd3 directive isolates the scope,
          # it does not inherit to the parent $scope properties.
          # Therefore, we must specify $scope.subject rather than
          # scope.subject.
          Timeline.decorate(element, $scope.subject, scope, $state)

          # Note: an angular-nvd3 bug voids element changes made
          # in this callback on refresh
          # (cf. https://github.com/krispo/angular-nvd3/issues/316).
          # The work-around is to surgically intervene in the
          # defective ngnvd3 code.
          # TODO - periodically check whether the ngnvd3 bug is
          #   fixed and remove the work-around if possible.
          #scope.isReady = false
          if _.isUndefined(scope.isBroken)
            broken = scope.api.refresh
            fixed = ->
              # Note: setting scope.isReady should trigger the watcher
              # but doesn't. The work-around to this work-around bug is
              # to force the issue by calling the decorate function
              # directly in the refresh rather than indirectly via the
              # watcher.
              # TODO - remove this work-around to a work-around bug when
              #   the original work-around is fixed.
              broken()
              $scope.decorate(scope, element)
            scope.api.refresh = fixed
            scope.isBroken = false
    ]


    ctlrs.controller 'IntensityChartCtrl', [
      '$scope', 'IntensityChart',
      ($scope, IntensityChart) ->
        # The chart {options, data} configuration.
        chartConfig = IntensityChart.configure($scope.scan)
        $scope.options = chartConfig.options
        $scope.data = chartConfig.data
        # The global configuration. See ModelingChartCtrl comment.
        $scope.config = deepWatchData: false
    ]


    ctlrs.controller 'ModelingChartCtrl', [
      '$scope', 'ModelingChart',
      ($scope, ModelingChart) ->
        # selModeling is set to the modeling object to display.
        # It is set if and only if there is at least one modeling
        # object. Thus, the if test guards against there not being
        # any modeling object to display.
        if $scope.selModeling?
          # The chart {options, data} configuration.
          chartConfig = ModelingChart.configure($scope.selModeling.results,
                                                $scope.paramKey)
          $scope.options = chartConfig.options
          $scope.data = chartConfig.data
          # The global configuration. Disable the data watcher since,
          # once built, the data is not changed. Furthermore, the
          # data is the modeling parameter objects, which are complex
          # objects with a circular object graph reference
          # (paramResult -> parent modelingResult -> child paramResult).
          $scope.config = deepWatchData: false
    ]


    ## The modeling parameter controllers. ##
    #
    # TODO - revise to beter fit ngnvd3. These controller's don't do
    #   much. 
    #
    # Each controller is required to set the following scope variable:
    # * dataSeriesConfig - the ModelingChart.configureD3 dataSeriesSpec
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

    ctlrs.controller 'KTransCtrl', [ '$scope', ($scope) ->
        $scope.paramKey = 'kTrans'
    ]

    ctlrs.controller 'VeCtrl', [ '$scope', ($scope) ->
        $scope.paramKey = 'vE'
    ]

    ctlrs.controller 'TauICtrl', [ '$scope', ($scope) ->
        $scope.paramKey = 'tauI'
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
        $scope.hormoneReceptors = $scope.tumor.hormoneReceptors
    ]


    ctlrs.controller 'BreastGeneticExpressionCtrl', [
      '$scope',
      ($scope) ->
        $scope.geneticExpression = $scope.tumor.geneticExpression
    ]


    ctlrs.controller 'BreastGeneAssayCtrl', [
      '$scope', 'Breast',
      ($scope, Breast) ->
        $scope.assay = $scope.geneticExpression.normalizedAssay
        $scope.recurrenceScore = Breast.recurrenceScore($scope.assay)
    ]


    ctlrs.controller 'TumorExtentCtrl', [
      '$scope',
      ($scope) ->
        $scope.extent = $scope.tumor.extent
    ]


    ctlrs.controller 'ResidualCancerBurdenCtrl', [
      '$scope', 'Breast',
      ($scope, Breast) ->
        $scope.rcb = Breast.residualCancerBurden($scope.tumor)
    ]


    ctlrs.controller 'RecurrenceScoreHelpCtrl', [
      '$scope', '$uibModal',
      ($scope, $uibModal) ->
        $scope.open = ->
          $uibModal.open
            controller: 'RecurrenceScoreHelpModalCtrl'
            templateUrl: '/partials/recurrence-score-help.html'
            size: 'med'
    ]


    ctlrs.controller 'RecurrenceScoreHelpModalCtrl', [
      '$scope', '$uibModalInstance',
      ($scope, $uibModalInstance) ->
        $scope.close = ->
          $uibModalInstance.close()
    ]


    ctlrs.controller 'DosageAmountHelpCtrl', [
      '$scope', '$uibModal',
      ($scope, $uibModal) ->
        $scope.open = ->
          $uibModal.open
            controller: 'DosageAmountHelpModalCtrl'
            templateUrl: '/partials/dosage-amount-help.html'
            size: 'med'
    ]


    ctlrs.controller 'DosageAmountHelpModalCtrl', [
      '$scope', '$uibModalInstance',
      ($scope, $uibModalInstance) ->
        $scope.close = ->
          $uibModalInstance.close()
    ]


    ctlrs.controller 'TNMCtrl', [
      '$scope',
      ($scope) ->
        # The parent can either be a pathology evaluation or a
        # generic evaluation outcome iterator.
        path = $scope.tumor
        $scope.tnm = if path then path.tnm else $scope.outcome
    ]


    ctlrs.controller 'BreastTNMStageHelpCtrl', [
      '$scope', '$uibModal',
      ($scope, $uibModal) ->
        $scope.open = ->
          $uibModal.open
            controller: 'BreastTNMStageHelpModalCtrl'
            templateUrl: '/partials/breast-tnm-stage-help.html'
            size: 'med'
    ]


    ctlrs.controller 'BreastTNMStageHelpModalCtrl', [
      '$scope', '$uibModalInstance',
      ($scope, $uibModalInstance) ->
        $scope.close = ->
          $uibModalInstance.close()
    ]


    ctlrs.controller 'SarcomaTNMStageHelpCtrl', [
      '$scope', '$uibModal',
      ($scope, $uibModal) ->
        $scope.open = ->
          $uibModal.open
            controller: 'SarcomaTNMStageHelpModalCtrl'
            templateUrl: '/partials/sarcoma-tnm-stage-help.html'
            size: 'med'
    ]


    ctlrs.controller 'SarcomaTNMStageHelpModalCtrl', [
      '$scope', '$uibModalInstance',
      ($scope, $uibModalInstance) ->
        $scope.close = ->
          $uibModalInstance.close()
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
        $scope.receptorStatus = _.find($scope.hormoneReceptors,
                                       (hr) -> hr.hormone == 'estrogen')
    ]


    ctlrs.controller 'ProgesteroneCtrl', [
      '$scope',
      ($scope) ->
        $scope.receptorStatus = _.find($scope.hormoneReceptors,
                                       (hr) -> hr.hormone == 'progesterone')
    ]


    ctlrs.controller 'ChemotherapyCtrl', [
      '$scope',
      ($scope) ->
        isChemo = (dosage) -> dosage.agent._cls == 'Drug'
        chemo = $scope.treatment.dosages.filter(isChemo)
        $scope.chemotherapy = {dosages: chemo} if chemo.length
    ]


    ctlrs.controller 'RadiotherapyCtrl', [
      '$scope',
      ($scope) ->
        isRadio = (dosage) -> dosage.agent._cls == 'Radiation'
        radio = $scope.treatment.dosages.filter(isRadio)
        $scope.radiotherapy = {dosages: radio} if radio.length
    ]


    ctlrs.controller 'NecrosisPercentCtrl', [
      '$scope',
      ($scope) ->
        $scope.necrosis_percent = $scope.tumor.necrosis_percent
    ]


    ## The Session Detail page controllers. ##
  
    ctlrs.controller 'SessionDetailCtrl', [
      '$rootScope', '$scope', '$state', 'session', 'ControllerHelper',
      ($rootScope, $scope, $state, session, ControllerHelper) ->
        # Capture the current project.
        $rootScope.project = session.subject.project
        # Place the session in the scope.
        $scope.session = session
        # If the project is the default, then remove it from the URL.
        ControllerHelper.cleanBrowserUrl($rootScope.project)
    ]


    #
    # TODO - retain on the xtk branch only.
    #
    ctlrs.controller 'VolumeDisplayCtrl', [
      '$scope', '$state',
      ($scope, $state) ->
        # Create the image object on demand.
        $scope.image = $scope.volume.image
      
        # Opens the series image display page.
        #
        # @param image the Image object
        $scope.openImage = () ->
          # The parent scan or registration image sequence.
          imageSequence = $scope.volume.imageSequence

          # The common parameters.
          params =
            project: imageSequence.session.subject.project
            collection: imageSequence.session.subject.collection
            subject: imageSequence.session.subject.number
            session: imageSequence.session.number
            detail: imageSequence.session.detail
            volume: $scope.volume.number

          # The target imageSequence route prefix.
          route = 'quip.collection.subject.session.scan.'
          # Add to the parameters and route based on the imageSequence type.
          if imageSequence._cls == 'Scan'
            params.scan = imageSequence.number
          else if imageSequence._cls == 'Registration'
            params.scan = imageSequence.scan.number
            params.registration = imageSequence.resource
            route += 'registration.'
          else
            throw new TypeError("Unsupported image sequence type:" +
                                " #{ imageSequence._cls }")
          # Finish off the route.
          route += 'volume.slice'

          # Go to the volume page.
          $state.go(route, params)
    #
    # TODO - Legacy controller partially repurposed for slice display.
    #   If volume display is reenabled, then borrow what is needed for
    #   the above controller and delete the rest.
    #
    # ctlrs.controller 'VolumeeDisplayCtrl', [
    #   '$rootScope', '$scope', '$location', '$sce', 'ModelingChart', 'SliceDisplay',
    #   'ControllerHelper', 'session', 'imageSequence', 'volume', 'slice',
    #   ($rootScope, $scope, $location, $sce, ModelingChart,  SliceDisplay,
    #    ControllerHelper, session, imageSequence, volume, slice) ->
    #     # Capture the current project.
    #     $rootScope.project = session.subject.project
    #
    #     # @param key the modeling parameter key, e.g. 'deltaKTrans'
    #     # @returns the modeling parameter heading HTML span element,
    #     #   e.g. '<span>&Delta;K<sub>trans</sub></span>'
    #     $scope.parameterHeading = (key) ->
    #       html = "<span>#{ Modeling.properties[key].html }</span>"
    #       $sce.trustAsHtml(html)
    #
    #     # The session modelings which have an overlay.
    #     $scope.overlayModelings = (
    #       mdl for mdl in session.modelings when mdl.overlays.length?
    #     )
    #     # The overlay selection.
    #     $scope.overlayIndex = null
    #
    #     # The initial saggital slice.
    #     $scope.saggitalView = slice: slice
    #
    #     # The overlay opacity slider setting and CSS styles.
    #     $scope.overlayConfig =
    #       setting: 1
    #       style:
    #         "opacity": 1
    #         "z-index": -1
    #
    #     # Watch for a change in the saggital slice control setting.
    #     # When the slice index changes, then update the image and,
    #     # if selected, the overlay.
    #     #
    #     # TODO - address the volume-controls.jade TODO items.
    #     #
    #     $scope.$watch 'saggitalView.slice', (index) ->
    #       SliceDisplay.updateSlice($scope.imageIds[index].dicomImageId)
    #       if $scope.overlayIndex?
    #         Slice.updateOverlay($scope.imageIds[index].overlayIds,
    #                                         $scope.overlayIndex)
    #
    #     # Update the URL search parameters.
    #     $location.search('volume', volume)
    #     $location.search('slice', slice)
    #
    #     # The overlayIndex scope variable is the overlay radio input
    #     # selection value in the format *modeling index*.*overlay index*,
    #     # e.g. the value '0.1' is the second overlay of the first modeling.
    #     # By default, no overlay is selected. When a radio button is
    #     # checked, then the overlayIndex variable is set and the watcher
    #     # below is triggered.
    #     #
    #     # If the overlayIndex scope variable is changed to a non-null value,
    #     # then parse the value and call the image selectOverlay(overlay)
    #     # function on the referenced overlay.
    #     # Otherwise, call the image deselectOverlay() function.
    #     $scope.$watch 'overlayIndex', (index) ->
    #       if index?
    #         # Parse and disaggregate the composite index.
    #         # Note: calling map with parseInt fails with a NaN second value
    #         # since both parseInt can include optional arguments
    #         # (cf. http://stackoverflow.com/questions/262427/javascript-arraymap-and-parseint).
    #         # The work-around is to call map with Number, which takes a
    #         # single string argument.
    #         #[mdlIndex, ovrIndex] = index.split('.').map(Number)
    #         # The selected modeling object.
    #         #modeling = $scope.overlayModelings[mdlIndex]
    #         # The select overlay label map in the selected modeling object.
    #         #overlay = modeling.overlays[ovrIndex]
    #         # Delegate to the image object.
    #         #$scope.volume.selectOverlay(overlay)
    #
    #         # Move the overlay viewport to the front and update it -
    #         #   Cornerstone prototype.
    #         $scope.overlayConfig.style['z-index'] = 1
    #         slice = $scope.saggitalView.slice
    #         $scope.slice.updateOverlay($scope.imageIds[slice].overlayIds,
    #                                         index)
    #       else
    #         #$scope.volume.deselectOverlay()
    #         # Move the overlay viewport to the back - Cornerstone prototype.
    #         $scope.overlayConfig.style['z-index'] = -1
    #
    #
    #     # If the project is the default, then remove it from the URL.
    #     ControllerHelper.cleanBrowserUrl($rootScope.project)
    ]


    # The Image Slice Display controller.
    ctlrs.controller 'SliceDisplayCtrl', [
      '$rootScope', '$scope', '$location', 'SliceDisplay', 'ControllerHelper', 'timeSeries', 'volume', 'slice',
      ($rootScope, $scope, $location, SliceDisplay, ControllerHelper, timeSeries, volume, slice) ->
        
        # Capture the current project.
        $rootScope.project = timeSeries.imageSequence.session.subject.project
        
        # Place the time series in scope.
        $scope.timeSeries = timeSeries
        
        # Initialize the volume number, if necessary.
        if not volume?
          # The default volume is at bolus arrival, if defined, otherwise the
          # first volume.
          bolusArvNdx = timeSeries.imageSequence.bolusArrivalIndex
          volume = if bolusArvNdx? then bolusArvNdx + 1 else 1
          # Update the URL search parameter.
          $location.search('volume', volume)
        # Place the volume in scope.
        $scope.volume = volumeNbr: volume

        # Initialize the slice number, if necessary.
        if not slice?
          # The default slice is the point of maximal ROI extent, if defined,
          # otherwise the first slice.
          # TODO - calculate the maximal ROI slice in the pipeline and put in
          #  the REST database. 
          maximalROISlice = undefined
          slice = if maximalROISlice? then maximalROISlice + 1 else 1
          # Update the URL search parameter.
          $location.search('slice', slice)
        # Place the slice in scope.
        $scope.slice = sliceNbr: slice
        
        # The slice dimensions.
        $scope.dimensions = [
          "Saggital"
          "Coronal"
          "Axial"
        ]

        # The default slice dimension.
        $scope.dimension = "Axial"

        #
        # TODO - add overlays. The REST data model is:
        #     Modeling {
        #       result {
        #         parameter: parameterResult{name, labelMap: {name, colorTable}}, ...}
        #       }
        #     }
        #   and:
        #     Scan {
        #       rois: [{name, labelMap: {name, colorTable}}, ...]
        #       }
        #     }
        #   with one ROI per tumor.
        #
        #   The LabelMap objects need to be collected by Scan.extend into a
        #   Scan.overlays virtual property {key, image} object, where:
        #   * *key* is either a modeling parameter name or 'roi'
        #   * *image* is the LabelMap extended by the Image service, which
        #     should be done in Modeling.extend and Scan.extend.
        #
        #   The composite ROI needs to be created in the pipeline from the
        #   tumor ROIs and placed into a new REST Scan.rois ROI object
        #   {composite, regions}, where:
        #   *composite* is a LabelMap object
        #   *regions* is the current Scan.rois [Region, ...] array. Since
        #   the Scan ROIs do not overlap, the masks can be combined in a
        #   ndarray operation by the pipeline.
        #
        #   The Slice Display page should have an overlay selection control,
        #   one per modeling parameter and one for the composite ROI.
        #   
        #   A registration image sequence needs to delegate to the parent
        #   scan overlays. This can be done in Registration.extend by adding a
        #   Registration.overlays virtual property.
        #   
        #   Finally, TimeSeries.extend should create a TimeSeries.overlays
        #   virtual property which delegates to the parent overlays.
        display = ->
          SliceDisplay.display($scope.timeSeries, $scope.volume.volumeNbr, $scope.slice.sliceNbr)

        watcher = (newValue, oldValue) ->
          if newValue != oldValue
            display()

        # Display the image the first time and whenever the volume changes
        # thereafter.
        $scope.$watch('volume', display, true)

        # Redisplay the image when the slice changes.
        $scope.$watch('slice', watcher, true)
        
        #
        # TODO - implement the overlay watcher in conjunction with the
        #   changes described above.
        #
        # # Redisplay the overlay when the overlay changes.
        # $scope.$watch 'overlayIndex', (overlayIndex, previous) ->
        #   # There must first be an overlay. This situation should never
        #   # occur by construction if the UI overlay selection properly
        #   # guards against it.
        #   if not data?
        #     throw new ReferenceError("The time series does not have an overlay")
        #   if overlayIndex != previous
        #     display()

      #
      # TODO - borrow whatever is useful from below--but don't copy it as is--then
      # delete it.
      #
      # '$rootScope', '$scope', '$location', '$sce', 'ModelingChart', 'SliceDisplay',
      # 'ControllerHelper', 'session', 'imageSequence', 'volume', 'slice',
      # ($rootScope, $scope, $location, $sce, ModelingChart, SliceDisplay,
      #  ControllerHelper, session, imageSequence, volume, slice) ->
      #   # Capture the current project.
      #   $rootScope.project = session.subject.project
      #
      #   # @param key the modeling parameter key, e.g. 'deltaKTrans'
      #   # @returns the modeling parameter heading HTML span element,
      #   #   e.g. '<span>&Delta;K<sub>trans</sub></span>'
      #   $scope.parameterHeading = (key) ->
      #     html = "<span>#{ Modeling.properties[key].html }</span>"
      #     $sce.trustAsHtml(html)
      #
      #   # The session modelings which have an overlay.
      #   $scope.overlayModelings = (
      #     mdl for mdl in session.modelings when mdl.overlays.length?
      #   )
      #   # The overlay selection.
      #   $scope.overlayIndex = null
      #
      #   # The initial saggital slice.
      #   $scope.saggitalView = slice: slice
      #
      #   # The overlay opacity slider setting and CSS styles.
      #   $scope.overlayConfig =
      #     setting: 1
      #     style:
      #       "opacity": 1
      #       "z-index": -1
      #
      #   # Watch for a change in the saggital slice control setting.
      #   # When the slice index changes, then update the image and,
      #   # if selected, the overlay.
      #   #
      #   # TODO - address the volume-controls.jade TODO items.
      #   #
      #   $scope.$watch 'saggitalView.slice', (index) ->
      #     SliceDisplay.updateSlice($scope.imageIds[index].dicomImageId)
      #     if $scope.overlayIndex?
      #       Slice.updateOverlay($scope.imageIds[index].overlayIds,
      #                                       $scope.overlayIndex)
      #
      #
      #   # The overlayIndex scope variable is the overlay radio input
      #   # selection value in the format *modeling index*.*overlay index*,
      #   # e.g. the value '0.1' is the second overlay of the first modeling.
      #   # By default, no overlay is selected. When a radio button is
      #   # checked, then the overlayIndex variable is set and the watcher
      #   # below is triggered.
      #   #
      #   # If the overlayIndex scope variable is changed to a non-null value,
      #   # then parse the value and call the image selectOverlay(overlay)
      #   # function on the referenced overlay.
      #   # Otherwise, call the image deselectOverlay() function.
      #   $scope.$watch 'overlayIndex', (index) ->
      #     if index?
      #       # Parse and disaggregate the composite index.
      #       # Note: calling map with parseInt fails with a NaN second value
      #       # since both parseInt can include optional arguments
      #       # (cf. http://stackoverflow.com/questions/262427/javascript-arraymap-and-parseint).
      #       # The work-around is to call map with Number, which takes a
      #       # single string argument.
      #       #[mdlIndex, ovrIndex] = index.split('.').map(Number)
      #       # The selected modeling object.
      #       #modeling = $scope.overlayModelings[mdlIndex]
      #       # The select overlay label map in the selected modeling object.
      #       #overlay = modeling.overlays[ovrIndex]
      #       # Delegate to the image object.
      #       #$scope.volume.selectOverlay(overlay)
      #
      #       # Move the overlay viewport to the front and update it -
      #       #   Cornerstone prototype.
      #       $scope.overlayConfig.style['z-index'] = 1
      #       slice = $scope.saggitalView.slice
      #       $scope.slice.updateOverlay($scope.imageIds[slice].overlayIds,
      #                                       index)
      #     else
      #       #$scope.volume.deselectOverlay()
      #       # Move the overlay viewport to the back - Cornerstone prototype.
      #       $scope.overlayConfig.style['z-index'] = -1

        # If the project is the default, then remove it from the URL.
        ControllerHelper.cleanBrowserUrl($rootScope.project)
    ]

