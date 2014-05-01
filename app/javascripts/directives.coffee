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
# 
# 
# # Draws a dateline.
# directives.directive 'qiDateline', ['Helpers', (Helpers) ->
#   # Formats the dateline from the given data.
#   format = (scope, element, attrs) ->
#     # Reformats the chart.
#     # @param chart the SVG chart element
#     # @param scales
#     # @param config the {x : {scale, axes: [{element, axis}, ...},
#     #                    y : ...} data structure
#     resize = (chart, config) ->
#       chartNode = chart.node()
#       # The parent element.
#       parent = chartNode.parentNode
#       # The chart height and width.
#       height = $(parent).height()
#       width = $(parent).width()
#       # Resize the chart.
#       config.x.scale.range([0, width])
#       for {element: elt, axis: axis} in config.x.axes
#         elt.attr('transform', "translate(0, #{ height })")
#         elt.call(axis)
#       if config.y
#         config.y.scale.range([height, 0])
#         for {element: elt, axis: axis} in config.y.axes
#           elt.call(axis)
# 
#     # The element which contains the chart.
#     parent = d3.select(element[0])
#     # The visits to display.
#     data = scope.data
#     # The visit dates.
#     dates =
#         obj[attrs.attribute] for obj in data
# 
#     # The x axis scale.
#     x_scale = d3.scale.linear()
#     domain = [_.min(dates), _.max(dates)]
#     x_scale.domain(domain)
# 
#     # The SVG chart.
#     chart = parent.append('svg')
# 
#     # The dates are displayed along the x axis bottom.
#     bot_axis = d3.svg.axis()
#     bot_axis.scale(x_scale).orient('bottom').tickValues(dates)
#       .tickFormat(Helpers.dateFormat)
#     bottom = chart.append('g').attr('class', 'x axis')
#     
#     # The visit numbers are displayed along the x axis top.
#     top_axis = d3.svg.axis()
#     top_axis.scale(x_scale).orient('top').tickValues(dates)
#       .tickFormat(Helpers.indexFormatter(dates, 1))
#     top = chart.append('g').attr('class', 'x axis')
#     
#     # The chart data structure.
#     config =
#       x:
#         scale: x_scale
#         axes: [
#           {element: bottom, axis: bot_axis}
#           {element: top, axis: top_axis}
#         ]
#     
#     # The visit hyperlinks.
#     hrefs =
#       scope.href(obj) for obj in data
#     # Replace the visit text with hyperlinks.
#     Helpers.d3Hyperlink(top, hrefs)
#     
#     # Make the chart responsive.
#     d3.select(window).on('resize', resize(chart, config))
#     
#     # Set the initial chart size.
#     resize(chart, config)
#     
#   # Make the directive.
#   restrict: 'E'
#   scope:
#     data: '='
#     href: '='
#     width: '@'
#     height: '@'
#   link: (scope, element, attrs) ->
#     scope.$watch 'data', (data) ->
#       if data
#         format(scope, element, attrs)
# ]