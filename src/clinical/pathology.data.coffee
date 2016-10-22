`import * as _ from "lodash"`
`import * as _s from "underscore.string"`

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
    # The REST pathology extent has a length field,
    # which wreaks havoc in Javascript, where a length
    # property name is reserved for array-like objects.
    # Mutate the extent object to avoid this problem.
    # Change the width and depth as well for consistency.
    for tumor in pathology.tumors
      if tumor.extent
        for prop in ['length', 'width', 'depth']
          if prop of tumor.extent
            altProp = 'tumor' + _s.capitalize(prop)
            tumor.extent[altProp] = tumor.extent[prop]
            delete tumor.extent[prop]

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
          _.sumBy(@tumors, 'extent.tumorLength')

    # Return the augmented pathology object.
    pathology

`export { Pathology as default }`
