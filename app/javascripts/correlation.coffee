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
      symbolSize: 8
      symbolFill: ['red', 'blue', 'green']

    # The default charts to be displayed.
    DEFAULT_CHARTS:
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

    dataTypeChoices: (coll) ->
      choices = LABELS
      for key of LABELS
        config = CHART_DATA_CONFIG[key]
        if config.coll != 'all' and config.coll != coll
          delete choices[key]
      choices

    prepareChartData: (charting, choices) ->
      # Extract the plot data from the data obtained via REST query, and prepare
      #   the list of data objects that will be sent to the rendering function.
      data = new Array
      for subj in charting
        tumors = null
        for enc in subj.encounters
          if _.endsWith(enc._cls, 'Surgery')
            if enc.pathology.tumors? then tumors = enc.pathology.tumors
        for enc, index in subj.encounters
          if enc.modelings
            for mod in enc.modelings
              modelingResult = mod.result
              dataObj =
                'subject': subj.number
                'visit': index + 1
              for key of choices
                config = CHART_DATA_CONFIG[key]
                if config.isImaging
                  dataObj[key] = config.accessor(modelingResult)
                else if tumors?
                  tumor = tumors[0]
                  dataObj[key] = config.accessor(tumor)
              data.push dataObj

      # Return the data objects
      data

    calculateScales: (data, choices) ->
      # For each valid data type, calculate the range and the chart padding.
      scales = new Object
      for key of choices
        allValues =
          dat[key] for dat in data
        max = _.max allValues
        min = _.min allValues
        diff = max - min
        if diff != 0
          result = diff * CHART_LAYOUT_PARAMS.axisPadding
          pad = Number(result.toPrecision(2))
        else
          max = Math.abs(max)
          result = Math.ceil(Math.log(max) / Math.log(10))
          if Math.abs(result) is Infinity then result = 0
          pad = CHART_LAYOUT_PARAMS.ticks / 2 * Math.pow(10, result - 1)
        scales[key] =
          range: [min, max]
          padding: pad
      scales

    renderCharts: (config) ->
      # Render the correlation charts.
      dat = config.data
      scales = config.scales
      chartsToDisplay = config.charts
      d3.selection::moveToFront = ->
        # Enables a specified D3 element to be moved to the
        #   "front" layer of the visualization, which is
        #   necessary if that element is to be bound to
        #   mouseover events (e.g. tooltips).
        @each ->
          @parentNode.appendChild this
          return

      # Set up the scatterplots.
      charts =
        dc.scatterPlot('#qi-correlation-chart-' + i) for i in [0...4]
      ndx = crossfilter(dat)
      for chart, index in charts
        xAxis = chartsToDisplay[index].x
        yAxis = chartsToDisplay[index].y
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

      # Move the chart data points to the front layer of the visualization so
      #   they can be bound to the tooltip mouseover events.
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