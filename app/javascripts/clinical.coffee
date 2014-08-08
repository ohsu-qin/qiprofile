define ['angular', 'lodash'], (ng, _) ->
  clinical = ng.module 'qiprofile.clinical', []

  clinical.factory 'Clinical', ->
    # The standard FDA race categories.
    RACE_CHOICES =
      {
        'White': 'White'
        'Black': 'Black or African American'
        'Asian': 'Asian'
        'AIAN': 'American Indian or Alaska Native'
        'NHOPI': 'Native Hawaiian or Other Pacific Islander'
      }

    # The standard FDA ethnicity categories.
    ETHNICITY_CHOICES =
      {
        'Hispanic': 'Hispanic or Latino'
        'Non-Hispanic': 'Not Hispanic or Latino'
        null: 'Not specified'
      }

    # Test result categorized as positive or negative.
    TEST_RESULTS =
      {
        false: 'negative'
        true: 'positive'
      }

    # The TNM metastatis parameters.
    TNM_METASTASIS =
      {
        false: '0'
        true: '1'
      }

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
    TUMOR_STAGES =
      'Breast':
        {
          'X':
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
      getNottinghamGrade = (grade) ->
        # Calculate the overall Nottingham grade. Return as null if any of the
        # three properties has a null value.
        if grade? and _.every(_.values(grade), (val) -> val?)
          grade.tubular_formation + grade.mitotic_count + grade.nuclear_pleomorphism
        else
          null
      
      # TO DO - add a function to calculate overall FNCLCC grade.

      getTumorStaging = (tnm, grade) ->
        # Breast or sarcoma collection.
        coll = subject.collection
        # Obtain the T value without any prefixes (i.e. c or p).
        if tnm.size
          size = tnm.size
          t_value = size.split('T')[1]
        else
          size = 'TX'
          t_value = null
        # Look up the TNM grade based on the overall Nottingham or FNCLCC grade.
        g_value = TUMOR_GRADES[coll][grade]
        # Obtain the T, N, M, and G values as strings or set to 'X' if null.
        t = if t_value then t_value else 'X'
        n = if tnm.lymph_status then tnm.lymph_status.toString() else 'X'
        m = if tnm.metastasis? then TNM_METASTASIS[tnm.metastasis] else 'X'
        g = if g_value then g_value else 'X'
        # Create the composite TNMG score.
        tumor_score = size.concat('N', n, 'M', m, 'G', g)
        # Look up the tumor stage.
        # If metastasis exits (M1), it is stage IV. Otherwise,
        # breast cancer stage is determined by T and N scores
        # and sarcoma stage is determined by T, N, and G scores.
        if tnm.metastasis
          tumor_stage = 'IV'
        else if coll == 'Breast'
          tumor_stage = TUMOR_STAGES['Breast'][t][n]
        else
          # For sarcoma, use the T value without any suffix (i.e. a or b).
          tumor_stage = TUMOR_STAGES['Sarcoma'][t.substring(0, 1)][n][g]
        tumor_stage = "undetermined" if not tumor_stage
        # Return the composite TNM score and the stage.
        t_value: t_value, g_value: g_value, tumor_score: tumor_score, tumor_stage: tumor_stage

      # Extend the subject encounters and outcomes.
      for enc in subject.encounters
        for outcome in enc.outcomes
          # Add staging properties.
          tnm = outcome.tnm
          # Note: CoffeeScript '?' is specifically the equivalent of 'not null'.
          # This is used to evaluate the data because for some properties,
          # falsy values such as '0' or 'false' are valid data.
          isStagingData = tnm? and _.some(_.values(tnm), (val) -> val?)
          if isStagingData
            # Add the overall Nottingham grade to the outcome.
            grade = tnm.grade
            overall_grade = getNottinghamGrade(grade)
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
        grade:
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
        estrogen:
          label: 'Estrogen Receptor'
          rows:
            [
              {
                label: 'Result'
                accessor: (outcome) -> TEST_RESULTS[outcome.estrogen.positive]
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
                accessor: (outcome) -> TEST_RESULTS[outcome.progestrogen.positive]
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
                accessor: (outcome) -> TEST_RESULTS[outcome.her2_neu_fish]
              }
              {
                label: 'Ki-67'
                accessor: (outcome) -> addPctSign(outcome.ki_67)
              }
            ]
      # Return the rows for the designated outcome group.
      # Include only those for which data are not null.
      rows = []
      for row in groups[group].rows
        rows.push row if row.accessor(outcome)?
      rows: rows
      label: groups[group].label
