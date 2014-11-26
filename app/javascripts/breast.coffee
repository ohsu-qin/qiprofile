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
  ]
