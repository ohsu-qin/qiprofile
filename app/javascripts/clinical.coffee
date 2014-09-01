define ['angular', 'lodash', 'helpers'], (ng, _) ->
  clinical = ng.module 'qiprofile.clinical', ['qiprofile.helpers']

  clinical.factory 'Clinical', ['ObjectHelper', (ObjectHelper) ->
    # The standard FDA race categories.
    RACE_CHOICES =
      'White': 'White'
      'Black': 'Black or African American'
      'Asian': 'Asian'
      'AIAN': 'American Indian or Alaska Native'
      'NHOPI': 'Native Hawaiian or Other Pacific Islander'

    # The standard FDA ethnicity categories.
    ETHNICITY_CHOICES =
      'Hispanic': 'Hispanic or Latino'
      'Non-Hispanic': 'Not Hispanic or Latino'
      null: 'Not specified'

    # Lab result categorized as positive or negative.
    POS_NEG_RESULTS =
      false: 'negative'
      true: 'positive'

    # The TNM metastatis parameters.
    TNM_METASTASIS =
      false: '0'
      true: '1'

    # TNM grades corresponding to overall Nottingham or FNCLCC grade.
    TUMOR_GRADES =
      'Breast':
        {
          3: '1'
          4: '1'
          5: '1'
          6: '2'
          7: '2'
          8: '3'
          9: '3'
        }
      'Sarcoma':
        {
          2: '1'
          3: '1'
          4: '2'
          5: '2'
          6: '3'
          7: '3'
          8: '3'
        }

    # The cancer stages corresponding to TNM scores,
    # assuming no metastasis (M0).
    # Sources:
    # * Breast: http://www.cancer.gov/cancertopics/pdq/treatment/breast/healthprofessional/page3
    # * Sarcoma: http://www.cancer.gov/cancertopics/pdq/treatment/adult-soft-tissue-sarcoma/HealthProfessional/page3
    #
    # KEY:
    #
    # 'Breast':
    #   {
    #     Size (T):
    #       {
    #         Lymph Status (N): Stage
    #       }
    #   }
    # 'Sarcoma':
    #   {
    #     Size (T):
    #       {
    #         Lymph Status (N):
    #           {
    #             Grade (M): Stage
    #           }
    #       }
    #   }
    #
    
    # TODO - change stage and grade to an array lookup, e.g.:
    # Breast =
    #   GRADE_RANGES = [[3..5], [6..7], [8..9]]
    #   STAGES = [
    #    ['IIA', 'IIIA', 'IIIC']
    #    ...
    #   ]
    #   stage = (t, n) ->
    #     STAGES[t][n] if ObjectHelper.exists(t)
    #   summaryGrade = (cumulativeGrade) ->
    #     1 + _.findIndex(GRADE_RANGES, (range) -> cumulativeGrade in range)
    #
    # Then there is no need to convert t, n, m or g to string.
    #
    
    TUMOR_STAGES =
      'Breast':
        {
          X:
            {
            }
          0:
            {
              1: 'IIA'
              2: 'IIIA'
              3: 'IIIC'
            }
          1:
            {
              0: 'IA'
              1: 'IIA'
              2: 'IIIA'
              3: 'IIIC'
            }
          2:
            {
              0: 'IIA'
              1: 'IIB'
              2: 'IIIA'
              3: 'IIIC'
            }
          3:
            {
              0: 'IIB'
              1: 'IIIA'
              2: 'IIIA'
              3: 'IIIC'
            }
          4:
            {
              0: 'IIIB'
              1: 'IIIB'
              2: 'IIIB'
              3: 'IIIC'
            }
        }
      'Sarcoma':
        {
          1:
            {
              0:
                {
                  1: 'IA'
                  2: 'IIA'
                  3: 'IIA'
                }
              1:
                {
                  1: 'III'
                  2: 'III'
                  3: 'III'
                }
            }
          2:
            {
              0:
                {
                  1: 'IB'
                  2: 'IIB'
                  3: 'III'
                }
              1:
                {
                  1: 'III'
                  2: 'III'
                  3: 'III'
                }
            }
        }

    configureProfile: (subject) ->
      GRADE_SCORES =
        NottinghamGrade: ['tubular_formation', 'mitotic_count', 'nuclear_pleomorphism']
        FNCLCCGrade: ['differentiation', 'mitotic_count', 'necrosis']
      
      # Calculates the overall grade. Return null if any grade score property
      # value is null.
      #
      # @param grade the grade
      getOverallGrade = (grade) ->
        return null unless grade?
        props = GRADE_SCORES[grade._cls]
        if not props?
          throw new Error("Grade type not recognized: #{ grade._cls }")
        if _.every(props, (prop) -> grade[prop]?)
          _.reduce(props, ((sum, prop) -> sum + grade[prop]), 0)
        else
          null

      # Determine the composite score and stage from the given TNM
      # and grade. This function creates a staging object consisting
      # of the following properties:
      # * t_value - the tumor size (the TNM T parameter)
      # * g_value - the TNM grade (the TNM G parameter)
      # * tumor_score - the composite TNM score
      # * tumor_stage - the I-IV stage defined in TUMOR_STAGES
      #
      # @param the TNM object
      # @param grade the tumor type-specific detail grade, e.g.
      #   Nottingham for Breast or FNCLCC for Sarcoma
      # @returns the staging object
      getTumorStaging = (tnm, grade) ->
        # TODO - Create a separate helper in this Clinical service for
        # each tumor type, e.g.
        #   Breast =
        #     GRADES = ...
        #     STAGES = ...
        #     getOverallGrade: (tnm) -> ...
        #     getStage: (tnm) ->
        # Remove all type-specific references in this main function.
        # All type-specific code should be contained in the respecive
        # service, so calls are by tumor type lookup, e.g.:
        #   FORMATTERS =
        #     Breast: Breast
        #     Sarcoma: Sarcoma
        #   formatter = FORMATTERS[coll]
        #   grade = formatter.getOverallGrade(tnm)
        #   ...
        # There should be no conditions like the following:
        #   if coll == 'Breast'
        #   else if coll == 'Sarcoma'
        #   ...
        #
        # TODO - The REST TNM model size field will become a composite
        # Size object. After this REST model change takes effect, remove
        # parsing the size string value and instead get the values
        # directly from the size object.
        #
        # Breast or sarcoma collection.
        coll = subject.collection
        
        # TODO - make a getTumorScore(tnm) method.
        size = if ObjectHelper.exists(tnm.size) then tnm.size else {}

        # Look up the TNM grade based on the overall Nottingham or FNCLCC grade.
        g_value = TUMOR_GRADES[coll][grade]
        # The T value is the TNM size tumor_size property.
        t_value = size.tumor_size
        # Obtain the T, N, M, and G values as strings or set to 'X' if null.
        t = if ObjectHelper.exists(t_value) then t_value.toString() else 'X'
        n = if ObjectHelper.exists(tnm.lymph_status) then tnm.lymph_status.toString() else 'X'
        m = if ObjectHelper.exists(tnm.metastasis) then TNM_METASTASIS[tnm.metastasis] else 'X'
        g = if g_value then g_value else 'X'
        # The size as a string.
        prefix = if ObjectHelper.exists(size.prefix) then size.prefix else ''
        suffix = if ObjectHelper.exists(size.suffix) then size.suffix else ''
        size_s = "#{ prefix }T#{ t }#{ suffix }"
        # Create the composite TNMG score.
        tumor_score = "#{ size_s }N#{ n }M#{ m }G#{ g }"
        # Look up the tumor stage.
        # If metastasis exits (M1), it is stage IV. Otherwise,
        # breast cancer stage is determined by T and N scores
        # and sarcoma stage is determined by T, N, and G scores.
        # TODO - delegate to the tumor type-specific service.
        if tnm.metastasis
          tumor_stage = 'IV'
        else if coll == 'Breast'
          tumor_stage = TUMOR_STAGES['Breast'][t][n]
        else if coll == 'Sarcoma'
          # For sarcoma, use the T value without any suffix (i.e. a or b).
          tumor_stage = TUMOR_STAGES['Sarcoma'][t.substring(0, 1)][n][g]
        tumor_stage = 'undetermined' if not tumor_stage
        # Return the composite TNM score and the stage.
        t_value: t_value, g_value: g_value, tumor_score: tumor_score, tumor_stage: tumor_stage

      # Extend the subject encounters and outcomes as follows:
      # * Add the t and g value properties to a TNM.
      # * If the outcome is a TNM or has a TNM, then add the tumor score
      #   to the outcome.
      # * Add the isStagingOrGradeData flag to the outcome.
      # * Add the accordionOpen flag to the encounter
      for enc in subject.encounters
        for outcome in enc.outcomes
          # Add staging properties.
          #
          # TODO - generalize for non-pathology and Sarcoma
          # (or any future tumor type). See the clinical-table.jade
          # TODOs. The assignment below is a kludgy work-around.
          tnm = if outcome._cls is 'TNM' then outcome else outcome.tnm
          # Note: CoffeeScript '?' is specifically the equivalent of not null.
          # This is used to evaluate the data because for some properties
          # falsy values such as 0 or false are valid data.
          isStagingData = tnm? and _.some(_.values(tnm), (val) -> val?)
          if isStagingData
            # Add the overall grade to the outcome.
            grade = tnm.grade
            overall_grade = getOverallGrade(grade)
            _.extend grade, overall_grade: overall_grade
            # Add the tumor composite score and stage to the outcome if the value
            # for at least one staging property is not null.
            staging = getTumorStaging(tnm, overall_grade)
            _.extend tnm, t_value: staging.t_value
            _.extend tnm, g_value: staging.g_value
            _.extend outcome, tumor_score: staging.tumor_score
            _.extend outcome, tumor_stage: staging.tumor_stage
          # Add a flag indicating whether staging or grade data exist.
          # If neither exist, the clinical profile column containing their outcomes
          # will be hidden from display.
          isGradeData = _.some(_.values(grade), (val) -> val?)
          _.extend outcome, isStagingOrGradeData: isStagingData or isGradeData
        # Add the accordion control flag to the encounter.
        _.extend enc, accordionOpen: true
      
      # The subject encounters.
      encounters: subject.encounters
      # The demographic data.
      races: (RACE_CHOICES[race] for race in subject.races).join(', ')
      ethnicity: ETHNICITY_CHOICES[subject.ethnicity]
      # The demographics accordion control.
      demogrOpen: true

    configureOutcome: (outcome, group) ->
      # Formatting functions.
      addPctSign = (val) ->
        # Display with a % sign following the value unless it is null.
        result = if val then val.toString().concat('%') else val
      
      asReactionScore = (val) ->
        # Display with a + sign following the value if it is not zero or null.
        result = if val > 0 then val.toString().concat('+') else val
      # The outcome specification.
      
      groups =
        tnm:
          label: 'Tumor Staging'
          rows:
            [
              {
                label: 'Stage'
                accessor: (outcome) -> outcome.tumor_stage
              }
              {
                label: 'Size'
                accessor: (outcome) -> outcome.tnm.t_value
              }
              {
                label: 'Lymph Status'
                accessor: (outcome) -> outcome.tnm.lymph_status
              }
              {
                label: 'Metastasis'
                accessor: (outcome) -> TNM_METASTASIS[outcome.tnm.metastasis]
              }
              {
                label: 'Grade'
                accessor: (outcome) -> outcome.tnm.g_value
              }
              {
                label: 'Summary'
                accessor: (outcome) -> outcome.tumor_score
              }
            ]
        nottingham_grade:
          label: 'Nottingham Grade'
          rows:
            [
              {
                label: 'Tubules'
                accessor: (outcome) -> outcome.tnm.grade.tubular_formation
              }
              {
                label: 'Nuclei'
                accessor: (outcome) -> outcome.tnm.grade.nuclear_pleomorphism
              }
              {
                label: 'Mitoses'
                accessor: (outcome) -> outcome.tnm.grade.mitotic_count
              }
              {
                label: 'Overall'
                accessor: (outcome) -> outcome.tnm.grade.overall_grade
              }
            ]
        fnclcc_grade:
          label: 'FNCLCC Grade'
          rows:
            [
              {
                label: 'Differentiation'
                accessor: (outcome) -> outcome.tnm.grade.differentiation
              }
              {
                label: 'Necrosis'
                accessor: (outcome) -> outcome.tnm.grade.necrosis
              }
              {
                label: 'Mitoses'
                accessor: (outcome) -> outcome.tnm.grade.mitotic_count
              }
              {
                label: 'Overall'
                accessor: (outcome) -> outcome.tnm.grade.overall_grade
              }
            ]
        estrogen:
          label: 'Estrogen Receptor'
          rows:
            [
              {
                label: 'Result'
                accessor: (outcome) -> POS_NEG_RESULTS[outcome.estrogen.positive]
              }
              {
                label: 'Intensity'
                accessor: (outcome) -> addPctSign(outcome.estrogen.intensity)
              }
              {
                label: 'Quick Score'
                accessor: (outcome) -> outcome.estrogen.quick_score
              }
            ]
        progestrogen:
          label: 'Progesterone Receptor'
          rows:
            [
              {
                label: 'Result'
                accessor: (outcome) -> POS_NEG_RESULTS[outcome.progestrogen.positive]
              }
              {
                label: 'Intensity'
                accessor: (outcome) -> addPctSign(outcome.progestrogen.intensity)
              }
              {
                label: 'Quick Score'
                accessor: (outcome) -> outcome.progestrogen.quick_score
              }
            ]
        expression:
          label: 'Genetic Expression'
          rows:
            [
              {
                label: 'HER2/neu IHC'
                accessor: (outcome) -> asReactionScore(outcome.her2_neu_ihc)
              }
              {
                label: 'HER2/neu FISH'
                accessor: (outcome) -> POS_NEG_RESULTS[outcome.her2_neu_fish]
              }
              {
                label: 'Ki-67'
                accessor: (outcome) -> addPctSign(outcome.ki_67)
              }
            ]
      
      GROUPS =
        BreastPathology: ['tnm', 'nottingham_grade', 'estrogen', 'progestrogen', 'expression']
        SarcomaPathology: ['tnm', 'fnclcc_grade']
      
      # Return the rows for the designated outcome group.
      # Include only those for which data are not null.
      rows = []
      if not group in groups
        throw new Error("Outcome group not recognized: #{ group }")
      coll_grps = GROUPS[outcome._cls]
      if not coll_grps
        throw new Error("Outcome not recognized: #{ outcome._cls }")
      if group in coll_grps
        for row in groups[group].rows
          rows.push row if row.accessor(outcome)?
      rows: rows
      label: groups[group].label
  ]