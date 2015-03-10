define ['ngmocks', 'image'], (ng) ->
  describe 'Unit Testing the Image Service', ->
    # The mock objects.
    mock =
      # The mock image file content.
      image:
        data: new Uint8Array(1)
      # The mock volume. The volume filename comes from the database.
      # The router getSessionDetail function adds the volume number
      # and parent container reference properties. This is simulated
      # in the mock object.
      volume:
        number: 1
        container:
          # The router getSessionDetail function adds the scan
          # parent session reference property.
          session:
            number: 1
        filename: 'path/to/volume001.nii.gz'

    # The mock Angular $http service provider.
    $httpBackend = null
    # The image service.
    Image = null
    # The encapsulated scan image object.
    image = null

    beforeEach ->
      # Fake the image service.
      ng.module('qiprofile.image')
      # Enable the test services.
      inject ['Image', '$httpBackend', (_Image_, _$httpBackend_) ->
        Image = _Image_
        $httpBackend = _$httpBackend_
        # The mock file URL.
        url = '/static/' + mock.volume.filename
        # The mock http call.
        $httpBackend.whenGET(url).respond(mock.image.data)
        # The router getSessionDetail function creates the image object
        # on demand when the volume image property is accessed. This test
        # case bypasses that mechanism and create the image object directly.
        image = Image.forVolume(mock.volume)
      ]

    afterEach ->
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()

    it 'should expose the states in a STATES variable', ->
      expect(Image.STATES, 'The STATES variable is missing').to.exist

    describe 'Pre-load', ->
      it 'should encapsulate the image file', ->
        expect(image, "There is not an image object").to.exist

      it 'should reference the scan volume', ->
        expect(image.volume,
               "The image does not reference the parent scan volume").to.exist
        expect(image.volume, "The image parent volume reference is incorrect")
          .to.equal(mock.volume)

      it 'should not create the XTK volume before the image is loaded', ->
        expect(image.xtkVolume, "The image creates a XTK volume before load")
          .to.not.exist

      it 'should initialize the image state flag to unloaded', ->
        expect(image.state, 'The image state flag is not set to unloaded').
          to.equal(Image.STATES.UNLOADED)

    # Note - calling image.load() in the tests below results in the
    # following error:
    #
    #   Error: [ng:areq] Argument 'fn' is not a function, got Object
    #
    # This error is caused by XTK's casual disregard for component
    # boundaries. XTK cavalierly defines a global inject function which
    # it calls when the volume is created. Unfortunately, the Angular
    # mock module also cavalierly places its own inject function in the
    # global scope when the mocha framework is initialized. XTK subsequently
    # mistakenly calls the Angular inject function, resulting in the
    # error. This is only a problem in unit testing, since the Angular mock
    # module only declares the global inject when running tests in
    # jasmine or mocha.
    #
    # Replicating the test cases below in E2E volumeSpec.coffee is
    # awkward, since it entails validating the controller scope variable
    # image state property. The work-around is to visually inspect the
    # image state on load in the Chrome Developer Tools web debugger.
    #
    # describe 'Load', ->
    #   # The state flag is set to 'loading' during the load.
    #   # The load will not finish until the mock backend
    #   # is flushed at the end of this test case.
    #   it 'should set the image state flag to unloaded', ->
    #     # Load the image.
    #     image.load()
    #     expect(image.state, 'The image state flag is not set to loading')
    #       .to.equal('loading')
    #     # Dispatch the backend request.
    #     $httpBackend.flush()
    # 
    # describe 'Post-load', ->
    #   # When the image is loaded, then the state flag is set to 'loaded'.
    #   it 'should set the image state flag to loading', ->
    #     image.load().then ->
    #       expect(image.state, 'The image state flag is not set to loaded')
    #         .to.equal('loaded')
    #     # Dispatch the backend request.
    #     $httpBackend.flush()
    # 
    #   # When the image is loaded, the image data property is
    #   # set to the file content.
    #   it 'should set the image data property to the file content', =>
    #     image.load().then ->
    #       expect(image.data, 'The data property value is incorrect').
    #         to.equal(mock.image.data)
    #     # Dispatch the backend request.
    #     $httpBackend.flush()
