ctlrs = angular.module 'qiprofile.controllers', ['qiprofile.services']

# The controller helper methods.
ctlrs.factory 'ControllerHelper', ['$location', ($location) ->
  # Replaces the browser URL search parameters to include at most
  # a non-default project, since all other search parameters are
  # redundant.
  cleanBrowserUrl: (project) ->
    searchParams = {}
    if project != 'QIN'
      searchParams.project = project
    $location.replace()
    $location.search(searchParams)
]


ctlrs.controller 'GoHomeCtrl', ['$rootScope', '$scope', '$state',
  ($rootScope, $scope, $state) ->
    $scope.goHome = () ->
      project = $rootScope.project or 'QIN'
      $state.go('quip.home', project: project)
]


ctlrs.controller 'HelpCtrl', ['$scope',
  ($scope) ->
    $scope.$on '$locationChangeStart', (event, next, current) ->
      # Set the showHelp flag on the parent scope, since the
      # flag is shared with the sibling view scope.
      $scope.$parent.showHelp = false
]


ctlrs.controller 'SubjectListCtrl', ['$rootScope', '$scope', 'project',
  'subjects', 'collections',
  ($rootScope, $scope, project, subjects, collections) ->
    # Capture the current project.
    $rootScope.project = project
    # Place the subjects and collections in the scope.
    $scope.subjects = subjects
    $scope.collections = collections
]


ctlrs.controller 'SubjectDetailCtrl', ['$rootScope', '$scope', 'subject',
  'detail', 'ControllerHelper', 'Helpers',
  ($rootScope, $scope, subject, detail, ControllerHelper, Helpers) ->
    # Capture the current project.
    $rootScope.project = subject.project

    $scope.toggleModelingFormat = ->
      if $scope.modelingFormat == 'Chart'
        $scope.modelingFormat = 'List'
      else if $scope.modelingFormat == 'List'
        $scope.modelingFormat ='Chart'
      else
        throw "Modeling format is not recognized: " + $scope.modelingFormat
    
    # Adds the session hyperlinks above the timeline.
    #
    # @param chart the timeline chart
    $scope.addSessionDetailLinks = (chart) ->
      # @returns the link to detail page for the given session
      sessionDetailLink = (session) ->
        "/quip/#{ subject.collection.toLowerCase() }/subject/" +
        "#{ subject.number }/session/#{ session.number }?" +
        "project=#{ subject.project }&detail=#{ session.detail_id }"
      
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
        session = subject.sessions[i]
        # Make a new SVG text element.
        text = d3.select(tick).append('text')
        text.attr('dx', '-.2em').attr('dy', '-.5em')
        text.style('text-anchor: middle')
        # The text content is the session number.
        text.text(session.number)
        # The hyperlink target.
        href = sessionDetailLink(session)
        # Wrap the text element in a hyperlink.
        Helpers.d3Hyperlink(text.node(), href)
      # TODO - draw the x axis line.
      line = svg.append('line')
    
    # Adds the subject content as follows:
    # * Converts the subject detail session and encounter
    #   dates into moments, if necessary 
    # * copies the detail properties into the subject 
    # * sets the subject multiSession flag
    # * sets the modelingFormat to 'Chart' if there is more
    #   than one session, 'List' otherwise
    #
    # @param session the session object
    # @param detail the detail object
    addDetail = (subject, detail) ->
      # The default modeling format is 'Chart' for more than
      # one session, 'List' otherwise.
      defaultModelingFormat = (subject) ->
        if subject.sessions.length > 1 then 'Chart' else 'List'

      # Fix the session and encounter dates.
      Helpers.fixDate(sess, 'acquisition_date') for sess in detail.sessions
      Helpers.fixDate(enc, 'date') for enc in detail.encounters
      
      # Copy the detail content into the subject.
      Helpers.copyContent(detail, subject)
      
      # Flag indicating whether there is more than one session.
      subject.multiSession = subject.sessions.length > 1
      
      # The modeling display format, Chart or List.
      $scope.modelingFormat = defaultModelingFormat(subject)

    # Add the detail to the subject.
    addDetail(subject, detail)
    
    # Place the subject in the scope.
    $scope.subject = subject

    ControllerHelper.cleanBrowserUrl(subject.project)
]


ctlrs.controller 'ClinicalProfileCtrl', ['$scope', '$stateParams',
  ($scope, $stateParams) ->
]


