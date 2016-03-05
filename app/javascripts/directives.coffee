define ['angular', 'lodash', 'underscore.string', 'spin', 'helpers',
        'correlation', 'dateline', 'intensity', 'modeling', 'imageproto'],
  (ng, _, _s, Spinner) ->
    directives = ng.module(
      'qiprofile.directives',
      ['qiprofile.helpers', 'qiprofile.correlation', 'qiprofile.dateline',
       'qiprofile.intensity', 'qiprofile.modeling', 'qiprofile.imageproto']
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
              scope.config = VisitDateline.configureChart(subject)
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
    directives.directive 'qiCorrelationCharts', ['Correlation', '$compile',
      (Correlation, $compile) ->
        restrict: 'A'
        link: (scope, element) ->
          Correlation.renderCorrelationCharts()
          element.removeAttr 'qi-correlation-charts'
          $compile(element)(scope)
    ]


    # Displays the slice.
    directives.directive 'qiSliceDisplay', ['SliceDisplay', '$compile',
      (SliceDisplay, $compile) ->
        restrict: 'A'
        link: (scope, element) ->
          initImage = {
            dicomImageId: 'example://1'
            overlayIds: [
              'example://3'
            ]
          }
          SliceDisplay.updateDicomImage(initImage.dicomImageId)
          element.removeAttr 'qi-slice-display'
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
          scope.$parent.$watch 'scan', (scan) ->
            if scan?
              scope.config = Intensity.configureChart(scan, element)
        templateUrl: '/partials/intensity-chart.html'
    ]


    # Displays a scan or registration series 3D image.
    directives.directive 'qiImage', ->
      restrict: 'E'
      link: (scope, element) ->
        scope.$watch 'image', (image) ->
          if image.isLoaded()
            scope.image.open(element)
