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
    # Import the lodash utility library.
    _ = window._
    
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
    # Import the lodash utility library.
    _ = window._

    # Compose a subject from the route parameters.
    subject =
      project: $routeParams.project or 'QIN'
      collection: _.str.capitalize($routeParams.collection)
      number: parseInt($routeParams.subject)
      detail: $routeParams.detail
    
    add_detail = (detail, subject) ->
      # Adds the fetched subject detail into the given subject.
      
      format_k_trans_chart = (sessions, x_config) ->
        # Makes the Ktrans graph data parameters for the given sessions.
        # The graph x axis labels are the session numbers. The y values
        # are the FXL and FXR Ktrans values.
        #
        # @param sessions the subject sessions to graph
        # @param x_config the visit date {label, accessor} configuration
        # @returns the [{key: label, values: coordinates}] nvd3 data
        config =
          x: x_config
          y:
            precision: 1
            data:
              [
                {
                  label: 'FXL Ktrans'
                  color: 'OliveDrab'
                  accessor: (session) -> session.modeling.fxl_k_trans
                }
                {
                  label: 'FXR Ktrans'
                  color: 'BurlyWood'
                  accessor: (session) -> session.modeling.fxr_k_trans
                }
              ]
        Helpers.format_chart(sessions, config)
      
      format_v_e_chart = (sessions, x_config) ->
        # Makes the v_e graph data parameters for the given sessions.
        # The graph x axis labels are the session numbers. The y values
        # are the FXL and FXR v_e values.
        #
        # @param sessions the subject sessions to graph
        # @param x_config the visit date {label, accessor} configuration
        # @returns the [{key: label, values: coordinates}] nvd3 data
        config =
          x: x_config
          y:
            precision: 1
            data:
              [
                {
                  label: 'FXL v_e'
                  color: 'MediumSeaGreen'
                  accessor: (session) -> session.modeling.v_e
                }
              ]
        Helpers.format_chart(sessions, config)

      # Fix the session and encounter dates.
      Helpers.fix_date(sess, 'acquisition_date') for sess in detail.sessions
      Helpers.fix_date(enc, 'date') for enc in detail.encounters
      
      # Copy the detail content into the subject.
      ControllerHelper.copy_content(detail, subject)

      # The modeling results.
      mdls = (sess.modeling for sess in subject.sessions)
      
      # The visit dates as numbers for charting.
      $scope.visitDateValues = () ->
        sess.acquisition_date.valueOf() for sess in subject.sessions
      
      # The visit date x axis configuration.
      x_config =
        label: 'Visit Date'
        accessor: (session) -> session.acquisition_date
      
      $scope.kTransGraph = format_k_trans_chart(subject.sessions, x_config)
      
      $scope.veGraph = format_v_e_chart(subject.sessions, x_config)
      
      # Place the subject in scope.
      $scope.subject = subject
    
    # If there is a detail id, then fetch the detail.
    # Otherwise, fetch the subject and then the detail.
    if subject.detail
      ControllerHelper.get_detail(subject, Subject, add_detail)
    else
      Subject.get(subject).$promise
      .then (fetched) ->
        subject.detail = fetched.detail
        ControllerHelper.get_detail(subject, Subject, add_detail)
      
    $scope.dateFormat = (value) ->
      # Formats the given moment date integer.
      moment(value).format('MM/DD/YYYY')
    
    $scope.modeling_format = 'Graph'
    
    $scope.toggle_modeling_format = () ->
      if $scope.modeling_format == 'Graph'
        $scope.modeling_format = 'Table'
      else if $scope.modeling_format == 'Table'
        $scope.modeling_format ='Graph'
      else
        throw "Modeling format is not recognized: " + $scope.modeling_format

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

    # Sets the scan and registration line color.
    $scope.graphColor = (d, i) ->
      ['Indigo', 'LightGreen'][i]
    
    $scope.intensityFormat = (value) ->
      # If the intensity value is integral, then return the integer.
      # Otherwise, truncate the value to two decimal places. nvd3
      # unfortunately uses this function to format both the tick
      # values and the tooltip y values. Therefore, this function
      # formats the integral tick values as an integer and the float
      # y values as floats. Thus, both the y tick values and the
      # tooltip are more readable.
      #
      # ~~ is the obscure Javascript idiom for correctly converting
      # a float to an int. Math.ceil does not correctly truncate
      # negative floats.
      intValue = ~~value
      if value == intValue
        intValue
      else
        value.toFixed(2)
    
    
    $scope.open_image = (image) ->
      # TODO - Route to the image open page.
      window.alert("Image open is not yet supported.")

    add_detail = (detail, session) ->
      # Fetches the detail into the given session.
    
      intensity_graph_data = (data) ->
        # Makes the graph data parameters for the given
        # label: values associative array. The value arrays must be
        # the same length. The graph x axis labels are the
        # one-based values indexes, e.g. ['1', '2', ..., '12']
        # for data with value arrays of length 12.

        coordinates = (intensities) ->
          # Return the intensity graph [x, y] coordinates.
          [i + 1, intensities[i]] for i in [0...intensities.length]
      
        format_item = (key, intensities) ->
          # Return the intensity graph {key, values} object.
          key: key
          values: coordinates(intensities)
      
        # Return the intensity graph {key, values} objects
        # for the scan and reconstruction image containers.
        format_item(key, data[key]) for key in _.keys(data)
      
      # Copy the fetched detail into the session.
      ControllerHelper.copy_content(detail, session)
      # Add the registration.
      # TODO - handle more than one registration?
      session.registration = session.reconstructions[0]
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
        # ...find the session in the session list....
        for sess in detail.sessions
          if sess.number == session.number
            # ...and fetch the session detail.
            session.detail = sess.detail_id
        # If the session was not found, then complain.
        if not session.detail
          throw "Subject #{ subject } does not have a session #{ session.number }"
        # Fill in the session detail.
        ControllerHelper.get_detail(session, Session, add_detail)
    
    # The session future holding a promise. This future is referenced by the
    # qiShiftBolusArrival directive.
    $scope.deferred_session = deferred
    
    ControllerHelper.clean_browser_url(subject.project)
]
