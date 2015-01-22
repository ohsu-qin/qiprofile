define ['angular', 'lodash', 'underscore.string', 'rest', 'uirouter', 'resources',
        'router'],
  (ng, _, _s, REST) ->
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
                # The selection criterion is the project name.
                cond = REST.where(project: project)
                # Only the id and secondary key and fields are fetched.
                fields = REST.pluck(['project', 'collection', 'number'])
                # The HTML query parameter.
                param = _.extend(_.clone(cond), fields)
                # Delegate to the resource.
                Subject.query(param).$promise
              collections: ($state, subjects) ->
                # The sorted collection names, with duplicates removed.
                _.chain(subjects).pluck('collection').uniq().value().sort()
            views:
              'main@':
                templateUrl: '/partials/subject-list.html'
                controller:  'SubjectListCtrl'

          # The subject state.
          # TODO - child states always fetch the subject, even if
          # called in a context with the fetched subject. Can this
          # be avoided? Does the ui-router go function have an
          # option to supply a subject argument and thereby forego
          # the subject fetch resolution? 
          .state 'quip.subject',
            url: '/:collection/subject/{subject:[0-9]+}?subjectdetail'
            resolve:
              subject: ($stateParams, Router) ->
                condition =
                  project: $stateParams.project or project
                  collection: _s.capitalize($stateParams.collection)
                  number: parseInt($stateParams.subject)
                # If the subject detail id is available, then the router
                # searches the subject detail collection directly.
                # Otherwise, the router searches the subject collection
                # to get the detail id, then searches the subject detail
                # collection.
                #
                # TODO - fold the MongoDB subject detail into subject and
                # change the subjects query to do a reduction search to
                # return only the subject id, collection and number. 
                if $stateParams.subjectdetail?
                  condition.detail = $stateParams.subjectdetail
                # Fetch the subject.
                Router.getSubject(condition)
            views:
              'main@':
                templateUrl: '/partials/subject-detail.html'
                controller:  'SubjectDetailCtrl'

          # The session state.
          .state 'quip.subject.session',
            url: '/session/{session:[0-9]+}'
            resolve:
              session: (subject, $stateParams, Router) ->
                number = parseInt($stateParams.session)
                if number >= subject.sessions.length
                  throw ReferenceError.new("Subject #{ subject.number } does" +
                                           " not have a session #{ number }")
                # Grab the subject session embedded object.
                sess = subject.sessions[number - 1]
                # The session must have a detail foreign key.
                if not sess.detail?
                  throw ReferenceError.new("Subject #{ subject.number }" +
                                           " Session #{ sess.number } does" +
                                           " not have detail")

                # Fetch the session detail.
                Router.getSessionDetail(sess)
            views:
              'main@':
                templateUrl: '/partials/session-detail.html'
                controller:  'SessionDetailCtrl'

          # The scan state.
          .state 'quip.subject.session.scan',
            abstract: true
            url: '/scan/:scan'
            resolve:
              scan: (session, $stateParams, Router) ->
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
