ctlrs = angular.module 'qiprofile.controllers', ['qiprofile.services']

# The controller helper methods.
ctlrs.factory 'ControllerHelper', ['$location', ($location) ->
  # Fetches a parent object's detail and apply the given
  # action function.
  get_detail: (obj, resource, action) ->
    resource.detail(id: obj.detail).$promise
      .then (detail) ->
        action(detail, obj)
        obj

  # Copies the given source object properties into the
  # destination object.
  copy_content: (source, dest) ->
    # Copy the detail properties into the parent object.
    src_props = Object.getOwnPropertyNames(source)
    dest_props = Object.getOwnPropertyNames(dest)
    fields = _.difference(src_props, dest_props)
    for field in fields
      dest[field] = source[field]

  # Replaces the browser URL search parameters to include at most
  # a non-default project, since all other search parameters are
  # redundant.
  clean_browser_url: (project) ->
    search_params = {}
    if project != 'QIN'
      search_params.project = project
    $location.replace()
    $location.search(search_params)
]

ctlrs.controller 'HelpCtrl', ['$scope',
  ($scope) ->
    $scope.$on '$locationChangeStart', (event, next, current) ->
      # Set the showHelp flag on the parent scope, since the
      # flag is shared with the sibling view scope.
      $scope.$parent.showHelp = false
]

ctlrs.controller 'SubjectListCtrl', ['$scope', 'Subject',
  ($scope, Subject) ->
    # Export the deferred subjects REST promise to the scope.
    $scope.subjects = Subject.query()

    # When the subjects are loaded. then export the collections
    # to the scope.
    $scope.subjects.$promise
      .then (subjects) ->
        # The unique subject collections.
        $scope.collections = _.uniq _.map(
          $scope.subjects,
          (subject) -> subject.collection
        )
]

ctlrs.controller 'SubjectDetailCtrl', ['$scope', '$routeParams',
  'ControllerHelper', 'Subject', 'Helpers',
  ($scope, $routeParams, ControllerHelper, Subject, Helpers) ->
    # Compose a subject from the route parameters.
    subject =
      project: $routeParams.project or 'QIN'
      collection: _.str.capitalize($routeParams.collection)
      number: parseInt($routeParams.subject)
      detail: $routeParams.detail

    $scope.toggleModelingFormat = ->
      if $scope.modelingFormat == 'Chart'
        $scope.modelingFormat = 'Table'
      else if $scope.modelingFormat == 'Table'
        $scope.modelingFormat ='Chart'
      else
        throw "Modeling format is not recognized: " + $scope.modelingFormat
    
    # Adds the session links above the line.
    $scope.add_session_detail_links = (chart) ->
      # @returns the link to detail page for the given session
      session_detail_link = (session) ->
        "/quip/#{ subject.collection.toLowerCase() }/subject/" +
        "#{ subject.number }/session/#{ session.number }?" +
        "project=#{ subject.project }&detail=#{ session.detail_id }"
      
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      x_axis = svg.select('.nv-x')
      # The tick elements.
      ticks = x_axis.selectAll('.tick')[0]
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
        href = session_detail_link(session)
        # Wrap the text element in a hyperlink.
        Helpers.d3Hyperlink(text.node(), href)
      # TODO - draw the x axis line.
      line = svg.append('line')
    
    # Adds the fetched subject detail into the given subject.
    add_detail = (detail, subject) ->
      # The default modeling format is Chart for more than
      # one session, Table otherwise.
      default_modeling_format = (subject) ->
        if subject.sessions.length > 1 then 'Chart' else 'Table'

      # Fix the session and encounter dates.
      Helpers.fix_date(sess, 'acquisition_date') for sess in detail.sessions
      Helpers.fix_date(enc, 'date') for enc in detail.encounters
      # Copy the detail content into the subject.
      ControllerHelper.copy_content(detail, subject)
      # Flag indicating whether there is more than one session.
      subject.multiSession = subject.sessions.length > 1
      # The modeling display format, Chart or Table.
      $scope.modelingFormat = default_modeling_format(subject)
      # Place the subject in scope.
      $scope.subject = subject
      # End of the add_detail function.

    # If there is a detail id, then fetch the detail.
    # Otherwise, fetch the subject and then the detail.
    if subject.detail
      ControllerHelper.get_detail(subject, Subject, add_detail)
    else
      Subject.get(subject).$promise
        .then (fetched) ->
          subject.detail = fetched.detail
          ControllerHelper.get_detail(subject, Subject, add_detail)

    ControllerHelper.clean_browser_url(subject.project)
]

