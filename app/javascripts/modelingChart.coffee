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
            # @returns the session date
            x: (paramResult) ->
              paramResult.modelingResult.modeling.session.date
            xAxis:
              axisLabel: 'Visit Date'
              tickFormat: Chart.formatDate
              tooltip:
                headerEnabled: false
            # @returns the modeling parameter result average value
            y: (paramResult) ->
              paramResult.average
            yAxis:
              # Don't show a max and min value on the axis.
              showMaxMin: true
            tooltip:
              headerEnabled: false
      
      # @param modelingResults the modeling result REST objects
      #   to chart
      # @returns the Ktrans-specific chart configuration
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
      
      # @param modelingResults the modeling result REST objects
      #   to chart
      # @param paramKey the Modeling.properties property to chart,
      #   e.g. 'vE'
      # @returns the modeling parameter chart configuration
      singleParameterConfiguration = (modelingResults, paramKey) ->
        # The label text and bar color.
        dspConf = Modeling.properties[paramKey]
        
        # Return the {options, data} chart configuration.
        options:
          chart:
            # A simple single data series bar chart.
            type: 'discreteBarChart'
            yAxis:
              axisLabel: dspConf.text
        data: [
          # Pluck the modeling parameter object from each modeling
          # result.
          color: dspConf.color
          values: _.map(modelingResults, paramKey)
        ]
      
      # @param paramKey the modeling parameter key, either 'kTrans'
      #   or a Modeling.properties property
      # @returns the parameter-specific chart configuration
      parameterConfiguration = (modelingResults, paramKey) ->
        if paramKey is 'kTrans'
          kTransConfiguration(modelingResults)
        else
          singleParameterConfiguration(modelingResults, paramKey)

      # @param paramKey the modeling parameter key
      # @returns the tooltip HTML content generator function
      tooltipGenerator = (paramKey) ->
         # The tooltip value heading.
         if paramKey is 'kTrans'
           propertyFormatter = (modelingResult, property) ->
             dspConf = Modeling.properties[property]
             # The value to display.
             value = modelingResult[property].average
             # Return the tooltip HTML.
             "<tr>" +
               "<td>#{ dspConf.html }:</td>" +
               "<td>#{ valueFormatter(value) }</td>" +
             "</tr>"

           generateTooltip = (obj) ->
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
         else
           dspConf = Modeling.properties[paramKey]
           generateTooltip = (obj) ->
             # The value to display.
             value = obj.series[0].value
             "#{ dspConf.html }: #{ valueFormatter(value) }"
          
          # Return the generator function.
          generateTooltip
      
      # Configures the D3 chart with the given format. The format is an
      # object in the form {label: string, data: array}
      # where the data array has one object per data series in the form
      # {label: string, color: color, accessor: (modelingResult) -> body}
      #
      # @param modelingResults the session modeling results array
      # @param property the modeling parameter property, e.g. 'kTrans'
      # @returns the nvd3 chart {data, options} configuration
      configure: (modelingResults, paramKey) ->
        # Start with a copy of the shared configuration.
        conf = _.cloneDeep(COMMON_CONFIG)
        # The parameter-specific configuration.
        paramConf = parameterConfiguration(modelingResults, paramKey, precision)
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
        # The value formatter shows three decimals more than
        # the minimum.
        valueFormatter = d3.format(".#{ precision + 3 }f")
        # The tooltip content generator.
        generateTooltip = tooltipGenerator(paramKey)
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