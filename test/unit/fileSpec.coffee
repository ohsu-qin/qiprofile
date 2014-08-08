define ['lodash', 'expect', 'pako', 'encoding', 'ngmocks', 'file'], (_, expect, pako) ->
  describe 'Unit Testing File Service', ->
    # The mock Angular $http service provider.
    $httpBackend = null
  
    # The file service.
    File = null
  
    # The mock plaintext file.
    mock =
      plaintext:
        path: 'test.txt'
        data: 'test data'

    # The mock compressed file.
    mock.compressed = path: 'test.txt.gz'
    encoder = TextEncoder('utf-8')
    encoded = encoder.encode(mock.plaintext.data)
    mock.compressed.data = pako.deflate(encoded)

    beforeEach ->
      # Fake the file service.
      angular.mock.module('qiprofile.file')
      # Enable the test services.
      inject ['File', '$httpBackend', (_File_, _$httpBackend_) ->
        File = _File_
        $httpBackend = _$httpBackend_
        # The mock http gets.
        for file in _.values(mock)
          url = '/static/' + file.path
          $httpBackend.whenGET(url).respond(file.data)
      ]

    afterEach ->
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()

    describe 'Read', ->
      it 'should read the plaintext file content', ->
        data = File.read(mock.plaintext.path)
        expect(data, "The plaintext result is incorrect")
          .to.eventually.equal(mock.plaintext.data)
        # Dispatch the backend request.
        $httpBackend.flush()

      it 'should read the compressed file content', ->
        data = File.read(mock.compressed.path, responseType: 'arraybuffer')
        expect(data, "The compressed result is incorrect")
          .to.eventually.eql(mock.compressed.data)
        # Dispatch the backend request.
        $httpBackend.flush()
