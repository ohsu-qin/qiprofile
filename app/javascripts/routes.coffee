define ['angular', 'lodash', 'underscore.string', 'uirouter', 'resources',
        'subject', 'session', 'scan', 'registration'],
  (ng, _, _s) ->
    routes = ng.module(
      'qiprofile.routes',
      ['ui.router', 'qiprofile.resources', 'qiprofile.subject', 'qiprofile.session',
       'qiprofile.scan', 'qiprofile.registration']
    )

    routes.config [
      '$stateProvider', '$urlMatcherFactoryProvider', '$locationProvider',
      ($stateProvider, $urlMatcherFactoryProvider, $locationProvider) ->
        
        # Match optional trailing slash. Cf.
        # https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions\
        # #how-to-make-a-trailing-slash-optional-for-all-routes
        $urlMatcherFactoryProvider.strictMode(false)

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
              # The project is shared by all states.
              # TODO - determine the default in a property.
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
              Resources: 'Resources'
              collections: (Resources, project) ->
                # The selection criterion is the project name.
                condition = project: project
                # Delegate to the ImagingCollection resource.
                Resources.ImagingCollection.query(condition)
            views:
              'main@':
                templateUrl: '/partials/collection-list.html'
                controller:  'CollectionListCtrl'

          # The subject list page.
          .state 'quip.subjects',
            url: '/subjects'
            resolve:
              Subject: 'Subject'
              subjects: (Subject, project) ->
                # The selection criterion is the project name.
                condition = project: project
                # The id is always fetched. In addition, the
                # project/collection/number secondary key is fetched.
                # No other fields are fetched.
                fields = ['project', 'collection', 'number']
                # Delegate to the resource.
                Subject.query(condition, fields)
              collections: ($state, subjects) ->
                # The sorted collection names, with duplicates removed.
                _.chain(subjects).map('collection').uniq().value().sort()
            views:
              'main@':
                templateUrl: '/partials/subject-list.html'
                controller:  'SubjectListCtrl'

          # The collection abstract state.
          .state 'quip.collection',
            abstract: true
            url: '/:collection'
            resolve:
              collection: ($stateParams) ->
                _s.capitalize($stateParams.collection)

          # The Collection Detail state.
          .state 'quip.collection.detail',
            url: ''
            resolve:
              Subject: 'Subject'
              collection: ($stateParams) ->
                _s.capitalize($stateParams.collection)
              # TODO - rename charting to subjects.
              charting: (Subject, project, collection) ->
                # The selection criterion is the project and collection.
                condition = {project: project, collection: collection}
                # The id is always fetched. In addition, the number and encounters
                # are fetched. No other field is fetched.
                fields = ['number', 'encounters']
                # Delegate to the resource.
                Subject.query(condition, fields)
            views:
              'main@':
                templateUrl: '/partials/collection-detail.html'
                controller:  'CollectionDetailCtrl'

          # The subject state.
          .state 'quip.collection.subject',
            url: '/subject/{subject:[0-9]+}?id'
            resolve:
              subject: ($stateParams, Subject, project, collection) ->
                #  The search condition object determnined as follows:
                # * If the subject id is available, then the search
                #   condition is the {id} primary key.
                # * Otherwise, the search condition is the
                #   {project, collection, number} secondary key.
                condition = 
                  if $stateParams.id?
                    id: $stateParams.id
                  else
                    # Return the secondary key.
                    project: project
                    collection: collection
                    number: parseInt($stateParams.subject)
                # Fetch the subject.
                Subject.find(condition)
            views:
              'main@':
                templateUrl: '/partials/subject-detail.html'
                controller:  'SubjectDetailCtrl'

          # The session state.
          # The session state parameter is the session number.
          .state 'quip.collection.subject.session',
            url: '/session/{session:[0-9]+}'
            resolve:
              session: (subject, $stateParams, Session) ->
                number = parseInt($stateParams.session)
                if number >= subject.sessions.length
                  throw new ReferenceError(
                    "Subject #{ subject.number } Session #{ number } was" +
                    "not found"
                  )
                # Grab the subject session embedded object.
                session = subject.sessions[number - 1]
                # If the session has a scans array, then the detail was already
                # fetched and we are done. Otherwise, fetch the detail.
                if session.scans?
                  session
                else
                  # The session must have a detail foreign key.
                  if not session.detail?
                    throw new ReferenceError(
                      "Subject #{ subject.number } Session #{ session.number }" +
                      " does not have detail"
                  )
                  # Fetch the session detail.
                  Session.detail(session)
            views:
              'main@':
                templateUrl: '/partials/session-detail.html'
                controller:  'SessionDetailCtrl'

          # The scan state.
          # The scan state parameter is the scan number.
          .state 'quip.collection.subject.session.scan',
            abstract: true
            url: '/scan/:scan'
            resolve:
              scan: (session, $stateParams, Scan) ->
                number = parseInt($stateParams.scan)
                Scan.find(session, number)

          # The scan volume state.
          # The volume state parameter is the volume number.
          .state 'quip.collection.subject.session.scan.volume',
            abstract: true
            url: '?volume'
            resolve:
              imageSequence: (scan) -> scan
              volume: ($stateParams) -> parseInt($stateParams.volume)

          # TODO - uncomment to enable XTK.
          # # The scan 3D volume detail state.
          # .state 'quip.collection.subject.session.scan.volume.detail',
          #   url: ''
          #   views:
          #     'main@':
          #       templateUrl: '/partials/volume-display.html'
          #       controller:  'VolumeDisplayCtrl'

          # The Scan Detail state.
          .state 'quip.collection.subject.session.scan.volume.slice',
            url: '?slice'
            resolve:
              slice: ($stateParams) -> parseInt($stateParams.slice)
              timeSeries: (subject, session, scan) ->
                ts = scan.timeSeries
                if not ts?
                  throw new ReferenceError(
                    " #{ scan.title } does not have a time series"
                  )
                img = ts.image
                if img.isLoaded() then ts else img.load().then -> ts
            views:
              'main@':
                templateUrl: '/partials/slice-display.html'
                controller:  'SliceDisplayCtrl'

          # The registration state.
          # The registration state parameter is the registration
          # resource name.
          .state 'quip.collection.subject.session.scan.registration',
            abstract: true
            url: '/registration/:registration'
            resolve:
              registration: (scan, $stateParams, Registration) ->
                Registration.find(scan, $stateParams.registration)

          # The Registration Detail state.
          .state 'quip.collection.subject.session.scan.registration.volume',
            abstract: true
            url: '?volume'
            resolve:
              imageSequence: (registration) -> registration
              volume: -> parseInt($stateParams.volume)

          # # TODO - uncomment to enable XTK.
          # # The registration 3D volume detail state.
          # .state 'quip.collection.subject.session.scan.registration.volume.detail',
          #   url: ''
          #   views:
          #     'main@':
          #       templateUrl: '/partials/volume-display.html'
          #       controller:  'VolumeDisplayCtrl'

          # The registration slice detail state.
          .state 'quip.collection.subject.session.scan.registration.volume.slice',
            url: '?slice'
            resolve:
              slice: ($stateParams) -> parseInt($stateParams.slice)
              timeSeries: (subject, session, scan, registration) ->
                ts = registration.timeSeries
                if not ts?
                  throw new ReferenceError(
                      "#{ subject.title } #{ session.title }" +
                      " #{ scan.title } #{ registration.title }" +
                      " does not have a time series"
                  )
                if ts.isLoaded() then ts else ts.load()
            views:
              'main@':
                templateUrl: '/partials/slice-display.html'
                controller:  'SliceDisplayCtrl'

        # HTML5 mode enables the back button to work properly.
        $locationProvider.html5Mode(enabled: true, requireBase: false)
    ]
