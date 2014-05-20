describe 'Unit Testing Services', ->

  beforeEach ->
    # Fake the services module.
    angular.mock.module('qiprofile.services')

  describe 'The Image Service', ->
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
      mock_scan = {id: 1, files: [path]}
      # The mock file URL.
      url = '/static/' + path
      # The mock http call.
      $httpBackend.whenGET(url).respond(expected)
      # The encapsulated "scan" images.
      images = Image.images_for(mock_scan)
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
