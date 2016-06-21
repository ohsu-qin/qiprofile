define ['angular', 'underscore.string'], (ng, _s) ->
  clinical = ng.module 'qiprofile.clinical', []

  clinical.factory 'Clinical', ->
    # @param encounter the clinical encounter
    # @returns the augmented clinical encounter object 
    extend: (encounter) ->
      # @return whether this is a surgery encounter
      encounter.isSurgery = -> _s.endsWith(@_cls, 'Surgery')

      # Add the title virtual property.
      Object.defineProperties encounter,
        # @return 'Surgery' for a surgery encounter,
        #   otherwise return the encounter class 
        title:
          get: ->
            if @isSurgery() then 'Surgery' else @_cls
      
      # Return the augmented clinical encounter object.
      encounter
