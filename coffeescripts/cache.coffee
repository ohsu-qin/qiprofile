define ['angular'], (ng) ->
  cache = ng.module 'qiprofile.cache', []

  # The application cache singleton. This service should be used
  # sparingly only to retain non-volatile data while navigating
  # within the application. Inject the cache in the root route
  # for sharing in all application routes.
  cache.factory 'Cache', ['$rootScope', ($rootScope) ->
    # @param id the object id unique in the cache scope
    # @param factory an optional function to create the
    #   object with the id argument if it is not yet cached
    # @returns the cached object with the given id,
    #   or null if the object is not yet cached
    get: (id, factory) ->
      target = this[id]
      if factory? and not target?
        target = factory(id)
        add(target)
      # Return the cached object.
      target
    
    # Adds the object to the cache.
    #
    # @param object the object to cache
    # @param id the cache id
    # @returns the cached object
    add: (object, id) ->
      this[id] = object
      object

    # Removes the object with the given id from the cache.
    #
    # @param object the object to cache
    # @returns the removed object, or null if it is not cached
    remove: (id) ->
      target = @get(id)
      delete this[id] if target?
      target
  ]
