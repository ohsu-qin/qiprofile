# The Modeling unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'modeling', 'helpers'],
  (ng, _, expect, moment, modeling) ->
    describe 'Unit Testing the Modeling service', ->

      # The mock Modeling service module.
      Modeling = null
      
      # The mock objects.
      mock =
        subject:
          sessions: [
            {
              _cls: 'Session'
              number: 1
              acquisition_date: moment('Jul 1, 2013', 'MMM DD, YYYY').valueOf()
              detail: 'sd1'
              modelings: [
                resource: 'pk_01'
                protocol: 'mp1'
                source:
                  registration: 'rp1'
                result:
                  delta_k_trans:
                    name: "path/to/first/delta_k_trans.nii.gz"
                    average: 2.3
                    label_map:
                      name: "path/to/first/delta_k_trans_color.nii.gz"
                      color_table: "path/to/color_table.txt"
              ]
            }
            {
              _cls: 'Session'
              number: 2
              acquisition_date: moment('Aug 1, 2013', 'MMM DD, YYYY').valueOf()
              detail: 'sd2'
              modelings: [
                resource: 'pk_02'
                protocol: 'mp1'
                source:
                  registration: 'rp1'
                result:
                  delta_k_trans:
                    name: "path/to/second/delta_k_trans.nii.gz"
                    average: 2.4
                    label_map:
                      name: "path/to/second/delta_k_trans_color.nii.gz"
                      color_table: "path/to/color_table.txt"
              ]
            }
          ]

      beforeEach ->
        # Fake the modeling service module.
        ng.module('qiprofile.modeling')
        inject ['Modeling', (_Modeling_) ->
            Modeling = _Modeling_
        ]

      describe.only 'Modeling', ->
        modelings = null

        beforeEach ->
          modelings = Modeling.collect(mock.subject)
          try
            modeling = subject.modelings[0]
          catch TypeError
            # There is not a modelings array.

        it 'should have a subject modelings object', ->
          expect(modelings, "Subject is missing modelings")
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
            expect(result.delta_k_trans,
                   "Modeling does not have a delta Ktrans result")
              .to.exist

          it 'should reflect the session modeling delta Ktrans value', ->
            mockResult = mock.subject.encounters[0].modelings[0].result
            expect(result.delta_k_trans.average,
                   "Modeling delta Ktrans result is incorrect")
