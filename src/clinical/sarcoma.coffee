`import * as _ from "lodash"`

`import ObjectHelper from "../common/object-helper.coffee"`

# The cancer stages correspond to TNM scores, assuming no
# metastasis (M0). Source:
# http://www.cancer.gov/cancertopics/pdq/treatment/adult-soft-tissue-sarcoma/HealthProfessional/page3
STAGES =
  1: [
    ['1A', '2A', '2C']
    ['3', '3', '3']
  ]
  2: [
    ['1B', '2B', '3']
    ['3', '3', '3']
  ]

###*
 * The static sarcoma utility.
 *
 * @module clinical
 * @class Sarcoma
 * @static
###
Sarcoma =
    ###*
     * The sarcoma cancer grade determinants, consisting of the
     * following properties:
     * * _RANGES_ - the three grade score ranges, as follows:
     *   - Grade 1: score 2,3
     *   - Grade 2: score 4,5
     *   - Grade 3: score 6,8
     * * _SCORES_ - the grade score factor properties
     *   `differentiation`, `mitoticCount` and `necrosisScore`
     *
     * @property Grade
     * @static
    ###
    # The cancer grades
    Grade:
      RANGES: [[2..3], [4..5], [6..8]]
      SCORES: ['differentiation', 'mitoticCount', 'necrosisScore']

    ###*
     * @method stageExtent
     * @return the sorted stage values
    ###
    stageExtent: ->
      _.chain(STAGES).values().flattenDeep().union(['4']).uniq().sort().value()

    ###*
     * Returns the cancer stage.
     *
     * If metastasis exists (M1), then the stage is 4.
     * Otherwise, the stage is determined by T and N scores as
     * defined in the tumor type factory STAGES associative
     * lookup table.
     *
     * @method stage
     * @param tnm the TNM object
     * @param summaryGrade the summary grade (1 to 3)
     * @return the cancer stage object, as described in tnm.coffee
     *    stage
    ###
    stage: (tnm, summaryGrade) ->
      # M1 => stage 4.
      if tnm.metastasis
        return '4'
      # The T and N scores.
      # TODO - factor in the size suffix.
      t = tnm.size.tumorSize
      n = tnm.lymphStatus
      g = summaryGrade

      # Lookup (t, n, g) in the stage table.
      # If not found, then throw an error.
      find = (table, value) ->
        result = table[value] or
          throw new ReferenceError("Unsupported #{ tnm.tumorType }" +
                                   " TNM: #{ ObjectHelper.prettyPrint(tnm) }" +
                                   " Summary Grade: #{ g }")

      _.reduce([t, n, g - 1], find, STAGES)

`export { Sarcoma as default }`
