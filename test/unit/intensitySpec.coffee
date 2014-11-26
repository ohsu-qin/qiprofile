define ['ngmocks', 'intensity'], ->
  describe 'Unit Testing the Intensity Service', ->
    # The mock objects consist of a session with a scan
    # and one registration.
    mock =
      session:
        scans:
          t1:
            name: 't1'
            intensity:
              # Max intensity is at session 10.
              intensities: (30 - Math.abs(10 - i) for i in [1..32])
            registrations: [
              name: 't1'
              intensity:
                # Dampen the registration intensity a bit.
                intensities: (30 - (Math.abs(10 - i) * 1.2) for i in [1..32])
            ]

    # The configuration.
    config = null

    # The x axis values are the time points.
    expectedX = [1..32]

    beforeEach ->
      # Fake the intensity service.
      angular.mock.module('qiprofile.intensity')
      # Enable the test services.
      inject ['Intensity', (Intensity) ->
        # Configure the chart.
        config = Intensity.configureChart(mock.session)
      ]

    it 'should configure two data series', ->
      expect(config.data, "The configuration data is missing").to.exist
      expect(config.data.length, "The configuration data series count is incorrect")
        .to.equal(2)

    it 'should set the X axis values to the time points', ->
      expect(config.xValues, "The configuration X values are incorrect")
        .to.eql(expectedX)

    describe 'Scan Configuration', ->
      scan = null

      beforeEach ->
        scan = config.data[0]

      it 'should set the key to the title', ->
        expect(scan.key, "The scan key is incorrect").to.equal('Scan')

      it 'should have values', ->
        expect(scan.values, "The scan values are missing").to.exist

      it 'should configure the scan coordinates', ->
        scanX = (coord[0] for coord in scan.values)
        expect(scanX, "The scan X coordinate is incorrect")
          .to.eql(expectedX)
        scanY = (coord[1] for coord in scan.values)
        expect(scanY, "The scan Y coordinate is incorrect")
          .to.eql(mock.session.scans.t1.intensity.intensities)

    describe 'Registration Configuration', ->
      reg = null

      beforeEach ->
        reg = config.data[1]

      it 'should set the key to the title', ->
        expect(reg.key, "The registration key is incorrect")
          .to.equal('Realigned')

      it 'should have values', ->
        expect(reg.values, "The registration values are missing")
          .to.exist

      it 'should configure the registration coordinates', ->
        regX = (coord[0] for coord in reg.values)
        expect(regX, "The registration X coordinate is incorrect")
          .to.eql(expectedX)
        regY = (coord[1] for coord in reg.values)
        expect(regY, "The registration Y coordinate is incorrect")
          .to.eql(mock.session.scans.t1.registrations[0].intensity.intensities)
