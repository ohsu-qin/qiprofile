define ['angular', 'lodash', 'moment', 'helpers', 'chart', 'session'], (ng, _, moment) ->
  timeline = ng.module 'qiprofile.timeline', ['qiprofile.helpers', 'qiprofile.chart', 'qiprofile.session']

  timeline.factory 'Timeline', ['ObjectHelper', 'Chart', 'Session', (ObjectHelper, Chart, Session) ->
    # A helper function to calculate the effective treatment dates.
    # This function returns a [start, end] array, where:
    # * start is the moment start date integer
    # * end is the moment end date integer
    # The default end date is today.
    #
    # TODO - depict a treatment with no end date as an arrow.
    #
    # @param treatment the treatment object
    # @returns the [start, end] array
    treatmentSpan = (treatment) ->
      start = treatment.startDate
      end = treatment.endDate or moment()
      [start, end]

    # Helper function to calculate the earliest and latest session,
    # encounter and treatment dates.
    #
    # @param subject the target subject
    # @returns the [earliest, latest] X axis range
    minMax = (subject) ->
      values = []
      for trt in subject.treatments
        trtSpan = treatmentSpan(trt)
        for value in trtSpan
          values.push(value)
      for enc in subject.encounters
        values.push(enc.date)
      # Return the min and max date.
      [_.min(values), _.max(values)]
    
    # @param subject the target subject
    # @returns the date values to plot
    xValues = (subject) ->
      # The session dates are displayed as X axis tick marks.
      sessionDates = (sess.date for sess in subject.sessions)
      # The starting values are the sorted session dates.
      values = _.sortBy(sessionDates, (date) -> date.valueOf())
      # The [earliest, latest] session, treatment or encounter
      # date.
      [low, high] = minMax(subject)
      # Add the other dates only if they do not coincide with
      # the session dates.
      if low.valueOf() != _.first(sessionDates).valueOf()
        values.unshift(low)
      if high.valueOf() != _.last(sessionDates).valueOf()
        values.push(high)
      # Return the date values.
      values

    # Decorates the timeline as follows:
    # * Add the session hyperlinks, encounter dates and treatment
    #   start-end bars.
    # * Rotate the date x-axis tick labels
    #
    # Note: The session hyperlinks are ui-sref attributes. However,
    # D3 mutates the DOM after the Angular digest cycle. Consequently,
    # the callback must call Angular $compile with the current scope
    # on each new hyperlink.ui-sref directive.
    #
    # @param chart the timeline chart element
    # @param subject the displayed subject
    # @param scope the (isolated) chart scope containing the options
    #   and data
    # @param $state the ui-router $state 
    decorate: (chart, subject, scope, $state) ->
      # The min and max X values. The dates are sorted by the
      # configure method.
      values = scope.data[0].values
      low = _.first(values)
      high = _.last(values)
      
      # The treatment bar height, in em units
      TREATMENT_BAR_HEIGHT = 1
      
      # A treatment is designated by the HTML nabla special character
      # (the wedge-like math del operator).
      TREATMENT_SYMBOL = '\u2207'
      
      # The Session Detail state.
      SESSION_DETAIL_STATE = 'quip.collection.subject.session'

      # Adds the session hyperlinks above the timeline. The template
      # sets the callback attribute to this function. The new anchor
      # elements are positioned dy em units above the timeline,
      # plus a small padding. This allows for displaying the treatment
      # bars and encounter points between the timeline and the
      # hyperlinks.
      #
      # @param sessions the subject sessions
      # @param xAxis the chart SVG X axis D3 selection
      # @param low the minimum date
      # @param high the maximum date
      # @param dy the optional y offset in em units
      addSessionDetailLinks = (sessions, xAxis, low, high, dy=0) ->
        # Makes a new ui-sref anchor element that hyperlinks to the given
        # session detail page.
        #
        # @param session the hyperlink target session
        # @param tick the X axis tick mark
        createSessionDetailLink = (session, tick) ->
          # Make a new SVG text element to hold the session number.
          text = tick.append('text')
          # Position the session number a bit to right and above the tick
          # mark, scooched up by the dy amount.
          text.attr('dx', '-.2em').attr('dy', "-#{ 0.5 + dy }em")
          text.style('text-anchor: middle')
          # The text content is the session number.
          text.text(session.number)
          # The Session Detail state parameters.
          params =
            project: subject.project
            collection: subject.collection
            subject: subject.number
            session: session.number
          # The hyperlink click event handler.
          handler = -> $state.go(SESSION_DETAIL_STATE, params)
          # Wrap the text element in a hyperlink.
          Chart.d3Hyperlink(text, handler)

        # The tick marks.
        ticks = xAxis.selectAll('.tick')
        # The session milliseconds.
        sessionMillis = (session.date.valueOf() for session in sessions)

        # @param date the date to check
        # @returns whether the date is a session date
        isSessionDate = (date) -> _.includes(sessionMillis, date.valueOf())

        # Make the Session Detail page links.
        #
        # The odd D3 *each* operator calls this function with
        # *this* bound to the D3 tick selection and arguments
        # the element "data", as D3 chooses to call it, and
        # the iteration number. The element data in this
        # case is the date. We want the D3 tick selection,
        # which is given by d3.select(this).
        #
        # Note that we can't simply iterate over the ticks in a
        # for loop, since that is a D3 taboo which results in
        # garbage.
        sessionIndex = 0
        ticks.each (date, i) ->
          if isSessionDate(date)
            tick = d3.select(this)
            createSessionDetailLink(sessions[sessionIndex], tick)
            sessionIndex++

      # Inserts an SVG bar for each treatment above the timeline.
      #
      # @param xAxisNode the chart SVG x axis element
      # @param options the chart options
      addTreatmentBars = (xAxis, low, high) ->
        # The .nv-background xAxis contained in the X axis parent
        # spaces the X axis.
        xAxisNode = xAxis.node()
        parent = d3.select(xAxisNode.parentNode)
        background = parent.select('.nv-background')
        spacer = background.select('rect')
        axisWidth = spacer.attr('width')
        # The date offset-to-pixel scaling factor.
        factor = axisWidth / (high - low)
        for trt in subject.treatments
          [start, end] = treatmentSpan(trt)
          left = (start - low) * factor
          width = (end - start) * factor
          # Allow for a 6-pixel minimum width.
          if not width
            left = left - 3
            width = 6
          # Place the new bar rectangle element in the DOM
          # before the x axis element.
          bar = parent.insert('svg:rect', -> xAxisNode)
          # Set the bar dimensions.
          bar.attr('height', "#{ TREATMENT_BAR_HEIGHT }em")
          bar.attr('width', width)
          # Set the bar style.
          bar.classed("qi-timeline-#{ trt.treatmentType.toLowerCase() }", true)
          # Position the bar.
          bar.attr('x', left)
          bar.attr('y', "-#{ TREATMENT_BAR_HEIGHT }em")

      # Inserts a marker for each clinical encounter above the
      # timeline.
      #
      # @param element the chart X axis D3 selection
      # @param low the minimum date
      # @param high the maximum date
      addClinicalEncounters = (xAxis, low, high) ->
        # The .nv-background xAxis contained in the X axis parent
        # spaces the X axis.
        xAxisNode = xAxis.node()
        parent = d3.select(xAxisNode.parentNode)
        background = parent.select('.nv-background')
        spacer = background.select('rect')
        axisWidth = spacer.attr('width')
        # The X axis line element is contained in the axis parent.
        line = parent.select('.nv-series-0')
        # Unwrap the DOM element.
        lineNode = line.node()
        # The date offset-to-pixel scaling factor.
        factor = axisWidth / (high - low)
        # Insert the encounters.
        for enc in subject.clinicalEncounters
          date = enc.date
          # The pixel offset.
          offset = (date - low) * factor
          # Place the new text element in the DOM before the
          # x axis element. Scooch it over 6 pixels to center
          # the marker.
          text = parent.insert('svg:text')
          text.attr('x', Math.floor(offset) - 6)
          # Set the text style, e.g. .qi-timeline-surgery.
          text.classed("qi-timeline-#{ enc.title.toLowerCase() }", true)
          # Set the text content to a marker, specifically the HTML
          # nabla math special character (the wedge-like del operator).
          text.text(TREATMENT_SYMBOL)

      # Adds the treatment and encounter legend directly before the
      # SVG element.
      #
      # @param svg the SVG D3 selection
      addLegend = (svg) ->
        addTreatmentLegend = (parent) ->
          # If there are no treatments, then bail out.
          trts = subject.treatments
          return if not trts.length
          # Place the legend line.
          p = parent.insert('p', -> svg.node())
          p.text('Treatments: ')
          p.classed({'col-md-offset-5': true, 'font-size: small': true})
          # Sort by start date.
          sorted = _.sortBy(trts, (trt) -> trt.start_date.valueOf())
          # The treatment labels.
          labels = _.uniq(trt.treatment_type for trt in sorted)
          # The treatment label size.
          label_lengths = (label.length for label in labels)
          len = _.max(label_lengths) + 2
          for label in labels
            # Place the new span element.
            span = p.append('span')
            # The legend style.
            span.classed("qi-timeline-#{ label.toLowerCase() }", true)
            # The span content is the treatment type label.
            span.text(label)

        addEncounterLegend = (parent) ->
          # Bail if no encounters are displayed.
          encs = subject.clinicalEncounters
          return if not encs.length
          # Place the legend line.
          p = parent.insert('p', -> svg.node())
          p.text('Encounters: ')
          p.classed({'col-md-offset-5': true, 'font-size: small': true})
          # Sort by start date.
          sorted = _.sortBy(encs, (enc) -> enc.date.valueOf())
          # The encounter labels.
          labels = _.uniq(enc.title for enc in sorted)
          for label in labels
            # Place the new span element.
            span = p.append('span')
            # The legend style.
            span.classed("qi-timeline-#{ label.toLowerCase() }", true)
            # The span content is the symbol which designates the encounter
            # followed by the encounter type.
            span.text(TREATMENT_SYMBOL + label)

        # The legend is inserted directly before the svg element.
        svgNode = svg.node()
        parent = d3.select(svgNode.parentNode)
        addTreatmentLegend(parent)
        addEncounterLegend(parent)

      # Find the SVG element.
      svg = d3.select('svg')
      if not svg?
        throw new ReferenceError("The svg element was not found.")
      # The X axis element.
      xAxis = svg.select('.nv-x')
      # The session hyperlink vertical offset.
      if _.some(subject.treatments) or _.some(subject.clinicalEncounters)
        dy = TREATMENT_BAR_HEIGHT
      else
        dy = 0
      
      # Scooch the X axis label up to work around the
      # nvd3 or d3 bug described in the config rotateLabels
      # setting below.
      workAroundAxisLabelBug = (xAxis) ->
        label = xAxis.select('.nv-axislabel')
        y = label.attr('y')
        label.attr('y', y - 10)

      # The earliest and latest dates.
      [low, high] = minMax(subject)
      # Decorate the chart.
      addTreatmentBars(xAxis, low, high)
      addClinicalEncounters(xAxis, low, high)
      addSessionDetailLinks(subject.sessions, xAxis, low, high, dy)
      addLegend(svg)
      workAroundAxisLabelBug(xAxis)

    # @param subject the subject to display
    # @returns the nvd3 chart configuration
    configure: (subject) ->
      # The values to plot.
      values = xValues(subject)
      
      # Return the {options, data} configuration.
      options:
        chart:
          type: 'lineChart'
          height: 83
          # We roll our own legend in the callback.
          showLegend: false
          x: (date) -> date
          xAxis:
            axisLabel: 'Visit Date'
            showMaxMin: false
            tickValues: values
            tickFormat: Chart.formatDate
            # Note - due to a nvd3 or d3 bug, rotating the labels
            # forces the axis out of the chart display. Adding a
            # margin has no effect. The only recourse is to hammer
            # the DOM afterwards to move the label up.
            rotateLabels: -30
            # Note: a nvd3 bug clobbers the custom tickSize set below.
            # The work-around is to reduce the height to a just-so
            # value that loses the tick marks (yuck). Setting the
            # xAxis height would be an alternative, but this has
            # no effect, probably due to another nvd3 bug.
            # TODO - file a nvd3 bug and revisit this in 2017.
            #tickSize: 4
          tooltip:
            enabled: false
          xScale: d3.time.scale()
          # The session dates align on the X axis,
          # hence the Y value is always zero.
          y: -> 0
          showYAxis: false
      data: [
        key: 'Visit Date'
        values: values
      ]
  ]
