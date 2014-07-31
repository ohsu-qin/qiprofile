define ['ngmocks', 'image'], ->
  describe 'Unit Testing Image Service', ->
    # The mock Angular $http service provider.
    $httpBackend = null
    
    # The mock objects.
    mock =
      # The mock image file content.
      image:
        data: 'test data'
      # The mock scan.
      scan:
        id: 1
        files: ['data/QIN/Breast008/Session01/series01.nii.gz']

    # The encapsulated scan image object.
    image = null

    beforeEach ->
      # Fake the image service.
      angular.mock.module('qiprofile.image')
      # Enable the test services.
      inject ['Image', '$httpBackend', (_Image_, _$httpBackend_) ->
        Image = _Image_
        $httpBackend = _$httpBackend_
        # The mock test scan object.
        # The mock file URL.
        url = '/static/' + mock.scan.files[0]
        # The mock http call.
        $httpBackend.whenGET(url).respond(mock.image.data)
        # The encapsulated mock scan images.
        images = Image.imagesFor(mock.scan)
        image = images[0]
      ]

    afterEach ->
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()

    describe 'Pre-load', ->
      it 'should encapsulate the image file', ->
        expect(image, "There is not an image object").to.exist

      it 'should initialize the image state loading flag to false', ->
        expect(image.state.loading, "The image state loading flag is not false").
          to.be.false
      
      # TODO - verify image properties.

    describe 'Load', ->
      # The loading flag is set to true during the load.
      # The load will not finish until the mock backend
      # is flushed at the end of this test case.
      it 'should set the image state loading flag to true', ->
        # Load the image.
        image.load()
        expect(image.state.loading, "The image state loading flag is not true")
          .to.be.true
        # Dispatch the backend request.
        $httpBackend.flush()

    describe 'Post-load', ->
      # When the image is loaded, then the loading flag
      # is unset.
      it 'should set the image state loading flag to false', ->
        image.load().then ->
          expect(image.state.loading, "The image state loading flag is not false")
            .to.be.false
        # Dispatch the backend request.
        $httpBackend.flush()

      # When the image is loaded, the image data property is
      # set to the file content.
      it 'should set the image data property to the file content', =>
        image.load().then (content) ->
          expect(image.data, "The data property value is incorrect").
            to.equal(mock.image.data)
        # Dispatch the backend request.
        $httpBackend.flush()
