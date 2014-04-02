svcs = angular.module 'qiprofile.services', ['ngResource']

svcs.factory 'Subject', ['$resource', ($resource) ->
  $resource '/api/subjects/:number/', null,
    detail:
      method: 'GET'
      url: '/api/subject_detail/:id/'
]

svcs.factory 'Session', ['$resource', ($resource) ->
  $resource '/api/session_detail/:id/', null,
    detail:
      method: 'GET'
      url: '/api/session_detail/:id/'
]

svcs.factory 'Image', ['$rootScope', '$timeout', ($rootScope, $timeout) -> #['$http', ($http) ->
  # A root scope cache.
  $rootScope.images = {}
  
  # Helper function to load the given file.
  load_data = (filename) ->
    # Placeholder testing function to simulate data transfer.
    $timeout(
      () -> 'loaded'
      3000
    )

    # TODO - replace the mock load by the following:
    # $http
    #   method: 'GET'
    #   url: '/static/' + path

  # Returns a new image object.
  create: (filename) ->
    filename: filename
    state:
      loading: false
    data: null
    # Transfers the image file content to the data attribute.
    load: () ->
      this.state.loading = true
      image = this
      load_data(filename)
      .then (data) ->
        image.data = data
        image.state.loading = false
        data
]
