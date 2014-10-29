define ['angular', 'lodash', 'underscore.string', 'resources', 'router', 'uirouter'],
  (ng, _, _s) ->
    routes = ng.module 'qiprofile.routes', ['ui.router', 'qiprofile.resources',
                                            'qiprofile.router']

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
              # The Routers service is injected into all child states.
              Router: 'Router'
              # The project is shared by all states.
              project: ($stateParams) ->
                $stateParams.project or 'QIN'
            views:
              # The home button.
              home:
                templateUrl: '/partials/home-btn.html'
                controller: 'HomeCtrl'
              # The help button.
              help:
                templateUrl: '/partials/help-btn.html'
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
              subject: ($stateParams) ->
                project: $stateParams.project or project
                collection: _s.capitalize($stateParams.collection)
                number: parseInt($stateParams.subject)
          
          # The subject detail page.
          .state 'quip.subject.detail',
            url: '?detail'
            resolve:
              detail: (subject, $stateParams, Router) ->
                subject.detail = $stateParams.detail
                Router.getSubjectDetail(subject)
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
            url: '?detail'
            resolve:
              detail: (session, $stateParams, Router) ->
                session.detail = $stateParams.detail
                Router.getSessionDetail(session)
            views:
              'main@':
                templateUrl: '/partials/session-detail.html'
                controller:  'SessionDetailCtrl'

          # The scan state.
          .state 'quip.subject.session.scan',
            abstract: true
            url: '/scan/:scan?detail'
            resolve:
              scan: (session, $stateParams, Router) ->
                # The optional session detail query parameter.
                session.detail = $stateParams.detail
                # Get the scan.
                Router.getScan(session, $stateParams.scan)

          # The registration state.
          .state 'quip.subject.session.scan.registration',
            abstract: true
            url: '/registration/:registration'
            resolve:
              registration: (scan, $stateParams, Router) ->
                Router.getRegistration(scan, $stateParams.registration)

          # The scan image detail page.
          .state 'quip.subject.session.scan.image',
            url: '/image/{timePoint:[1-9][0-9]*}'
            resolve:
              image: (scan, $stateParams, Router) ->
                timePoint = parseInt($stateParams.timePoint)
                Router.getImageDetail(scan, timePoint)
            views:
              'main@':
                templateUrl: '/partials/image-detail.html'
                controller:  'ImageDetailCtrl'

          # The registration image detail page.
          .state 'quip.subject.session.scan.registration.image',
            url: '/image/{timePoint:[1-9][0-9]*}'
            resolve:
              image: (registration, $stateParams, Router) ->
                timePoint = parseInt($stateParams.timePoint)
                Router.getImageDetail(registration, timePoint)
            views:
              'main@':
                templateUrl: '/partials/image-detail.html'
                controller:  'ImageDetailCtrl'

        # Redirect an URL with trailing slash to an URL without it.
        $urlRouterProvider.rule ($injector, $location) ->
          path = $location.path()
          search = $location.search()
          if _s.endsWith(path, '/')
            path = path[0...-1]
          params = ["#{ k }=#{ v}" for [k, v] in _.pairs(search)]
          paramStr = params.join('&')
          [path, paramStr].join('?')

        # HTML5 mode enables the back button to work properly.
        $locationProvider.html5Mode(true)
    ]
