define ['angular', 'dc', 'lodash', 'crossfilter', 'd3', 'breast'], (ng, dc) ->
  correlation = ng.module 'qiprofile.correlation', ['qiprofile.breast']

  correlation.factory 'Correlation', ['Breast', (Breast) ->
    # The charting configuration object.
    CHART_CONFIG =
      'rcbIndex':
          axisLabel: 'RCB Index'
          type: 'pathology'
          accessor: (path) ->
            rcb = Breast.residualCancerBurden(path.tumors[0])
            rcb.rcbIndex
      'deltaKtrans':
          axisLabel: 'delta Ktrans'
          type: 'modeling'
          accessor: (mod) ->
            mod.result.delta_k_trans.average
      've':
          axisLabel: 'v_e'
          type: 'modeling'
          accessor: (mod) ->
            mod.result.v_e.average
      'taui':
          axisLabel: 'tau_i'
          type: 'modeling'
          accessor: (mod) ->
            mod.result.tau_i.average

    # The list of X and Y axis options.
    AXES = _.keys CHART_CONFIG
    # Map the axis options to their display labels.
    LABELS = _.mapValues(CHART_CONFIG, (o) ->
      o.axisLabel
    )

    prepareChartData: (charting) ->
      # Extract the plot data from the data obtained via REST query, and prepare
      #   the list of data objects that will be sent to the rendering function.
      data = []
      for subj in charting
        for enc in subj.encounters
          if enc._cls == 'BreastSurgery'
            path = enc.pathology
        for enc, index in subj.encounters
          if enc.modelings
            mod = enc.modelings[0]
            dataObj =
              'subject': subj.number
              'visit': index + 1
            for axis in AXES
              if CHART_CONFIG[axis].type is 'modeling'
                dataObj[axis] = CHART_CONFIG[axis].accessor(mod)
              else
                dataObj[axis] = CHART_CONFIG[axis].accessor(path)
            data.push dataObj
      data

    calculateValueRanges: (data) ->
      # Calculate the min and max values for each category.
      # 
      # TO DO - Write a script to calculate these. See the Chart module.
      ranges =
        'rcbIndex':
          min: 1.5
          max: 3
        'deltaKtrans':
          min: -0.15
          max: 0
        've':
          min: 0.4
          max: 0.8
        'taui':
          min: 0.3
          max: 0.7

    addAxisLabels: (axes) ->
      # Provide the charts' X and Y axis labels.
      assignLabels = (chart) ->
        _.extend chart,
          xLabel: LABELS[chart.x]
          yLabel: LABELS[chart.y]
      axesWithLabels = assignLabels(chart) for chart in axes

    renderCharts: (config) ->
      # Render the correlation charts.
      dat = config.data
      ranges = config.ranges
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
      charts = [
        dc.scatterPlot('#qi-correlation-chart-0')
        dc.scatterPlot('#qi-correlation-chart-1')
        dc.scatterPlot('#qi-correlation-chart-2')
        dc.scatterPlot('#qi-correlation-chart-3')
      ]
      ndx = crossfilter(dat)
      for chart, index in charts
        dim = ndx.dimension((d) ->
          props = [
            d.rcbIndex
            d.deltaKtrans
            d.ve
            d.taui
          ]
          [
            props[AXES.indexOf(axes[index].x)]
            props[AXES.indexOf(axes[index].y)]
          ]
        )
        group = dim.group()
        rangeX = [
          ranges[axes[index].x].min
          ranges[axes[index].x].max
        ]
        rangeY = [
          ranges[axes[index].y].min
          ranges[axes[index].y].max
        ]
        chart.width(width)
          .height(height)
          .x(d3.scale.linear().domain(rangeX))
          .y(d3.scale.linear().domain(rangeY))
          .xAxisLabel(axes[index].xLabel)
          .yAxisLabel(axes[index].yLabel)
          .renderVerticalGridLines(gridLines)
          .renderHorizontalGridLines(gridLines)
          .symbolSize(symbolSize)
          .dimension(dim)
          .group(group)
        chart.xAxis().ticks(ticks)
        chart.yAxis().ticks(ticks)

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

      for chart in charts
        chart.on 'renderlet', (chart) ->
          chart.selectAll('.symbol')
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