ctlrs.controller 'SessionDetailCtrl', ['$scope', '$routeParams',
  'ControllerHelper', 'Subject', 'Session', 'Image',
  ($scope, $routeParams, ControllerHelper, Subject, Session, Image) ->
    # Compose a subject from the route parameters.
    subject =
      project: $routeParams.project or 'QIN'
      collection: _.str.capitalize($routeParams.collection)
      number: parseInt($routeParams.subject)

    # Compose a session from the route parameters.
    session =
      subject: subject
      number: parseInt($routeParams.session)
      detail: $routeParams.detail

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
    $scope.highlight_bolus_arrival = (chart) ->
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      x_axis = svg.select('.nv-x')
      # The tick elements.
      ticks = x_axis.selectAll('.tick')[0]
      # The bolus tick element.
      bolus_tick = ticks[session.bolus_arrival_index]
      # The bolus tick child line element.
      bolus_tick_line = $(bolus_tick).children('line')[0]
      highlight = $(bolus_tick_line).clone()
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
      $(highlight).insertAfter(bolus_tick_line)
      # Add the legend.
      legend = svg.select('.nv-legend')
      legend_grp = legend.select(':first-child')
      bolus_grp = legend_grp.insert('svg:g', ':first-child')
      bolus_grp.attr('transform', 'translate(-30, 5)')
      filter = bolus_grp.append('svg:filter')
      filter.attr('width', 1.2).attr('height', 1)
      filter.attr('id', 'boluslegendbackground')
      filter.append('feFlood').attr('class', 'qi-bolus-flood')
      filter.append('feComposite').attr('in', 'SourceGraphic')
      bolus_legend = bolus_grp.append('svg:text')
      bolus_legend.attr('class', 'qi-bolus-legend')
      bolus_legend.attr('dy', '.32em')
      bolus_legend.attr('filter', 'url(#boluslegendbackground)')
      bolus_legend.text('Bolus Arrival')

    $scope.open_image = (image) ->
      # TODO - Route to the image open page.
      window.alert("Image open is not yet supported.")

    # Fetches the detail into the given session.
    add_detail = (detail, session) ->
      # Makes the graph data parameters for the given
      # label: values associative array. The value arrays must be
      # the same length. The graph x axis labels are the
      # one-based values indexes, e.g. ['1', '2', ..., '12']
      # for data with value arrays of length 12.
      intensity_graph_data = (data) ->
        # @returns the intensity graph [x, y] coordinates
        coordinates = (intensities) ->
          [i + 1, intensities[i]] for i in [0...intensities.length]
        
        # @returns the intensity graph {key, values} object
        format_item = (key, intensities) ->
          key: key
          values: coordinates(intensities)

        # Return the intensity graph {key, values} objects
        # for the scan and reconstruction image containers.
        format_item(key, data[key]) for key in _.keys(data)

      # Copy the fetched detail into the session.
      ControllerHelper.copy_content(detail, session)
      # Add the registration.
      # TODO - handle more than one registration?
      session.registration = session.registrations[0]
      # Add the intensity graph parameters.
      session.graphData = intensity_graph_data(
        Scan: session.scan.intensity.intensities
        Realigned: session.registration.intensity.intensities
      )

      # The series numbers.
      session.seriesNumbers = [1..session.scan.intensity.intensities.length]
      # Encapsulate the image files.
      for obj in [session.scan, session.registration]
        obj.images = Image.images_for(obj)
      # Place the session in the scope.
      $scope.session = session
      # End of the add_detail function.

    # If there is a detail id, then fetch the detail.
    # Otherwise, fetch the session and then the detail.
    if session.detail
      deferred = ControllerHelper.get_detail(session, Session, add_detail)
    else
      # Fetch the subject...
      deferred = Subject.get(subject).$promise
        .then (fetched) ->
          # ...then fetch the subject detail...
          Subject.detail(id: fetched.detail).$promise
        .then (detail) ->
          # ...find the session in the session list...
          for sess in detail.sessions
            if sess.number == session.number
              # ...and fetch the session detail.
              session.detail = sess.detail_id
          # If the session was not found, then complain.
          if not session.detail
            throw "Subject #{ subject } does not have a session #{ session.number }"
          # Fill in the session detail.
          ControllerHelper.get_detail(session, Session, add_detail)

    ControllerHelper.clean_browser_url(subject.project)
]
