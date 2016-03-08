define [], ->
  class Loader
    # The valid file load states.
    STATES =
      UNLOADED: 'unloaded'
      LOADING: 'loading'
      LOADED: 'loaded'
      ERROR: 'error'

    constructor: ->
      @state = STATES.UNLOADED
      @data = null

    isLoaded: ->
      @state is STATES.LOADED

    isLoading: ->
      @state is STATES.LOADING

    isError: ->
      @state is STATES.ERROR
  
    # Transfers the file content to the data property.The state flag
    # is set to STATES.LOADING while the file is being read.
    #
    # @param path the file path name
    # @returns a promise which resolves to the loaded data
    #   when the file is loaded
    load: (path) ->
      # Set the loading flag.
      @state = STATES.LOADING

      # Read the file into an ArrayBuffer. The CoffeeScript fat
      # arrow (=>) binds the this variable to the image sequence object
      # rather than the $http request.
      File.readBinary(path).then (data) =>
        # Set the state to loaded.
        @state = STATES.LOADED
        # Resolve to the data.
        data
      .catch (res) =>
        # Display an alert with the status text.
        alert("The image file #{ path } load was unsuccessful: " +
              "#{ res.statusText } (#{ res.status }).")
        # Set the state to 'error'.
        @state = STATES.ERROR
