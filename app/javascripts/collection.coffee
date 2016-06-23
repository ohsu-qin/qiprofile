define ['angular', 'dc', 'moment', 'roman', 'lodash', 'crossfilter', 'd3',
        'breast', 'sarcoma', 'subject', 'session', 'tnm', 'helpers'],
  (ng, dc, moment, roman) ->
    collection = ng.module(
      'qiprofile.collection',
      ['qiprofile.breast', 'qiprofile.sarcoma', 'qiprofile.subject',
       'qiprofile.session', 'qiprofile.tnm', 'qiprofile.helpers']
    )

    collection.factory 'Collection', ['Breast', 'Sarcoma', 'Subject', 'Session', 'TNM', 'DateHelper',
      (Breast, Sarcoma, Subject, Session, TNM, DateHelper) ->
        # The data series configuration. These are all of the data series that
        # the dimensional charting (DC) charts support and are in the order in
        # which they appear in the X and Y axis selection dropdowns. Each has
        # the following properties:
        #
        # * label - Appears in the dropdown picklists and as chart axis labels.
        # * collection - The collection(s) for which the data series is valid.
        #     May be 'all' or a list of specific collections.
        # * accessor - The data accessor.
        #
        # Note that necrosis percent can exist either as a single value or a
        # range. In the latter case, the mean of the upper and lower values is
        # obtained and plotted on the charts.
        #
        # TODO - push the common config data into the respective services.
        #   See the k-trans.coffee TODO item. See also the CATEGORICAL_VALUES
        #   TODO below.
        #
        DATA_SERIES_CONFIG =
          'fxlKTrans':
              label: 'FXL Ktrans'
              collection: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.fxlKTrans.average
          'fxrKTrans':
              label: 'FXR Ktrans'
              collection: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.fxrKTrans.average
          'deltaKTrans':
              label: 'delta Ktrans'
              collection: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.deltaKTrans.average
          'vE':
              label: 'v_e'
              collection: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.vE.average
          'tauI':
              label: 'tau_i'
              collection: [
                'all'
              ]
              accessor: (modelingResult) -> modelingResult.tauI.average
          'tumorLength':
              label: 'Tumor Length (mm)'
              collection: [
                'all'
              ]
              accessor: (tumor) ->
                return null unless tumor.extent?
                if tumor.extent.length? then tumor.extent.length else null
          'tumorWidth':
              label: 'Tumor Width (mm)'
              collection: [
                'all'
              ]
              accessor: (tumor) ->
                return null unless tumor.extent?
                if tumor.extent.width? then tumor.extent.width else null
          'tumorDepth':
              label: 'Tumor Depth (mm)'
              collection: [
                'all'
              ]
              accessor: (tumor) ->
                return null unless tumor.extent?
                if tumor.extent.depth? then tumor.extent.depth else null
          'breastTNMStage':
              label: 'TNM Stage'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.tnm?
                stage = Breast.stage tumor.tnm
                stage.replace /^\d+/, roman.romanize
          'rcbIndex':
              label: 'RCB Index'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.rcb?
                rcb = Breast.residualCancerBurden tumor
                rcb.index
          'recurrenceScore':
              label: 'Recurrence Score'
              collection: [
                'Breast'
              ]
              scale: null
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                Breast.recurrenceScore tumor.geneticExpression.normalizedAssay
          'ki67Expression':
              label: 'Ki67 Expression'
              collection: [
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
              collection: [
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
              collection: [
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
              collection: [
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
              collection: [
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
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.her2?
                  tumor.geneticExpression.normalizedAssay.her2.her2
                else
                  null
          'er':
              label: 'ER Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.estrogen?
                  tumor.geneticExpression.normalizedAssay.estrogen.er
                else
                  null
          'pgr':
              label: 'PGR Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.estrogen?
                  tumor.geneticExpression.normalizedAssay.estrogen.pgr
                else
                  null
          'bcl2':
              label: 'BCL2 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.estrogen?
                  tumor.geneticExpression.normalizedAssay.estrogen.bcl2
                else
                  null
          'scube2':
              label: 'SCUBE2 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.estrogen?
                  tumor.geneticExpression.normalizedAssay.estrogen.scube2
                else
                  null
          'ki67':
              label: 'Ki67 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.proliferation?
                  tumor.geneticExpression.normalizedAssay.proliferation.ki67
                else
                  null
          'stk15':
              label: 'STK15 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.proliferation?
                  tumor.geneticExpression.normalizedAssay.proliferation.stk15
                else
                  null
          'survivin':
              label: 'Survivin Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.proliferation?
                  tumor.geneticExpression.normalizedAssay.proliferation.survivin
                else
                  null
          'ccnb1':
              label: 'CCNB1 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.proliferation?
                  tumor.geneticExpression.normalizedAssay.proliferation.ccnb1
                else
                  null
          'mybl2':
              label: 'MYBL2 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.proliferation?
                  tumor.geneticExpression.normalizedAssay.proliferation.mybl2
                else
                  null
          'mmp11':
              label: 'MMP11 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.invasion?
                  tumor.geneticExpression.normalizedAssay.invasion.mmp11
                else
                  null
          'ctsl2':
              label: 'CTSL2 Normalized Assay'
              collection: [
                'Breast'
              ]
              accessor: (tumor) ->
                return null unless tumor.geneticExpression.normalizedAssay?
                if tumor.geneticExpression.normalizedAssay.invasion?
                  tumor.geneticExpression.normalizedAssay.invasion.ctsl2
                else
                  null
          'sarcomaTNMStage':
              label: 'TNM Stage'
              collection: [
                'Sarcoma'
              ]
              accessor: (tumor) ->
                return null unless tumor.tnm?
                stage = Sarcoma.stage tumor.tnm, TNM.summaryGrade(tumor.tnm)
                stage.replace /^\d+/, roman.romanize
          'necrosisPercent':
              label: 'Necrosis Percent'
              collection: [
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

        # Map the data series key values to the display labels.
        LABELS = _.mapValues(DATA_SERIES_CONFIG, (obj) ->
          obj.label
        )

        # The complete list of data series.
        DATA_SERIES = _.keys DATA_SERIES_CONFIG

        # The imaging data series.
        IMAGING_DATA_SERIES = DATA_SERIES.slice(0, 5)

        # The categorical type data series {data series: value extent array}
        # associative look-up object.
        #
        # TODO - Get the stages on demand given the current collection rather
        #   than list the known collections here, e.g. make a service
        #   collection.coffee with:
        #     factory 'Collection', ... ->
        #       SERVICES = {breast: Breast, ...}
        #       service: (key) -> SERVICES[key] or throw error
        #       extent: (collection) -> service(key).stageExtent()
        #   then replace use of CATEGORICAL_VALUES by:
        #      Collection.extent(key)
        #
        #   The application tends to break if detailed domain knowledge
        #   is redundantly dispersed throughout the source code. There
        #   are other opportunities to consolidate domain knowledge
        #   in services and delegate to those services in this file.
        CATEGORICAL_VALUES =
          'breastTNMStage': Breast.stageExtent().map(
                              (s) -> s.replace /^\d+/, roman.romanize
                            )
          'sarcomaTNMStage': Sarcoma.stageExtent().map(
                               (s) -> s.replace /^\d+/, roman.romanize
                             )
        # The chart layout parameters.
        CHART_LAYOUT_PARAMS =
          subjectChartHeight: 150
          collectionChartHeight: 250
          symbolSize: 8
          subjectChartSymbol: 'diamond'
          subjectChartPadding: .5
          collectionChartPadding: .2
          ticks: 4
          leftMargin: 6

        # The default chart axes to be displayed, by collection. The X axes can
        # include any data series that is valid for the collection. The Y axes
        # can include only data series that have continuous data. Data series
        # that have categorical/ordinal data types are excluded from the Y axis
        # choices because the DC charting does not currently support such a
        # configuration.
        DEFAULT_AXES:
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
                y: 'ki67Expression'
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

        ###*
         * Creates an object containing only those data series that are valid
         * for the current collection. These are the choices that will appear in
         * the X and Y axis selection dropdowns. Categorical type data series
         * are excluded from the Y axis choices.
         *
         * @method dataSeriesChoices
         * @param collection the target collection
         * @return the valid X and Y axis data series and labels for the target
         *   collection
        ###
        dataSeriesChoices: (collection) ->
          xChoices = new Object
          yChoices = new Object
          for ds in DATA_SERIES
            config = DATA_SERIES_CONFIG[ds]
            if 'all' in config.collection or collection in config.collection
              xChoices[ds] = LABELS[ds]
              if ds not in Object.keys(CATEGORICAL_VALUES)
                yChoices[ds] = LABELS[ds]
          choices =
            x: xChoices
            y: yChoices

        ###*
         * Obtains and formats the scatterplot data for display in the charts.
         * The data consist of an array of objects where each object contains
         * the subject and session numbers and dates followed by the the data
         * series that are valid for the current collection, e.g.:
         *
         * {
         *   'subject': 1
         *   'session': 1
         *   'date': "01/06/2013"
         *   'fxlKTrans': 0.16492194885121594
         *   ...
         *   'recurrenceScore': 76
         *   'rcbIndex': 2.9283422241238926
         * }
         *
         * Each object needs to contain all of the same keys. If data
         * is not available for a data series, it must be assigned a null value.
         *
         * TODO - The chart should collect whatever properties are available
         *   rather than be constrained by choices. See the DATA_SERIES_CONFIG
         *   TODO above.
         *
         * TODO - Are there count(session) x max(1, count(tumors)) objects for
         *   each subject?
         *
         * @method chartData
         * @param charting the REST query result
         * @param dataSeries the valid data series for the current collection
         * @return the scatterplot data
        ###
        chartData: (charting, dataSeries) ->
          ###*
           * @method createDCObject
           * @param modeling the modeling object
           * @param tumor the tumor pathology
           * @return a complete scatterplot data object
          ###
          createDCObject = (modeling, tumor) ->
            # Create a new data object with core properties.
            session = modeling.session
            subject = session.subject
            date = session.date

            #The Subject Detail page hyperlink.
            sbjRef = Subject.hyperlink(subject)
            #The Session Detail page hyperlink.
            sessRef = Session.hyperlink(session)

            # Make the chart data object. The chart data object combines the
            # subject, session and modeling objects.
            dcObject =
              subject: _.extend({href: sbjRef}, subject)
              session: _.extend({href: sessRef}, session)

            # Iterate over the valid data series and add data to the object.
            for ds in dataSeries
              config = DATA_SERIES_CONFIG[ds]
              if ds in IMAGING_DATA_SERIES
                dcObject[ds] = config.accessor(modeling.result)
              else if tumor?
                dcObject[ds] = config.accessor(tumor)
              else
                dcObject[ds] = null

            # Return the data object.
            dcObject

          # Initialize the data object array.
          data = new Array
          # Iterate over the subjects.
          for sbj in charting
            # Obtain the tumor pathology data from the Surgery encounter.
            # tumors will be null iff there is no pathology report.
            # A path report is required for a biopsy, optional for a
            # surgery. However, the biopsy tumors could be an empty
            # array, althought that should be an error.
            #
            # For now, we allow for at most one path report and raise an error
            # otherwise.
            #
            # TODO - Support both a biopsy and a surgery path report.
            #   Then rework the tumors loop below.
            #
            # TODO - Support no path reports.
            #
            tumors = null
            for enc in sbj.clinicalEncounters
              if enc.pathology.tumors?
                # More than one path report is not yet supported.
                if tumors?
                  console.warn("Only one pathology report per subject is" +
                               " supported: #{ sbj.collection } Subject" +
                               " #{ sbj.number }")
                if enc.isSurgery()
                  tumors = enc.pathology.tumors
            # Make a chart data object for each tumor of each session. The
            # data object consists of the modeling result properties and,
            # if available, the tumor pathology data.
            for session in sbj.sessions
              for mdl in session.modelings
                if tumors
                  # TODO - how are tumors distinguished? Should we aggregate
                  #   the size across tumors? What about other clinical values?
                  #   Current handling of more than one tumor is probably a bug.
                  for tumor in tumors
                    dcObject = createDCObject(mdl, tumor)
                else
                  dcObject = createDCObject(mdl,  null)
                data.push dcObject
          # Return the scatterplot data.
          data

        ###*
         * Calculates the chart padding value for each continuous type data
         * series. In the charts, the padding must be expressed in the same unit
         * domains as the data being charted.
         *
         * FIXME - this breaks if data is empty. Present an alert
         *   in that case. Can this occur in practice?
         *
         * @method chartPadding
         * @param data the scatterplot data
         * @param dataSeries the valid data series for the current collection
         * @return the chart padding for each data series
        ###
        chartPadding: (data, dataSeries) ->
          ###*
           * @method dataSeriesPadding
           * @param key the data series
           * @return the chart padding for the data series
          ###
          dataSeriesPadding = (key) ->
            values = _.map(data, key)
            max = _.max(values)
            min = _.min(values)
            diff = max - min
            # The padding is determined as follows:
            # * If the values are all the same, then calculate a padding amount
            #   of an appropriate resolution for that value. The initial result
            #   value reflects the number of digits or decimal places of the
            #   scatterplot values. Each chart tick mark above and below that
            #   value is then set to 10 to the power of the result reduced by
            #   one.
            # * Otherwise, calculate a padding amount based the chart layout
            #   parameter setting, e.g. a setting of .2 will give the chart 20%
            #   padding.
            if diff == 0
              max = Math.abs max
              result = Math.ceil(Math.log(max) / Math.log(10))
              if Math.abs(result) is Infinity then result = 0
              pad = CHART_LAYOUT_PARAMS.ticks / 2 * Math.pow(10, result - 1)
            else
              pad = diff * CHART_LAYOUT_PARAMS.collectionChartPadding
          ###*
           * @method addDataSeriesPadding
           * @param obj the padding object
           * @param key the data series
           * @return the padding object
          ###
          addDataSeriesPadding = (obj, key) ->
            obj[key] = dataSeriesPadding(key)
            obj
          # Return the chart padding object.
          padding = dataSeries.reduce(addDataSeriesPadding, {})

        ###*
         * The dimensional charting (DC) rendering function.
         *
         * @method renderCharts
         * @param config the chart configuration
        ###
        renderCharts: (config) ->
          # TODO - refactor this function body into app. 3 smaller functions.
          #
          # Enables a specified D3 element to be moved to the front layer of
          # the visualization, which is necessary if that element is to be
          # bound to mouseover events (e.g. tooltips).
          d3.selection::moveToFront = ->
            @each ->
              @parentNode.appendChild this

          # Convenience temp config variables.
          data = config.data
          padding = config.padding
          axes = config.axes

          # Construct the multi-dimensional crossfilter.
          xFilter = crossfilter(data)

          # The subject/session dimension.
          dim = xFilter.dimension (obj) ->
            [
              obj.subject.number
              obj.session.number
            ]

          # The subject/session group.
          group = dim.group()

          # The subject/session table configuration.
          table = dc.dataTable '#qi-subject-table'
          table.dimension dim
            .group (obj) ->
              "<a href=\"#{ obj.subject.href }\">Patient #{ obj.subject.number }</a>"
            .sortBy (obj) -> obj.session.href
            .columns [
              (obj) ->
                "<span class='qi-subject-table-col'><a href=\"#{ obj.session.href }\">Visit #{ obj.session.number }</a></span>"
              (obj) ->
                "<span class='qi-subject-table-col'>#{ obj.session.date.format('MM/DD/YYYY') }</span>"
            ]

          # The largest subject number is the number of X tick marks.
          maxSbjNbr = _.chain(data).map('subject.number').max().value()
          # The largest session number is the number of Y tick marks.
          maxSessNbr = _.chain(data).map('session.number').max().value()

          # The subject/session chart configuration.
          chart = dc.scatterPlot '#qi-subject-chart'
          chart.dimension dim
            .group group
            .height CHART_LAYOUT_PARAMS.subjectChartHeight
            .renderVerticalGridLines true
            .renderHorizontalGridLines true
            .symbolSize CHART_LAYOUT_PARAMS.symbolSize
            .highlightedSize CHART_LAYOUT_PARAMS.symbolSize + 2
            .symbol CHART_LAYOUT_PARAMS.subjectChartSymbol
            # Construct a new scale with a range of ten categorical colors.
            .colors d3.scale.category10()
            # The symbol color is based on the data object's key 1 value, which
            # is the session number.
            .colorAccessor (obj) -> obj.key[1]
            .xAxisLabel "Patient"
            .yAxisLabel "Visit"
            .elasticX true
            .elasticY true
            .x d3.scale.linear()
            .y d3.scale.linear()
            .xAxisPadding CHART_LAYOUT_PARAMS.subjectChartPadding
            .yAxisPadding CHART_LAYOUT_PARAMS.subjectChartPadding
          # Set the axis tick counts.
          chart.xAxis().ticks(maxSbjNbr)
          chart.yAxis().ticks(maxSessNbr)
          # Pad the left margins.
          chart.margins().left += CHART_LAYOUT_PARAMS.leftMargin

          # Apply a renderlet and associate it with tooltip callbacks.
          chart.on 'renderlet', (chart) ->
            chart.selectAll '.symbol'
              .on 'mouseover', (obj) ->
                # Supply the tooltips. The tooltip element is the selection
                # returned by d3 after the chart rendering call.
                xText = "<strong>Subject:</strong> #{ obj.key[0] }"
                yText = "<strong>Visit:</strong> #{ obj.key[1] }"
                html = "#{ xText }<br/>#{ yText }"
                leftOffset = d3.event.pageX + 5 + 'px'
                topOffset = d3.event.pageY - 35 + 'px'
                tooltip.html(html).style('left', leftOffset).style('top', topOffset)
                tooltip.transition().duration(20).style 'opacity', 1
              .on 'mouseout', (obj) ->
                tooltip.transition().duration(50).style('opacity', 0)

          # The axes determine the number of charts to display.
          chartCnt = axes.length
          # The charts are numbered from 1 to n, where n is the number of
          # axis pairs defined in the chart config axes variable.
          chartNbrs = _.range(1, chartCnt + 1)
          # Set up the scatterplots.
          charts = (dc.scatterPlot('#qi-collection-chart-' + chartNbr) for chartNbr in chartNbrs)

          # Iterate over the charts.
          for chart, i in charts
            # TODO - make this for body a function.
            xAxis = axes[i].x
            yAxis = axes[i].y

            # Set up the dimension based on the X and Y axis user selections.
            dim = xFilter.dimension (obj) ->
              [
                obj[xAxis]
                obj[yAxis]
              ]

            # The chart group.
            group = dim.group()

            # The chart configuration.
            chart.dimension dim
              .group group
              .height CHART_LAYOUT_PARAMS.collectionChartHeight
              .renderVerticalGridLines true
              .renderHorizontalGridLines true
              .symbolSize CHART_LAYOUT_PARAMS.symbolSize
              .highlightedSize CHART_LAYOUT_PARAMS.symbolSize + 2
              .xAxisLabel LABELS[xAxis]
              .yAxisLabel LABELS[yAxis]
              .elasticY true
              .y d3.scale.linear()
              .yAxisPadding padding[yAxis]
            chart.xAxis().ticks CHART_LAYOUT_PARAMS.ticks
            chart.yAxis().ticks CHART_LAYOUT_PARAMS.ticks
            chart.margins().left += CHART_LAYOUT_PARAMS.leftMargin

            # Special configuration for X-axis categorical data.
            if xAxis in Object.keys(CATEGORICAL_VALUES)
              chart.elasticX false
                .x d3.scale.ordinal().domain(CATEGORICAL_VALUES[xAxis])
                .xUnits dc.units.ordinal
                ._rangeBandPadding 1
            else
              chart.elasticX true
                .x d3.scale.linear()
                .xAxisPadding padding[xAxis]

            chart.on 'renderlet', (chart) ->
              chart.selectAll '.symbol'
                # Supply the tooltips.
                .on 'mouseover', (obj) ->
                  xText = "<strong>x:</strong> #{ obj.key[0] }"
                  yText = "<strong>y:</strong> #{ obj.key[1] }"
                  html = "#{ xText }<br/>#{ yText }"
                  leftOffset = d3.event.pageX + 5 + 'px'
                  topOffset = d3.event.pageY - 35 + 'px'
                  tooltip.html(html).style('left', leftOffset).style('top', topOffset)
                  tooltip.transition().duration(20).style 'opacity', 1
                .on 'mouseout', (obj) ->
                  tooltip.transition().duration(50).style 'opacity', 0
                # Hide plot points where either the X or Y value is null. The
                # data object's key 0 value is the X axis data value and the
                # key 1 value is the Y axis data value.
                .style 'opacity', (obj) ->
                  if obj.key[0]? and obj.key[1]? then 1 else 0

          # Render the charts.
          dc.renderAll()

          # Move the chart data points to the front layer of the visualization.
          d3.selectAll('.chart-body').moveToFront()

          # The collection chart tooltip container.
          d3.select('body').append('div').attr('class', 'qi-collection-tooltip')
          # The tooltip div.
          tooltip = d3.select('.qi-collection-tooltip').append('div').attr('class', 'tooltip').style 'opacity', 0

      ]
