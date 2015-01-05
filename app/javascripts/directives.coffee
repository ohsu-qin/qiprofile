define ['angular', 'lodash', 'underscore.string', 'spin', 'helpers',
        'dateline', 'intensity', 'modeling'],
  (ng, _, _s, Spinner) ->
    directives = ng.module(
      'qiprofile.directives',
      ['qiprofile.helpers', 'qiprofile.dateline', 'qiprofile.intensity',
       'qiprofile.modeling']
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
            if _.any(subject.sessions)
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


    directives.directive 'qiKTrans', ->
      restrict: 'E'
      templateUrl: '/partials/k-trans.html'


    directives.directive 'qiDemographics', ->
      restrict: 'E'
      templateUrl: '/partials/demographics.html'


    directives.directive 'qiEncounter', ->
      restrict: 'E'
      templateUrl: '/partials/encounter.html'


    directives.directive 'qiHormoneReceptor', ->
      restrict: 'E'
      templateUrl: '/partials/hormone-receptor.html'


    directives.directive 'qiTnm', ['TNM', (tnm) ->
      restrict: 'E'
      templateUrl: '/partials/tnm.html'
    ]


    directives.directive 'qiGrade', ->
      restrict: 'E'
      templateUrl: '/partials/grade.html'


    directives.directive 'qiModifiedBRGrade', ->
      restrict: 'E'
      templateUrl: '/partials/modified-b-r-grade.html'


    directives.directive 'qiFnclccGrade', ->
      restrict: 'E'
      templateUrl: '/partials/fnclcc-grade.html'


    # Displays the session intensity chart.
    directives.directive 'qiIntensityChart', ['Intensity', 'ObjectHelper',
      (Intensity, ObjectHelper) ->
        restrict: 'E'
        scope:
          session: '=' 
        link: (scope, element) ->
          # Wait for a session extended with detail to digest the scan.
          scope.$watch 'session.scans.t1', (scan) ->
            if scan?
              scope.config = Intensity.configureChart(scope.session, element)
        templateUrl: '/partials/intensity-chart.html'
    ]


    # Displays a scan or registration series 3D image.
    directives.directive 'qiImage', ->
      restrict: 'E'
      link: (scope, element) ->
        scope.$watch 'image.state', (state) ->
          if state is 'loaded'
            scope.image.open(element)
