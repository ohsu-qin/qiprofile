define ['ngmocks', 'intensityChart'], (ng) ->
  describe 'Unit Testing the Intensity Chart Service', ->
    # The mock scan has one registration.
    mock =
      scan:
        volumes:
          images: ({averageIntensity: 30 - Math.abs(10 - i)} for i in [1..32])
        registrations: [
          {
            # Dampen the registration intensity a bit.
            volumes:
              images: ({averageIntensity: 30 - Math.abs(10 - i) * 1.2} for i in [1..32])
          }
        ]

    # The configuration.
    config = null

    # The x axis values are the time points.
    expectedX = [1..32]

    beforeEach ->
      # Fake the intensity service.
      ng.module('qiprofile.intensitychart')
      # Enable the test services.
      inject ['IntensityChart', (IntensityChart) ->
        # Configure the chart.
        config = IntensityChart.configure(mock.scan)
      ]

    it 'should configure two data series', ->
      expect(config.data, "The configuration data is missing").to.exist
      expect(config.data.length, "The configuration data series count is incorrect")
        .to.equal(2)

    describe 'Scan Configuration', ->
      scanConfig = null

      beforeEach ->
        scanConfig = config.data[0]

      it 'should set the key to the title', ->
        expect(scanConfig.key, "The scan key is incorrect").to.equal('Scan')

      it 'should have values', ->
        expect(scanConfig.values, "The scan values are missing").to.exist

      it 'should configure the scan coordinates', ->
        scanX = (coord.x for coord in scanConfig.values)
        expect(scanX, "The scan X coordinate is incorrect")
          .to.eql(expectedX)
        expectedY = (img.averageIntensity for img in mock.scan.volumes.images)
        scanY = (coord.y for coord in scanConfig.values)
        expect(scanY, "The scan Y coordinate is incorrect").to.eql(expectedY)

    describe 'Registration Configuration', ->
      regConfig = null

      beforeEach ->
        regConfig = config.data[1]

      it 'should set the key to the title', ->
        expect(regConfig.key, "The registration key is incorrect")
          .to.equal('Realigned')

      it 'should have values', ->
        expect(regConfig.values, "The registration values are missing")
          .to.exist

      it 'should configure the registration coordinates', ->
        regX = (coord.x for coord in regConfig.values)
        expect(regX, "The registration X coordinate is incorrect")
          .to.eql(expectedX)
        regY = (coord.y for coord in regConfig.values)
        mockReg = mock.scan.registrations[0]
        expectedY = (img.averageIntensity for img in mockReg.volumes.images)
        expect(regY, "The registration Y coordinate is incorrect")
          .to.eql(expectedY)
