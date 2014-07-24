routes = angular.module 'qiprofile.routes', ['ui.router', 'qiprofile.services']

routes.config ['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider) ->
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
          # The Routers service is injected into all child states.
          Router: 'Router'
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
        url: '/:collection/subject/{subject:[0-9]+}?detail'
        resolve:
          subject: (project, $stateParams, Router) ->
            # The default project is in the root state.
            params = _.extend(project: project, $stateParams)
            # Delegate to the helper.
            Router.getSubject(params)

      # The subject detail page.
      .state 'quip.subject.detail',
        url: ''
        resolve:
          detail: (subject, $stateParams, Router) ->
            Router.getSubjectDetail(subject, $stateParams)
        views:
          'main@':
            templateUrl: '/partials/subject-detail.html'
            controller:  'SubjectDetailCtrl'

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
        url: ''
        resolve:
          Session: 'Session'
          Image: 'Image'
          detail: (session, $stateParams, Router) ->
            Router.getSessionDetail(session, $stateParams, Router)
        views:
          'main@':
            templateUrl: '/partials/session-detail.html'
            controller:  'SessionDetailCtrl'

      # The image parent container state.
      .state 'quip.subject.session.container',
        abstract: true
        url: '/:container'
        resolve:
          container: (session, $stateParams, Router) ->
            Router.getImageContainer(session, $stateParams, Router)

      # The image detail page.
      .state 'quip.subject.session.container.image',
        url: '/{time_point:[1-9][0-9]*}'
        resolve:
          image: (container, $stateParams) ->
            time_point = parseInt($stateParams.time_point)
            Router.getImageDetail(container, time_point)
        views:
          'main@':
            templateUrl: '/partials/image-detail.html'
            controller:  'ImageDetailCtrl'

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
