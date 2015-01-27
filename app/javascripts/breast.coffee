define ['angular', 'lodash', 'helpers'], (ng, _) ->
  breast = ng.module 'qiprofile.breast', ['qiprofile.helpers']

  breast.factory 'Breast', ['ObjectHelper', (ObjectHelper) ->
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

    Grade:
      RANGES: [[3..5], [6..7], [8..9]]
      SCORES: ['tubularFormation', 'mitoticCount', 'nuclearPleomorphism']


    # Returns the cancer stage.
    #
    # 1f metastasis exists (M1), then the stage is 4.
    # Otherwise, the stage is determined by T and N scores as
    # defined in the tumor type factory STAGES associative
    # lookup table.
    #
    # @param tnm the TNM object
    # @returns the cancer stage object, as described in tnm.coffee
    #    stage
    stage: (tnm) ->
      # M1 => stage IV.
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
    

    # Returns the cancer recurrence score. This score is calculated from
    # a genetic expression assay according to algorithm in Figure 1 of
    # the following paper:
    #
    #   Paik, et al., 'A Multigene Assay to Predict Recurrence of
    #   Tamoxifen-Treated, Node-Negative Breast Cancer',
    #   N Engl J Med 2004; 351:2817-2826  
    #   (http://www.nejm.org/doi/full/10.1056/NEJMoa041588)
    #
    # 1f metastasis exists (M1), then the stage is 4.
    # Otherwise, the stage is determined by T and N scores as
    # defined in the tumor type factory STAGES associative
    # lookup table.
    #
    # @param tnm the TNM object
    # @returns the cancer stage object, as described in tnm.coffee
    #    stage
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
  ]
