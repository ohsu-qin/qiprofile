directives = angular.module 'qiprofile.directives', []

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


# Displays the modeling tables.
directives.directive 'qiModelingTable', ['Modeling', (Modeling) ->
  restrict: 'E'
  scope:
    data: '='   # the subject sessions
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        scope.config = Modeling.configureTable(data)
  templateUrl: '/partials/modeling-table.html'
]


# Displays the MR session visit dateline chart.
directives.directive 'qiVisitDateline', ['VisitDateline', (VisitDateline) ->
  restrict: 'E'
  scope:
    data: '='   # the subject sessions
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        scope.config = VisitDateline.configureChart(data)
  templateUrl: '/partials/visit-dateline-chart.html'
]


# Displays the session intensity chart.
directives.directive 'qiIntensityChart', ['Intensity', (Intensity) ->
  restrict: 'E'
  scope:
    session: '=' 
  link: (scope, element, attrs) ->
    # Wait for a session extended with detail, including the scan.
    scope.$watch 'session.scan', (scan) ->
      if scan
        scope.config = Intensity.configureChart(scope.session)
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
        scope.renderer = scope.image.createRenderer()
  templateUrl: '/partials/series-image.html'
