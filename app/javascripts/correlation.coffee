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
        # * collection - The collection(s) for which the data type is valid. May be
        #   'all' or a list of specific collections.
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
        CHART_DATA_CONFIG =
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

        # Map the data type handles to the display labels.
        LABELS = _.mapValues(CHART_DATA_CONFIG, (o) ->
          o.label
        )

        # The complete list of data types.
        DATA_TYPES = _.keys CHART_DATA_CONFIG

        # The imaging data types.
        IMAGING_DATA_TYPES = DATA_TYPES.slice(0, 5)

        # The categorical data type {data type: value extent array}
        # associative look-up object.
        #
        # TODO - get this from the respective services:
        #
        #     breast: Breast.stageExtent().map(Roman.romanize)
        #     sarcoma: Sarcoma.stageExtent().map(Roman.romanize)
        #
        #   Better still is to geet the stages on demand given the
        #   current collection rather than list the known collections
        #   here, e.g. make a service collection.coffee with:
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

        # The default chart axes to be displayed, by collection. The X
        # axes can include any data type that is valid for the collection.
        # The Y axes can include only the continuous data types, i.e. no
        # categorical/ordinal data types.
        #
        # TODO - where is the above statement enforced?
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

        # Creates an object containing only those data types that are valid for
        # the current collection. These are the choices that will appear in the
        # X and Y axis selection dropdowns. Categorical data types are excluded
        # from the Y axis choices because the DC charting does not currently
        # support such a configuration.
        #
        # @param collection the target collection
        # @returns the valid X and Y axis data types and labels for the target
        #   collection
        dataTypeChoices: (collection) ->
          xChoices = new Object
          yChoices = new Object
          for dt in DATA_TYPES
            config = CHART_DATA_CONFIG[dt]
            if 'all' in config.collection or collection in config.collection
              xChoices[dt] = LABELS[dt]
              if dt not in Object.keys(CATEGORICAL_VALUES)
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
        # TODO - The chart should collect whatever properties are available
        #   rather than be constrained by choices. See the CHART_DATA_CONFIG
        #   TODO above.
        #
        # TODO - Are there count(session) x max(1, count(tumors)) objects for
        #   each subject?
        #
        # @param charting the REST query result
        # @param choices the valid data types for the current collection
        # @returns the scatterplot data
        prepareScatterPlotData: (charting, choices) ->
          # @param modeling the modeling object
          # @param tumor the tumor pathology
          # @returns a complete scatterplot data object
          createDCObject = (modeling, tumor) ->
            formatDate = (date) ->
              # TODO - the date should already be a moment here and below.
              moment(date).format 'MM/DD/YYYY'

            # Create a new data object with core properties.
            session = modeling.session
            subject = session.subject
            # TODO - the date should already be a moment here and above.
            date = formatDate(DateHelper.asMoment(session.date))

            # Make the session page hyperlink.
            sbjRefUrl = "/quip/#{ subject.collection }/subject/#{ subject.number }"
            sbjRef = "#{ sbjRefUrl }?project=#{ subject.project }"
            sessRef = "#{ sbjRefUrl }/session/#{ session.number }?project=#{ subject.project }"

            # Make the chart data object. The chart data object combines the
            # subject, session and modeling objects.
            #
            # TODO - rename the visit variable to session here and elsewhere.
            #   Visit has a web connotation that differs from the imaging connotation.
            #   For clarity, 'visit' is confined to the presentation layer, i.e. it is
            #   displayed to the user but is not used as a variable in the source code.
            #   Thus, e.g., the test Page class has a function named 'visit' that
            #   follows a link. It would be confusing to 'visit the visit page'.
            #
            # TODO - similarly, rename patient variables and element ids/classes to
            #   'subject'.
            #
            dcObject =
              subject: _.extend({href: sbjRef}, subject)
              visit: _.extend({href: sessRef}, session)

            # Iterate over the valid data types and add data to the object.
            for key of choices
              config = CHART_DATA_CONFIG[key]
              if key in IMAGING_DATA_TYPES
                dcObject[key] = config.accessor(modeling.result)
              else if tumor?
                dcObject[key] = config.accessor(tumor)
              else
                dcObject[key] = null

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

        # Calculates the chart padding value for each continuous data type. In
        # the DC charts, the padding must be expressed in the same unit domains
        # as the data being charted.
        #
        # @param data the scatterplot data
        # @param choices the valid data types for the current collection
        # @returns the chart padding for each data type
        calculatePadding: (data, choices) ->
          padding = new Object
          # Iterate over the data types.
          #
          # TODO - What does 'data type' mean here?
          #
          # FIXME - this breaks if data is empty. Present an alert
          #   in that case. Can this occur in practice?
          #
          # TODO - rename function to chartPadding. Then, make a function to
          #   get the item padding and collect the iteration result into an
          #   object using the functional programming reduce idiom, e.g.:
          #     chartPadding: (data, choices) ->
          #       dataTypePadding = (key) -> ...
          #       addDataTypePadding = (obj, key) ->
          #         obj[key] = dataTypePadding(key)
          #         obj
          #     # Return the {data type: padding} object
          #     choices.reduce(addDataTypePadding, key, {})
          for key of choices
            values = _.map(data, key)
            max = _.max(values)
            min = _.min(values)
            diff = max - min
            # The padding is determined as follows:
            # * If the values are all the same, then calculate a padding value of
            #   an appropriate resolution for that value. The initial result value
            #   reflects the number of digits or decimal places of the
            #   scatterplot values. Each chart tick mark above and below that
            #   value is then set to 10 to the power of the result reduced by 1.
            # * Otherwise, calculate a padding value based the chart layout
            #   parameter setting, e.g. a setting of .2 will give the chart 20%
            #   padding.
            if diff == 0
              max = Math.abs max
              result = Math.ceil(Math.log(max) / Math.log(10))
              if Math.abs(result) is Infinity then result = 0
              pad = CHART_LAYOUT_PARAMS.ticks / 2 * Math.pow(10, result - 1)
            else
              # Add the padding for the data type to the object.
              pad = diff * CHART_LAYOUT_PARAMS.corrChartPadding
            padding[key] = pad
          # Return the padding object.
          padding

        # The dimensional charting (DC) rendering function.
        #
        # @param config the chart configuration
        renderCharts: (config) ->
          # TODO - refactor this function body into app. 3 smaller functions.
          #
          # Enables a specified D3 element to be moved to the front layer of
          # the visualization, which is necessary if that element is to be
          # bound to mouseover events (e.g. tooltips).
          d3.selection::moveToFront = ->
            @each ->
              @parentNode.appendChild this
              # TODO - Why this return?
              return
          
          # Convenience temp config variables.
          data = config.data
          padding = config.padding
          axes = config.axes

          # Set up the crossfilter.
          # TODO - what is ndx? Rename and describe.
          #   'ndx' conventionally signifies an integer index.
          #   That is not what ndx is here.
          ndx = crossfilter(data)

          # The patient/visit dimension.
          dim = ndx.dimension (obj) -> 
            [
              obj.subject.number
              obj.visit.number
            ]

          # The patient/visit group.
          group = dim.group()

          # The patient/visit table configuration.
          table = dc.dataTable '#qi-patient-table'
          table.dimension dim
            .group (obj) -> "<a href=\"#{ obj.subject.href }\">Patient #{ obj.subject.number }</a>"
            .sortBy (obj) -> obj.visit.href
            .columns [
              # TODO - Should this be two columns per row?
              (obj) ->
                refElt = "&bullet; <a href=\"#{ obj.visit.href }\">Visit #{ obj.visit.number }</a>"
                dateElt = "<span class='qi-dc-date'>#{ obj.visit.date.format('MM/DD/YYYY') }</span>"
                "#{ refElt } #{ dateElt }"
            ]

          # The largest subject number is the number of X tick marks.
          maxSbjNbr = _.chain(data).map('subject.number').max().value()
          # The largest session number is the number of Y tick marks.
          maxSessNbr = _.chain(data).map('visit.number').max().value()

          # The patient/visit chart configuration.
          chart = dc.scatterPlot '#qi-patient-chart'
          chart.dimension dim
            .group group
            .height CHART_LAYOUT_PARAMS.patientChartHeight
            .renderVerticalGridLines true
            .renderHorizontalGridLines true
            .symbolSize CHART_LAYOUT_PARAMS.symbolSize
            .symbol CHART_LAYOUT_PARAMS.patientChartSymbol
            # TODO - What is category 10?
            .colors d3.scale.category10()
            # TODO - What is d here? Why key 1?
            .colorAccessor (d) -> d.key[1]
            .xAxisLabel "Patient"
            .yAxisLabel "Visit"
            .elasticX true
            .elasticY true
            .x d3.scale.linear()
            .y d3.scale.linear()
            .xAxisPadding CHART_LAYOUT_PARAMS.patientChartPadding
            .yAxisPadding CHART_LAYOUT_PARAMS.patientChartPadding
          # Set the axis tick counts.
          chart.xAxis().ticks(maxSbjNbr)
          chart.yAxis().ticks(maxSessNbr)
          # Pad the left margins.
          chart.margins().left += CHART_LAYOUT_PARAMS.leftMargin
          
          # Supply the tooltips.
          chart.on 'renderlet', (chart) ->
            chart.selectAll '.symbol'
              .on 'mouseover', (d) ->
                # TODO - What is div here?
                # TODO - Remove the returns below if they are extraneous.
                div.transition().duration(20).style('opacity', .9)
                # TODO - make temp variables and interpolate the argument,
                #   e.g.:
                #     label = "<strong>Patient:</strong>#{ d.key[0] }"
                #     ...
                #     html = "#{ label }..."
                #     div.html(html)
                div.html('<strong>Patient:</strong> ' + d.key[0] + '<br/><strong>Visit:</strong> ' + d.key[1]).style('left', d3.event.pageX + 5 + 'px').style 'top', d3.event.pageY - 35 + 'px'
                return
              .on 'mouseout', (d) ->
                div.transition().duration(50).style('opacity', 0)
                return

          # The axes determine the number of charts to display.
          chartCnt = axes.length
          # The charts are numbered from 1 to n, where n is the number of
          # axis pairs defined in the chart config axes variable. 
          chartNbrs = _.range(1, chartCnt + 1)
          # Set up the scatterplots.
          charts = (dc.scatterPlot('#qi-correlation-chart-' + chartNbr) for chartNbr in chartNbrs)

          # Iterate over the charts.
          for chart, i in charts
            # TODO - make this for body a function.
            xAxis = axes[i].x
            yAxis = axes[i].y

            # Set up the dimension based on the X and Y axis user selections.
            # TODO - is d here the chart data object? If so, then comment and
            # rename to obj here and below.
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
            if xAxis in Object.keys(CATEGORICAL_VALUES)
              chart.elasticX false
                .x d3.scale.ordinal().domain(CATEGORICAL_VALUES[xAxis])
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
                  if d.key[0]? and d.key[1]? then 1 else 0

          # Render the charts.
          dc.renderAll()

          # Move the chart data points to the front layer of the visualization.
          d3.selectAll('.chart-body').moveToFront()

          # The tooltip div.
          div = d3.select('body').append('div').attr('class', 'tooltip').style 'opacity', 0

      ]
