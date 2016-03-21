# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'timeSeries', 'helpers'],
  (ng, _, expect, moment) ->
    # The mock objects.
    mock =
      scan:
        _cls: 'Scan'
        title: 'Breast Subject 1 Session 1 Scan 1'
        timeSeries:
          name: 'scan_ts'
          image:
            name: 'reg_01_ts.nii.gz'

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
        it 'should reference the parent image sequence', ->
          expect(timeSeries.imageSequence, "The timeSeries is missing" +
                                           " the imageSequence reference")
            .to.exist
          expect(timeSeries.imageSequence, "The timeSeries imageSequence" +
                                           " reference is incorrect")
            .to.equal(scan)

        it 'should reference the parent scan', ->
          expect(timeSeries.scan, "The timeSeries is missing the scan" +
                                  " reference")
            .to.exist
          expect(timeSeries.scan, "The timeSeries scan reference" +
                                  " is incorrect")
            .to.equal(scan)
        
        describe 'Image', ->
          image = null
          
          beforeEach ->
            image = timeSeries.image
          
          it 'should have a parent image series property', ->
            expect(image.imageSequence, "The parent imageSequence reference" +
                                   " is missing")
              .to.exist
            expect(image.imageSequence, "The parent imageSequence reference" +
                                   " is incorrect")
              .to.equal(scan)
          
          it 'should have a resource property', ->
            expect(image.resource, "The image resource property is missing")
              .to.exist
            expect(image.resource, "The image resource property is incorrect")
              .to.equal('scan_ts')

          it 'should have a load function', ->
            expect(image.load, "The image load function is missing")
              .to.exist
          
          # TODO - test image load.