import * as _s from "underscore.string";
import pako from "pako";
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()

/**
 * The File utility service.
 *
 * @module file
 * @class FileService
 * @main
 */
export class FileService {
  constructor(private http: Http) {}

  /**
   * Reads the given server file.
   *
   * Note: the response is returned even if there is an
   * HTTP error. The error is caught and the response is
   * returned.
   *
   * @method read
   * @param url the file path relative to the web app root
   * @param options additional HTTP options
   * @return {Observable<any>} an observable which resolves
   *   to the file content
   */
  read(url: string, options: Object = {}): Observable<any> {
    options.method = 'GET';
    // Read the file.
    return this.http.get(url, options).map((res) => res.body);
  }

  /**
   * A convenience function to read a binary file into an
   * ArrayBuffer. This method uncompresses compressed data
   * for files ending in '.gz' or '.zip'.
   *
   * @method readBinary
   * @param url the file path relative to the web app root
   * @param options additional HTTP options
   * @return an observable which resolves to the file content
   */
  readBinary(url: string, options: Object = {}): Observable<any> {
    options.responseType = 'arraybuffer';
    // Delegate to the base read.
    return this.read(url, options).map((bytes) => {
      // If this file is compressed, then uncompress the byte
      // array. Otherwise, pass through the bytes unchanged.
      let isCompressed = _s.endsWith(url, '.gz') || _s.endsWith(url, '.zip');
      return isCompressed ? pako.inflate(bytes) : bytes;
    });
  }

  /**
   * Encodes and posts the given content. The input data parameter
   * is an unencoded Javascript object rather than a JSON object.
   *
   * @method send
   * @param url (string) the server URL to receive the object
   * @param data  {Object} the unencoded Javascript object to send
   * @return {Observable<any>} an observable which resolves to the
   *   POST response body
   */
  send(url: string, data: Object) {
    let options = {contentType: 'application/json'};
    let post = this.http.post(url, JSON.stringify(data), options);
    return post.map((res) => res.body);
  }
}
