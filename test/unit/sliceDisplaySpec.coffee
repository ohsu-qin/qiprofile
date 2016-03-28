# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'sliceDisplay'],
  (ng, _, expect) ->
    # The mock objects.
    mock =
      timeSeries:
        name: 'scan_ts'
        image:
          resource: 'scan_ts'
          imageSequence:
            _cls: 'Scan'
            number: 1
            session:
              number: 1
              subject:
                project: 'QIN_Test'
                collection: 'Breast'
                number: 1
          name: 'scan_ts.nii'
          # The mock time series image file content.
          data: new Uint8Array(1)

    xdescribe 'Unit Testing the Slice Display Service', ->
      SliceDisplay = null
      timeSeries = mock.timeSeries

      beforeEach ->
        # Fake the session service module.
        ng.module('qiprofile.slicedisplay')
        inject ['SliceDisplay', (_SliceDisplay_) ->
          SliceDisplay = _SliceDisplay_
        ]
        timeSeries = _.cloneDeep(mock.timeSeries)

      it 'should load the Cornerstone module', ->
        expect(true).to.be.true

