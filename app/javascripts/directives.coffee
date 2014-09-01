define ['angular', 'lodash', 'spin', 'helpers', 'dateline', 'intensity', 'modeling', 'clinical'],
  (ng, _, Spinner) ->
    directives = ng.module(
      'qiprofile.directives',
      ['qiprofile.helpers', 'qiprofile.dateline', 'qiprofile.intensity', 'qiprofile.modeling', 'qiprofile.clinical']
    )
    
    # Spinner directive.
    directives.directive 'qiSpin', ->
      (scope, element, attrs) ->
        # Replaces the DOM element with a spinner
        # while the qiSpin attribute is set.
  
        createSpinner = ->
          # Creates an image selection spinner.
          new Spinner(
            lines: 10
            width: 4
            length: 4
            radius: 4
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


    # Displays a discrete bar chart.
    directives.directive 'qiModelingDiscreteChart', ['Modeling', (Modeling) ->
      restrict: 'E'
      scope:
        data: '='   # the subject sessions
        chart: '='  # the chart type, e.g. 'ktrans'
      link: (scope, element, attrs) ->
        scope.$watch 'data', (data) ->
          if data
            scope.config = Modeling.configureChart(data, attrs.chart)
      templateUrl: '/partials/modeling-discrete-chart.html'
    ]


    # Displays a multi bar chart.
    directives.directive 'qiModelingMultiChart', ['Modeling', (Modeling) ->
      restrict: 'E'
      scope:
        data: '='   # the subject sessions
        chart: '='  # the chart type, e.g. 'ktrans'
      link: (scope, element, attrs) ->
        scope.$watch 'data', (data) ->
          if data
            scope.config = Modeling.configureChart(data, attrs.chart)
      templateUrl: '/partials/modeling-multi-chart.html'
    ]


    # Displays the MR session visit dateline chart.
    directives.directive 'qiVisitDateline', ['VisitDateline', '$compile',
      (VisitDateline, $compile) ->
        restrict: 'E'
        scope:
          subject: '='   # the subject
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


    # Displays the modeling tables.
    directives.directive 'qiModelingTable', ['Modeling', (Modeling) ->
      restrict: 'E'
      scope:
        sessions: '='   # the subject sessions
      link: (scope, element, attrs) ->
        scope.$watch 'sessions', (sessions) ->
          if sessions
            scope.config = Modeling.configureTable(sessions)
      templateUrl: '/partials/modeling-table.html'
    ]


    # Displays the clinical profile.
    directives.directive 'qiClinicalTable', ['Clinical', (Clinical) ->
      restrict: 'E'
      scope:
        subject: '='   # the subject
      link: (scope, element, attrs) ->
        scope.$watch 'subject', (subject) ->
          if subject
            scope.config = Clinical.configureProfile(subject)
      templateUrl: '/partials/clinical-table.html'
    ]


    # Displays a clinical outcome.
    directives.directive 'qiOutcomeTable', ['Clinical', (Clinical) ->
      restrict: 'E'
      scope:
        outcome: '='  # the outcome data
        group: '='    # the outcome data group, e.g. 'tnm'
      link: (scope, element, attrs) ->
        scope.$watch 'outcome', (outcome) ->
          if outcome
            scope.config = Clinical.configureOutcome(outcome, attrs.group)
      templateUrl: '/partials/outcome-table.html'
    ]


    # Displays the session intensity chart.
    directives.directive 'qiIntensityChart', ['Intensity', 'ObjectHelper',
      (Intensity, ObjectHelper) ->
        restrict: 'E'
        scope:
          session: '=' 
        link: (scope, element, attrs) ->
          # Wait for a session extended with detail to digest the scan.
          scope.$watch 'session.scan', (scan) ->
            if ObjectHelper.exists(scan)
              scope.config = Intensity.configureChart(scope.session, element)
        templateUrl: '/partials/intensity-chart.html'
    ]


    # Displays the series image selection.
    directives.directive 'qiImageSelection', ['Intensity', 'ObjectHelper',
      (Intensity, ObjectHelper) ->
        restrict: 'E'
        scope:
          session: '=' 
        link: (scope, element, attrs) ->
          # Wait for a session extended with detail to digest both the scan
          # and the registrations. The registrations listener is necessary
          # because the registration buttons are not added to the DOM until
          # just before the registrations listener is called.
          scope.$watch 'session.scan', (scan) ->
            if ObjectHelper.exists(scan)
              scope.$watch 'session.registrations', (regs) ->
                if ObjectHelper.exists(regs)
                  scope.config = Intensity.formatSelection(element)
        templateUrl: '/partials/image-selection.html'
    ]


    # Displays a scan or registration series 3D image.
    directives.directive 'qiSeriesImage', ->
      restrict: 'E'
      scope:
        image: '='
      link: (scope, element, attrs) ->
        scope.$watch 'image.data', (data) ->
          if data
            scope.image.open(element)
