define ['angular', 'chart'], (ng) ->
  intensityChart = ng.module 'qiprofile.intensitychart', []

  intensityChart.factory 'IntensityChart', ->
    # Highlights the bolus arrival tick mark. The bolus arrival is
    # only highlighted if it occurs after the first series.
    #
    # @param session the session object
    # @param chart the intensity chart
    highlightBolusArrival = (session, chart) ->
      # If the bolus arrival index is zero, then it does not have
      # have a tick mark, so bail.
      if not session.bolusArrivalIndex
        return
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      xAxis = svg.select('.nv-x')

      # The D3 CSS3 bolus tick selector. The tick marks are SVG
      # g elements with the tick class. There is a tick mark for
      # all but the first and last series. Therefore, the tick
      # offset is one less than the bolus arrival index.
      offset = session.bolusArrivalIndex - 1
      # The D3 CSS3 nth-of-type selector argument of zero returns
      # null. The work-around for this possible D3 bug by using
      # the first-of-type selector argument in that case.
      if offset
        bolusTickSel = "g.tick:nth-of-type(#{ offset })"
      else
        bolusTickSel = "g.tick:first-of-type"
      # The bolus tick element.
      bolusTick = xAxis.select(bolusTickSel)
      # The bolus tick child line element.
      bolusTickLine = bolusTick.select('line')
      highlightNode = bolusTickLine.node().cloneNode()
      highlight = d3.select(highlightNode)
      # Set the bolus CSS class.
      highlight.classed('qi-bolus-arrival', true)

      # Insert the highlight SVG element after the tick line. The
      # highlight will display centered over the tick line. Note
      # that D3 insert differs from jQuery insert. The D3 arguments
      # are a function which returns a DOM element and the selector
      # before which the node is inserted. In our case, the node to
      # insert is the highlight node and the before selector is the
      # bolus tick selector.
      highlightNodeFunc = -> highlightNode
      bolusTick.insert(highlightNodeFunc, 'line')

      # The chart legend.
      legend = svg.select('.nv-legend')
      # The legend group holds the legend elements.
      legendGroup = legend.select(':first-child')
      # Add a bolus legend group before the standard legends.
      bolusGroup = legendGroup.insert('svg:g', ':first-child')
      bolusGroup.attr('transform', 'translate(-25, 5)')
      # The legend text.
      text = 'Bolus Arrival'
      # The SVG text size in em units.
      textScale = 0.32
      # The legend length.
      textWidth = textScale * text.length

      # A rectangle of the same color as the bolus arrival timeline
      # bar is the background for the legend text.
      bolusLegendBar = bolusGroup.append('svg:rect')
      bolusLegendBar.attr('width', "#{ textWidth + 1 }em")
      bolusLegendBar.attr('height', '1.1em')
      bolusLegendBar.attr('x', "#{ -textWidth - 1.1 + textScale }em")
      bolusLegendBar.attr('y', "-#{ textScale + .2 }em")
      bolusLegendBar.attr('fill', 'Gainsboro')

      # The bolus legend text is painted on top of the rectangle.
      bolusLegend = bolusGroup.append('svg:text')
      bolusLegend.attr('class', 'qi-bolus-legend')
      bolusLegend.attr('dy', "#{ textScale }em")
      bolusLegend.text(text)

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
        color: REG_COLORS[index % REG_COLORS.length]
        values: coordinates(registration.volumes.images)

      # The scan data series configuration.
      scanDataSeries =
        key: 'Scan'
        color: SCAN_COLOR
        values: coordinates(scan.volumes.images)
      # The registration data series.
      regDataSeries = (registrationDataSeries(reg, i) for reg, i in scan.registrations)
      # Combine the scan and registration data series.
      data = [scanDataSeries].concat(regDataSeries)

      # TODO - adapt highlightBolusArrival for ngnvd3 and enable
      #   as the onready callback.
      #   But try out a line/bar combo chart first.
      highlightBolusArrival: (chart) ->
        highlightBolusArrival(scan.session, chart)

      # Return the chart configuration.
      options:
        chart:
          type: 'lineChart'
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
      data: data
