define ['angular', 'dc', 'crossfilter', 'd3', 'breast'], (ng, dc) ->
  correlation = ng.module 'qiprofile.correlation', ['qiprofile.breast']

  correlation.factory 'Correlation', ['Breast', (Breast) ->
    prepareChartData: (charting) ->
      # From the data that was obtained via the REST query...
      #   subject?projection={"number": 1, "encounters": 1}&where={"project": "QIN_Test", "collection": "Breast"}
      #   ...extract the data that will be shown in the correlation charts.
      #
      # TO DO - Needs refactoring along with the configureCharts function in
      #   order to enable user selection of X and Y axes.
      chartData = []
      for subj in charting
        rcb = null
        for enc in subj.encounters
          if enc._cls == 'BreastSurgery'
            rcb = Breast.residualCancerBurden(enc.pathology.tumors[0])
        for enc, index in subj.encounters
          if enc.modelings?
            chartObj = {
              subject: subj.number
              visit: index + 1
              x: rcb.rcbIndex
              y: enc.modelings[0].result.delta_k_trans.average
              z: enc.modelings[0].result.v_e.average
              a: enc.modelings[0].result.tau_i.average
            }
            chartData.push chartObj
      chartData

    configureCharts: (chartData) ->
      # Configure the correlation charts.
      #
      # TO DO - Assign data to the various charts and assign axis labels
      #   according to user menu selections. Hard coded for now.
      axes = [
        {
          xLabel: 'RCB Index'
          yLabel: 'delta Ktrans'
        }
        {
          xLabel: 'RCB Index'
          yLabel: 'v_e'
        }
        {
          xLabel: 'RCB Index'
          yLabel: 'tau_i'
        }
        {
          xLabel: 'delta Ktrans'
          yLabel: 'v_e'
        }
      ]
      config =
        data: chartData
        axes: axes

    renderCharts: (config) ->
      # Render the correlation charts.
      dat = config.data
      axes = config.axes
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
      scale = [0, 1]
      ticks = 4
      gridLines = true
      symbolSize = 10

      # Set up the scatterplots.
      chart1 = dc.scatterPlot('#qi-correlation-chart-1')
      chart2 = dc.scatterPlot('#qi-correlation-chart-2')
      chart3 = dc.scatterPlot('#qi-correlation-chart-3')
      chart4 = dc.scatterPlot('#qi-correlation-chart-4')
      ndx = crossfilter(dat)
      dim1 = ndx.dimension((d) ->
        [
          +d.x
          +d.y
        ]
      )
      dim2 = ndx.dimension((d) ->
        [
          +d.x
          +d.z
        ]
      )
      dim3 = ndx.dimension((d) ->
        [
          +d.x
          +d.a
        ]
      )
      dim4 = ndx.dimension((d) ->
        [
          +d.y
          +d.z
        ]
      )
      group1 = dim1.group()
      group2 = dim2.group()
      group3 = dim3.group()
      group4 = dim4.group()
      chart1.width(width)
        .height(height)
        .x(d3.scale.linear().domain([0, 4]))
        .y(d3.scale.linear().domain([-0.15, 0]))
        .yAxisLabel(axes[0].yLabel)
        .xAxisLabel(axes[0].xLabel)
        .renderVerticalGridLines(gridLines)
        .renderHorizontalGridLines(gridLines)
        .symbolSize(symbolSize)
        .dimension(dim1)
        .group(group1)
      chart1.xAxis().ticks(ticks)
      chart1.yAxis().ticks(ticks)
      chart2.width(width)
        .height(height)
        .x(d3.scale.linear().domain([0, 4]))
        .y(d3.scale.linear().domain([0.2, 0.8]))
        .yAxisLabel(axes[1].yLabel)
        .xAxisLabel(axes[1].xLabel)
        .renderVerticalGridLines(gridLines)
        .renderHorizontalGridLines(gridLines)
        .symbolSize(symbolSize)
        .dimension(dim2)
        .group(group2)
      chart2.xAxis().ticks(ticks)
      chart2.yAxis().ticks(ticks)
      chart3.width(width)
        .height(height)
        .x(d3.scale.linear().domain([0, 4]))
        .y(d3.scale.linear().domain([0.2, 0.8]))
        .yAxisLabel(axes[2].yLabel)
        .xAxisLabel(axes[2].xLabel)
        .renderVerticalGridLines(gridLines)
        .renderHorizontalGridLines(gridLines)
        .symbolSize(symbolSize)
        .dimension(dim3)
        .group(group3)
      chart3.xAxis().ticks(ticks)
      chart3.yAxis().ticks(ticks)
      chart4.width(width)
        .height(height)
        .x(d3.scale.linear().domain([-0.15, 0]))
        .y(d3.scale.linear().domain([0.2, 0.8]))
        .yAxisLabel(axes[3].yLabel)
        .xAxisLabel(axes[3].xLabel)
        .renderVerticalGridLines(gridLines)
        .renderHorizontalGridLines(gridLines)
        .symbolSize(symbolSize)
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
      
      # Specify tooltips for the data points. Use the "renderlet"
      #   listener to specify the content of the tooltips after each rendering
      #   of the chart, including the initial rendering and any re-renderings
      #   after a brush gesture has been made.
      chart1.on 'renderlet', (chart1) ->
        chart1.selectAll('.symbol')
          .data(dat)
          .on('mouseover', (d) ->
            div.transition().duration(20).style 'opacity', .9
            div.html('Subject: ' + d.subject + '<br/>' + 'Visit: ' + d.visit).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
            return
          ).on('mouseout', (d) ->
            div.transition().duration(50).style 'opacity', 0
            return
          )
      chart2.on 'renderlet', (chart2) ->
        chart2.selectAll('.symbol')
          .data(dat)
          .on('mouseover', (d) ->
            div.transition().duration(20).style 'opacity', .9
            div.html('Subject: ' + d.subject + '<br/>' + 'Visit: ' + d.visit).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
            return
          ).on('mouseout', (d) ->
            div.transition().duration(50).style 'opacity', 0
            return
          )
      chart3.on 'renderlet', (chart3) ->
        chart3.selectAll('.symbol')
          .data(dat)
          .on('mouseover', (d) ->
            div.transition().duration(20).style 'opacity', .9
            div.html('Subject: ' + d.subject + '<br/>' + 'Visit: ' + d.visit).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
            return
          ).on('mouseout', (d) ->
            div.transition().duration(50).style 'opacity', 0
            return
          )
      chart4.on 'renderlet', (chart4) ->
        chart4.selectAll('.symbol')
          .data(dat)
          .on('mouseover', (d) ->
            div.transition().duration(20).style 'opacity', .9
            div.html('Subject: ' + d.subject + '<br/>' + 'Visit: ' + d.visit).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
            return
          ).on('mouseout', (d) ->
            div.transition().duration(50).style 'opacity', 0
            return
          )

  ]