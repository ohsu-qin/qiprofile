`import Pathology from "./pathology.data.coffee"`

###*
 * The clinical Encounter REST data object extension utility.
 *
 * @module clinical
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
     * @method isBiopsy
     * @return whether the encounter class is `Biopsy`
    ###
    encounter.isBiopsy = -> @_cls is 'Biopsy'

    ###*
     * @method isSurgery
     * @return whether the encounter class ends in `Surgery`
    ###
    encounter.isSurgery = -> @_cls.endsWith('Surgery')

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

    # Extend the pathology object.
    if encounter.pathology
      Pathology.extend(encounter.pathology)

    # Return the augmented clinical encounter object.
    encounter

`export { ClinicalEncounter as default }`
