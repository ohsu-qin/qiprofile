routes = angular.module 'qiprofile.routes', ['qiprofile.services']

routes.config ['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider) ->
    # Make a subject from the route parameters. If there is not
    # a detail parameter, then fetch the subject.
    #
    # @param resource the Subject resource
    # @param params the URL parameters
    # @returns the subject
    getSubject = (resource, params) ->
      sbj =
        project: params.project or 'QIN'
        collection: _.str.capitalize(params.collection)
        number: parseInt(params.subject)
      if params.detail
        sbj
      else
        resource.get(sbj).$promise
    
    $stateProvider
      # The top-level state. This abstract state is the ancestor
      # of all other states. It holds the url prefix. There are
      # two ui-views in the index.html file: main and goHome. This
      # top-level state formats the goHome navigation button. The
      # main ui-view is formatted by child states. Since the main
      # ui-view is in the root context, it is referenced by the
      # child state as main@.
      .state 'quip',
        url: '/quip?project'
        abstract: true
        views:
          # The home button.
          goHome:
            templateUrl: '/views/go-home.html'
            controller: 'GoHomeCtrl'
      
      # The home landing page.
      .state 'quip.home',
        url: ''
        views:
          'main@':
            templateUrl: '/partials/subject-list.html'
            controller:  'SubjectListCtrl'
      
      # The subject state.
      .state 'quip.subject',
        abstract: true
        url: '/:collection/subject/{subject:[0-9]+}'
        resolve:
          subject: ['$stateParams', 'Subject',
            ($stateParams, Subject) ->
              getSubject($stateParams, Subject)
          ]
      
      # The subject detail page.
      .state 'quip.subject.detail',
        url: '?detail'
        resolve:
          detail: ['Subject', 'subject',
            (Subject, subject) ->
              Subject.detail(id: subject.detail)
          ]
        views:
          'main@':
            templateUrl: '/partials/subject-detail.html'
            controller:  'SubjectDetailCtrl'
        reloadOnSearch: false
      
      # The session state.
      .state 'quip.subject.session',
        abstract: true
        url: '/session/{session:[0-9]+}'
        # TODO - enable
        # resolve:
        #   session: ['$stateParams', 'subject', 'Session',
        #     ($stateParams, subject, Session) ->
        #       getSession($stateParams, subject, Session)
        #   ]
      
      # The session detail page.
      .state 'quip.subject.session.detail',
        url: '?detail'
        # TODO - enable
        # resolve:
        #   detail: ['$stateParams', 'Session', 'session',
        #     ($stateParams, Session, session) ->
        #       detail_id = $stateParams.detail or ssession.detail
        #       Session.detail(id: $stateParams.detail)
        #   ]
        views:
          'main@':
            templateUrl: '/partials/session-detail.html'
            controller:  'SessionDetailCtrl'
        reloadOnSearch: false
     
      # The series image page.
      .state 'quip.subject.session.series',
        url: '/:image_container/series/{series:[0-9]+}'
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
