# The Modeling unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'modeling', 'helpers'],
  (ng, _, expect, moment, modeling) ->
    describe 'Unit Testing the Modeling Service', ->
      modelings = null
      modeling = null
      
      # The mock objects.
      mock =
        protocol:
          registration:
            _id: 'rp1'
        subject:
          sessions: [
            {
              number: 1
              modelings: [
                resource: 'pk_01'
                protocol: 'mp1'
                source:
                  registration: 'rp1'
                result:
                  deltaKTrans:
                    name: "path/to/first/delta_k_trans.nii.gz"
                    average: 2.3
                    labelMap:
                      name: "path/to/first/delta_k_trans_color.nii.gz"
                      colorTable: "path/to/color_table.txt"
              ]
            }
            {
              number: 2
              modelings: [
                resource: 'pk_02'
                protocol: 'mp1'
                source:
                  registration: 'rp1'
                result:
                  deltaKTrans:
                    name: "path/to/second/delta_k_trans.nii.gz"
                    average: 2.4
                    labelMap:
                      name: "path/to/second/delta_k_trans_color.nii.gz"
                      colorTable: "path/to/color_table.txt"
              ]
            }
          ]

      beforeEach ->
        # Fake the modeling service module.
        ng.module('qiprofile.modeling')
        inject ['Modeling', (Modeling) ->
            modelings = Modeling.collect(mock.subject)
            try
              modeling = modelings[0]
            catch TypeError
              # There is not a modelings array.
              # This is detected by the first test case below.
        ]

      it 'should have a subject modelings object', ->
        expect(modelings, "Subject is missing the modeling objects")
          .to.exist

      it 'should have one modeling object', ->
        expect(modelings.length, "Subject modelings count is incorrect")
          .to.equal(1)
        expect(modeling, "Subject modeling is missing").to.exist

      describe 'Source', ->
        source = null

        beforeEach ->
          source = modeling.source

        it 'should have a source', ->
          expect(source, "Subject modeling does not reference a source")
            .to.exist

        it 'should reference the registration protocol', ->
          expect(source.registration,
                 "Subject modeling does not reference a source").to.exist
          expect(source.registration,
                 "Subject modeling source does not reference the" +
                 " registration protocol")
            .to.equal(mock.protocol.registration._id)

      describe 'Result', ->
        result = null

        beforeEach ->
          try
            result = modeling.results[0]
          catch TypeError
            # There is not a results array.

        it 'should have a result for each session', ->
          expect(modeling.results.length,
                 "Subject modeling results length is incorrect")
            .to.equal(2)
          expect(result, "Subject modeling result is missing").to.exist

        it 'should have a delta Ktrans value', ->
          expect(result.deltaKTrans, "Modeling does not have a delta" +
                                     " Ktrans result")
            .to.exist
        it 'should reflect the session modeling delta Ktrans value', ->
          expected = mock.subject.sessions[0].modelings[0].result.deltaKTrans.average
          expect(result.deltaKTrans.average, "Modeling delta Ktrans result" +
                                             " is incorrect")
            .to.equal(expected)
