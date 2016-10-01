`import * as _ from "lodash"`

###*
 * The clinical pathology REST data object extension utility.
 *
 * @module clinical
 * @class Pathology
 * @static
###
Pathology =
  ###*
   * @method extend
   * @param pathology the pathology REST object
   * @return the augmented pathology object
  ###
  extend: (pathology) ->
    # Add the virtual properties.
    Object.defineProperties pathology,
      ###*
       * The largest TNM tumor size over all tumors.
       *
       * @property tumorSize
      ###
      tumorSize:
        get: ->
          _.maxBy(@tumors, 'tnm.size.tumorSize')

      ###*
       * The aggregate tumor length over all tumors.
       *
       * @property tumorLength
      ###
      tumorLength:
        get: ->
          _.sumBy(@tumors, 'extent.length')

    # Return the augmented pathology object.
    pathology

`export { Pathology as default }`
