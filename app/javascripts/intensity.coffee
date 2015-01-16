define ['angular', 'chart', 'image'], (ng) ->
  intensity = ng.module 'qiprofile.intensity', ['qiprofile.image']

  intensity.factory 'Intensity', ['Image', (Image) ->
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
        bolusTickSlct = "g.tick:nth-of-type(#{ offset })"
      else
        bolusTickSlct = "g.tick:first-of-type"
      # The bolus tick element.
      bolusTick = xAxis.select(bolusTickSlct)
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

    # The y-axis format function. If the given intensity value
    # is integral, then this function returns the integer.
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
    yFormat = (value) ->
      # ~~ is the obscure Javascript idiom for correctly converting
      # a float to an int. Math.ceil does not correctly truncate
      # negative floats.
      intValue = ~~value
      if value == intValue
        intValue
      else
        value.toFixed(2)

    # Makes the intensity chart configuration for the given session.
    #
    # The result includes the T1 scan data series and each registration
    # data series. The chart x-axis labels are the one-based series
    # indexes, e.g. ['1', '2', ..., '12'] for 12 series.
    #
    # @param session the session object
    # @param element the chart Angular jQueryLite element
    # @returns the nvd3 chart configuration
    configureChart: (session, element) ->
      # @param intensities the intensity value array
      # @returns the intensity chart [x, y] coordinates
      coordinates = (intensities) ->
        [i + 1, intensities[i]] for i in [0...intensities.length]

      # The scan data series configuration.
      scan = session.scans.t1
      scanData =
        key: 'Scan'
        values: coordinates(scan.intensity.intensities)
        color: 'Indigo'

      # Flag indicating whether the T1 scan has more than one
      # realignment.
      hasMultipleRegs = Object.keys(scan.registration).length > 1

      # Makes the data series {key, color} format object for the
      # given registration.
      #
      # The key is 'Realigned' if there is exactly one registration,
      # otherwise 'Reg' followed by the registration index, e.g.
      # 'Reg 1'.
      #
      # @param registration the registration object
      # @param index the index of the registration in the registrations
      #   array
      # @returns the data series {key, color, values} format object
      registrationDataSeries = (registration, index) ->
        # The registration image select button colors.
        COLORS = ['LightGreen', 'LightYellow', 'LightCyan', 'LemonChiffon']
        # The registration data series key.
        key = if hasMultipleRegs then "Reg #{ index }" else 'Realigned'
        # Set the registration title property, since it is used in the
        # image selection as well.
        registration.title = key

        # TODO - Wrap the key in a registration parameters pop-up hyperlink.
        
        # Return the data series format object.
        key: key
        color: COLORS[index % COLORS.length]
        values: coordinates(registration.intensity.intensities)

      # Sort the scan registrations by key.
      regKeys = Object.keys(scan.registration).sort()
      regsSorted = (scan.registration[key] for key in regKeys)
      # Collect the data series specifications.
      regData = (registrationDataSeries(reg, i) for reg, i in regsSorted)

      # Return the chart configuration.
      data: [scanData].concat(regData)
      xValues: (coord[0] for coord in scanData.values)
      yFormat: yFormat
      highlightBolusArrival: (chart) ->
        highlightBolusArrival(session, chart)
  ]