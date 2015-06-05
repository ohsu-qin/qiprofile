define ['angular'], (ng) ->
  file = ng.module 'qiprofile.file', []

  file.factory 'File', ['$http', ($http) ->
    # Define the service in a separate object, since it has a 
    # self-reference, which is not handled by the deficient
    # Angular service definition mechanism.
    File =
      # Helper function to read the given server file.
      #
      # Note: the response is returned even if there is an
      # HTTP error. The error is caught and the response is
      # returned.
      #
      # @param path the file path relative to the web app root
      # @param config the optional AngularJS $http config argument
      # @returns a promise which resolves to the HTTP response
      read: (path, config={}) ->
        # Remove the leading slash, if necessary.
        if path[0] is '/'
          path = path[1..]
        url = '/static/' + path
        config.method = 'GET'
        config.url = url
        
        # Read the file.
        $http(config).then (res) ->
            res.data

      # A convenience function to read a binary file into
      # an ArrayBuffer.
      #
      # @param path the file path relative to the web app root
      # @param config the optional AngularJS $http config argument
      # @returns a promise which resolves to the HTTP response
      readBinary: (path, config={}) ->
        config.responseType = 'arraybuffer'
        File.read(path, config)

      # Enocodes and posts the given content. The input data parameter
      # is an unencoded Javascript object.
      #
      # @param url the server URL to receive the object
      # @param data the unencoded Javascript object to send
      send: (url, data) ->
        config = contentType: 'application/json'
        $http.post(url, ng.toJson(data), config).then (res) ->
          res.data

    # Return the File object.  
    File
  ]
