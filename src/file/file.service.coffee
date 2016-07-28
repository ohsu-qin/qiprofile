`import * as _s from "underscore.string"`
`import pako from "pako"`
`import { ReflectiveInjector } from "@angular/core"`
`import { Http } from "@angular/http"`

###*
 * The File utility service.
 *
 * @module file
 * @class FileService
###
class FileService
  constructor: ->
    injector = ReflectiveInjector.resolveAndCreate([Http])
    @http = injector.get(Http)

  ###*
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
  ###
  read: (url, options={}) ->
    options.method = 'GET'

    # Read the file.
    @http.get(url, options).map (res) ->
      res.body

  ###*
   * A convenience function to read a binary file into an
   * ArrayBuffer. This method uncompresses compressed data
   * for files ending in '.gz' or '.zip'.
   *
   * @method readBinary
   * @param url the file path relative to the web app root
   * @param options additional HTTP options
   * @return an observable which resolves to the file content
  ###
  readBinary: (url, options={}) ->
    options.responseType = 'arraybuffer'
    @read(url, options).map (bytes) ->
      # If this file is compressed, then uncompress the byte
      # array. Otherwise, pass through the bytes unchanged.
      if _s.endsWith(url, '.gz') or _s.endsWith(url, '.zip')
        pako.inflate(bytes)
      else
        bytes

  ###*
   * Encodes and posts the given content. The input data parameter
   * is an unencoded Javascript object rather than a JSON object.
   *
   * @method send
   * @param url the server URL to receive the object
   * @param data the unencoded Javascript object to send
   * @return {Observable<any>} an observable which resolves to the
  *    POST response body
  ###
  send: (url, data) ->
    options = contentType: 'application/json'
    @http.post(url, JSON.stringify(data), options).map (res) ->
      res.body

Object.defineProperties File,
  ###*
   * This static property is used by Angular to inject the Http service
   * into the File constructor.
   *
   * @property parameters
   * @static
  ###
  parameters:
    get: -> [Http]

`export { FileService as default }`
