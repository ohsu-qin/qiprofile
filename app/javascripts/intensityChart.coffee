define ['angular', 'chart'], (ng) ->
  intensityChart = ng.module 'qiprofile.intensitychart', []

  intensityChart.factory 'IntensityChart', ->
    # The Y axis value formatter function. If the given intensity
    # value is integral, then this function returns the integer.
    # Otherwise, the value is truncated to two decimal places.
    #
    # nvd3 unfortunately uses this function to format both the tick
    # values and the tooltip y values. Therefore, this function
    # formats the integral tick values as an integer and the float
    # y values as floats. Thus, both the y tick values and the
    # tooltip are more readable.
    #
    # @param value the intensity value
    # @returns the chart display value
    formatIntensity = (value) ->
      # ~~ is the obscure Javascript idiom for correctly converting
      # a float to an int. Math.floor does not correctly truncate
      # negative floats.
      intValue = ~~value
      if value == intValue
        intValue
      else
        value.toFixed(2)

    # Makes the D3 intensity chart configuration for the given session.
    #
    # The result includes the T1 scan data series and each registration
    # data series. The chart x-axis labels are the one-based series
    # indexes, e.g. ['1', '2', ..., '12'] for 12 series.
    #
    # @param session the session object
    # @param element the chart Angular jqLite element
    # @returns the ngnvd3 chart configuration
    configure: (scan, element) ->
      # The scan data series and volume select color. This value must match
      # the .qi-scan-vol-btn-group basic color.
      SCAN_COLOR = 'Indigo'
      
      # The registration data series and volume select button colors. If
      # there are more than four registrations per scan, which is highly
      # unlikely, then the colors are reused. These values must match
      # the .qi-reg-vol-btn-group basic colors.
      REG_COLORS = ['LightGreen', 'LightYellow', 'LightCyan', 'LemonChiffon']

      # @param image the scan or registration volume image
      # @param index the zero-based volume index
      # @returns the intensity chart {x, y} coordinate
      coordinate = (image, index) ->
        {x: index + 1, y: image.averageIntensity}

      # @param images the scan or registration volume images
      # @returns the intensity chart [{x, y}, ...] coordinates
      coordinates = (images) ->
        (coordinate(image, i) for image, i in images)

      # @returns 'Realigned', followed by the one-based registration
      #   number if there is more than one
      dataSeriesKey = (index) ->
        if scan.registrations.length == 1
          'Realigned'
        else
          "Realigned #{ index + 1 }"

      # Makes the data series {key, color} format object for the
      # given registration.
      #
      # The key is 'Realigned' if there is exactly one registration,
      # otherwise 'Realigned' followed by the one-based registration
      # number, e.g. 'Reg 1'.
      #
      # @param registration the registration object
      # @param index the index of the registration in the registrations
      #   array
      # @returns the data series {key, color, values} format object
      registrationDataSeries = (registration, index) ->
        # Return the data series format object.
        key: dataSeriesKey(index)
        type: 'line'
        yAxis: 1
        color: REG_COLORS[index % REG_COLORS.length]
        values: coordinates(registration.volumes.images)

      # The scan data series configuration.
      scanDataSeries =
        key: 'Scan'
        type: 'line'
        yAxis: 1
        color: SCAN_COLOR
        values: coordinates(scan.volumes.images)
      # The registration data series.
      regDataSeries = (registrationDataSeries(reg, i) for reg, i in scan.registrations)
      
      # Combine the scan and registration data series.
      data = [scanDataSeries].concat(regDataSeries)

      # Add the bolus arrival bar.
      bolusArvNdx = scan.bolusArrivalIndex
      if bolusArvNdx?
        # Extend the bar from the axis to the top.
        dsIntensities = (_.map(dataSeries.values, 'y') for dataSeries in data)
        dsMaxIntensities = (_.max(values) for values in dsIntensities)
        maxIntensity = _.max(dsMaxIntensities)
        yValues = new Array(scan.volumes.images.length)
        if Array.prototype.fill?
          yValues.fill(0)
        else
          # Polyfill IE.
          for i in [0...yValues.length]
            yValues[i] = 0
        yValues[bolusArvNdx] = maxIntensity
        values = ({x: i + 1, y: y} for y, i in yValues)
        bolusDataSeries =
          key: 'Bolus Arrival'
          type: 'bar'
          yAxis: 1
          color: 'SandyBrown'
          values: values
          showMaxMin: false
        data.push(bolusDataSeries)

      # Return the chart configuration.
      options:
        chart:
          type: 'multiChart'
          forceY: [0]
          yAxis:
            tickFormat: formatIntensity
            showMaxMin: false
          xAxis:
            axisLabel: 'Time Point'
            ticks: scan.volumes.images.length
          tooltip:
            headerFormatter: (volumeNumber) ->
              "Volume #{ volumeNumber }"
            # Note: due to a svd3 but, valueFormatter doesn't work on a
            # multichart, although headerFormatter does.
            #valueFormatter: d3.format('.2f')
      data: data
