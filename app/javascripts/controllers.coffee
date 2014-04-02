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
  'ControllerHelper', 'Subject',
  ($scope, $routeParams, ControllerHelper, Subject) ->
    # Import the lodash utility library.
    _ = window._

    # Compose a subject from the route parameters.
    subject =
      project: $routeParams.project or 'QIN'
      collection: _.str.capitalize($routeParams.collection)
      number: parseInt($routeParams.subject)
      detail: $routeParams.detail
    
    # The fetch detail action.
    action = (detail, subject) ->
      ControllerHelper.copy_content(detail, subject)
      $scope.subject = subject
    
    # If there is a detail id, then fetch the detail.
    # Otherwise, fetch the subject and then the detail.
    if subject.detail
      ControllerHelper.get_detail(subject, Subject, action)
    else
      Subject.get(subject).$promise
      .then (fetched) ->
        subject.detail = fetched.detail
        ControllerHelper.get_detail(subject, Subject, action)
    
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
    
    # Make the graph data parameters for the given
    # label: values associative array. The value arrays must be
    # the same length. The graph x axis labels are the
    # one-based values indexes, e.g. ['1', '2', ..., '12']
    # for data with value arrays of length 12.
    intensity_graph_data = (data) ->
      coordinates = (intensities) ->
        [i + 1, intensities[i]] for i in [0...intensities.length]
      format_item = (key, intensities) ->
        key: key
        values: coordinates(intensities)
      format_item(key, data[key]) for key in _.keys(data)

    # Sets the scan and registration line color.
    $scope.graphColor = (d, i) ->
      ['Indigo', 'LightGreen'][i]
    
    # Fetches the detail into the given session.
    add_detail = (detail, session) ->
      # Encapsulates the images of the given image holder object.
      wrap_images = (obj) ->
        Image.create(file) for file in session.scan.files

      # Copy the fetched detail into the session.
      ControllerHelper.copy_content(detail, session)
      # Add the registration.
      session.registration = session.reconstructions[0]
      # Add the intensity graph parameters.
      session.graphData = intensity_graph_data(
        Scan: session.scan.intensity.intensities
        Realigned: session.registration.intensity.intensities
      )
      # The series numbers.
      session.seriesNumbers = [1..session.scan.intensity.intensities.length]
      # Encapsulate the images.
      session.scan.images = wrap_images(session.scan.files)
      session.registration.images = wrap_images(session.registration.files)
      # Place the session in the scope.
      $scope.session = session
    
    # If there is a detail id, then fetch the detail.
    # Otherwise, fetch the session and then the detail.
    if session.detail
      ControllerHelper.get_detail(session, add_detail)
    else
      # Fetch the subject...
      Subject.get(subject).$promise
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
    
    ControllerHelper.clean_browser_url(subject.project)
]
