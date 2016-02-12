define ['ngmocks', 'breast', 'helpers'], ->
  describe 'Unit Testing the Breast Service', ->
    # The qiprofile Breast factory.
    Breast = null
    # The ObjectHelper factory.
    ObjectHelper = null

    beforeEach ->
      # Fake the services.
      angular.mock.module('qiprofile.breast')
      angular.mock.module('qiprofile.helpers')
      inject ['Breast', 'ObjectHelper', (_Breast_, _ObjectHelper_) ->
        Breast = _Breast_
        ObjectHelper = _ObjectHelper_
      ]

    describe 'Recurrence Score', ->
      it 'calculates the recurrence score', ->
        assayMin =
          gstm1: 15
          cd68: 0
          bag1: 15
          her2:
            grb7: 0
            her2: 0
          estrogen:
            er: 15
            pgr: 15
            bcl2: 15
            scube2: 15
          proliferation:
            ki67: 0
            survivin: 0
            ccnb1: 0
            mybl2: 0
            stk15: 0
          invasion:
            mmp11: 0
            ctsl2: 0
        assayMid =
          gstm1: 7
          cd68: 7
          bag1: 7
          her2:
            grb7: 7
            her2: 7
          estrogen:
            er: 7
            pgr: 7
            bcl2: 7
            scube2: 7
          proliferation:
            ki67: 7
            survivin: 7
            ccnb1: 7
            mybl2: 7
            stk15: 7
          invasion:
            mmp11: 7
            ctsl2: 7
        assayMax =
          gstm1: 0
          cd68: 15
          bag1: 0
          her2:
            grb7: 15
            her2: 15
          estrogen:
            er: 0
            pgr: 0
            bcl2: 0
            scube2: 0
          proliferation:
            ki67: 15
            survivin: 15
            ccnb1: 15
            mybl2: 15
            stk15: 15
          invasion:
            mmp11: 15
            ctsl2: 15
        expected = [
          [assayMin, 0]
          [assayMid, 39]
          [assayMax, 100]
        ]

        for [assay, expectedValue] in expected
          actual = Breast.recurrenceScore(assay)
          expect(actual, "Recurrence score is incorrect for assay #{ ObjectHelper.prettyPrint(assay) }")
            .to.equal(expectedValue)
