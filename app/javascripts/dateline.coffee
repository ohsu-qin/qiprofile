dateline = angular.module 'qiprofile.dateline', ['qiprofile.chart']

dateline.factory 'VisitDateline', ['Chart', (Chart) ->
  # @param data the session array
  # @returns the nvd3 chart configuration
  configureChart: (sessions) ->
    # Adds the session hyperlinks above the timeline.
    # The template sets the callback attribute to this
    # function. 
    #
    # @param chart the timeline chart
    addSessionDetailLinks = (sessions, chart) ->
      # @returns the link to detail page for the given session
      sessionDetailLink = (session) ->
        "/quip/#{ session.subject.collection.toLowerCase() }/subject/" +
        "#{ session.subject.number }/session/#{ session.number }?" +
        "project=#{ session.subject.project }&detail=#{ session.detail }"
      
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      xAxis = svg.select('.nv-x')
      # The tick elements.
      ticks = xAxis.selectAll('.tick')[0]
      # Add the session hyperlinks.
      for i in _.range(ticks.length)
        # The session tick.
        tick = ticks[i]
        session = sessions[i]
        # Make a new SVG text element.
        text = d3.select(tick).append('text')
        text.attr('dx', '-.2em').attr('dy', '-.5em')
        text.style('text-anchor: middle')
        # The text content is the session number.
        text.text(session.number)
        # The hyperlink target.
        href = sessionDetailLink(session)
        # Wrap the text element in a hyperlink.
        Chart.d3Hyperlink(text.node(), href)

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
      addSessionDetailLinks: (chart) ->
        addSessionDetailLinks(sessions, chart)
]
