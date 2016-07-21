`import * as _s from "underscore.string"`

###*
 * The Clinical REST data object extension service.
 *
 * @module subject
 * @class Clinical
 * @static
###
Clinical =
  ###*
   * @method extend
   * @param encounter the clinical encounter
   * @return the augmented clinical encounter object
  ###
  extend: (encounter) ->
    ###*
     * @method encounter
     * @return whether this is a surgery encounter
    ###
    encounter.isSurgery = -> _s.endsWith(@_cls, 'Surgery')

    # Add the title virtual property.
    Object.defineProperties encounter,
      ###*
       * @method title
       * @return 'Surgery' for a surgery encounter,
       *   otherwise return the encounter class
      ###
      title:
        get: ->
          if @isSurgery() then 'Surgery' else @_cls

    # Return the augmented clinical encounter object.
    encounter
