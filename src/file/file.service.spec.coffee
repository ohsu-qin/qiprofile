`import * as _ from "lodash"`
`import pako from "pako"`
`import { TextEncoder } from "text-encoding"`
`import { provide } from "@angular/core"`
`import { Http, BaseRequestOptions, ResponseOptions } from "@angular/http"`
`import { describe, it, inject, expect, addProviders } from "@angular/core/testing"`
`import { MockBackend } from "@angular/http/testing"`

`import { FileService } from "./file.service.ts"`

###*
 * The {{#crossLink "FileService"}}{{/crossLink}} validator.
 *
 * @module file
 * @class FileServiceSpec
###
describe 'The File service', ->
  ###*
   * The mock backend provider.
   *
   * @property backend
   * @private
  ###
  backend = null
    
  beforeEach ->
    addProviders [
      MockBackend
      BaseRequestOptions
      {
        provide: Http
        useFactory: (backend, defaultOptions) ->
          new Http(backend, defaultOptions)
        deps: [MockBackend, BaseRequestOptions]
      }
      {
        provide: FileService
        useFactory: (http) ->
          new FileService(http)
        deps: [Http]
      }
    ]

  describe 'Read', ->
    plain = 'test data'
    # The mock data set is by each test case.
    #
    # Note: mock can be reset after reads are dispatched.
    # Therefore, all tests should compare against a constant
    # value, not against mock.data.
    mock = null
    
    beforeEach inject([MockBackend], (_backend) ->
      backend = _backend
      backend.connections.subscribe (conn) ->
        conn.mockRespond(new ResponseOptions(body: mock.data))
    )

    afterEach ->
      backend.verifyNoPendingRequests()

    # Note: This test fails. See the FileService.read note.
    # describe 'Plaintext Content', ->
    #   # The mock data.
    #   mock =
    #     path: 'test.txt'
    #     data: plain
    #
    #   it 'should read the plaintext file content',
    #     inject [FileService], (service) ->
    #       service.read(mock.path).subscribe (data) ->
    #         expect(data, 'The plaintext result is incorrect')
    #           .to.eql(plain)
    #       # Dispatch the backend request.
    #       backend.resolveAllConnections()

    describe 'Binary Content', ->
      encoder = new TextEncoder('utf-8')
      uncompressed = encoder.encode(plain)

      describe 'Uncompressed', ->
        # The mock data.
        mock =
          path: 'test.txt'
          data: uncompressed

        it 'should read uncompressed binary file content',
          inject [FileService], (service) ->
            service.readBinary(mock.path).subscribe (data) ->
              expect(data, 'The uncompressed binary result is incorrect')
                .to.eql(uncompressed)
            # Dispatch the backend request.
            backend.resolveAllConnections()

      describe 'Compressed', ->
        compressed = pako.deflate(uncompressed)
        # The mock binary compressed file.
        mock =
          path: 'test.txt.gz'
          data: compressed

        it 'should read compressed binary file content',
          inject [FileService], (service) ->
            service.readBinary(mock.path).subscribe (data) ->
              expect(data, 'The compressed binary result is not uncompressed')
                .to.not.eql(compressed)
              expect(data, 'The compressed binary result is incorrect')
                .to.eql(uncompressed)
            # Dispatch the backend request.
            backend.resolveAllConnections()

  describe 'Send', ->
    mock =
      path: '/test'
      data: {payload: 'test data'}

    beforeEach inject([MockBackend], (_backend) ->
      backend = _backend
      backend.connections.subscribe (conn) ->
        conn.mockRespond(new ResponseOptions(body: 'Received'))
    )

    afterEach ->
      backend.verifyNoPendingRequests()

    it 'should encode and post an object',
      inject [FileService], (service) ->
        service.send(mock.path).subscribe (data) ->
          expect(data, 'The post response is incorrect')
            .to.equal('Received')
        # Dispatch the backend request.
        backend.resolveAllConnections()
