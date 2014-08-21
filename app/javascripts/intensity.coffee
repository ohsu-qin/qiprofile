define ['angular', 'chart'], (ng) ->
  intensity = ng.module 'qiprofile.intensity', ['qiprofile.chart']

  intensity.factory 'Intensity', ['Chart', (Chart) ->
    # Highlights the bolus arrival tick mark. The bolus arrival is
    # only highlighted if it occurs after the first series.  
    #
    # @param session the session object
    # @param chart the intensity chart
    highlightBolusArrival = (session, chart) ->
      # If the bolus arrival index is zero, then it does not have
      # have a tick mark, so bail.
      if not session.bolus_arrival_index
        return
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      xAxis = svg.select('.nv-x')
      # The D3 CSS3 bolus tick selector. The tick marks are SVG
      # g elements with the tick class. There is a tick mark for
      # all but the first and last series. Therefore, the tick
      # offset is one less than the bolus arrival index.
      offset = session.bolus_arrival_index - 1
      # The D3 CSS3 nth-of-type selector argument of zero returns
      # null. Work around this possible D3 bug by using the
      # first-of-type selector argument in that case.
      if offset
        bolusTickSltr = "g.tick:nth-of-type(#{ offset })"
      else
        bolusTickSltr = "g.tick:first-of-type"
      # The bolus tick element.
      bolusTick = xAxis.select(bolusTickSltr)
      # The bolus tick child line element.
      bolusTickLine = bolusTick.select('line')
      highlightNode = bolusTickLine.node().cloneNode()
      highlight = d3.select(highlightNode)
      # Set the bolus CSS class.
      highlight.classed('qi-bolus-arrival', true)
      # Insert the highlight SVG element after the tick line.
      # The highlight will display centered over the tick line.
      # D3 insert differs from jQuery insert. The D3 arguments are
      # a function which returns a DOM element and the selector
      # before which the node is inserted. In our case, the
      # node to insert is the highlight node and the before
      # selector is the bolus tick selector.
      highlightNodeFunc = -> highlightNode 
      bolusTick.insert(highlightNodeFunc, 'line')
      # Add the legend.
      legend = svg.select('.nv-legend')
      legendGroup = legend.select(':first-child')
      bolusGroup = legendGroup.insert('svg:g', ':first-child')
      bolusGroup.attr('transform', 'translate(-30, 5)')
      filter = bolusGroup.append('svg:filter')
      filter.attr('width', 1.2).attr('height', 1)
      filter.attr('id', 'boluslegendbackground')
      filter.append('feFlood').attr('class', 'qi-bolus-flood')
      filter.append('feComposite').attr('in', 'SourceGraphic')
      bolusLegend = bolusGroup.append('svg:text')
      bolusLegend.attr('class', 'qi-bolus-legend')
      bolusLegend.attr('dy', '.32em')
      bolusLegend.attr('filter', 'url(#boluslegendbackground)')
      bolusLegend.text('Bolus Arrival')

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
    # The result includes two data series, Scan and Realigned.
    # The chart x-axis labels are the one-based series indexes,
    # e.g. ['1', '2', ..., '12'] for 12 series.
    #
    # @param session the session object
    # @returns the nvd3 chart configuration
    configureChart: (session) ->
      # @param intensities the intensity value array
      # @returns the intensity chart [x, y] coordinates
      coordinates = (intensities) ->
        [i + 1, intensities[i]] for i in [0...intensities.length]

      # Makes the data series {key, color} format object for the
      # given registration.
      #
      # The key is 'Realigned' if there is exactly one registration,
      # otherwise the registration name
      #
      # @param registration the registration object
      # @param index the index of the registration in the registrations array
      # @returns the data series {key, color, values} format object
      registration_data_series = (registration, index) ->
        # The registration image select button colors.
        COLORS = ['LightGreen', 'LightYellow', 'LightCyan', 'LemonChiffon']
      
        key = registration.title
      
        # TODO - Wrap the key in a registration parameters pop-up hyperlink.
        # Return the data series format object.
        key: key
        color: COLORS[index % COLORS.length]
        values: coordinates(registration.intensity.intensities)

      # The scan data series configuration.
      scan_data =
        key: session.scan.title
        values: coordinates(session.scan.intensity.intensities)
        color: 'Indigo'

      # The registration data series configuration.
      for reg, i in session.registrations
        # Set the data series property so the partial can use the data
        # series key.
        reg.data_series = registration_data_series(reg, i)
      reg_data = ((reg.data_series for reg in session.registrations))
    
      # Return the chart configuration.
      data: [scan_data].concat(reg_data)
      xValues: (coord[0] for coord in scan_data.values)
      yFormat: yFormat
      highlightBolusArrival: (chart) ->
        highlightBolusArrival(session, chart)
  ]
