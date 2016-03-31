define ['angular', 'lodash', 'underscore.string', 'spin', 'helpers',
        'correlation', 'dateline', 'intensity', 'modeling'],
  (ng, _, _s, Spinner) ->
    directives = ng.module(
      'qiprofile.directives',
      ['qiprofile.helpers', 'qiprofile.correlation', 'qiprofile.dateline',
       'qiprofile.intensity', 'qiprofile.modeling']
    )

    # Spinner directive.
    directives.directive 'qiSpin', ->
      (scope, element, attrs) ->
        # Replaces the DOM element with a spinner
        # while the qiSpin attribute is set.

        createSpinner = ->
          # Creates an image selection spinner.
          # position relative places the spinner element
          # with respect to the button. top .6em centers
          # the spinner on the button. The spinner has
          # 10 spokes radiating out 2 pixels from the
          # center of the button with length and width
          # 4 pixels.
          new Spinner(
            position: 'relative'
            top: '.6em'
            lines: 10
            width: 4
            length: 4
            radius: 2
            trail: 80
            speed: 1
            color: 'Orange'
          )

        scope.$watch attrs.qiSpin, (value, oldValue) ->
          if value
            if not scope.spinner
              scope.spinner = createSpinner()
            scope.spinner.spin(element[0])
          else if scope.spinner
            scope.spinner.stop()


    # Displays the MR session visit dateline chart.
    directives.directive 'qiVisitDateline', ['VisitDateline', '$compile',
      (VisitDateline, $compile) ->
        restrict: 'E'
        scope:
          subject: '='
        link: (scope, element, attrs) ->
          scope.$watch 'subject', (subject) ->
            if _.some(subject.sessions)
              scope.config = VisitDateline.configure(subject)
              # This function is called by D3 after the chart DOM is built.
              #
              # @param chart the chart SVG element
              scope.applyChart = (chart) ->
                # Compiles the given anchor element ui-sref directive
                # in the current scope.
                #
                # @param a the anchor element
                compileDetailLink = (a) ->
                  $compile(a)(scope)

                # Add the session detail hyperlinks, treatment bars and
                # encounter points. The callback compiles the ui-sref
                # anchor hyperlinks after they are added to the DOM.
                VisitDateline.decorate(subject, chart, scope.config, compileDetailLink)
        templateUrl: '/partials/visit-dateline-chart.html'
    ]
    
    
    directives.directive 'qiFocus', ['$timeout',
      ($timeout) ->
        restrict: 'A'
        scope:
          focus: '@qiFocus'
        link: (scope, element) ->
          scope.$watch 'focus', (value) ->
            if value is 'true'
              $timeout ->
                element[0].focus()
    ]


    # Displays the correlation charts.
    #
    # TODO - Why is this not an entity (E) directive?
    #   Why is the attribute removed after rendering? The intent seems to
    #   be to disable the directive after the link. However, removing the
    #   attribute does not appear to have any effect. The directive is
    #   called on AngularJS compile. Once compiled, the element is not
    #   recompiled. Thus, removing the attribute is superfluous. Is this
    #   assessment correct?
    # TODO - why is there a config? test. Shouldn't config always exist?
    # TODO - Why is $compile called? This call does not appear to have any
    #   effect. The link is performed during $compile, so calling $compile
    #   here seems to be at best unnecessary and at worst dangerous.
    # TODO - same effect might be obtained more cleanly on each chart
    #   using the qiCorrelationChart directive below.
    #
    directives.directive 'qiCorrelationCharts', ['Correlation', '$compile',
      (Correlation, $compile) ->
        restrict: 'A'
        link: (scope, element) ->
          scope.$watch 'config', (config) ->
            if config?
              # The page must completely load before the chart rendering call
              # is made.
              # TODO - element should already be ready before link is called.
              #   Also, this element ready is no guarantee that the chart
              #   elements are ready.
              element.ready ->
                Correlation.renderCharts(scope.config)
                element.removeAttr('qi-correlation-charts')
                $compile(element)(scope)
    ]


    # TODO - try enabling this in conjunction with the TODO above.
    directives.directive 'qiCorrelationChart', ['Correlation',
      (Correlation) ->
        restrict: 'E'
        link: (scope, element) ->
          # Here, the scope config is set on the individual chart, not
          # all of the charts.
          Correlation.renderChart(scope.config)
    ]


    # Displays the slice.
    directives.directive 'qiSliceDisplay', ['SliceDisplay', '$compile',
      (SliceDisplay, $compile) ->
        restrict: 'A'
        link: (scope, element) ->
          # TODO - obtain the updateImage argument.
          # SliceDisplay.updateImage(???)
          # TODO - see qiCorrelationCharts link TODO.
          element.removeAttr('qi-slice-display')
          $compile(element)(scope)
    ]


    # Displays the session intensity chart.
    directives.directive 'qiIntensityChart', ['Intensity', 'ObjectHelper',
      (Intensity, ObjectHelper) ->
        restrict: 'E'
        scope:
          scan: '='
        link: (scope, element) ->
          # Wait for a session extended with detail to digest the scan.
          # TODO - see qiCorrelationCharts link TODO.
          scope.$parent.$watch 'scan', (scan) ->
            if scan?
              scope.config = Intensity.configure(scan, element)
        templateUrl: '/partials/intensity-chart.html'
    ]


    # Displays a scan or registration series 3D volume.
    directives.directive 'qiVolumeDisplay', ->
      restrict: 'E'
      link: (scope, element) ->
        scope.$watch 'volume', (image) ->
          if volume.isLoaded()
            scope.volume.open(element)
