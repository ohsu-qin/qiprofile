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
                # The id is always fetched. In addition, the
                # project/collection/number secondary key is fetched.
                # No other fields are fetched.
                fields = REST.map(['project', 'collection', 'number'])
                # The HTML query parameter.
                param = _.extend(_.clone(cond), fields)
                # Delegate to the resource.
                Subject.query(param).$promise
              collections: ($state, subjects) ->
                # The sorted collection names, with duplicates removed.
                _.chain(subjects).map('collection').uniq().value().sort()
            views:
              'main@':
                templateUrl: '/partials/subject-list.html'
                controller:  'SubjectListCtrl'

          # The collection state.
          .state 'quip.collection',
            url: '/:collection'
            resolve:
              Subject: 'Subject'
              subjects: (Subject, project, collection) ->
                # The selection criterion is the project name.
                cond = REST.where(project: project, collection: collection)
                # The id is always fetched. In addition, the
                # project/collection/number secondary key is fetched.
                # No other fields are fetched.
                fields = REST.map(['project', 'collection', 'number'])
                # The HTML query parameter.
                param = _.extend(_.clone(cond), fields)
                # Delegate to the resource.
                Subject.query(param).$promise
              collection: ($stateParams) ->
                _s.capitalize($stateParams.collection)
            views:
              'main@':
                templateUrl: '/partials/collection.html'
                controller:  'CollectionCtrl'

          # The subject state.
          .state 'quip.subject',
            url: '/:collection/subject/{subject:[0-9]+}?id'
            resolve:
              subject: ($stateParams, Router) ->
                # Returns the search condition object determnined as
                # follows:
                # * If the subject id is available, then the search
                #   condition is the {id} primary key.
                # * Otherwise, the search condition is the
                #   {project, collection, number} secondary key.
                searchCondition = ->
                  if $stateParams.id?
                    id: $stateParams.id
                  else
                    # Validate the secondary key parameters.
                    if not $stateParams.collection?
                      throw new ValueError("Subject search parameters is missing" +
                                           " both an id and the subject collection")
                    if not $stateParams.subject?
                      throw new ValueError("Subject search parameters is missing" +
                                           " both an id and the subject number")
                    # Return the secondary key.
                    project: $stateParams.project or project
                    collection: _s.capitalize($stateParams.collection)
                    number: parseInt($stateParams.subject)
                
                # Get the search condition.
                condition = searchCondition()
                # Fetch the subject.
                Router.getSubject(condition)
            views:
              'main@':
                templateUrl: '/partials/subject-detail.html'
                controller:  'SubjectDetailCtrl'

          # The session state.
          # The session state parameter is the session number.
          .state 'quip.subject.session',
            url: '/session/{session:[0-9]+}'
            resolve:
              session: (subject, $stateParams, Router) ->
                number = parseInt($stateParams.session)
                if number >= subject.sessions.length
                  throw new ReferenceError.new("Subject #{ subject.number }" +
                                           " does not have a session" +
                                           " #{ number }")
                # Grab the subject session embedded object.
                session = subject.sessions[number - 1]
                # If the session has a scans array, then the detail was already
                # fetched and we are done. Otherwise, fetch the detail.
                if session.scans?
                  session
                else
                  # The session must have a detail foreign key.
                  if not session.detail?
                    throw new ReferenceError.new("Subject #{ subject.number }" +
                                             " Session #{ session.number }" +
                                             " does not have detail")
                  # Fetch the session detail.
                  Router.getSessionDetail(session)
            views:
              'main@':
                templateUrl: '/partials/session-detail.html'
                controller:  'SessionDetailCtrl'

          # The scan state.
          # The scan state parameter is the scan number.
          .state 'quip.subject.session.scan',
            abstract: true
            url: '/scan/:scan'
            resolve:
              scan: (session, $stateParams, Router) ->
                number = parseInt($stateParams.scan)
                Router.getScan(session, number)

          # The scan volume state.
          # The volume state parameter is the volume number.
          .state 'quip.subject.session.scan.volume',
            url: '/volume/{volume:[1-9][0-9]*}'
            resolve:
              image: (scan, $stateParams, Router) ->
                number = parseInt($stateParams.volume)
                volume = Router.getVolume(scan, number)
                image = volume.image
                if image.isLoaded() then image else image.load()
            views:
              'main@':
                templateUrl: '/partials/image-detail.html'
                controller:  'ImageDetailCtrl'

          # The registration state.
          # The registration state parameter is the registration
          # resource name.
          .state 'quip.subject.session.scan.registration',
            abstract: true
            url: '/registration/:registration'
            resolve:
              registration: (scan, $stateParams, Router) ->
                Router.getRegistration(scan, $stateParams.registration)

          # The registration volume state.
          # The volume state parameter is the volume number.
          .state 'quip.subject.session.scan.registration.volume',
            url: '/volume/{volume:[1-9][0-9]*}'
            resolve:
              volume: (registration, $stateParams, Router) ->
                number = parseInt($stateParams.volume)
                Router.getVolume(registration, number)
              image: (volume) ->
                image = volume.image
                if image.isLoaded() then image else image.load()
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
          params = ["#{ k }=#{ v}" for [k, v] in _.toPairs(search)]
          paramStr = params.join('&')
          [path, paramStr].join('?')

        # HTML5 mode enables the back button to work properly.
        $locationProvider.html5Mode(enabled: true, requireBase: false)
    ]
