`import * as _ from "lodash"`
`import pako from "pako"`
`import { TextEncoder } from 'text-encoding'`
`import { provide } from '@angular/core'`
`import { Http, BaseRequestOptions, ResponseOptions } from '@angular/http'`
`import { describe, it, inject, expect, addProviders } from '@angular/core/testing'`
`import { MockBackend } from '@angular/http/testing'`

`import { FileService } from './file.service.ts'`

###*
 * {{#crossLink "FileService"}}{{/crossLink}} validator.
 *
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
    # The mock data set by each test case.
    mock = null
    
    beforeEach inject([MockBackend], (_backend) ->
      backend = _backend
      backend.connections.subscribe (conn) ->
        conn.mockRespond(new ResponseOptions(body: mock.data))
    )

    afterEach ->
      backend.verifyNoPendingRequests()

    describe 'Plaintext Content', ->
      # The mock data.
      mock =
        path: 'test.txt'
        data: 'test data'

      it 'should read the plaintext file content',
        inject [FileService], (service) ->
          service.read(mock.path).subscribe (data) ->
            expect(data, 'The plaintext result is incorrect')
              .to.equal(mock.data)
          # Dispatch the backend request.
          backend.resolveAllConnections()

    describe 'Binary Content', ->
      encoder = new TextEncoder('utf-8')

      describe 'Uncompressed', ->
        # The mock data.
        mock =
          path: 'test.txt'
          data: encoder.encode('test data')

        it 'should read uncompressed binary file content', ->
          inject [FileService], (service) ->
            service.read(mock.path).subscribe (data) ->
              expect(data, 'The uncompressed binary result is incorrect')
                .to.equal(mock.data)
          # Dispatch the backend request.
          backend.resolveAllConnections()

      describe 'Compressed', ->
        uncompressed = encoder.encode('test data')
        compressed = pako.deflate(uncompressed)
        # The mock binary compressed file.
        mock =
          path: 'test.txt.gz'
          data: compressed

        it 'should read compressed binary file content', ->
          inject [FileService], (service) ->
            service.read(mock.path).subscribe (data) ->
              expect(data, 'The compressed binary result is not uncompressed')
                .to.not.equal(mock.data)
              expect(data, 'The compressed binary result is incorrect')
                .to.equal(uncompressed)
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

    it 'should encode and post an object', ->
      inject [FileService], (service) ->
        service.send(mock.path).subscribe (data) ->
          expect(data, 'The post response is incorrect')
            .to.equal('Received')
      # Dispatch the backend request.
      backend.resolveAllConnections()
