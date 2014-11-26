define ['angular', 'lodash', 'helpers'], (ng, _) ->
  sarcoma = ng.module 'qiprofile.sarcoma', ['qiprofile.helpers']

  sarcoma.factory 'Sarcoma', ['ObjectHelper', (ObjectHelper) ->
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

    Grade:
      RANGES: [[2..3], [4..5], [6..8]]
      SCORES: ['differentiation', 'mitoticCount', 'necrosis']


    # Returns the cancer stage.
    #
    # If metastasis exists (M1), then the stage is IV.
    # Otherwise, the stage is determined by T and N scores as
    # defined in the tumor type factory STAGES associative
    # lookup table.
    #
    # @param tnm the TNM object
    # @param summaryGrade the summary grade (1 to 3)
    # @returns the cancer stage object, as described in tnm.coffee
    #    stage
    stage: (tnm, summaryGrade) ->
      # M1 => stage IV.
      if tnm.metastasis
        return 'IV'
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
  ]