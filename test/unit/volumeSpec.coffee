define ['ngmocks', 'volume'], (ng) ->
  # Enable the describe below to enable XTK.
  #
  # TODO - if XTK is resurrected, then fit this test to the new
  #   Volume object data structure.
  xdescribe 'Unit Testing the Volume Service', ->

    # The mock objects.
    mock =
      # The mock image file content.
      image:
        data: new Uint8Array(1)
      # The mock volume. The volume name comes from the database.
      # The Volume service  adds the volume number
      # and parent container reference properties. This is simulated
      # in the mock object.
      volume:
        number: 1
        imageSequence:
          # The Session.detail function adds the scan parent session
          # reference property.
          session:
            number: 1
        name: 'path/to/volume001.nii.gz'

    # The mock Angular $http service provider.
    $httpBackend = null
    # The volume service.
    Volume = null
    # The encapsulated scan volume object.
    volume = null

    beforeEach ->
      # Fake the image service.
      ng.module('qiprofile.volume')
      # Enable the test services.
      inject ['Volume', '$httpBackend', (_Volume_, _$httpBackend_) ->
        Volume = _Volume_
        $httpBackend = _$httpBackend_
        # The mock file URL.
        url = '/static/' + mock.volume.name
        # The mock http call.
        $httpBackend.whenGET(url).respond(mock.volume.data)
        # The Volume service get method creates the image object
        # on demand when the volume image property is accessed. This test
        # case bypasses that mechanism and create the image object directly.
        volume = Volume.get(mock.volume)
      ]

    afterEach ->
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()

    describe 'Pre-load', ->
      it 'should encapsulate the volume', ->
        expect(volume, "There is not a volume object").to.exist

      it 'should have the scan volume number', ->
        expect(volume.number, "The volume does not reference the parent scan")
          .to.exist

      it 'should reference the parent scan', ->
        expect(volume.imageSequence, "The image parent reference is incorrect")
          .to.equal(mock.volume)

      it 'should not create the XTK volume before the image is loaded', ->
        expect(volume.xtkVolume, "The image creates a XTK volume before load")
          .to.not.exist

      it 'should initialize the image state flag to unloaded', ->
        expect(volume.state, 'The image state flag is not set to unloaded').
          to.equal(ImageSequence.STATES.UNLOADED)

    # Note - calling volume.load() in the tests below results in the
    # following error:
    #
    #     Error: [ng:areq] Argument 'fn' is not a function, got Object
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
    describe 'Load', ->
      # The state flag is set to 'loading' during the load.
      # The load will not finish until the mock backend
      # is flushed at the end of this test case.
      it 'should set the image state flag to unloaded', ->
        # Load the volume.
        volume.load()
        expect(volume.state, 'The image state flag is not set to loading')
          .to.equal('loading')
        # Dispatch the backend request.
        $httpBackend.flush()

    describe 'Post-load', ->
      # When the image is loaded, then the state flag is set to 'loaded'.
      it 'should set the image state flag to loading', ->
        volume.load().then ->
          expect(volume.state, 'The image state flag is not set to loaded')
            .to.equal('loaded')
        # Dispatch the backend request.
        $httpBackend.flush()

      # When the image is loaded, the image data property is
      # set to the file content.
      it 'should set the image data property to the file content', =>
        volume.load().then ->
          expect(volume.data, 'The data property value is incorrect').
            to.equal(mock.volume.data)
        # Dispatch the backend request.
        $httpBackend.flush()
