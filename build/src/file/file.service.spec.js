(function() {
  import * as _ from "lodash";
  import pako from "pako";
  import { TextEncoder } from "text-encoding";
  import { provide } from "@angular/core";
  import { Http, BaseRequestOptions, ResponseOptions } from "@angular/http";
  import { describe, it, inject, expect, addProviders } from "@angular/core/testing";
  import { MockBackend } from "@angular/http/testing";
  import { FileService } from "./file.service.ts";

  /**
   * The {{#crossLink "FileService"}}{{/crossLink}} validator.
   *
   * @module file
   * @class FileServiceSpec
   */
  describe('The File service', function() {

    /**
     * The mock backend provider.
     *
     * @property backend
     * @private
     */
    var backend;
    backend = null;
    beforeEach(function() {
      return addProviders([
        MockBackend, BaseRequestOptions, {
          provide: Http,
          useFactory: function(backend, defaultOptions) {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        }, {
          provide: FileService,
          useFactory: function(http) {
            return new FileService(http);
          },
          deps: [Http]
        }
      ]);
    });
    describe('Read', function() {
      var mock, plain;
      plain = 'test data';
      mock = null;
      beforeEach(inject([MockBackend], function(_backend) {
        backend = _backend;
        return backend.connections.subscribe(function(conn) {
          return conn.mockRespond(new ResponseOptions({
            body: mock.data
          }));
        });
      }));
      afterEach(function() {
        return backend.verifyNoPendingRequests();
      });
      return describe('Binary Content', function() {
        var encoder, uncompressed;
        encoder = new TextEncoder('utf-8');
        uncompressed = encoder.encode(plain);
        describe('Uncompressed', function() {
          mock = {
            path: 'test.txt',
            data: uncompressed
          };
          return it('should read uncompressed binary file content', inject([FileService], function(service) {
            service.readBinary(mock.path).subscribe(function(data) {
              return expect(data, 'The uncompressed binary result is incorrect').to.eql(uncompressed);
            });
            return backend.resolveAllConnections();
          }));
        });
        return describe('Compressed', function() {
          var compressed;
          compressed = pako.deflate(uncompressed);
          mock = {
            path: 'test.txt.gz',
            data: compressed
          };
          return it('should read compressed binary file content', inject([FileService], function(service) {
            service.readBinary(mock.path).subscribe(function(data) {
              expect(data, 'The compressed binary result is not uncompressed').to.not.eql(compressed);
              return expect(data, 'The compressed binary result is incorrect').to.eql(uncompressed);
            });
            return backend.resolveAllConnections();
          }));
        });
      });
    });
    return describe('Send', function() {
      var mock;
      mock = {
        path: '/test',
        data: {
          payload: 'test data'
        }
      };
      beforeEach(inject([MockBackend], function(_backend) {
        backend = _backend;
        return backend.connections.subscribe(function(conn) {
          return conn.mockRespond(new ResponseOptions({
            body: 'Received'
          }));
        });
      }));
      afterEach(function() {
        return backend.verifyNoPendingRequests();
      });
      return it('should encode and post an object', inject([FileService], function(service) {
        service.send(mock.path).subscribe(function(data) {
          return expect(data, 'The post response is incorrect').to.equal('Received');
        });
        return backend.resolveAllConnections();
      }));
    });
  });

}).call(this);
