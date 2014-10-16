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
    directives.directive 'qiClinicalProfile', ['Clinical', (Clinical) ->
      restrict: 'E'
      link: (scope, element, attrs) ->
        scope.$watch 'subject', (subject) ->
          if subject
            scope.config = Clinical.configureProfile(subject)
      templateUrl: '/partials/clinical-profile.html'
    ]


    # Subject Detail clinical profile directives. There is a unique
    # directive for demographics and for each encounter and outcome.
    ENCOUNTER_DIRECTIVES = ['Biopsy']
    OUTCOME_DIRECTIVES = ['BreastPathology', 'TNM']
    CLINICAL_DIRECTIVES =
      ['Demographics']
        .concat(ENCOUNTER_DIRECTIVES)
        .concat(OUTCOME_DIRECTIVES)
    
    for directive in CLINICAL_DIRECTIVES
      # The directive name, e.g. qiDemographicsTable.
      name = "qi#{ directive }Table"
      # The directive URL, e.g. /partials/breast-pathology-table.
      url = "/partials/#{ _s.dasherize(directive) }-table.html"
      # Declare the directive.
      directives.directive name, ->
        restrict: 'E'
        link: (scope) ->
          # The accordion group is initially open.
          scope.isOpen = true
        templateUrl: url


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
          # Wait for a session extended with detail to digest both the scan
          # and the registrations. Both the scan and registrations listener
          # are necessary because there is a data series for the scan and
          # each registration.
          scope.$watch 'session.scan', (scan) ->
            if scan?
              scope.$watch 'session.registrations', (regs) ->
                if regs?
                  scope.config = Intensity.configureChart(scope.session, element)
        templateUrl: '/partials/intensity-chart.html'
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