ctlrs.controller 'SessionDetailCtrl', ['$rootScope', '$scope',
  'session', 'detail', 'Image', 'ControllerHelper', 'Helpers',
  ($rootScope, $scope, session, detail, Image, ControllerHelper, Helpers) ->
    # Capture the current project.
    $rootScope.project = session.subject.project

    # TODO - refactor the chart formatting cruft below into a
    # directive a la the modeling charts.
    # TODO - rename graph to chart.

    # Sets the scan and registration line color.
    $scope.graphColor = (d, i) ->
      ['Indigo', 'LightGreen'][i]

    # If the intensity value is integral, then return the integer.
    # Otherwise, truncate the value to two decimal places. nvd3
    # unfortunately uses this function to format both the tick
    # values and the tooltip y values. Therefore, this function
    # formats the integral tick values as an integer and the float
    # y values as floats. Thus, both the y tick values and the
    # tooltip are more readable.
    $scope.intensityFormat = (value) ->
      # ~~ is the obscure Javascript idiom for correctly converting
      # a float to an int. Math.ceil does not correctly truncate
      # negative floats.
      intValue = ~~value
      if value == intValue
        intValue
      else
        value.toFixed(2)
    
    # Highlights the bolus arrival tick mark.
    #
    # @param chart the intensity chart
    $scope.highlightBolusArrival = (chart) ->
      # TODO - move this function to a directive.
      
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      xAxis = svg.select('.nv-x')
      # The tick elements.
      ticks = xAxis.selectAll('.tick')[0]
      # The bolus tick element.
      bolusTick = ticks[session.bolus_arrival_index]
      # The bolus tick child line element.
      bolusTick_line = $(bolusTick).children('line')[0]
      highlight = $(bolusTick_line).clone()
      # Set the class attribute directly, since neither the d3 nor
      # the jquery add class utility has any effect. d3 has the
      # following bug:
      # * In the d3 classed function, the condition:
      #       if (value = node.classList) {
      #   should read:
      #       if (value == node.classList) {
      # I don't know why jquery addClass doesn't work.
      # TODO - fork and fix d3 
      $(highlight).attr('class', 'qi-bolus-arrival')
      # Place the highlight after the tick line.
      # It will display opaquely over the tick line.
      $(highlight).insertAfter(bolusTick_line)
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

    # Opens the series image display page.
    #
    # @param image the Image object
    $scope.openImage = (image) ->
      # TODO - Route to the image open page.
      window.alert("Image open is not yet supported.")

    # Adds the following session content:
    # * the detail properties are copied into the session 
    # * sets the session graph parameters
    #
    # @param session the session object
    # @param detail the detail object
    addDetail = (session, detail) ->
      # Makes the graph data parameters for the given
      # label: values associative array. The value arrays must be
      # the same length. The graph x axis labels are the
      # one-based values indexes, e.g. ['1', '2', ..., '12']
      # for data with value arrays of length 12.
      intensityGraphData = (data) ->
        # @returns the intensity graph [x, y] coordinates
        coordinates = (intensities) ->
          [i + 1, intensities[i]] for i in [0...intensities.length]
        
        # @returns the intensity graph {key, values} object
        formatItem = (key, intensities) ->
          key: key
          values: coordinates(intensities)

        # Return the intensity graph {key, values} objects
        # for the scan and reconstruction image containers.
        formatItem(key, data[key]) for key in _.keys(data)

      # Copy the fetched detail into the session.
      Helpers.copyContent(detail, session)
      
      # Add the registration.
      # TODO - handle more than one registration?
      session.registration = session.registrations[0]
      
      # Add the intensity graph parameters.
      session.graphData = intensityGraphData(
        Scan: session.scan.intensity.intensities
        Realigned: session.registration.intensity.intensities
      )

      # The series numbers.
      session.seriesNumbers = [1..session.scan.intensity.intensities.length]
      # Encapsulate the image files.
      for obj in [session.scan, session.registration]
        obj.images = Image.imagesFor(obj)

    # Add the detail to the session.
    addDetail(session, detail)

    # Place the session in the scope.
    $scope.session = session

    ControllerHelper.cleanBrowserUrl(session.subject.project)
]


ctlrs.controller 'SeriesDetailCtrl', ['$rootScope', '$scope', 'series',
  ($rootScope, $scope, series) ->
    # Capture the current project.
    $rootScope.project = series.session.subject.project

    # Place the series in the scope.
    $scope.series = series

    ControllerHelper.cleanBrowserUrl(series.session.subject.project)
]
