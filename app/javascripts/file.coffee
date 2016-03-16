define ['angular', 'underscore.string', 'pako'], (ng, _s, pako) ->
  file = ng.module 'qiprofile.file', []

  file.factory 'File', ['$http', ($http) ->
    # Helper function to read the given server file.
    # This private helper function is defined here since
    # it is used by the readBinary function.
    #
    # @param path the file path relative to the web app root
    # @param config the optional AngularJS $http config argument
    # @returns a promise which resolves to the HTTP response
    _read = (path, config={}) ->
      # Remove the leading slash, if necessary.
      if path[0] is '/'
        path = path[1..]
      url = '/static/' + path
      config.method = 'GET'
      config.url = url
      
      # Read the file.
      $http(config).then (res) ->
          res.data
    
    # Reads the given server file.
    #
    # Note: the response is returned even if there is an
    # HTTP error. The error is caught and the response is
    # returned.
    #
    # @param path the file path relative to the web app root
    # @param config the optional AngularJS $http config argument
    # @returns a promise which resolves to the HTTP response
    read: _read

    # A convenience function to read a binary file into an
    # ArrayBuffer. This method uncompresses compressed data
    # for files ending in '.gz' or '.zip'.
    #
    # @param path the file path relative to the web app root
    # @param config the optional AngularJS $http config argument
    # @returns a promise which resolves to the HTTP response
    readBinary: (path, config={}) ->
      config.responseType = 'arraybuffer'
      _read(path, config).then (bytes) ->
        # If this file is compressed, then uncompress the byte
        # array. Otherwise, pass through the bytes unchanged.
        if _s.endsWith(path, '.gz') or _s.endsWith(path, '.zip')
          pako.inflate(bytes)
        else
          bytes

    # Enocodes and posts the given content. The input data parameter
    # is an unencoded Javascript object.
    #
    # @param url the server URL to receive the object
    # @param data the unencoded Javascript object to send
    send: (url, data) ->
      config = contentType: 'application/json'
      $http.post(url, ng.toJson(data), config).then (res) ->
        res.data
  ]
