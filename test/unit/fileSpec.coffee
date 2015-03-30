define ['ngmocks', 'lodash', 'expect', 'pako', 'encoding', 'file'],
  (ng, _, expect, pako) ->
    describe 'Unit Testing the File Service', ->
      # The mock Angular $http service provider.
      $httpBackend = null

      # The file service.
      File = null

      beforeEach ->
        # Fake the file service.
        ng.module('qiprofile.file')
        # Enable the test services.
        inject ['File', '$httpBackend', (_File_, _$httpBackend_) ->
          File = _File_
          $httpBackend = _$httpBackend_
        ]

      afterEach ->
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()

      describe 'Read', ->
        describe 'Plaintext Content', ->
          # The mock plaintext file.
          mock =
            path: 'test.txt'
            data: 'test data'

          beforeEach ->
            # The mock http GET.
            url = '/static/' + mock.path
            $httpBackend.whenGET(url).respond(mock.data)

          it 'should read the plaintext file content', ->
            data = File.read(mock.path)
            expect(data, "The plaintext result is incorrect")
              .to.eventually.equal(mock.data)
            # Dispatch the backend request.
            $httpBackend.flush()

        describe 'Binary Content', ->
          mock = null
          
          beforeEach ->
            encoder = TextEncoder('utf-8')
            # The mock plaintext file.
            encoded = encoder.encode('test data')
            mock =
              path: 'test.txt.gz'
              data: pako.deflate(encoded)
            # The mock http GET.
            url = '/static/' + mock.path
            $httpBackend.whenGET(url).respond(mock.data)

          it 'should read the binary file content', ->
            data = File.readBinary(mock.path)
            expect(data, "The compressed result is incorrect")
              .to.eventually.eql(mock.data)
            # Dispatch the backend request.
            $httpBackend.flush()

      describe 'Send', ->
        mock =
          url: '/test'
          data: {payload: 'test data'}

        beforeEach ->
          # The mock http POST.
          $httpBackend.expectPOST(mock.url, mock.data).respond('Received')

        it 'should encode and post an object', ->
          response = File.send(mock.url, mock.data).then (r) -> r.data
          expect(response, "The post status is incorrect")
            .to.eventually.equal('Received')
          # Dispatch the backend request.
          $httpBackend.flush()
