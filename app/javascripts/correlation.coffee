define ['angular', 'dc', 'lodash', 'crossfilter', 'd3', 'breast'], (ng, dc) ->
  correlation = ng.module 'qiprofile.correlation', ['qiprofile.breast']

  correlation.factory 'Correlation', ['Breast', (Breast) ->
    # The charting data types.
    CHART_DATA_CONFIG =
      'fxlKTrans':
          label: 'FXL Ktrans'
          isImaging: true
          coll: 'all'
          accessor: (modelingResult) -> modelingResult.fxlKTrans.average
      'fxrKTrans':
          label: 'FXR Ktrans'
          isImaging: true
          coll: 'all'
          accessor: (modelingResult) -> modelingResult.fxrKTrans.average
      'deltaKTrans':
          label: 'delta Ktrans'
          isImaging: true
          coll: 'all'
          accessor: (modelingResult) -> modelingResult.deltaKTrans.average
      'vE':
          label: 'v_e'
          isImaging: true
          coll: 'all'
          accessor: (modelingResult) -> modelingResult.vE.average
      'tauI':
          label: 'tau_i'
          isImaging: true
          coll: 'all'
          accessor: (modelingResult) -> modelingResult.tauI.average
      'tumorLength':
          label: 'Tumor Length (mm)'
          isImaging: false
          coll: 'all'
          accessor: (tumor) ->
            if tumor.extent?
              if tumor.extent.length? then tumor.extent.length else null
            else
              null
      'tumorWidth':
          label: 'Tumor Width (mm)'
          isImaging: false
          coll: 'all'
          accessor: (tumor) ->
            if tumor.extent?
              if tumor.extent.width? then tumor.extent.width else null
            else
              null
      'tumorDepth':
          label: 'Tumor Depth (mm)'
          isImaging: false
          coll: 'all'
          accessor: (tumor) ->
            if tumor.extent?
              if tumor.extent.depth? then tumor.extent.depth else null
            else
              null
      'recurrenceScore':
          label: 'Recurrence Score'
          isImaging: false
          coll: 'Breast'
          accessor: (tumor) ->
            if tumor.geneticExpression.normalizedAssay?
              Breast.recurrenceScore(tumor.geneticExpression.normalizedAssay)
            else
              null
      'rcbIndex':
          label: 'RCB Index'
          isImaging: false
          coll: 'Breast'
          accessor: (tumor) ->
            if tumor.rcb?
              rcb = Breast.residualCancerBurden(tumor)
              rcb.rcbIndex
            else
                null
      'necrosisPercent':
          label: 'Necrosis Percent'
          isImaging: false
          coll: 'Sarcoma'
          accessor: (tumor) ->
            if tumor.necrosisPercent?
              if tumor.necrosisPercent._cls == 'NecrosisPercentValue'
                tumor.necrosisPercent.value
              else
                _.mean [tumor.necrosisPercent.start.value, tumor.necrosisPercent.stop.value]
            else
              null

    # The list of data types.
    DATA_TYPES = _.keys CHART_DATA_CONFIG

    # Map the data types to their display labels.
    LABELS = _.mapValues(CHART_DATA_CONFIG, (o) ->
      o.label
    )

    # The chart layout parameters.
    CHART_LAYOUT_PARAMS =
      height: 280
      width: 600
      ticks: 4
      axisPadding: .2
      symbolSize: 10
      symbolFill: ['red', 'blue', 'green']

    # The default display data types.
    DEFAULT_AXES:
      'Breast':
        [
          {
            x: 'rcbIndex'
            y: 'deltaKTrans'
          }
          {
            x: 'rcbIndex'
            y: 'vE'
          }
          {
            x: 'recurrenceScore'
            y: 'tauI'
          }
          {
            x: 'vE'
            y: 'deltaKTrans'
          }
        ]
      'Sarcoma':
        [
          {
            x: 'necrosisPercent'
            y: 'deltaKTrans'
          }
          {
            x: 'necrosisPercent'
            y: 'vE'
          }
          {
            x: 'necrosisPercent'
            y: 'tauI'
          }
          {
            x: 'tumorLength'
            y: 'deltaKTrans'
          }
        ]

    prepareChartData: (charting, coll) ->
      # Extract the plot data from the data obtained via REST query, and prepare
      #   the list of data objects that will be sent to the rendering function.
      data = []
      for subj in charting
        for enc in subj.encounters
          if enc._cls == 'BreastSurgery' or enc._cls == 'Surgery'
            if enc.pathology.tumors?
              tumors = enc.pathology.tumors
            else
              tumors = null
        for enc, index in subj.encounters
          if enc.modelings
            modelingResult = enc.modelings[0].result
            dataObj =
              'subject': subj.number
              'visit': index + 1
            for dt in DATA_TYPES
              config = CHART_DATA_CONFIG[dt]
              if config.coll == 'all' or config.coll == coll
                if config.isImaging
                  dataObj[dt] = config.accessor(modelingResult)
                else
                  if tumors?
                    tumor = tumors[0]
                    dataObj[dt] = config.accessor(tumor)
            data.push dataObj
      data

    calculateScales: (data) ->
      # For each data type, calculate the range and the chart padding.
      #
      # TO DO - Pass in the collection type and perform the function only on
      #   valid data types.
      scales = {}
      for dt in DATA_TYPES
        allValues =
          dat[dt] for dat in data
        max = _.max allValues
        min = _.min allValues
        diff = max - min
        # TO DO - Calculate a padding where diff is zero.
        if diff != 0
          padding = Math.abs(diff) * CHART_LAYOUT_PARAMS.axisPadding
        else
          padding = 1
        scales[dt] =
          range: [min, max]
          padding: Number(padding.toPrecision(2))
      scales

    dataTypeChoices: (coll) ->
      choices = {}
      for dt in DATA_TYPES
        config = CHART_DATA_CONFIG[dt]
        if config.coll == 'all' or config.coll == coll
          choices[dt] = config.label
      choices

    getLabels: (axes) ->
      # Make a chart object containing X and Y display labels.
      labelProps = (chart) ->
        chartObj =
          xLabel: LABELS[chart.x]
          yLabel: LABELS[chart.y]
      charts = labelProps(chart) for chart in axes

    renderCharts: (config) ->
      # Render the correlation charts.
      dat = config.data
      scales = config.scales
      axes = config.axes
      d3.selection::moveToFront = ->
        # Enables a specified D3 element to be moved to the
        #   "front" layer of the visualization, which is
        #   necessary if that element is to be bound to
        #   mouseover events (e.g. tooltips).
        @each ->
          @parentNode.appendChild this
          return

      # Set up the scatterplots.
      charts = [
        dc.scatterPlot('#qi-correlation-chart-0')
        dc.scatterPlot('#qi-correlation-chart-1')
        dc.scatterPlot('#qi-correlation-chart-2')
        dc.scatterPlot('#qi-correlation-chart-3')
      ]
      ndx = crossfilter(dat)
      for chart, index in charts
        xAxis = axes[index].x
        yAxis = axes[index].y
        dim = ndx.dimension((d) ->
          # The properties must correspond to the CHART_DATA_CONFIG objects.
          props = [
            d.fxlKTrans
            d.fxrKTrans
            d.deltaKTrans
            d.vE
            d.tauI
            d.tumorLength
            d.tumorWidth
            d.tumorDepth
            d.recurrenceScore
            d.rcbIndex
            d.necrosisPercent
          ]
          # Return the properties corresponding to the user selections.
          [
            props[DATA_TYPES.indexOf(xAxis)]
            props[DATA_TYPES.indexOf(yAxis)]
          ]
        )
        group = dim.group()
        chart.width(CHART_LAYOUT_PARAMS.width)
          .height(CHART_LAYOUT_PARAMS.height)
          .x(d3.scale.linear().domain(scales[xAxis].range))
          .y(d3.scale.linear().domain(scales[yAxis].range))
          .elasticX(true)
          .elasticY(true)
          .xAxisLabel(LABELS[xAxis])
          .yAxisLabel(LABELS[yAxis])
          .xAxisPadding(scales[xAxis].padding)
          .yAxisPadding(scales[yAxis].padding)
          .renderVerticalGridLines(true)
          .renderHorizontalGridLines(true)
          .symbolSize(CHART_LAYOUT_PARAMS.symbolSize)
          .dimension(dim)
          .group(group)
        chart.xAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
        chart.yAxis().ticks(CHART_LAYOUT_PARAMS.ticks)

      dc.renderAll()

      # Move the chart data points to the front layer of the
      #   visualization so they can be bound to the tooltip
      #   mouseover events...
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
            .attr('fill', (d) -> CHART_LAYOUT_PARAMS.symbolFill[d.subject - 1])
            .on('mouseover', (d) ->
              div.transition().duration(20).style 'opacity', .9
              div.html('Subject: ' + d.subject + '<br/>' + 'Visit: ' + d.visit).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
              return
            ).on('mouseout', (d) ->
              div.transition().duration(50).style 'opacity', 0
              return
            )

  ]