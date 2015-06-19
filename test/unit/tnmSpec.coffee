define ['ngmocks', 'tnm', 'helpers'], -> 
  describe 'Unit Testing the TNM Service', ->
    # The qiprofile TNM factory.
    TNM = null
    # The ObjectHelper factory.
    ObjectHelper = null

    beforeEach ->
      # Fake the services.
      angular.mock.module('qiprofile.tnm')
      angular.mock.module('qiprofile.breast')
      angular.mock.module('qiprofile.sarcoma')
      angular.mock.module('qiprofile.helpers')
      inject ['TNM', 'ObjectHelper', (_TNM_, _ObjectHelper_) ->
        TNM = _TNM_
        ObjectHelper = _ObjectHelper_
      ]

    describe 'Size', ->
      it 'formats the tumor size', ->
        expected = [
          [null, 3, null, null, '3']
          ['p', 2, true, null, 'p2is']
          [null, 3, null, null, '3']
          ['p', 3, false, null, 'p3']
          [null, 1, true, 'b', '1is']
          [null, 1, false, 'b', '1b']
          ['p', 2, false, 'a', 'p2a']
        ]

        for [px, ts, ist, sx, expectedValue] in expected
          size =
            prefix: px
            tumorSize: ts
            suffix: sx
          # An empty in situ object marks the presence of an in situ tumor.
          size.inSitu = {} if ist
          actual = TNM.formatSize(size)
          expect(actual, "Formatted TNM size #{ ObjectHelper.prettyPrint(size) } is incorrect")
            .to.equal(expectedValue)

    describe 'Breast', ->
      tumorType = 'Breast'

      describe 'grade', ->
        # @param the grade composite object
        # @returns the expected summary grade
        expectedSummaryGrade = (grade) ->
          cumulativeGrade = grade.tubularFormation + grade.mitoticCount +
            grade.nuclearPleomorphism
          if cumulativeGrade < 6
            1
          else if cumulativeGrade < 8
            2
          else
            3

        it 'should calcuate the summary grade', ->
          for tf in [1..3]
            for np in [1..3]
              for mc in [1..3]
                tnm =
                  tumorType: 'Breast'
                  grade:
                    tubularFormation: tf
                    nuclearPleomorphism: np
                    mitoticCount: mc
                expected = expectedSummaryGrade(tnm.grade)
                actual = TNM.summaryGrade(tnm)
                expect(actual, "The summary grade #{ ObjectHelper.prettyPrint(tnm.grade) }" +
                               " is incorrect")
                  .to.equal(expected)

      describe 'stage', ->
        # The (t, n) -> expected stage map.
        expected =
          0:
            0: 'IA'
            1: 'IIA'
            2: 'IIIA'
            3: 'IIIC'
          1:
            0: 'IA'
            1: 'IIA'
            2: 'IIIA'
            3: 'IIIC'
          2:
            0: 'IIA'
            1: 'IIB'
            2: 'IIIA'
            3: 'IIIC'
          3:
            0: 'IIB'
            1: 'IIIA'
            2: 'IIIA'
            3: 'IIIC'
          4:
            0: 'IIIB'
            1: 'IIIB'
            2: 'IIIB'
            3: 'IIIC'

        it 'should calculate the stage', ->
          for [t, [n, expectedStage]] in expected
            actual = TNM.stage(tumorType, t, n, 0)
            expect(actual, "The stage for #{ tumorType } T#{ t }N#{ n }0 is" +
                           " incorrect")
              .to.equal(expectedStage)

    describe 'Sarcoma', ->
      tumorType = 'Sarcoma'

      describe 'grade', ->
        # @param grade the composite grade object
        # @returns the expected summary grade
        expectedSummaryGrade = (grade) ->
          cumulativeGrade = grade.differentiation + grade.mitoticCount +
            grade.necrosis_score
          if cumulativeGrade < 4
            1
          else if cumulativeGrade < 6
            2
          else
            3

        it 'should calculate the summary grade', ->
          for df in [1..3]
            for mc in [1..3]
              for nc in [1..2]
                tnm =
                  tumorType: 'Sarcoma'
                  grade:
                    differentiation: df
                    mitoticCount: mc
                    necrosis_score: nc
                expected = expectedSummaryGrade(tnm.grade)
                actual = TNM.summaryGrade(tnm)
                expect(actual, "The summary grade" +
                               " #{ ObjectHelper.prettyPrint(tnm.grade) }" +
                               " is incorrect")
                  .to.equal(expected)

      describe 'stage', ->
        # The (t, n) -> expected stage map.
        expected =
          1:
            0:
              1: 'IA'
              2: 'IIA'
              3: 'IIA'
            1:
              1: 'III'
              2: 'III'
              3: 'III'
          2:
            0:
              1: 'IB'
              2: 'IIB'
              3: 'III'
            1:
              1: 'III'
              2: 'III'
              3: 'III'

        it 'should calculate the stage', ->
          for [t,  nMap] in expected
            for [n, expectedStage] in nMap
              tnm =
                tumorType: tumorType
                size:
                  tumorSize: t
                lymphStatus: n
                metastasis: false
              actual = TNM.stage(tnm)
              expect(actual, "The stage for #{ ObjectHelper.prettyPrint(tnm) }" +
                             " is incorrect")
                .to.equal(expectedStage)
