`import ObjectHelper from "../common/object-helper.service.coffee"`

# The cancer stages correspond to TNM scores, assuming no
# metastasis (M0).
#
# TODO - extend this table to account for the T and N suffixes per
# the reference document mentioned below.
STAGES = [
  ['1A', '2A', '3A', '3C']
  ['1A', '2A', '3A', '3C']
  ['2A', '2B', '3A', '3C']
  ['2B', '3A','3A', '3C']
  ['3B', '3B','3B', '3C']
]

###*
 * The static breast utility service.
 *
 * @module clinical
 * @class Breast
 * @static
###
Breast =
    ###*
     * The breast cancer grade determinants, consisting of the
     * following properties:
     * * *RANGES* - the three grade score ranges, as follows:
     *   - Grade 1: score 3,5
     *   - Grade 2: score 6,7
     *   - Grade 3: score 8,9
     * * *SCORES* - the grade score factor properties
     *   `tubularFormation`, `mitoticCount` and `nuclearPleomorphism`
     *
     * @property Grade
     * @static
    ###
    Grade:
      RANGES: [[3..5], [6..7], [8..9]]
      SCORES: ['tubularFormation', 'mitoticCount', 'nuclearPleomorphism']

    ###*
     * @method stageExtent
     * @return the sorted stage values
    ###
    stageExtent: ->
      _.chain(STAGES).flatten().union(['4']).uniq().sort().value()

    ###*
     * Returns the cancer stage.
     *
     * 1f metastasis exists (M1), then the stage is 4.
     * Otherwise, the stage is determined by T and N scores as
     * defined in the tumor type factory STAGES associative
     * lookup table.
     *
     * @method stage
     * @param tnm the TNM object
     * @return the cancer stage object, as described in tnm.coffee
     *    stage
    ###
    stage: (tnm) ->
      # M1 => stage IV.
      # TODO - shouldn't this be '4'? Is there a test case for this?
      #   Since the value is romanized prior to display, this bug might
      #   be hidden. Same with the Sarcoma stage.
      if tnm.metastasis
        return 'IV'
      # The T and N scores.
      # TODO - factor in the size suffix.
      t = tnm.size.tumorSize
      n = tnm.lymphStatus

      # Lookup (T, N) in the stage table.
      # If not found, then throw an error.
      find = (table, value) ->
        result = table[value] or
          throw new ReferenceError("Unsupported #{ tnm.tumorType }" +
                                   " TNM: #{ ObjectHelper.prettyPrint(tnm) }")

      _.reduce([t, n], find, STAGES)


    ###*
     * Returns the cancer recurrence score. This score is calculated from
     * a genetic expression assay according to algorithm in Figure 1 of
     * the following paper:
     *
     *   Paik, et al., 'A Multigene Assay to Predict Recurrence of
     *   Tamoxifen-Treated, Node-Negative Breast Cancer',
     *   N Engl J Med 2004; 351:2817-2826
     *   (http://www.nejm.org/doi/full/10.1056/NEJMoa041588)
     *
     * 1f metastasis exists (M1), then the stage is 4.
     * Otherwise, the stage is determined by T and N scores as
     * defined in the tumor type factory STAGES associative
     * lookup table.
     *
     * @method recurrenceScore
     * @param tnm the TNM object
     * @return the cancer stage object, as described in tnm.coffee
     *    stage
    ###
    recurrenceScore: (assay) ->
      her2Unscaled = (0.9 * assay.her2.grb7) + (0.1 * assay.her2.her2)
      her2 = Math.max(8, her2Unscaled)
      erUnscaled = (0.8 * assay.estrogen.er) + (1.2 * assay.estrogen.pgr) +
                   assay.estrogen.bcl2 + assay.estrogen.scube2
      er = erUnscaled / 4
      proliferationUnscaled = (assay.proliferation.survivin + assay.proliferation.ki67 +
                              assay.proliferation.mybl2 + assay.proliferation.ccnb1 +
                              assay.proliferation.stk15) / 5
      proliferation = Math.max(6.5, proliferationUnscaled)
      invasion = (assay.invasion.ctsl2 + assay.invasion.mmp11) / 2

      # The unscaled score.
      recurrenceUnscaled = (0.47 * her2) - (0.34 * er) + (1.04 * proliferation) +
                           (0.10 * invasion) + (0.05 * assay.cd68) -
                           (0.08 * assay.gstm1) - (0.07 * assay.bag1)

      # Guard against missing values.
      if isNaN(recurrenceUnscaled)
        return null

      recurrenceScaled = Math.round(20 * (recurrenceUnscaled - 6.7))

      # Return the score fit to the range [0, 100].
      Math.max(0, Math.min(recurrenceScaled, 100))


    ###*
     * Calculates the Residual Cancer Burden index and class as described in:
     *   JCO 25:28 4414-4422 <http://jco.ascopubs.org/content/25/28/4414.full>
     *
     * @method residualCancerBurden
     * @param tumor the tumor object
     * @return the RCB object extended with index and class properties
    ###
    residualCancerBurden: (tumor) ->
      ###*
       * @method rcbIndex
       * @param extent the tumor extent {length, width, depth} REST object
       * @param rcb the RCB REST object
       * @return the RCB index
      ###
      rcbIndex = (extent, rcb) ->
        # The bidimensional tumor size metric.
        size = Math.sqrt(extent.length * extent.width)
        # The overall tumor cellularity.
        overall = rcb.tumorCellDensity / 100
        # The in situ cellularity.
        inSitu = rcb.dcisCellDensity / 100
        # The invasive carcinoma proportion.
        invasion = (1 - inSitu) * overall
        # The RCB index invasion component.
        invasionFactor = 1.4 * Math.pow(invasion * size, 0.17)
        # The RCB index positive node component.
        posNodeFactor = 1 - Math.pow(0.75, rcb.positiveNodeCount)
        # The base of the RCB index node component.
        nodeBase =  4 * posNodeFactor * rcb.largestNodalMetastasisLength
        # The RCB index node component.
        nodeFactor = Math.pow(nodeBase, 0.17)

        # The RCB index is the sum of the invasion and node components.
        invasionFactor + nodeFactor

      ###*
       * @method rcbClass
       * @param index the calculated RCB index value
       * @return the RCB class based on RCB index cut-offs
      ###
      rcbClass = (index) ->
        if index == 0
          return 0
        else if index < 1.36
          return 1
        else if index < 3.28
          return 2
        else
          return 3

      # If the RCB object exists, then return it extended with the
      # index and class properties.
      rcb = tumor.rcb
      if rcb?
        rcb.index = rcbIndex(tumor.extent, tumor.rcb)
        rcb.class = rcbClass(rcb.index)
        rcb

`export { Breast as default }`
