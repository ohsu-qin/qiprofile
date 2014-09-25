define ['angular', 'lodash', 'moment', 'helpers', 'chart'], (ng, _, moment) ->
  dateline = ng.module 'qiprofile.dateline', ['qiprofile.helpers', 'qiprofile.chart']
  
  dateline.factory 'VisitDateline', ['ObjectHelper', 'Chart', (ObjectHelper, Chart) ->
    # A helper function to calculate the effective treatment dates.
    # If there is not a begin date, then this function returns an
    # empty array. Otherwise, this function returns a [begin, end]
    # array, where:
    # * begin is the moment begin date integer 
    # * end is the moment end date integer
    # The default end date is today.
    #
    # @param treatment the treatment object
    # @returns the [begin, end] array
    treatmentSpan = (treatment) ->
      if treatment.begin_date?
        begin = treatment.begin_date.valueOf()
        endDate = treatment.end_date or moment()
        end = endDate.valueOf()
        [begin, end]
      else
        []
    
    # Decorates the dateline as follows:
    # * Add the session hyperlinks, encounter dates and treatment
    #   begin-end bars.
    # * Rotate the date x-axis tick labels
    #
    # Note: The session hyperlinks are ui-sref attributes. However,
    # D3 mutates the DOM after the Angular digest cycle. Consequently,
    # the callback must call Angular $compile with the current scope
    # on each new hyperlink.ui-sref directive.
    #
    # @param subject the subject to display
    # @param chart the dateline chart
    # @param config the dateline configuration
    # @param callback the function to call on each new session anchor
    #   element
    decorate: (subject, chart, config, callback) ->
      # The treatment bar height, in em units
      TREATMENT_BAR_HEIGHT = 1
      
      # A treatment is designated by the HTML nabla special character
      # (the wedge-like math del operator).
      TREATMENT_SYMBOL = '\u2207'
      
      # Adds the session hyperlinks above the timeline. The template
      # sets the callback attribute to this function. The new anchor
      # elements are positioned dy em units above the timeline,
      # plus a small padding. This allows for displaying the treatment
      # bars and encounter points between the timeline and the
      # hyperlinks.
      #
      # @param sessions the subject sessions
      # @param xAxis the chart SVG x axis D3 selection
      # @param dy the optional y offset in em units
      addSessionDetailLinks = (sessions, xAxis, dy=0) ->
        # @returns the ui-sref link to detail page for the given session
        sessionDetailLink = (session) ->
          "quip.subject.session.detail(" +
          "{project: '#{ session.subject.project }'," +
          " collection: '#{ session.subject.collection.toLowerCase() }'," +
          " subject: #{ session.subject.number }," +
          " session: #{ session.number }," +
          " detail: '#{ session.detail }'})"
      
        # Makes a new ui-sref anchor element that hyperlinks to the given
        # session detail page.
        #
        # @param tick the timeline X-axis tick mark
        # @param session the hyperlink target session
        # @param dy the y axis offset
        createSessionDetailLink = (tick, session, offset) ->
          # Make a new SVG text element to hold the session number.
          text = d3.select(tick).append('text')
          # Position the session number a bit to right and above the tick
          # mark, scooched up by the dy amount.
          text.attr('dx', '-.2em').attr('dy', "-#{ 0.5 + dy }em")
          text.style('text-anchor: middle')
          # The text content is the session number.
          text.text(session.number)
          # The hyperlink target.
          sref = sessionDetailLink(session)
          # Wrap the text element in a hyperlink.
          Chart.d3Hyperlink(text.node(), sref)
        
        # The tick elements.
        ticks = xAxis.selectAll('.tick')[0]
        for i in [0...ticks.length]
          a = createSessionDetailLink(ticks[i], sessions[i])
          callback(a) if callback
  
      # Inserts an SVG bar for each treatment above the timeline.
      # The bar is added if and only if the treatment has a
      # begin date.
      #
      # @param xAxisNode the chart SVG x axis element
      # @param config the chart configuration
      addTreatmentBars = (xAxisNode, config) ->
        # The x axis container.
        parent = d3.select(xAxisNode.parentNode)
        # The invisible SVG rect element spans the dateline.
        rect = parent.select('rect')
        dateline = width: parseInt(rect.attr('width'))
        [low, high] = config.xMaxMin
        # The scaling factor.
        factor = dateline.width / (high - low)
        for trt in subject.treatments
          trtSpan = treatmentSpan(trt)
          if _.any(trtSpan)
            [begin, end] = trtSpan
            left = (begin - low) * factor
            width = (end - begin) * factor
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
            bar.classed("qi-dateline-#{ trt.treatment_type.toLowerCase() }", true)
            # Position the bar.
            bar.attr('x', left)
            bar.attr('y', "-#{ TREATMENT_BAR_HEIGHT }em")
      
      # Inserts a marker for each encounter above the timeline.
      #
      # @param xAxisNode the chart SVG x axis element
      # @param config the chart configuration
      addEncounterDates = (xAxisNode, config) ->
        # The x axis container.
        parent = d3.select(xAxisNode.parentNode)
        # The invisible SVG rect element spans the dateline.
        rect = parent.select('rect')
        dateline = width: parseInt(rect.attr('width'))
        [low, high] = config.xMaxMin
        # The scaling factor.
        factor = dateline.width / (high - low)
        for enc in subject.encounters
          date = enc.date.valueOf()
          offset = (date - low) * factor
          # Place the new text element in the DOM before the
          # x axis element. Scooch it over 6 pixels to center
          # the marker.
          text = parent.insert('svg:text', -> xAxisNode)
          text.attr('x', Math.floor(offset) - 6)
          # Set the text style.
          text.classed("qi-dateline-#{ enc.encounter_type.toLowerCase() }", true)
          # Set the text content to a marker, specifically the HTML
          # nabla math special character (the wedge-like del operator).
          text.text(TREATMENT_SYMBOL)
      
      # Rotates the x-axis visit date tick labels by 45 degrees.
      #
      # @param chart the dateline chart
      # @param xAxis the x-axis D3 selection
      rotateDateLabels = (chart, xAxis) ->
        xTicks = xAxis.selectAll('.tick')
        labels = xTicks.select('text')
        labels.attr 'transform', (d, i, j) ->
            'translate (-27, 18) rotate(-40, 0, 0)'
    
      # Adds the treatment and encounter legend directly before the
      # SVG element.
      #
      # @param svg the SVG element
      addLegend = (svgNode) ->
        addTreatmentLegend = (parent, svgNode) ->
          # The displayed treatments have a begin date.
          filtered = _.filter(subject.treatments, (trt) -> trt.begin_date?)
          # Bail if no treatments are displayed.
          if not filtered.length
            return
          # Place the legend line.
          p = parent.insert('p', -> svgNode)
          p.text('Treatments: ')
          p.classed({'col-md-offset-5': true, 'font-size: small': true})
          # Sort by begin date.
          sorted = _.sortBy(filtered, (trt) -> trt.begin_date.valueOf())
          # The treatment labels.
          labels = _.uniq(trt.treatment_type for trt in sorted)
          # The treatment label size.
          label_lengths = (label.length for label in labels)
          len = _.max(label_lengths) + 2
          for label in labels
            # Place the new span element.
            span = p.append('span')
            # The legend style.
            span.classed("qi-dateline-#{ label.toLowerCase() }", true)
            # The span content is the treatment type label.
            span.text(label)
        
        addEncounterLegend = (parent, svgNode) ->
          # Bail if no encounters are displayed.
          if not subject.encounters.length
            return
          # Place the legend line.
          p = parent.insert('p', -> svgNode)
          p.text('Encounters: ')
          p.classed({'col-md-offset-5': true, 'font-size: small': true})
          # Sort by begin date.
          sorted = _.sortBy(subject.encounters, (enc) -> enc.date.valueOf())
          # The encounter labels.
          labels = _.uniq(enc.encounter_type for enc in sorted)
          for label in labels
            # Place the new span element.
            span = p.append('span')
            # The legend style.
            span.classed("qi-dateline-#{ label.toLowerCase() }", true)
            # The span content is the symbol which designates the encounter
            # followed by the encounter type.
            span.text(TREATMENT_SYMBOL + label)
        
        # The legend is inserted directly before the svg element.
        parent = d3.select(svgNode.parentNode)
        addTreatmentLegend(parent, svgNode)
        addEncounterLegend(parent, svgNode)
      
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      xAxis = svg.select('.nv-x')
      # The session hyperlink vertical offset.
      if _.any(subject.treatments) or _any(subject.encounters.length)
        dy = TREATMENT_BAR_HEIGHT
      else
        dy = 0
      # Decorate the chart.
      addTreatmentBars(xAxis.node(), config)
      addEncounterDates(xAxis.node(), config)
      addSessionDetailLinks(subject.sessions, xAxis, dy)
      rotateDateLabels(chart, xAxis)
      addLegend(svg.node())
  
    # @param subject the subject to display
    # @returns the nvd3 chart configuration
    configureChart: (subject) ->
      # Helper function to calculate the earliest and latest session,
      # encounter and treatment dates.
      #
      # @returns the [earliest, latest] X axis range
      xMaxMin = ->
        values = []
        for trt in subject.treatments
          trtSpan = treatmentSpan(trt)
          for value in trtSpan
            values.push(value)
        for enc in subject.encounters
          values.push(enc.date.valueOf())
        for sess in subject.sessions
          values.push(sess.acquisitionDate.valueOf())
        # Return the min and max date.
        [_.min(values), _.max(values)]

      # The chart data specification.
      dataSpec =
        x:
          accessor: (session) -> session.acquisitionDate.valueOf()
        y:
          # There is one tri-partite data series. The y coordinate
          # for this data series is always zero.
          data: [ accessor: -> 0 ]
  
      # Return the standard chart configuration extended
      # with the following:
      # * the xValues and xFormat properties
      # * the addSessionDetailLinks function
      _.extend Chart.configureChart(subject.sessions, dataSpec),
        xValues: (dataSpec.x.accessor(sess) for sess in subject.sessions)
        xFormat: Chart.dateFormat
        xMaxMin: xMaxMin()
        height: 100
  ]
