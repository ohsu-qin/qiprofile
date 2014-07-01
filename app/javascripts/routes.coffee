routes = angular.module 'qiprofile.routes', ['qiprofile.services']

routes.config ['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider) ->
    # Make a subject from the given route parameters. If there
    # is not a detail parameter, then fetch the subject from the
    # Subject resource.
    #
    # @param project the project
    # @param params the URL parameters 
    # @param resource the Subject resource
    # @returns the subject
    getSubject = (project, params, resource) ->
      sbj =
        project: project
        collection: _.str.capitalize(params.collection)
        number: parseInt(params.subject)
      if params.detail
        sbj
      else
        resource.get(sbj).$promise
    
    # Fetches the subject detail and fixes it up as follows:
    # * converts the session and encounter dates into moments
    # * copies the detail properties into the subject 
    # * sets the subject isMultiSession flag
    #
    # @param subject the parent object
    # @param Subject the Subject Resource
    # @returns a promise which resolves to the detail object
    getSubjectDetail = (subject, Subject, Helpers) ->
      if subject.detail
        Subject.detail(id: subject.detail).$promise.then (detail) ->
          for sess in detail.sessions
            # Set the session subject
            sess.subject = subject
            # Fix the acquisition date.
            Helpers.fixDate(sess, 'acquisition_date')
            # Calculate delta-ktrans.
            _.extend sess.modeling, delta_k_trans: sess.modeling.fxr_k_trans \
                - sess.modeling.fxl_k_trans
          # Fix the encounter dates.
          Helpers.fixDate(enc, 'date') for enc in detail.encounters
          # Copy the detail content into the subject.
          Helpers.copyContent(detail, subject)
          # Set a flag indicating whether there is more than
          # one session.
          subject.isMultiSession = subject.sessions.length > 1
          # Resolve to the detail object.
          detail
      else
        Subject.get(subject).$promise.then (fetched) ->
          # If the fetched subject has no detail, then complain.
          if not fetched.detail
            throw "Subject does not have detail: #{ subject.number }"
          # Recurse.
          getSubjectDetail(fetched, Subject, Helpers)
    
    # @param session the parent object
    # @param Session the Session Resource
    # @returns the detail object
    getSessionDetail = (session, Session, Subject, Image, Helpers) ->
      if session.detail
        Session.detail(id: session.detail).$promise.then (detail) ->
          # Copy the fetched detail into the session.
          Helpers.copyContent(detail, session)
          # Add the registration.
          # TODO - handle more than one registration?
          session.registration = session.registrations[0]
          # The series numbers.
          session.seriesNumbers = [1..session.scan.intensity.intensities.length]
          # Encapsulate the image files.
          for obj in [session.scan, session.registration]
            obj.images = Image.imagesFor(obj)
      else
        getSubjectDetail(session.subject, Subject, Helpers).then (detail) ->
          # Find the session in the session list.
          sbj_session = _.find detail.sessions, (other) ->
            other.number == session.number
          # If the session was not found, then complain.
          if not sbj_session
            throw "Subject #{ subject.number } does not have a session #{ session.number }"
          # Recurse.
          session.detail = sbj_session.detail_id
          getSessionDetail(session, Session, Subject, Image, Helpers)
        
    $stateProvider
      # The top-level state. This abstract state is the ancestor
      # of all other states. It holds the url prefix. There are
      # two ui-views in the index.html file, main and goHome. This
      # top-level state formats the goHome navigation button. The
      # main ui-view is formatted by child states. Since the main
      # ui-view is in the root context, it is referenced by the
      # child state as main@.
      .state 'quip',
        url: '/quip?project'
        abstract: true
        resolve:
          # The Helpers service is injected into all child states.
          Helpers: 'Helpers'
          # The project is shared by all states.
          project: ($stateParams) ->
            $stateParams.project or 'QIN'
        views:
          # The home button.
          goHome:
            templateUrl: '/partials/go-home.html'
            controller: 'GoHomeCtrl'
      
      # The home landing page.
      .state 'quip.home',
        url: ''
        resolve:
          Subject: 'Subject'
          subjects: (Subject, project) ->
            Subject.query(project: project).$promise
          collections: ($state, subjects) ->
            _.uniq _.map(
              subjects,
              (subject) -> subject.collection
            )
        views:
          'main@':
            templateUrl: '/partials/subject-list.html'
            controller:  'SubjectListCtrl'
      
      # The subject state.
      .state 'quip.subject',
        abstract: true
        url: '/:collection/subject/{subject:[0-9]+}'
        resolve:
          subject: (project, $stateParams, Subject) ->
            getSubject(project, $stateParams, Subject)
      
      # The subject detail page.
      .state 'quip.subject.detail',
        url: '?detail'
        resolve:
          detail: (subject, Subject, Helpers) ->
            getSubjectDetail(subject, Subject, Helpers)
        views:
          'main@':
            templateUrl: '/partials/subject-detail.html'
            controller:  'SubjectDetailCtrl'
        reloadOnSearch: false
      
      # The session state.
      .state 'quip.subject.session',
        abstract: true
        url: '/session/{session:[0-9]+}'
        resolve:
          session: (subject, $stateParams) ->
            subject: subject
            number: parseInt($stateParams.session)
      
      # The session detail page.
      .state 'quip.subject.session.detail',
        url: '?detail'
        resolve:
          Session: 'Session'
          Image: 'Image'
          detail: (session, Session, Subject, Image, Helpers) ->
            getSessionDetail(session, Session, Subject, Image, Helpers)
        views:
          'main@':
            templateUrl: '/partials/session-detail.html'
            controller:  'SessionDetailCtrl'
        reloadOnSearch: false
     
      # The series detail page.
      .state 'quip.subject.session.series',
        url: '/:image_container/series/{series:[0-9]+}'
        resolve:
          series: (session, $stateParams) ->
            session: session
            number: parseInt($stateParams.series)
            container: $stateParams.image_container
        views:
          'main@':
            templateUrl: '/partials/series-detail.html'
            controller:  'SeriesDetailCtrl'
        reloadOnSearch: false
    
    # Redirect url with trailing slash to an url without it.
    $urlRouterProvider.rule ($injector, $location) ->
      # # Enable lodash.
      # _ = window._
      # 
      path = $location.path()
      search = $location.search()
      if _.str.endsWith(path, '/')
        path = path[0...-1]
      params = ["#{ k }=#{ v}" for [k, v] in _.pairs(search)]
      paramStr = params.join('&')
      [path, paramStr].join('?')

    $locationProvider.html5Mode true
]
