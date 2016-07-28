`import * as _s from "underscore.string"`

###*
 * The clinical Encounter REST data object extension utility.
 *
 * @class ClinicalEncounter
 * @static
###
ClinicalEncounter =
  ###*
   * @method extend
   * @param encounter the clinical encounter
   * @param subject the parent subject REST object
   * @return the augmented clinical encounter object
  ###
  extend: (encounter, subject) ->
    ###*
     * The parent subject REST object
     *
     * @property subject
    ###
    encounter.subject = subject
    
    ###*
     * @method isSurgery
     * @return whether the encounter class ends in 'Surgery'
    ###
    encounter.isSurgery = -> _s.endsWith(@_cls, 'Surgery')

    # Add the virtual properties.
    Object.defineProperties encounter,
      ###*
       * 'Surgery' for a surgery encounter,
       *  otherwise the encounter class
       *
       * @property title
      ###
      title:
        get: ->
          if @isSurgery() then 'Surgery' else @_cls

      ###*
       * The patient age at the time of the encounter.
       *
       * @property age
      ###
      age:
        get: ->
          if @date and @subject.birthDate
            @date - @subject.birthDate

    # Return the augmented clinical encounter object.
    encounter

`export { ClinicalEncounter as default }`
