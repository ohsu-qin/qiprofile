define ['angular', 'dc', 'lodash', 'crossfilter', 'd3', 'breast'], (ng, dc) ->
  correlation = ng.module 'qiprofile.correlation', ['qiprofile.breast']

  correlation.factory 'Correlation', ['Breast', (Breast) ->
    # The charting data types. They are in the order in which they appear in
    #   the X/Y axis selection dropdowns. The key value is the handle for each
    #   data type. Each has the following properties:
    #     * label - Appears in the dropdown picklists and as chart axis labels.
    #     * coll - The collection(s) for which the data type is valid. May be
    #         'all' or a list of specific collections.
    #     * accessor - The data accessor.
    #
    #   The order of the data types and their handles must be exactly
    #   consistent with the property list in the dimension constructor in the
    #   renderCharts function.
    #
    #   Note that necrosis percent can exist either as a single value or a
    #   range. In the latter case, the mean of the upper and lower values is
    #   obtained and passed on to the charts.
    CHART_DATA_CONFIG =
      'fxlKTrans':
          label: 'FXL Ktrans'
          coll: [
            'all'
          ]
          accessor: (modelingResult) -> modelingResult.fxlKTrans.average
          pAccessor: (p) -> p.value.fxlKTrans
      'fxrKTrans':
          label: 'FXR Ktrans'
          coll: [
            'all'
          ]
          accessor: (modelingResult) -> modelingResult.fxrKTrans.average
          pAccessor: (p) -> p.value.fxrKTrans
      'deltaKTrans':
          label: 'delta Ktrans'
          coll: [
            'all'
          ]
          accessor: (modelingResult) -> modelingResult.deltaKTrans.average
          pAccessor: (p) -> p.value.deltaKTrans
      'vE':
          label: 'v_e'
          coll: [
            'all'
          ]
          accessor: (modelingResult) -> modelingResult.vE.average
          pAccessor: (p) -> p.value.vE
      'tauI':
          label: 'tau_i'
          coll: [
            'all'
          ]
          accessor: (modelingResult) -> modelingResult.tauI.average
          pAccessor: (p) -> p.value.tauI
      'tumorLength':
          label: 'Tumor Length (mm)'
          coll: [
            'all'
          ]
          accessor: (tumor) ->
            return null unless tumor.extent?
            if tumor.extent.length? then tumor.extent.length else null
      'tumorWidth':
          label: 'Tumor Width (mm)'
          coll: [
            'all'
          ]
          accessor: (tumor) ->
            return null unless tumor.extent?
            if tumor.extent.width? then tumor.extent.width else null
      'tumorDepth':
          label: 'Tumor Depth (mm)'
          coll: [
            'all'
          ]
          accessor: (tumor) ->
            return null unless tumor.extent?
            if tumor.extent.depth? then tumor.extent.depth else null
      'recurrenceScore':
          label: 'Recurrence Score'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            return null unless tumor.geneticExpression.normalizedAssay?
            Breast.recurrenceScore(tumor.geneticExpression.normalizedAssay)
          pAccessor: (p) -> p.value.recurrenceScore
      'ki67':
          label: 'Ki67 Expression'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            return null unless tumor.geneticExpression?
            if tumor.geneticExpression.ki67?
              tumor.geneticExpression.ki67
            else
              null
      'gstm1':
          label: 'GSTM1 Normalized Assay'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            return null unless tumor.geneticExpression.normalizedAssay?
            if tumor.geneticExpression.normalizedAssay.gstm1?
              tumor.geneticExpression.normalizedAssay.gstm1
            else
              null
      'cd68':
          label: 'CD68 Normalized Assay'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            return null unless tumor.geneticExpression.normalizedAssay?
            if tumor.geneticExpression.normalizedAssay.cd68?
              tumor.geneticExpression.normalizedAssay.cd68
            else
              null
      'bag1':
          label: 'BAG1 Normalized Assay'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            return null unless tumor.geneticExpression.normalizedAssay?
            if tumor.geneticExpression.normalizedAssay.bag1?
              tumor.geneticExpression.normalizedAssay.bag1
            else
              null
      'grb7':
          label: 'GRB7 Normalized Assay'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            return null unless tumor.geneticExpression.normalizedAssay?
            if tumor.geneticExpression.normalizedAssay.her2?
              tumor.geneticExpression.normalizedAssay.her2.grb7
            else
              null
      'her2':
          label: 'HER2 Normalized Assay'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            return null unless tumor.geneticExpression.normalizedAssay?
            if tumor.geneticExpression.normalizedAssay.her2?
              tumor.geneticExpression.normalizedAssay.her2.her2
            else
              null
      'rcbIndex':
          label: 'RCB Index'
          coll: [
            'Breast'
          ]
          accessor: (tumor) ->
            if tumor.rcb?
              rcb = Breast.residualCancerBurden(tumor)
              rcb.rcbIndex
            else
                null
          pAccessor: (p) -> p.value.rcbIndex
      'necrosisPercent':
          label: 'Necrosis Percent'
          coll: [
            'Sarcoma'
          ]
          accessor: (tumor) ->
            if tumor.necrosisPercent?
              if tumor.necrosisPercent._cls == 'NecrosisPercentValue'
                tumor.necrosisPercent.value
              else if tumor.necrosisPercent._cls == 'NecrosisPercentRange'
                _.mean [
                  tumor.necrosisPercent.start.value
                  tumor.necrosisPercent.stop.value
                ]
              else
                null
            else
              null

    # The complete list of data types.
    DATA_TYPES = _.keys CHART_DATA_CONFIG

    # Map the data type handles to their display labels.
    LABELS = _.mapValues(CHART_DATA_CONFIG, (o) ->
      o.label
    )

    # The imaging data types.
    IMAGING_DATA_TYPES = [
      "fxlKTrans"
      "fxrKTrans"
      "deltaKTrans"
      "vE"
      "tauI"
    ]

    # The chart layout parameters.
    CHART_LAYOUT_PARAMS =
      height: 280
      width: 600
      axisPadding: .2
      symbolSize: 8
      ticks: 4
      leftMargin: 6

    # The default chart data types to be displayed, by collection.
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

    # Creates an object containing only those data types that are valid for the
    #   current collection. These are the choices that will appear in the X/Y
    #   axis selection dropdowns.
    #
    # @param coll the collection
    # @returns the valid data types for the current collection
    dataTypeChoices: (coll) ->
      choices = new Object
      for key of LABELS
        config = CHART_DATA_CONFIG[key]
        if 'all' in config.coll or coll in config.coll
          choices[key] = LABELS[key]
      choices

    # Obtains and formats the scatterplot data for display in the charts. The
    #   data consist of an array of objects where each object contains the
    #   subject and visit numbers followed by the valid data types for the
    #   current collection, e.g.:
    #     {
    #       'subject': 1
    #       'visit': 1
    #       'fxlKTrans': 0.19331708519426527
    #       ...
    #       'recurrenceScore': null
    #       'rcbIndex': 1.746018789130012
    #     }
    #   The DC charts require each object to contain all the same keys. If data
    #   is not available for a data type, it must be assigned the value 'null'.
    #
    # @param charting the REST query result
    # @param choices the valid data types for the current collection
    # @returns the scatterplot data
    prepareScatterPlotData: (charting, choices) ->
      # @param s the subject number
      # @param v the visit number
      # @param modResult the modeling result
      # @param tumor the tumor pathology
      # @returns a complete scatterplot data object
      constructDCObject = (s, v, modResult, tumor) ->
        # Create a new data object with core properties.
        dcObject =
            'uid': s.toString() + '-' + v.toString()
            'subject': s
            'visit': v
        # Iterate over the valid data types and add data to the object.
        for key of choices
          config = CHART_DATA_CONFIG[key]
          if key in IMAGING_DATA_TYPES
            dcObject[key] = config.accessor(modResult)
          else if tumor?
            dcObject[key] = config.accessor(tumor)
          else
            dcObject[key] = null
        # Return the data object.
        dcObject

      # Initialize the data object array.
      data = new Array
      # Iterate over the subjects.
      for subj in charting
        # Obtain the tumor pathology data from the Surgery encounter.
        tumors = null
        for enc in subj.encounters
          if _.endsWith(enc._cls, 'Surgery') and enc.pathology.tumors?
            tumors = enc.pathology.tumors
        # Iterate over the subject encounters. If an encounter is a modeling
        #   session, construct a data object with the modeling and, if
        #   available, tumor pathology data.
        for enc, i in subj.encounters
          if enc._cls == 'Session'
            for mod in enc.modelings
              if not tumors
                dcObject = constructDCObject(
                  subj.number, i + 1, mod.result, null
                )
              else
                for tumor in tumors
                  dcObject = constructDCObject(
                    subj.number, i + 1, mod.result, tumor
                  )
              data.push dcObject
      # Return the scatterplot data.
      data

    # Calculates the chart axis scale for each data type. The value ranges for
    #   plotted data types must be provided to the chart configuration in the
    #   rendering function. A padding value is calculated based on the range.
    #   In DC charts, the padding must be expressed in the same unit domains as
    #   the data being charted.
    #
    # @param data the scatterplot data
    # @param choices the valid data types for the current collection
    # @returns the range and padding for each data type
    calculateScales: (data, choices) ->
      scales = new Object
      # Iterate over the valid data types.
      for key of choices
        # Make a list of all values for the data type and obtain the max
        #   and min values.
        allValues = (dat[key] for dat in data)
        max = _.max allValues
        min = _.min allValues
        diff = max - min
        # If the values are not all the same, calculate a padding value based
        #   the chart layout parameter setting, e.g. a setting of .2 will
        #   give the chart 20% padding.
        # If the values are all the same, calculate a padding value of an
        #   appropriate resolution for that value. The initial "result" value
        #   reflects the number of digits or decimal places of the scatterplot
        #   values. Each chart tick mark above and below that value is then set
        #   to 10 to the power of the result reduced by 1.
        if diff != 0
          pad = diff * CHART_LAYOUT_PARAMS.axisPadding
        else
          max = Math.abs(max)
          result = Math.ceil(Math.log(max) / Math.log(10))
          if Math.abs(result) is Infinity then result = 0
          pad = CHART_LAYOUT_PARAMS.ticks / 2 * Math.pow(10, result - 1)
        # Add the range and padding for the data type to the scales object.
        scales[key] =
          range: [min, max]
          padding: pad
      # Return the scales object.
      scales

    # The dimensional charting (DC) rendering function.
    #
    # @param config the chart configuration
    renderCharts: (config) ->
      data = config.data
      scales = config.scales
      chartsToDisplay = config.charts

      getGroup = (dim) ->
        dim.group().reduce(((p, v) ->
          p.uid = v.uid
          p.subject = v.subject
          p.visit = v.visit
          p.fxlKTrans = v.fxlKTrans
          p.fxrKTrans = v.fxrKTrans
          p.deltaKTrans = v.deltaKTrans
          p.vE = v.vE
          p.tauI = v.tauI
          p.recurrenceScore = v.recurrenceScore
          p.rcbIndex = v.rcbIndex
          p
        ), ((p, v) ->
          p.uid = ''
          p.subject = null
          p.visit = null
          p.fxlKTrans = null
          p.fxrKTrans = null
          p.deltaKTrans = null
          p.vE = null
          p.tauI = null
          p.recurrenceScore = null
          p.rcbIndex = null
          p
        ), ->
          {
            uid: ''
            subject: ''
            visit: ''
            fxlKTrans: null
            fxrKTrans: null
            deltaKTrans: null
            vE: null
            tauI: null
            recurrenceScore: null
            rcbIndex: null
          }
        )

      charts = (dc.bubbleChart('#qi-correlation-chart-' + i) for i in [0...4])
      # Set up the crossfilter.
      ndx = crossfilter(data)

      # CHART 0
      index = 0
      chart = charts[0]
      xAxis = chartsToDisplay[index].x
      yAxis = chartsToDisplay[index].y
      dim = ndx.dimension((d) ->
        d.uid
      )
      group = getGroup(dim)
      chart.dimension(dim)
        .group(group)
        .x(d3.scale.linear().domain(scales[xAxis].range))
        .y(d3.scale.linear().domain(scales[yAxis].range))
        .width(CHART_LAYOUT_PARAMS.width)
        .height(CHART_LAYOUT_PARAMS.height)
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(scales[xAxis].padding)
        .yAxisPadding(scales[yAxis].padding)
        .xAxisLabel(LABELS[xAxis])
        .yAxisLabel(LABELS[yAxis])
        .renderLabel(true)
        .label((p) ->
          p.value.subject
        ).renderTitle(true)
        .title((p) ->
          [
            'Subject: ' + p.value.subject
            'Visit: ' + p.value.visit
          ].join '\n'
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
        .renderVerticalGridLines(true)
        .renderHorizontalGridLines(true)
      chart.valueAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[0].y].pAccessor(p)
        ).keyAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[0].x].pAccessor(p)
        ).radiusValueAccessor((p) ->
          if (CHART_DATA_CONFIG[chartsToDisplay[0].y].pAccessor(p)? and CHART_DATA_CONFIG[chartsToDisplay[0].x].pAccessor(p)?)
            1
          else
            0
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
      chart.xAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.yAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.margins().left += 6;

      # CHART 1
      index = 1
      chart = charts[1]
      xAxis = chartsToDisplay[index].x
      yAxis = chartsToDisplay[index].y
      dim = ndx.dimension((d) ->
        d.uid
      )
      group = getGroup(dim)
      chart.dimension(dim)
        .group(group)
        .x(d3.scale.linear().domain(scales[xAxis].range))
        .y(d3.scale.linear().domain(scales[yAxis].range))
        .width(CHART_LAYOUT_PARAMS.width)
        .height(CHART_LAYOUT_PARAMS.height)
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(scales[xAxis].padding)
        .yAxisPadding(scales[yAxis].padding)
        .xAxisLabel(LABELS[xAxis])
        .yAxisLabel(LABELS[yAxis])
        .renderLabel(true)
        .label((p) ->
          p.value.subject
        ).renderTitle(true)
        .title((p) ->
          [
            'Subject: ' + p.value.subject
            'Visit: ' + p.value.visit
          ].join '\n'
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
        .renderVerticalGridLines(true)
        .renderHorizontalGridLines(true)
      chart.valueAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[1].y].pAccessor(p)
        ).keyAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[1].x].pAccessor(p)
        ).radiusValueAccessor((p) ->
          if (CHART_DATA_CONFIG[chartsToDisplay[1].y].pAccessor(p)? and CHART_DATA_CONFIG[chartsToDisplay[1].x].pAccessor(p)?)
            1
          else
            0
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
      chart.xAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.yAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.margins().left += 6;

      # CHART 2
      index = 2
      chart = charts[2]
      xAxis = chartsToDisplay[index].x
      yAxis = chartsToDisplay[index].y
      dim = ndx.dimension((d) ->
        d.uid
      )
      group = getGroup(dim)
      chart.dimension(dim)
        .group(group)
        .x(d3.scale.linear().domain(scales[xAxis].range))
        .y(d3.scale.linear().domain(scales[yAxis].range))
        .width(CHART_LAYOUT_PARAMS.width)
        .height(CHART_LAYOUT_PARAMS.height)
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(scales[xAxis].padding)
        .yAxisPadding(scales[yAxis].padding)
        .xAxisLabel(LABELS[xAxis])
        .yAxisLabel(LABELS[yAxis])
        .renderLabel(true)
        .label((p) ->
          p.value.subject
        ).renderTitle(true)
        .title((p) ->
          [
            'Subject: ' + p.value.subject
            'Visit: ' + p.value.visit
          ].join '\n'
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
        .renderVerticalGridLines(true)
        .renderHorizontalGridLines(true)
      chart.valueAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[2].y].pAccessor(p)
        ).keyAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[2].x].pAccessor(p)
        ).radiusValueAccessor((p) ->
          if (CHART_DATA_CONFIG[chartsToDisplay[2].y].pAccessor(p)? and CHART_DATA_CONFIG[chartsToDisplay[2].x].pAccessor(p)?)
            1
          else
            0
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
      chart.xAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.yAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.margins().left += 6;

      # CHART 3
      index = 3
      chart = charts[3]
      xAxis = chartsToDisplay[index].x
      yAxis = chartsToDisplay[index].y
      dim = ndx.dimension((d) ->
        d.uid
      )
      group = getGroup(dim)
      chart.dimension(dim)
        .group(group)
        .x(d3.scale.linear().domain(scales[xAxis].range))
        .y(d3.scale.linear().domain(scales[yAxis].range))
        .width(CHART_LAYOUT_PARAMS.width)
        .height(CHART_LAYOUT_PARAMS.height)
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(scales[xAxis].padding)
        .yAxisPadding(scales[yAxis].padding)
        .xAxisLabel(LABELS[xAxis])
        .yAxisLabel(LABELS[yAxis])
        .renderLabel(true)
        .label((p) ->
          p.value.subject
        ).renderTitle(true)
        .title((p) ->
          [
            'Subject: ' + p.value.subject
            'Visit: ' + p.value.visit
          ].join '\n'
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
        .renderVerticalGridLines(true)
        .renderHorizontalGridLines(true)
      chart.valueAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[3].y].pAccessor(p)
        ).keyAccessor((p) ->
          CHART_DATA_CONFIG[chartsToDisplay[3].x].pAccessor(p)
        ).radiusValueAccessor((p) ->
          if (CHART_DATA_CONFIG[chartsToDisplay[3].y].pAccessor(p)? and CHART_DATA_CONFIG[chartsToDisplay[3].x].pAccessor(p)?)
            1
          else
            0
        ).colors(d3.scale.category20b())
        .colorAccessor((p) -> return p.value.subject)
      chart.xAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.yAxis().ticks(CHART_LAYOUT_PARAMS.ticks)
      chart.margins().left += CHART_LAYOUT_PARAMS.leftMargin

      # Render all the charts.
      dc.renderAll()


      ###
      # THE OLD TOOLTIP CODE.

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

      See: https://jsfiddle.net/eugene_goldberg/yv3nnred/18/

      Stylus:
        
      div.tooltip
        text-align left
        padding 5px
        font 14px sans-serif
        background rgba(0, 0, 0, 0.8)
        color #fff
        border 0px
        border-radius 8px
        pointer-events none

      ###

  ]
