# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'timeSeries', 'helpers'],
  (ng, _, expect, moment) ->
    # The mock objects.
    mock =
      scan:
        title: 'Breast Subject 1 Session 1 Scan 1'
        timeSeries:
          name: 'NIFTI'
          image: 'reg_01_ts.nii.gz'

    describe 'Unit Testing the TimeSeries Service', ->
      TimeSeries = null
      timeSeries = null
      scan = null

      beforeEach ->
        # Fake the session service module.
        ng.module('qiprofile.timeseries')
        inject ['TimeSeries', (_TimeSeries_) ->
          TimeSeries = _TimeSeries_
        ]
        scan = _.cloneDeep(mock.scan)
        timeSeries = scan.timeSeries
        # Extend the test timeSeries.
        TimeSeries.extend(timeSeries, scan)

      describe 'extend', ->
        it 'should reference the parent scan', ->
          expect(timeSeries.imageSequence, "The timeSeries is missing" +
                                           " the scan reference")
            .to.exist
          expect(timeSeries.imageSequence, "The timeSeries scan reference" +
                                           " is incorrect")
            .to.equal(scan)
        it 'should have a resource virtual property', ->
          expect(timeSeries.resource, "The time series resource is missing")
            .to.exist
          expect(timeSeries.resource, "The time series resource is incorrect")
            .to.equal('NIFTI')
        it 'should have a load function', ->
          expect(timeSeries.load, "The time series load function is missing")
            .to.exist
        it 'should have a title virtual property', ->
          expect(timeSeries.title, "The time series title is missing")
            .to.exist
          expect(timeSeries.title, "The time series title is incorrect")
            .to.equal('Breast Subject 1 Session 1 Scan 1 Time Series')
