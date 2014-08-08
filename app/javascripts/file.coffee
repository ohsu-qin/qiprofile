define ['angular', 'underscore.string', 'ngresource'], (ng, _s) ->
  file = ng.module 'qiprofile.file', []

  file.factory 'File', ['$http', ($http) ->
    # Helper function to read the given server file.
    #
    # @param path the file path relative to the web app root
    # @param config the optional AngularJS $http config argument
    # @returns a promise which resolves to the file content
    read: (path, config=null) ->
      # Remove the leading slash, if necessary.
      if path[0] is '/'
        path = path[1..]
      # Read the file and resolve to the content.
      $http(method: 'GET', url: '/static/' + path, config)
  ]
