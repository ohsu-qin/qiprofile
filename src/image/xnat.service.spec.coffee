`import * as _ from "lodash"`
`import pako from "pako"`
`import { TextEncoder } from "text-encoding"`
`import { provide } from "@angular/core"`
`import { Http, BaseRequestOptions, ResponseOptions } from "@angular/http"`
`import { describe, it, inject, expect, addProviders } from "@angular/core/testing"`
`import { MockBackend } from "@angular/http/testing"`

`import { FileService } from "../file/file.service.ts"`
`import { XNATService } from "./xnat.service.ts"`

###*
 * The {{#crossLink "Scan"}}{{/crossLink}} validator.
 *
 * This test is effectively a union of the {{#crossLink "XNATSpec"}}{{/crossLink}}
 * and {{#crossLink "FileServiceSpec"}}{{/crossLink}} tests, which reflects the
 * fact that {{#crossLink "XNATService"}}{{/crossLink}} is effectively a union
 * of {{#crossLink "XNAT"}}{{/crossLink}} and
 * The {{#crossLink "FileService"}}{{/crossLink}}.
 *
 * @class XNATServiceSpec
###
describe 'The XNAT service', ->
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
      {
        provide: XNATService
        useFactory: (file) ->
          new XNATService(file)
        deps: [FileService]
      }
    ]
    
  describe 'Load', ->
    # The request url.
    url = null
    
    encoder = new TextEncoder('utf-8')
    uncompressed = encoder.encode('test data')
    compressed = pako.deflate(uncompressed)
    
    # The mock binary compressed file.
    mock =
      volume:
        name: 'volume01.nii.gz'
        resource: 'volume01'
        imageSequence:
          _cls: 'Scan'
          number: 1
          session:
            number: 1
            subject:
              number: 1
              collection: 'Breast'
              project: 'QIN_Test'

    beforeEach inject([MockBackend], (_backend) ->
      backend = _backend
      backend.connections.subscribe (conn) ->
        url = conn.request.url
        conn.mockRespond(new ResponseOptions(body: compressed))
    )

    afterEach ->
      backend.verifyNoPendingRequests()
    
    it 'should load the image file content',
      inject [XNATService], (service) ->
        service.load(mock.volume).subscribe (data) ->
          expect(url, 'The image server file path is incorrect')
            .to.equal('/data/QIN_Test/arc001/Breast001_Session01/SCANS/1/volume01/volume01.nii.gz')
          expect(data, 'The image load result is incorrect')
            .to.eql(uncompressed)
        # Dispatch the backend request.
        backend.resolveAllConnections()
