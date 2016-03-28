define ['angular', 'dc', 'moment', 'roman', 'lodash', 'crossfilter', 'd3',
        'breast', 'sarcoma', 'tnm', 'helpers'],
  (ng, dc, moment, roman) ->
    correlation = ng.module(
      'qiprofile.correlation',
      ['qiprofile.breast', 'qiprofile.sarcoma', 'qiprofile.tnm',
       'qiprofile.helpers']
    )

    correlation.factory 'Correlation', ['Breast', 'Sarcoma', 'TNM', 'DateHelper',
      (Breast, Sarcoma, TNM, DateHelper) ->
        # The charting data types. They are in the order in which they appear
        # in the X and Y axis selection dropdowns. Each has the following
        # properties:
        #
        # * label - Appears in the dropdown picklists and as chart axis labels.
        # * coll - The collection(s) for which the data type is valid. May be
        #   'all' or a list of specific collections.
        # * accessor - The data accessor.
        #
        # Note that necrosis percent can exist either as a single value or a
        # range. In the latter case, the mean of the upper and lower values is
        # obtained and plotted on the charts.
        #
        # TODO - push the common config data into the respective services.
        #   See the k-trans.coffee TODO item.
        #
        CHART_DATA_CONFIG =
          'fxlKTrans':
              label: 'FXL Ktrans'
              coll: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.fxlKTrans.average
          'fxrKTrans':
              label: 'FXR Ktrans'
              coll: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.fxrKTrans.average
          'deltaKTrans':
              label: 'delta Ktrans'
              coll: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.deltaKTrans.average
          'vE':
              label: 'v_e'
              coll: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.vE.average
          'tauI':
              label: 'tau_i'
              coll: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.tauI.average
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
          'breastTNMStage':
              label: 'TNM Stage'
              coll: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.tnm?
                stage = Breast.stage tumor.tnm
                stage.replace /^\d+/, roman.romanize
          'recurrenceScore':
              label: 'Recurrence Score'
              coll: [
                'Breast'
              ]
              scale: null
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                Breast.recurrenceScore tumor.geneticExpression.normalizedAssay
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
                return null unless tumor.rcb?
                rcb = Breast.residualCancerBurden tumor
                rcb.index
          'sarcomaTNMStage':
              label: 'TNM Stage'
              coll: [
                'Sarcoma'
              ]
              accessor: (tumor) ->
                return null unless tumor.tnm?
                stage = Sarcoma.stage tumor.tnm, TNM.summaryGrade(tumor.tnm)
                stage.replace /^\d+/, roman.romanize
          'necrosisPercent':
              label: 'Necrosis Percent'
              coll: [
                'Sarcoma'
              ]
              accessor: (tumor) ->
                return null unless tumor.necrosisPercent?
                if tumor.necrosisPercent._cls == 'NecrosisPercentValue'
                  tumor.necrosisPercent.value
                else if tumor.necrosisPercent._cls == 'NecrosisPercentRange'
                  _.mean [
                    tumor.necrosisPercent.start.value
                    tumor.necrosisPercent.stop.value
                  ]
                else
                  null

        # Map the data type handles to the display labels.
        LABELS = _.mapValues(CHART_DATA_CONFIG, (o) ->
          o.label
        )

        # The complete list of data types.
        DATA_TYPES = _.keys CHART_DATA_CONFIG

        # The imaging data types.
        IMAGING_DATA_TYPES = DATA_TYPES.slice 0, 5

        # All possible values for categorical data types.
        CAT_DATA_SCALES =
          'breastTNMStage':
            [
             'IA'
             'IIA'
             'IIB'
             'IIIA'
             'IIIB'
             'IIIC'
             'IV'
            ]
          'sarcomaTNMStage':
            [
             'IA'
             'IB'
             'IIA'
             'IIB'
             'IIC'
             'III'
             'IV'
            ]

        # The chart layout parameters.
        CHART_LAYOUT_PARAMS =
          patientChartHeight: 150
          corrChartHeight: 250
          symbolSize: 8
          patientChartSymbol: 'diamond'
          patientChartPadding: .5
          corrChartPadding: .2
          ticks: 4
          leftMargin: 6

        # The default chart data types to be displayed, by collection. X axes
        # may include any data types that are valid for the collection. Y axes
        # may only include continuous data types (no categorical/ordinal data
        # types).
        DEFAULT_CHARTS:
          'Breast':
            [
              {
                x: 'rcbIndex'
                y: 'deltaKTrans'
              }
              {
                x: 'breastTNMStage'
                y: 'deltaKTrans'
              }
              {
                x: 'recurrenceScore'
                y: 'deltaKTrans'
              }
              {
                x: 'deltaKTrans'
                y: 'ki67'
              }
            ]
          'Sarcoma':
            [
              {
                x: 'necrosisPercent'
                y: 'deltaKTrans'
              }
              {
                x: 'sarcomaTNMStage'
                y: 'deltaKTrans' 
              }
              {
                x: 'necrosisPercent'
                y: 'vE'
              }
              {
                x: 'deltaKTrans'
                y: 'tumorLength'
              }
            ]

        # Creates an object containing only those data types that are valid for
        # the current collection. These are the choices that will appear in the
        # X and Y axis selection dropdowns. Categorical data types are excluded
        # from the Y axis choices because the DC charting does not currently
        # support such a configuration.
        #
        # @param coll the collection
        # @returns the valid X and Y axis data types and labels for the current
        #   collection
        dataTypeChoices: (coll) ->
          xChoices = new Object
          yChoices = new Object
          for dt in DATA_TYPES
            config = CHART_DATA_CONFIG[dt]
            if 'all' in config.coll or coll in config.coll
              xChoices[dt] = LABELS[dt]
              if dt not in Object.keys CAT_DATA_SCALES
                yChoices[dt] = LABELS[dt]
          choices =
            x: xChoices
            y: yChoices

        # Obtains and formats the scatterplot data for display in the charts.
        # The data consist of an array of objects where each object contains
        # the subject and visit numbers and dates followed by the the data
        # types that are valid for the current collection, e.g.:
        #
        # {
        #   'subject': 1
        #   'visit': 1
        #   'date': "01/06/2013"
        #   'fxlKTrans': 0.16492194885121594
        #   ...
        #   'recurrenceScore': 76
        #   'rcbIndex': 2.9283422241238926
        # }
        #
        # Each object needs to contain all of the same keys. If data
        # is not available for a data type, it must be assigned a null value.
        #
        # @param charting the REST query result
        # @param choices the valid data types for the current collection
        # @returns the scatterplot data
        prepareScatterPlotData: (charting, choices) ->
          # @param s the subject number
          # @param v the visit number
          # @param d the visit date
          # @param modResult the modeling result
          # @param tumor the tumor pathology
          # @returns a complete scatterplot data object
          constructDCObject = (s, v, d, modResult, tumor) ->
            dateFormat = (date) ->
              moment(date).format 'MM/DD/YYYY'
            # Create a new data object with core properties.
            dcObject =
              'subject': s
              'visit': v + 1
              'date': dateFormat DateHelper.asMoment(d)
            # Iterate over the valid data types and add data to the object.
            for key of choices
              config = CHART_DATA_CONFIG[key]
              if key in IMAGING_DATA_TYPES
                dcObject[key] = config.accessor modResult
              else if tumor?
                dcObject[key] = config.accessor tumor
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
            # Iterate over the subject encounters. If an encounter is a
            # modeling session, construct a data object with the modeling and,
            # if available, tumor pathology data.
            for enc, i in subj.encounters
              if enc._cls == 'Session'
                for mod in enc.modelings
                  if not tumors
                    dcObject = constructDCObject(
                      subj.number, i, enc.date, mod.result, null
                    )
                  else
                    for tumor in tumors
                      dcObject = constructDCObject(
                        subj.number, i, enc.date, mod.result, tumor
                      )
                  data.push dcObject
          # Return the scatterplot data.
          data

        # Calculates the chart padding value for each continuous data type. In
        # the DC charts, the padding must be expressed in the same unit domains
        # as the data being charted.
        #
        # @param dat the scatterplot data
        # @param choices the valid data types for the current collection
        # @returns the chart padding for each data type
        calculatePadding: (dat, choices) ->
          padding = new Object
          # Iterate over the data types.
          for key of choices
            max = _.maxBy(dat, (o) -> o[key])[key]
            min = _.minBy(dat, (o) -> o[key])[key]
            diff = max - min
            # If the values are not all the same, calculate a padding value
            # based the chart layout parameter setting, e.g. a setting of .2
            # will give the chart 20% padding.
            #
            # If the values are all the same, calculate a padding value of an
            # appropriate resolution for that value. The initial result value
            # reflects the number of digits or decimal places of the
            # scatterplot values. Each chart tick mark above and below that
            # value is then set to 10 to the power of the result reduced by 1.
            if diff != 0
              pad = diff * CHART_LAYOUT_PARAMS.corrChartPadding
            else
              max = Math.abs max
              result = Math.ceil(Math.log(max) / Math.log(10))
              if Math.abs(result) is Infinity then result = 0
              pad = CHART_LAYOUT_PARAMS.ticks / 2 * Math.pow(10, result - 1)
              # Add the padding for the data type to the object.
            padding[key] = pad
          # Return the padding object.
          padding

        # The dimensional charting (DC) rendering function.
        #
        # @param config the chart configuration
        renderCharts: (config) ->
          # Enables a specified D3 element to be moved to the front layer of
          # the visualization, which is necessary if that element is to be
          # bound to mouseover events (e.g. tooltips).
          d3.selection::moveToFront = ->
            @each ->
              @parentNode.appendChild this
              return

          dat = config.data
          padding = config.padding
          chartsToDisplay = config.charts

          # Set up the crossfilter.
          ndx = crossfilter dat

          # The patient/visit dimension.
          dim = ndx.dimension (d) -> 
            [
              d.subject
              d.visit
            ]

          # The patient/visit group.
          group = dim.group()

          # The patient/visit table configuration.
          #
          # TODO - Construct the hyperlinks.
          table = dc.dataTable '#qi-patient-table'
          table.dimension dim
            .group (d) ->
              '<a ui-sref="">Patient ' + d.subject + '</a>'
            .sortBy (d) -> d.visit
            .columns [
              (d) ->
                '&bullet; <a ui-sref="">Visit ' + d.visit + '</a> <span class="qi-dc-date">' + d.date + '</span>'
            ]

          # The patient/visit chart configuration.
          chart = dc.scatterPlot '#qi-patient-chart'
          chart.dimension dim
            .group group
            .height CHART_LAYOUT_PARAMS.patientChartHeight
            .renderVerticalGridLines true
            .renderHorizontalGridLines true
            .symbolSize CHART_LAYOUT_PARAMS.symbolSize
            .symbol CHART_LAYOUT_PARAMS.patientChartSymbol
            .colors d3.scale.category10()
            .colorAccessor (d) -> d.key[1]
            .xAxisLabel "Patient"
            .yAxisLabel "Visit"
            .elasticY true
            .elasticX true
            .x d3.scale.linear()
            .y d3.scale.linear()
            .xAxisPadding CHART_LAYOUT_PARAMS.patientChartPadding
            .yAxisPadding CHART_LAYOUT_PARAMS.patientChartPadding
          chart.xAxis().ticks _.maxBy(dat, (o) -> o.subject).subject
          chart.yAxis().ticks _.maxBy(dat, (o) -> o.visit).visit
          chart.margins().left += CHART_LAYOUT_PARAMS.leftMargin
          
          # Supply the tooltips.
          chart.on 'renderlet', (chart) ->
            chart.selectAll '.symbol'
              .on 'mouseover', (d) ->
                div.transition().duration(20).style 'opacity', .9
                div.html('<strong>Patient:</strong> ' + d.key[0] + '<br/><strong>Visit:</strong> ' + d.key[1]).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
                return
              .on 'mouseout', (d) ->
                div.transition().duration(50).style 'opacity', 0
                return

          # Set up the scatterplots.
          charts = (dc.scatterPlot('#qi-correlation-chart-' + i) for i in [0...4])

          # Iterate over the charts.
          for chart, index in charts
            xAxis = chartsToDisplay[index].x
            yAxis = chartsToDisplay[index].y

            # Set up the dimension based on the X and Y axis user selections.
            dim = ndx.dimension (d) ->
              [
                d[xAxis]
                d[yAxis]
              ]

            # The chart group.
            group = dim.group()

            # The chart configuration.
            chart.dimension dim
              .group group
              .height CHART_LAYOUT_PARAMS.corrChartHeight
              .renderVerticalGridLines true
              .renderHorizontalGridLines true
              .symbolSize CHART_LAYOUT_PARAMS.symbolSize
              .xAxisLabel LABELS[xAxis]
              .yAxisLabel LABELS[yAxis]
              .elasticY true
              .y d3.scale.linear()
              .yAxisPadding padding[yAxis]
            chart.xAxis().ticks CHART_LAYOUT_PARAMS.ticks
            chart.yAxis().ticks CHART_LAYOUT_PARAMS.ticks
            chart.margins().left += CHART_LAYOUT_PARAMS.leftMargin

            # Special configuration for X-axis categorical data.
            if xAxis in Object.keys CAT_DATA_SCALES
              chart.elasticX false
                .x d3.scale.ordinal().domain(CAT_DATA_SCALES[xAxis])
                .xUnits dc.units.ordinal
                ._rangeBandPadding 1
            else
              chart.elasticX true
                .x d3.scale.linear()
                .xAxisPadding padding[xAxis]

            # Supply the tooltips and hide plot points where the X or Y value
            # is null.
            chart.on 'renderlet', (chart) ->
              chart.selectAll '.symbol'
                .on 'mouseover', (d) ->
                  div.transition().duration(20).style 'opacity', 1
                  div.html('<strong>x:</strong> ' + d.key[0] + '<br/><strong>y:</strong> ' + d.key[1]).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
                  return
                .on 'mouseout', (d) ->
                  div.transition().duration(50).style 'opacity', 0
                  return
                .style 'opacity', (d) ->
                  if d.key[0]? && d.key[1]?
                    1
                  else
                    0

          # Render the charts.
          dc.renderAll()

          # Move the chart data points to the front layer of the visualization.
          d3.selectAll('.chart-body').moveToFront()

          # The tooltip div.
          div = d3.select('body').append('div').attr('class', 'tooltip').style 'opacity', 0

      ]
