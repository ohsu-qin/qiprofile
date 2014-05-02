directives = angular.module 'qiprofile.directives', []

# Spinner directive.
directives.directive 'qiSpin', () ->
  (scope, element, attrs) ->
    # Replaces the DOM element with a spinner
    # while the qiSpin attribute is set.
    
    create_spinner = () ->
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
          scope.spinner = create_spinner()
        scope.spinner.spin(element[0])
      else if scope.spinner
        scope.spinner.stop()


# Displays a modeling chart.
directives.directive 'qiModelingChart', ['Modeling', (Modeling) ->
  restrict: 'E'
  scope:
    data: '='
    chart: '='
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        scope.config = Modeling.configure_chart(data, attrs.chart)
  templateUrl: '/templates/modeling_chart.html'
]


# Displays a modeling chart.
directives.directive 'qiVisitDateline', ['VisitDateline', (VisitDateline) ->
  restrict: 'E'
  scope:
    data: '='
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        scope.config = VisitDateline.configure_chart(data)
  templateUrl: '/templates/visit_dateline_chart.html'
]
