define ['angular', 'ngresource'], (ng) ->
  file = ng.module 'qiprofile.file', []

  file.factory 'File', ['$http', ($http) ->
    # Define the service in a separate object, since it has a self-reference,
    # which is not handled by the deficient Angular service definition
    # mechanism.
    File =
      # Helper function to read the given server file.
      #
      # @param path the file path relative to the web app root
      # @param config the optional AngularJS $http config argument
      # @returns a promise which resolves to the file content
      read: (path, config={}) ->
        # Remove the leading slash, if necessary.
        if path[0] is '/'
          path = path[1..]
        config.method = 'GET'
        config.url = '/static/' + path
        # Read the file and resolve to the content.
        $http(config).then (res) ->
          res.data
      
      # A convenience function to read a binary file into
      # an ArrayBuffer.
      #
      # @param path the file path relative to the web app root
      # @param config the optional AngularJS $http config argument
      # @returns a promise which resolves to the file content
      #   ArrayBuffer
      readBinary: (path, config={}) ->
        config.responseType = 'arraybuffer'
        File.read(path, config)
    
    # Return the File object.  
    File
  ]
