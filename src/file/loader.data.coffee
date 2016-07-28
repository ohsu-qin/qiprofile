###*
 * The Loader helper data service.
 * Data services can extend REST objects with this class
 * to enable file loading capability.  
 *
 * @module file
 * @class Loader
###
class Loader
  # The valid file load states.
  STATES =
    UNLOADED: 'unloaded'
    LOADING: 'loading'
    LOADED: 'loaded'
    ERROR: 'error'

  constructor: ->
    @_state = STATES.UNLOADED

  ###*
   * @method isLoaded
   * @return whether the load is completed
  ###
  isLoaded: ->
    @_state is STATES.LOADED

  ###*
   * @method isLoading
   * @return whether the load is initiated but not completed
  ###
  isLoading: ->
    @_state is STATES.LOADING

  ###*
   * @method isError
   * @return whether the load was initiated but unsuccessful
  ###
  isError: ->
    @_state is STATES.ERROR

  ###*
   * Transfers the loadable content to the data property. The state
   * flag is set to STATES.LOADING while the file is being read.
   *
   * @method load
   * @param loadable an object which the data store can load
   * @param the data store
   * @return a promise which resolves to the loaded data
   *   when the file is loaded
  ###
  load: (loadable, store) ->
    # Set the loading flag.
    @_state = STATES.LOADING

    # Read the content into an ArrayBuffer. The CoffeeScript fat
    # arrow (=>) binds the this variable to this Loader object
    # rather than the $http request.
    store.load(loadable)
      .then (data) =>
        # Set the state to loaded.
        @_state = STATES.LOADED
        # Resolve to the data.
        data
      .catch (response) =>
        # Set the state to 'error'.
        @_state = STATES.ERROR
        # Throw an error with the status text.
        throw new Error("Image load was unsuccessful:" +
                        " #{ response.statusText } (#{ response.status }).")

`export { Loader as default }`
