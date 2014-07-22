describe 'Unit Testing Services', ->

  beforeEach ->
    # Fake the services module.
    angular.mock.module('qiprofile.services')

  describe 'Image Service', ->
    # The qiprofile Image factory.
    Image = null
    # The mock Angular $http service provider.
    $httpBackend = null
    
    beforeEach ->
      # Enable the test services.
      inject ['Image', '$httpBackend', (_Image_, _$httpBackend_) ->
        Image = _Image_
        $httpBackend = _$httpBackend_
      ]
    
    afterEach ->
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    
    it 'should load the image file', (done) =>
      # The mock file path.
      path = 'data/QIN/Breast008/Session01/series01.nii.gz'
      # The expected file content.
      expected = 'test data'
      # There is an Image service.
      expect(Image).to.exist
      # The mock test "scan" object.
      mockScan = {id: 1, files: [path]}
      # The mock file URL.
      url = '/static/' + path
      # The mock http call.
      $httpBackend.whenGET(url).respond(expected)
      # The encapsulated "scan" images.
      images = Image.imagesFor(mockScan)
      # There is one image.
      expect(images.length).to.equal(1)
      image = images[0]
      # The image is not yet loading.
      expect(image.state.loading).to.be.false
      # Load the image.
      promise = image.load()
      # The loading flag is set to true during the load.
      # The load will not finish until the mock backend
      # is flushed at the end of this test case.
      expect(image.state.loading).to.be.true
      # When the image is loaded, then the loading flag
      # is unset and the image data property is set to
      # the file content.
      promise.then (content) ->
        expect(image.state.loading).to.be.false
        expect(image.data).to.equal(expected)
        # Tell the test case that it is done.
        done()
      # Fire the backend request.
      $httpBackend.flush()


  describe 'Intensity Service', ->
    # The dummy input session.
    session = null
    # The configuration.
    config = null
    # The x axis values are the time points.
    expectedX = [1..32]

    beforeEach ->
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


  describe 'Imaging Profile', ->
    # The input session.
    session = null
    # The configuration.
    config = null

    beforeEach ->
      # Enable the test services.
      inject ['Modeling', (Modeling) ->
        # The mock input.
        subject =
          sessions: [
            acquisition_date: new Date
            modeling:
              v_e: Math.random()
              tau_i: Math.random()
              fxl_k_trans: Math.random()
              fxr_k_trans: Math.random()
              delta_k_trans: Math.random()
            number: 1
          ]
        session = subject.sessions[0]
        config = Modeling.configureTable(subject.sessions)
      ]

    it 'should configure one session', ->
      expect(config.data).to.exist
      expect(config.data.length).to.equal(1)

    it 'should initialize the open flags to true', ->
      expect(config.ktransOpen).to.equal(true)
      expect(config.veOpen).to.equal(true)
      expect(config.tauiOpen).to.equal(true)

    # TODO - add percent change test cases.
