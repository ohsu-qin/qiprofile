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

# Places a bolus arrival bar on the current graph element.
directives.directive 'qiBolusArrival', () ->
  restrict: 'E'
  link: (scope, element, attrs) ->
    # The intensity graph.
    chart = element.parent().find('nvd3-line-chart.qi-intensity-chart')[0]
    # Wait for the session detail to be fetched.
    scope.deferred_session.then (sess) ->
      # The chart axis tick marks start after the axis legend.
      # Therefore, the plot width is the chart width minus the y-axis
      # legend width and the plot height is the chart height minus the
      # data series legend and the x-axis legend.
      bar_width = element[0].clientWidth
      # The chart is positioned based on the parent CSS margin.
      chart_left = parseFloat(element.parent().css('marginLeft'))
      # The plot offset relative to the parent chart element.
      plot_offset = {left: 65, top: 29, bottom: 48, right: 35}
      plot =
        offset: plot_offset
        width: chart.clientWidth - plot_offset.left - plot_offset.right
        height: chart.clientHeight - plot_offset.top - plot_offset.bottom
      delta = plot.width / (sess.scan.intensity.intensities.length - 1)
      # The amount to shift the bar to the right from the origin.
      shift = sess.bolus_arrival_index * delta
      # Position the bar.
      element.offset(
        top: chart.offsetTop + plot.offset.top
        left: chart_left + plot.offset.left - (bar_width / 2) + shift
      )
      # The bar runs along the plot y axis.
      element.height(plot.height)

# Moves the element right by the specified number of x ticks.
directives.directive 'qiShiftBolusArrival', () ->
  link: (scope, element, attrs) ->
    # The current offset.
    offset = element.offset()
    # The intensity graph.
    chart = element.parent().find('nvd3-line-chart.qi-intensity-chart')[0]
    # Wait for the session detail to be fetched.
    scope.deferred_session.then (sess) ->
      # The chart x-axis tick marks start after the x-axis legend.
      # Therefore, the plot width is the chart width minus the x-axis
      # legend width.
      x_axis_legend_width = 100
      plot_width = chart.clientWidth - x_axis_legend_width
      delta = plot_width / (sess.scan.intensity.intensities.length - 1)
      # The amount to move.
      shift = sess.bolus_arrival_index * delta
      # Move the element right.
      element.offset(
        top: offset.top
        left: offset.left + shift
      )
