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


# Draws a dateline.
directives.directive 'qiDateline', ['Helpers', (Helpers) ->
  # Formats the dateline from the given data.
  format = (scope, element, attrs) ->
    data = scope.data
    dates =
        obj[attrs.attribute] for obj in data
    width = attrs.width or element.parent().width()
    height = attrs.height or element.parent().height()

    x = d3.scale.linear()
    domain = [_.min(dates), _.max(dates)]
    x.domain(domain).range([0, width])

    # The dates are displayed along the x axis bottom.
    bot_axis = d3.svg.axis()
    bot_axis.scale(x).orient('bottom').tickValues(dates)
      .tickFormat(Helpers.dateFormat)
    
    top_axis = d3.svg.axis()
    top_axis.scale(x).orient('top').tickValues(dates)
      .tickFormat(Helpers.indexFormatter(dates, 1))

    svg = d3.select(element[0]).append('svg')
      .attr('width', width - 140)
      .attr('height', height)
    svg.append('g').attr('class', 'x axis')
      .attr('transform', 'translate(50, ' + height + ')')
      .call(bot_axis)
    top = svg.append('g').attr('class', 'x axis')
      .attr('transform', 'translate(50, ' + height + ')')
      .call(top_axis)
    
    hrefs =
      scope.href(obj) for obj in data
    
    Helpers.d3Hyperlink(top, hrefs)
    
  # Make the directive.
  restrict: 'E'
  scope:
    data: '='
    href: '='
    width: '@'
    height: '@'
  link: (scope, element, attrs) ->
    scope.$watch 'data', (data) ->
      if data
        format(scope, element, attrs)
]