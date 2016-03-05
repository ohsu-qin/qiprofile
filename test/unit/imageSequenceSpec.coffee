define ['ngmocks', 'imageSequence'], (ng) ->
  describe.only 'Unit Testing the ImageSequence Service', ->

    # The mock ImageSequence service module.
    ImageSequence = null

    beforeEach ->
      # Fake the imageSequence service.
      ng.module('qiprofile.imageSequence')
      # Enable the test service.
      inject ['ImageSequence', (_ImageSequence_) ->
        ImageSequence = _ImageSequence_
      ]

    describe 'ImageSequence extend', ->
      mock = null
      
      beforeEach ->
        mock = scan:
          _cls: 'Scan'
          number: 1
          session:
            location: '/path/to/session'
          
        mock.registration = 
          _cls: 'Registration'
          scan: mock.scan
          resource: 'reg_rsc'

      describe 'Scan', ->
        scan = ImageSequence.extend(mock.scan)
        it 'should have a location', ->
          expect(scan.location, "The registration location property is incorrect")
            .to.equal('/path/to/session/SCANS/1')
        it 'should have a time series path', ->
          expect(scan.timeSeriesPath, "The registration timeSeriesPath property is incorrect")
            .to.equal('/path/to/session/SCANS/1/scan_ts/scan_ts.nii.gz')

      describe 'Registration', ->
        reg = ImageSequence.extend(mock.registration)
        it 'should set the location', ->
          expect(reg.location, "The registration location property is incorrect")
            .to.equal('/path/to/session/SCANS/1/reg_rsc')
        it 'should have a time series path', ->
          expect(reg.timeSeriesPath, "The registration timeSeriesPath property is incorrect")
            .to.equal('/path/to/session/SCANS/1/reg_rsc/reg_rsc_ts.nii.gz')
