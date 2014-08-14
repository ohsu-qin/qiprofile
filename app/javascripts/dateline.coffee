define ['angular', 'chart', 'lodash'], (ng) ->
  dateline = ng.module 'qiprofile.dateline', ['qiprofile.chart']
  
  dateline.factory 'VisitDateline', ['Chart', (Chart) ->
    # Adds the session hyperlinks above the timeline.
    # The template sets the callback attribute to this
    # function. 
    #
    # @param sessions the session objects
    # @param chart the timeline chart
    # @param callback the optional function to call on the new
    #   anchor element
    addSessionDetailLinks: (sessions, chart, callback) ->
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
      createSessionDetailLink = (tick, session) ->
        # Make a new SVG text element.
        text = d3.select(tick).append('text')
        text.attr('dx', '-.2em').attr('dy', '-.5em')
        text.style('text-anchor: middle')
        # The text content is the session number.
        text.text(session.number)
        # The hyperlink target.
        sref = sessionDetailLink(session)
        # Wrap the text element in a hyperlink.
        #
        # Note - The ui-router prevents the back button from returning to
        # the previous state when the current page is a session visited from
        # a D3 hyperlink below. ui-router links should be ui-sref rather than
        # href (cf. https://github.com/angular-ui/ui-router/issues/372).
        # However, D3 mutates the DOM after the Angular digest cycle.
        # Thus the ui-sref directive is not processed to insert the
        # resolved href. Adding a scope $apply call in the D3 callback has
        # no effect. Consequently, an anchor ui-sref disables the hyperlink.
        # TODO - why doesn't the $apply redigest properly?
        Chart.d3Hyperlink(text.node(), sref)
      
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      xAxis = svg.select('.nv-x')
      # The tick elements.
      ticks = xAxis.selectAll('.tick')[0]
      for i in [0...ticks.length]
        a = createSessionDetailLink(ticks[i], sessions[i])
        callback(a) if callback
  
    # TODO - Add treatments and encounters to the dateline.
    # Each treatment is a bar spanning the start and end dates.
    # Each encounter is a flash glyph.
    # The treatment and encounter types are distinguished by color.
    # There are legends for each type.
    # To do so, make a tri-partite config on a heterogenous data spec:
    #   visitTicks = [{session:sess, tick:tick}, ...]
    #   trtTicks = [{treatment:trt, start:tick, end:tick}, ...]
    #   encTicks = [{encounter:enc, tick:tick}, ...]
    # 
    # addTreatmentBars = (session, chart) ->
    #   # Select the SVG element.
    #   svg = d3.select(chart.container)
    #   # The x axis element.
    #   xAxis = svg.select('.nv-x')
    #   # The tick elements.
    #   ticks = xAxis.selectAll('.tick')[0]
    #   for i in [0...ticks.length]
    #     a = createSessionDetailLink(ticks[i], sessions[i])
    #     callback(a) if callback      
  
    # @param data the session array
    # @returns the nvd3 chart configuration
    configureChart: (sessions) ->
      # The chart data specification.
      dataSpec =
        x:
          accessor: (session) -> session.acquisition_date.valueOf()
        y:
          # The y coordinate is always zero.
          data: [ accessor: (session) -> 0 ]
  
      # Return the standard chart configuration extended
      # with the following:
      # * the xValues and xFormat properties
      # * the addSessionDetailLinks function
      _.extend Chart.configureChart(sessions, dataSpec),
        xValues: (dataSpec.x.accessor(sess) for sess in sessions)
        xFormat: Chart.dateFormat
  ]
