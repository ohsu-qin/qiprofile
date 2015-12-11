define ['angular', 'lodash', 'underscore.string', 'spin', 'dc', 'crossfilter', 'd3', 'helpers',
        'summary', 'dateline', 'intensity', 'modeling'],
  (ng, _, _s, Spinner, dc) ->
    directives = ng.module(
      'qiprofile.directives',
      ['qiprofile.helpers', 'qiprofile.summary', 'qiprofile.dateline', 'qiprofile.intensity',
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


    # Displays the DC correlation charts.
    directives.directive 'qiCorrelationCharts', ['$compile',
      ($compile) ->
        restrict: 'A'
        link: (scope, element) ->

          renderCorrelationCharts = ->
            # Make the DC summary charts.

            d3.selection::moveToFront = ->
              # Enables a specified D3 element to be moved to the
              #   "front" layer of the visualization, which is
              #   necessary if that element is to be bound to
              #   mouseover events (e.g. tooltips).
              @each ->
                @parentNode.appendChild this
                return

            # The scatterplot layout parameters.
            height = 250
            width = 600
            xAxisLabel = "Undefined"
            yAxisLabel = "Undefined"
            scale = [0, 0]
            ticks = 4
            gridLines = true
            symbolSize = 10
            clipPadding = 10

            # Set up the scatterplots.
            chart1 = dc.scatterPlot('#qi-correlation-chart-1')
            chart2 = dc.scatterPlot('#qi-correlation-chart-2')
            chart3 = dc.scatterPlot('#qi-correlation-chart-3')
            chart4 = dc.scatterPlot('#qi-correlation-chart-4')
            # The charts are empty for now.
            csvData = 'x,y,z,a,b\n'
            data = d3.csv.parse(csvData)
            data.forEach (x) ->
              x.x = +x.x
              x.y = +x.y
              x.z = +x.z
              x.a = +x.a
              x.b = +x.b
              return
            ndx = crossfilter(data)
            dim1 = ndx.dimension((d) ->
              [
                +d.x
                +d.y
              ]
            )
            dim2 = ndx.dimension((d) ->
              [
                +d.y
                +d.z
              ]
            )
            dim3 = ndx.dimension((d) ->
              [
                +d.y
                +d.a
              ]
            )
            dim4 = ndx.dimension((d) ->
              [
                +d.y
                +d.b
              ]
            )
            group1 = dim1.group()
            group2 = dim2.group()
            group3 = dim3.group()
            group4 = dim4.group()
            chart1.width(width)
              .height(height)
              .x(d3.scale.linear().domain(scale))
              .y(d3.scale.linear().domain(scale))
              .yAxisLabel(yAxisLabel)
              .xAxisLabel(xAxisLabel)
              .renderVerticalGridLines(gridLines)
              .renderHorizontalGridLines(gridLines)
              .symbolSize(symbolSize)
              .clipPadding(clipPadding)
              .dimension(dim1)
              .group(group1)
            chart1.xAxis().ticks(ticks)
            chart1.yAxis().ticks(ticks)
            chart2.width(width)
              .height(height)
              .x(d3.scale.linear().domain(scale))
              .y(d3.scale.linear().domain(scale))
              .yAxisLabel(yAxisLabel)
              .xAxisLabel(xAxisLabel)
              .renderVerticalGridLines(gridLines)
              .renderHorizontalGridLines(gridLines)
              .symbolSize(symbolSize)
              .clipPadding(clipPadding)
              .dimension(dim2)
              .group(group2)
            chart2.xAxis().ticks(ticks)
            chart2.yAxis().ticks(ticks)
            chart3.width(width)
              .height(height)
              .x(d3.scale.linear().domain(scale))
              .y(d3.scale.linear().domain(scale))
              .yAxisLabel(yAxisLabel)
              .xAxisLabel(xAxisLabel)
              .renderVerticalGridLines(gridLines)
              .renderHorizontalGridLines(gridLines)
              .symbolSize(symbolSize)
              .clipPadding(clipPadding)
              .dimension(dim3)
              .group(group3)
            chart3.xAxis().ticks(ticks)
            chart3.yAxis().ticks(ticks)
            chart4.width(width)
              .height(height)
              .x(d3.scale.linear().domain(scale))
              .y(d3.scale.linear().domain(scale))
              .yAxisLabel(yAxisLabel)
              .xAxisLabel(xAxisLabel)
              .renderVerticalGridLines(gridLines)
              .renderHorizontalGridLines(gridLines)
              .symbolSize(symbolSize)
              .clipPadding(clipPadding)
              .dimension(dim4)
              .group(group4)
            chart4.xAxis().ticks(ticks)
            chart4.yAxis().ticks(ticks)
            dc.renderAll()

            # Move the chart data points to the front layer of the
            #   visualization so they can be bound to the tooltip
            #   mouseover events.
            d3.selectAll('.chart-body').moveToFront()

            # Append a tooltip div to the document.
            div = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)
            # TO DO - Specify tooltips for the data points. Use the "renderlet"
            #   listener to specify the content of the tooltips after each rendering
            #   of the chart, including the initial rendering and any re-renderings
            #   after a brush gesture has been made.

            # Compile the charts.
            element.removeAttr 'qi-correlation-charts'
            $compile(element)(scope)

          renderCorrelationCharts()

    ]
