describe 'Unit Testing Intensity Service', ->
  # The dummy input session.
  session = null
  # The configuration.
  config = null
  # The x axis values are the time points.
  expectedX = [1..32]

  beforeEach ->
    # Fake the services module.
    angular.mock.module('qiprofile.services')
    # Enable the test services.
    inject ['Intensity', (Intensity) ->
      # The dummy input session.
      session =
        scan:
          title: 'Scan'
          intensity:
            # Max intensity is at session 10.
            intensities: (30 - Math.abs(10 - i) for i in [1..32])
        registrations: [
          name: 'reg_01'
          title: 'Realigned'
          intensity:
            # Dampen the registration intensity a bit.
            intensities: (30 - (Math.abs(10 - i) * 1.2) for i in [1..32])
        ]
      # Configure the chart.
      config = Intensity.configureChart(session)
    ]
  
  it 'should configure two time series', ->
    expect(config.data).to.exist
    expect(config.data.length).to.equal(2)

  it 'should set the x axis values to the time points', ->
    expect(config.xValues).to.eql(expectedX)
    
  describe 'Scan Configuration', ->
    scan = null
    
    beforeEach ->
      scan = config.data[0]
    
    it 'should set the key to the title', ->
      expect(scan.key).to.equal('Scan')
      
      it 'should have values', ->
        expect(scan.values).to.exist
      
      it 'should configure the coordinates', ->
        scanX = (coord[0] for coord in scan.values)
        expect(scanX).to.eql(expectedX)
        scanY = (coord[1] for coord in scan.values)
        expect(scanY).to.eql(session.scan.intensity.intensities)
      
    describe 'Registration Configuration', ->
      reg = null
      
      beforeEach ->
        reg = config.data[1]
      
      it 'should set the key to the title', ->
        expect(reg.key).to.equal('Realigned')
      
      it 'should have values', ->
        expect(reg.values).to.exist
      
      it 'should configure the coordinates', ->
        scanX = (coord[0] for coord in reg.values)
        expect(scanX).to.eql(expectedX)
        scanY = (coord[1] for coord in reg.values)
        expect(scanY).to.eql(session.registrations[0].intensity.intensities)
