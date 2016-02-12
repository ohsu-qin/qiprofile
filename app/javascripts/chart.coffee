define ['angular', 'lodash', 'moment', 'd3'], (ng, _, moment) ->
  # Note: The d3 convention is to set a global variable d3 used to
  # build a chart. Consequently, the reference to d3 below is to this
  # global variable. A better d3 implementation would package d3
  # as an AMD module which we can bind to a d3 variable above. However,
  # we adhere to the d3 convention in the implementation below.

  chart = ng.module 'qiprofile.chart', []

  chart.factory 'Chart', ->
    # Builds the nvd3 chart format for the given input resource
    # objects and configuration.
    #
    # The input data is the resource objects which contain the
    # values to graph. The chart values are obtained by calling
    # the input format x-axis accessor for each chart data series.
    #
    # The input dataSpec contains the following x and y attributes:
    # * x is the x-axis {label, accessor}
    # * y is the y-axis {[{label, color, accessor}, ...], precision},
    # where:
    # * label is the data series chart label
    # * color is the data series chart color
    # * accessor is the data value access function
    # * precision is the decimal precision to use for all data series
    #   values
    #
    # The result configuration object contains the following properties:
    # * data - the nvd3 chart data
    # * yLabel - the nvd3 yAxisLabel value
    # * yFormat - the nvd3 yAxisTickFormat function
    # * yMaxMin - the nvd3 forcey range
    #
    # @param data the resource objects to graph
    # @param dataSpec the data access specification
    # @returns the chart configuration
    configureChart: (data, dataSpec) ->
      # Note: nvd3 is undergoing a major version 2 rewrite.
      # Hopefully, version 2 will address the anomalies noted in
      # the modeling-discrete-chart template.
      # TODO - Adapt this function for version 2 when it is
      # completed.

      # @returns the y values for the given resource
      resourceYValues = (resource, dataSpec) ->
        ds.accessor(resource) for ds in dataSpec.y.data

      # @param data the graphed objects
      # @param dataSpec the y axis dataSpec
      # @returns the y axis {max, min} object
      getYValueRange = (data, dataSpec) ->
        # @param data the resource objects to graph
        # @param dataSpec the data access specification described
        #   in configureChart
        # @returns the result of first calling the accessor in the
        #   data specification to the given resoure, and then applying
        #   the given function
        applyToAllResourcesYValues = (data, dataSpec, fn) ->
          # @returns the result of applying the given function to the
          #   resource values of the given object
          applyToAResourceYValues = (resource, dataSpec, fn) ->
            values = resourceYValues(resource, dataSpec)
            fn(values)

          applyToAResourceYValues(rsc, dataSpec, fn) for rsc in data

        # Return the {max, min} range object.
        max: _.max(applyToAllResourcesYValues(data, dataSpec, _.max))
        min: _.min(applyToAllResourcesYValues(data, dataSpec, _.min))

      # @param data the input resource objects
      # @param dataSpec the dataSpec described in configureChart
      # @returns the [{key, values, color}] nvd3 configuration
      configureAllDataSeries = (data, dataSpec) ->
        # @param data the input resource objects
        # @param x the x-xaxis {accessor: function} object
        # @param y the y-axis  {accessor: function} object
        # @returns the {key, values, color} object
        configureADataSeries = (data, x, y) ->
          # @returns the graph [x, y] coordinates
          coordinates = (data, xAccessor, yAccessor) ->
            [xAccessor(rsc), yAccessor(rsc)] for rsc in data

          key: y.label
          values: coordinates(data, x.accessor, y.accessor)
          color: y.color

        (configureADataSeries(data, dataSpec.x, y) for y in dataSpec.y.data)

      # Adds padding to the give value range as follows:
      # * the the chart max is the next higher significant
      #   tick mark
      # * if the value min is zero, then that is the chart
      #   min. Otherwise the chart min is the next lower
      #   significant tick mark
      #
      # @param range the chart values {max, min} range object
      # @param returns the chart axis {max, min} range object
      padRange = (range, precision) ->
        # The factor is 10**precision.
        factor = Math.pow(10, precision)

        ceiling = Math.ceil(range.max * factor)
        # Pad the graph max with the next higher significant tick mark.
        upperInt = if ceiling == 0 then ceiling else ceiling + 1
        upper = upperInt / factor

        # Round the minimum down to the nearest precision decimal.
        floor = Math.floor(range.min * factor)
        # If the floor is not at the origin, then pad the graph min with
        # the next lower significant tick mark.
        lowerInt = if floor == 0 then floor else floor - 1
        lower = lowerInt / factor

        # Return the chart{max, min} range object.
        max: upper
        min: lower

      # @param data the resource objects
      # @param dataSpec the data access specification
      # @returns the number of decimals to display on the y-axis
      defaultYPrecision = (data, dataSpec) ->
        # @param resource the resource object
        # @param dataSpec the data access specification
        defaultResourcePrecision = (resource, dataSpec) ->
          # Determine the default value precision as follows:
          # * If the value is zero or greater then one, then zero
          # * Otherwise, the number of significant decimal digits
          #
          # @param value the numeric value
          # @returns the number of decimals to display for the
          #   given value
          defaultValuePrecision = (value) ->
            if not value or value > 1
              0
            else
              1 + defaultValuePrecision(value * 10)

          # The resource data series y values.
          values = resourceYValues(resource, dataSpec)
          # The precision for each value.
          precisions =
            defaultValuePrecision(value) for value in values
          # Return the largest precision.
          _.max(precisions)

        # The precision for each resource.
        precisions =
          defaultResourcePrecision(rsc, dataSpec) for rsc in data
        # Return the largest precision.
        _.max(precisions)

      # This function is a work-around for the following missing
      # nvd3 feature:
      # * allow different dataSpecs for y ticks and y tooltip
      #   values
      # This function allows for displaying the y-axis values
      # with two more precision digits than the y-axis ticks.
      #
      # @returns a function which formats the y axis
      #   ticks differently than the y tooltip values
      decimalFormatter = (precision) ->
        # The multiplicative factor.
        factor = Math.pow(10, precision)
        # The y-axis tick format.
        formatTick = d3.format('.' + precision + 'f')
        # The y-axis value format allows for more precision than
        # the tick mark.
        formatValue = d3.format('.' + (precision + 2) + 'f')

        # @param value the value to format
        # @returns the d3 formatter function
        (value) ->
          # Shift the value to the left.
          shifted = value * factor
          # If there are no significant decimal digits in
          # the shifted value, then format the value as a
          # tick mark. Otherwise, format the value as a data
          # series value.
          if shifted - Math.floor(shifted) < .001
            formatTick(value)
          else
            formatValue(value)

      # The y-axis value range.
      valueYRange = getYValueRange(data, dataSpec)

      # Get the default precision, if necessary.
      if dataSpec.y.precision
        precision = dataSpec.y.precision
      else
        precision = defaultYPrecision(data, dataSpec)

      # The chart y-axis range.
      chartYRange = padRange(valueYRange, precision)

      # Return the graph configuration.
      data: configureAllDataSeries(data, dataSpec)
      yFormat: decimalFormatter(precision)
      yLabel: dataSpec.y.label
      yMaxMin: _.values(chartYRange)

    # @param date the moment date integer
    # @returns the formatted date
    dateFormat: (date) ->
      moment(date).format('MM/DD/YYYY')

    # Replaces the given text element with a ui-router ui-sref
    # hyperlink anchor element.
    #
    # Note: since this function modifies the DOM with an AngularJS
    # directive, the element returned by this function must be
    # compiled by AngularJS with the scope $compile function.
    #
    # @param text the text element
    # @param the ui-router ui-sef
    # @returns the new ui-sref anchor element
    d3Hyperlink: (text, sref) ->
      # The parent node wrapped by D3.
      p = d3.select(text.parentNode)
      # The D3 wrapper on this text element.
      t = d3.select(text)
      # Remove this text element from the DOM.
      t.remove()
      # Append a SVG anchor.
      a = p.append('svg:a')
      # Add the ui-sref.
      a.attr('ui-sref', sref)
      # Failure to set href to a non-null, non-empty value results in
      # an obscure AngularJS DOM insertion error and disables the link.
      # The href is not used, since the ui-sref hyperlink target takes
      # precedence.
      a.attr('href', '#')
      # Reattach the text element to the anchor.
      # The D3 selection append method takes either a string,
      # in which case it creates a new element as in the above
      # svg:a append, or a function which returns a DOM element.
      # In the call below, the text element is appended.
      a.append(-> text)
      # Return the anchor element
      a.node()
