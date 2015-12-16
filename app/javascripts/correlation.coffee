define ['angular', 'dc', 'crossfilter', 'd3',], (ng, dc) ->
  correlation = ng.module 'qiprofile.correlation', []

  correlation.factory 'Correlation', ->
    renderCorrelationCharts: () ->
      # Render the correlation charts.

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
      #   after a brush gesture has been made, e.g.:
      #
      #   chart1.on 'renderlet', (chart1) ->
      #      chart1.selectAll('.symbol')
      #        .data(data)
      #        .on('mouseover', (d) ->
      #          div.transition().duration(20).style 'opacity', .9
      #          div.html('Subject: ' + d.subject + '<br/>' + 'Visit: ' + d.visit).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
      #          return
      #        ).on('mouseout', (d) ->
      #          div.transition().duration(50).style 'opacity', 0
      #          return
      #        )
