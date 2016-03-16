define [], ->
  # The loader helper.
  class Loader
    # The valid file load states.
    STATES =
      UNLOADED: 'unloaded'
      LOADING: 'loading'
      LOADED: 'loaded'
      ERROR: 'error'

    constructor: ->
      @_state = STATES.UNLOADED

    # @returns whether the load is completed
    isLoaded: ->
      @_state is STATES.LOADED

    # @returns whether the load is initiated but not completed
    isLoading: ->
      @_state is STATES.LOADING

    # @returns whether the load was initiated but unsuccessful
    isError: ->
      @_state is STATES.ERROR

    # Transfers the loadable content to the data property. The state
    # flag is set to STATES.LOADING while the file is being read.
    #
    # @param loadable an object which the data store can load
    # @param the data store
    # @returns a promise which resolves to the loaded data
    #   when the file is loaded
    load: (loadable, store) ->
      # Set the loading flag.
      @_state = STATES.LOADING

      # Read the content into an ArrayBuffer. The CoffeeScript fat
      # arrow (=>) binds the this variable to this Loader object
      # rather than the $http request.
      store.load(loadable).then (data) =>
        # Set the state to loaded.
        @_state = STATES.LOADED
        # Resolve to the data.
        data
      .catch (res) =>
        # Display an alert with the status text.
        alert("The image file #{ path } load was unsuccessful: " +
              "#{ res.statusText } (#{ res.status }).")
        # Set the state to 'error'.
        @_state = STATES.ERROR
  
  # Return the Loader class.
  Loader
