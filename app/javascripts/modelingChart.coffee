define ['angular', 'lodash', 'modeling', 'chart'], (ng, _) ->
  modelingChart = ng.module(
    'qiprofile.modelingchart',
    ['qiprofile.modeling', 'qiprofile.chart']
  )

  modelingChart.factory(
    'ModelingChart',
    ['Modeling', 'Chart', (Modeling, Chart) ->
      # The common modeling X axis specification.
      COMMON_CONFIG =
        options:
          chart:
            ###*
             * @method x
             * @return the session date
            ###
            x: (paramResult) ->
              paramResult.modelingResult.modeling.session.date
            xAxis:
              axisLabel: 'Visit Date'
              tickFormat: Chart.formatDate
              tooltip:
                headerEnabled: false
            ###*
             * @method y
             * @return the modeling parameter result average value
            ###
            y: (paramResult) ->
              paramResult.average
            yAxis:
              # Don't show a max and min value on the axis.
              showMaxMin: true
            tooltip:
              headerEnabled: false

      ###*
       * @method kTransConfiguration
       * @param modelingResults the modeling result REST objects
       *   to chart
       * @return the Ktrans-specific chart configuration
      ###
      kTransConfiguration = (modelingResults) ->
        options:
          chart:
            # Show both data series.
            type: 'multiBarChart'
            # Don't show the group/stack control.
            showControls: false
            yAxis:
              axisLabel: 'Ktrans'
        data: [
          {
            key: Modeling.properties.fxlKTrans.text
            color: Modeling.properties.fxlKTrans.color
            values: _.map(modelingResults, 'fxlKTrans')
          }
          {
            key: Modeling.properties.fxrKTrans.text
            color: Modeling.properties.fxrKTrans.color
            values: _.map(modelingResults, 'fxrKTrans')
          }
        ]

      ###*
       * @method singleParameterConfiguration
       * @param modelingResults the modeling result REST objects
       *   to chart
       * @param paramKey the Modeling.properties property to chart,
       *   e.g. 'vE'
       * @return the modeling parameter chart configuration
      ###
      singleParameterConfiguration = (modelingResults, paramKey) ->
        # The label text and bar color.
        dspConf = Modeling.properties[paramKey]
        if not dspConf?
          throw new ReferenceError("The modeling result parameter is not" +
                                   " supported: #{ paramKey }")

        # Return the {options, data} chart configuration.
        options:
          chart:
            # A simple single data series bar chart.
            type: 'discreteBarChart'
            yAxis:
              axisLabel: dspConf.text
        data: [
          key: dspConf.text
          # Pluck the modeling parameter object from each modeling
          # result.
          color: dspConf.color
          values: _.map(modelingResults, paramKey)
        ]

      ###*
       * @method parameterConfiguration
       * @param paramKey the modeling parameter key, either 'kTrans'
       *   or a Modeling.properties property
       * @return the parameter-specific chart configuration
      ###
      parameterConfiguration = (modelingResults, paramKey) ->
        if paramKey is 'kTrans'
          kTransConfiguration(modelingResults)
        else
          singleParameterConfiguration(modelingResults, paramKey)

      ###*
       * @method tooltipGenerator
       * @param paramKey the modeling parameter key
       * @param precision the minimum number of decimals to display
       * @return the tooltip HTML content generator function
      ###
      tooltipGenerator = (paramKey, precision) ->
        # The tooltip displays three decimals more than the
        # minimum.
        valueFormatter = d3.format(".#{ precision + 3 }f")

        # The ktrans tooltip shows the FXL, FXR and delta.
        kTransTooltipGenerator = ->
           propertyFormatter = (modelingResult, property) ->
             dspConf = Modeling.properties[property]
             # The value to display.
             value = modelingResult[property].average
             # Return the tooltip HTML.
             "<tr>" +
               "<td>#{ dspConf.html }:</td>" +
               "<td>#{ valueFormatter(value) }</td>" +
             "</tr>"

           # Return the formatter function.
           (obj) ->
             # The charting object is the data series object,
             # for either the FXL or FXR ktrans. In either case,
             # the modeling parameter result is in obj.data,
             # which references the parent modeling result.
             # The tooltip is the same for both data series,
             # and shows the FXL, FXR and delta ktrans in a
             # borderless mini-table.
             modelingResult = obj.data.modelingResult
             props = ['fxlKTrans', 'fxrKTrans', 'deltaKTrans']
             rows = (
               propertyFormatter(modelingResult, prop) for prop in props
             )
             "<table>" +
               rows.join("\n") +
             "</table>"

        singleParameterTooltipGenerator = (paramKey) ->
          dspConf = Modeling.properties[paramKey]
          # Return the formatter function.
          (obj) ->
            # The value to display.
            value = obj.series[0].value
            "#{ dspConf.html }: #{ valueFormatter(value) }"

        # Return the generator function.
        if paramKey is 'kTrans'
          kTransTooltipGenerator()
        else
          singleParameterTooltipGenerator(paramKey)

      ###*
       * Configures the D3 chart with the given format. The format is an
       * object in the form {label: string, data: array}
       * where the data array has one object per data series in the form
       * {label: string, color: color, accessor: (modelingResult) -> body}
       *
       * @method configure
       * @param modelingResults the session modeling results array
       * @param property the modeling parameter property, e.g. 'kTrans'
       * @return the nvd3 chart {data, options} configuration
      ###
      configure: (modelingResults, paramKey) ->
        # Start with a copy of the shared configuration.
        conf = _.cloneDeep(COMMON_CONFIG)
        # The parameter-specific configuration.
        paramConf = parameterConfiguration(modelingResults, paramKey)
        # Add the parameter-specific settings.
        _.merge(conf, paramConf)

        # The data set values arrays.
        dsValueArrays = (ds.values for ds in conf.data)
        # The modeling parameter result objects.
        paramResults = _.concat(dsValueArrays...)
        # The modeling parameter averages.
        values = (paramResult.average for paramResult in paramResults)
        # The smallest value precision that captures at least
        # one non-zero digit for all non-zero values.
        precision = Chart.minPrecision(values)
        # The tooltip content generator.
        generateTooltip = tooltipGenerator(paramKey, precision)
        # The tooltip and Y tick formatter depend on the precision.
        mixin =
          options:
            chart:
              yAxis:
                tickFormat: d3.format(".#{ precision }f")
              tooltip:
                contentGenerator: generateTooltip
        # Add the additional settings.
        _.merge(conf, mixin)

        # Return the configuration.
        conf
    ]
  )
