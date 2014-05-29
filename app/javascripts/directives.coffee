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
    data: '='
    chart: '='
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        scope.config = Modeling.configureChart(data, attrs.chart)
  templateUrl: '/templates/modeling-discrete-chart.html'
]


# Displays a multi bar chart.
directives.directive 'qiModelingMultiChart', ['Modeling', (Modeling) ->
  restrict: 'E'
  scope:
    data: '='
    chart: '='
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        scope.config = Modeling.configureChart(data, attrs.chart)
  templateUrl: '/templates/modeling-multi-chart.html'
]


# Displays a modeling chart.
directives.directive 'qiVisitDateline', ['VisitDateline', (VisitDateline) ->
  restrict: 'E'
  scope:
    data: '='
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        scope.config = VisitDateline.configureChart(data)
  templateUrl: '/templates/visit-dateline-chart.html'
]


# Displays a series image.
directives.directive 'qiSeriesImage', ->
  restrict: 'E'
  scope:
    image: '='
  link: (scope, element, attrs) ->
    scope.$watch 'image.data', (data) ->
      if data
        scope.image.configureRenderer()
  templateUrl: '/templates/series-image-xtk.html'
