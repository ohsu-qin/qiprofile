routes = angular.module 'qiprofile.routes', ['ui.router', 'qiprofile.services']

routes.config ['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider) ->
    # Make a subject from the given route parameters. If there
    # is not a detail parameter, then fetch the subject from the
    # Subject resource.
    #
    # @param project the project
    # @param params the URL parameters
    # @param Subject the Subject resource
    # @returns the subject
    getSubject = (project, params, Subject) ->
      sbj =
        project: project
        collection: _.str.capitalize(params.collection)
        number: parseInt(params.subject)
      if params.detail
        sbj
      else
        Subject.get(sbj).$promise

    # Fetches the subject detail and fixes it up as follows:
    # * converts the session and encounter dates into moments
    # * copies the detail properties into the subject
    # * sets the subject isMultiSession flag
    #
    # @param subject the parent object
    # @param Subject the Subject resource
    # @param Helpers the Helpers service
    # @returns a promise which resolves to the detail object
    getSubjectDetail = (subject, Subject, Helpers) ->
      if subject.detail
        Subject.detail(id: subject.detail).$promise.then (detail) ->
          for sess in detail.sessions
            # Set the session subject property.
            sess.subject = subject
            # Fix the acquisition date.
            Helpers.fixDate(sess, 'acquisition_date')
            # Calculate delta-ktrans.
            delta_k_trans = sess.modeling.fxr_k_trans - sess.modeling.fxl_k_trans
            _.extend sess.modeling, delta_k_trans: delta_k_trans
          # Fix the encounter dates.
          Helpers.fixDate(enc, 'date') for enc in detail.encounters
          # Calculate the subject's age.
          _.extend detail, age: Helpers.getAge(detail.birth_date)
          #
          #
          # ** TEMP dummy outcome data **
          dummy_outcome =
            [
              {
                "estrogen": {
                   "positive": true,
                   "intensity": 68,
                   "quick_score": 2
                },
                "grade": {
                   "tubular_formation": 2,
                   "mitotic_count": 1,
                   "nuclear_pleomorphism": 2
                },
                "her2_neu_ihc": 4,
                "her2_neu_fish": true,
                "progestrogen": {
                   "positive": true,
                   "intensity": 9,
                   "quick_score": 7
                },
                "tnm": {
                   "grade": 2,
                   "lymph_status": 1,
                   "metastasis": false,
                   "size": "pT2"
                },
                "ki_67": 40
              }
              {
                "estrogen": {
                   "positive": true,
                   "intensity": 68,
                   "quick_score": 2
                },
                "grade": {
                   "tubular_formation": null,
                   "mitotic_count": null,
                   "nuclear_pleomorphism": null
                },
                "her2_neu_ihc": 4,
                "her2_neu_fish": true,
                "progestrogen": {
                   "positive": true,
                   "intensity": 9,
                   "quick_score": 7
                },
                "tnm": {
                   "grade": null,
                   "lymph_status": null,
                   "metastasis": null,
                   "size": null
                },
                "ki_67": 40
              }
            ]
          for enc in detail.encounters
            _.extend enc, outcomes: dummy_outcome
          #
          #
          # Copy the detail content into the subject.
          Helpers.copyContent(detail, subject)
          # Set a flag indicating whether there is more than one
          # session.
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
    # @param params the URL parameters
    # @param Session the Session resource
    # @param Subject the Subject resource
    # @param Image the Image service
    # @param Helpers the Helpers service
    # @returns the detail object
    getSessionDetail = (session, params, Session, Subject, Image, Helpers) ->
      # Adds the session, container type and images properties to
      # the given parent image container.
      #
      # @param parent the image container
      # @param session the session holding the image container
      addImageContainerContent = (parent, session, container_type) ->
        # Set the container session property.
        parent.session = session
        # Set the container type property.
        parent.container_type = container_type
        # Encapsulate the image files.
        parent.images = Image.imagesFor(parent)
      
      if session.detail
        Session.detail(id: session.detail).$promise.then (detail) ->
          # Copy the fetched detail into the session.
          Helpers.copyContent(detail, session)
          addImageContainerContent(session.scan, session, 'scan')
          for reg in session.registrations
            addImageContainerContent(reg, session, 'registration')
          # Resolve to the detail object.
          detail
      else if params.detail
        # Set the session detail property from the URL detail parameter.
        session.detail = params.detail
        # Recurse.
        getSessionDetail(session, params, Session, Subject, Image, Helpers)
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
          getSessionDetail(session, params, Session, Subject, Image, Helpers)

    # @param session the session to search
    # @param name the container name
    # @param Session the Session resource
    # @param Subject the Subject resource
    # @param Image the Image service
    # @param Helpers the Helpers service
    # @return the container object with the given name, if it exists,
    #   otherwise undefined
    getImageContainer = (session, params, Session, Subject, Image, Helpers) ->
      if session.scan
        # The container name.
        name = params.container
        # Look for the scan or registration container.
        if name == 'scan'
          ctr = session.scan
        else
          ctr = _.find session.registrations, (reg) -> reg.name == name
        # If no such container, then complain.
        if not ctr
          throw " #{ session.subject.collection }" +
                " Subject #{ session.subject.number }" +
                " Session #{ session.number }" +
                " does not have a #{ params.container } image."
        # Resolve to the container.
        ctr
      else
        # Load the session detail and recurse.
        getSessionDetail(session, params, Session, Subject, Image, Helpers).then (detail) ->
          if not detail.scan and not detail.registrations.length
            throw " #{ session.subject.collection } Subject #{ session.subject.number }" +
                  " Session #{ session.number } does not have any image containers."
          getImageContainer(session, params, Session, Subject, Image, Helpers)
    
    # @param parent the image parent container object
    # @param time_point the one-based series time point
    # @returns the image, if the image data is already loaded,
    #   otherwise a promise which resolves to the image object
    #   when the image content is loaded into the data property
    getImageDetail = (parent, time_point) ->
      image = parent.images[time_point - 1]
      if not image
        throw "Subject #{ subject.number } session #{ session.number } does not" +
              " have an image at #{ parent.container_type } #{ parent.name }" +
              " time point #{ time_point }"
      if image.data
        image
      else
        image.load()

    ## The state definition. ##

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
          home:
            templateUrl: '/partials/home.html'
            controller: 'HomeCtrl'
          # The help button.
          help:
            templateUrl: '/partials/help.html'
            controller: 'HelpCtrl'

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
          detail: (session, $stateParams, Session, Subject, Image, Helpers) ->
            getSessionDetail(session, $stateParams, Session, Subject, Image, Helpers)
        views:
          'main@':
            templateUrl: '/partials/session-detail.html'
            controller:  'SessionDetailCtrl'
        reloadOnSearch: false

      # The image parent container state.
      .state 'quip.subject.session.container',
        abstract: true
        url: '/:container'
        resolve:
          container: (session, $stateParams, Session, Subject, Image, Helpers) ->
            getImageContainer(session, $stateParams, Session, Subject, Image, Helpers)

      # The image detail page.
      .state 'quip.subject.session.container.image',
        url: '/{time_point:[1-9][0-9]*}'
        resolve:
          image: (container, $stateParams) ->
            time_point = parseInt($stateParams.time_point)
            getImageDetail(container, time_point)
        views:
          'main@':
            templateUrl: '/partials/image-detail.html'
            controller:  'ImageDetailCtrl'
        reloadOnSearch: false

    # Redirect an URL with trailing slash to an URL without it.
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
