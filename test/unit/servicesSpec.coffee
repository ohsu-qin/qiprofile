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
      inject ['Image', '$timeout', '$httpBackend', (_Image_, _$timeout_, _$httpBackend_) ->
        Image = _Image_
        $timeout = _$timeout_
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
    # The qiprofile Intensity factory.
    Intensity = null

    beforeEach ->
      # Enable the test services.
      inject ['Intensity', (_Intensity_) ->
        Intensity = _Intensity_
      ]
    
    it 'should configure the chart', ->
      # Make the dummy input session.
      session =
        scan:
          intensity:
            # Max intensity is at session 10.
            intensities: (30 - Math.abs(10 - i) for i in [1..32])
         registration:
          intensity:
            # Dampen the scan intensity a bit.
            intensities: (30 - (Math.abs(10 - i) * 1.2) for i in [1..32])
      
      # Configure the chart.
      config = Intensity.configureChart(session)
      expect(config.data).to.exist
      expect(config.data.length).to.equal(2)
      
      # Verify the scan coordinates.
      scan = _.find config.data, (dataSeries) -> dataSeries.key == 'Scan'
      expect(scan).to.exist
      expect(scan.values).to.exist
      scanX = (coord[0] for coord in scan.values)
      expect(scanX).to.eql([1..32])
      scanY = (coord[1] for coord in scan.values)
      expect(scanY).to.eql(session.scan.intensity.intensities)
      
      # Verify the registration coordinates.
      reg = _.find config.data, (dataSeries) -> dataSeries.key == 'Realigned'
      expect(reg).to.exist
      expect(reg.values).to.exist
      regX = (coord[0] for coord in reg.values)
      expect(regX).to.eql([1..32])
      regY = (coord[1] for coord in reg.values)
      expect(regY).to.eql(session.registration.intensity.intensities)

      # Verify the x-axis values.
      expect(config.xValues).to.eql([1..32])