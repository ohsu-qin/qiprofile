`import * as _ from "lodash"`
`import pako from "pako"`
`import { TextEncoder } from "text-encoding"`
`import { provide } from "@angular/core"`
`import { Http, BaseRequestOptions, ResponseOptions } from "@angular/http"`
`import { describe, it, inject, expect, addProviders } from "@angular/core/testing"`
`import { MockBackend } from "@angular/http/testing"`

`import { XnatService } from "./xnat.coffee"`

###*
 * {{#crossLink "XnatService"}}{{/crossLink}} validator.
 *
 * @class XnatServiceSpec
###
xdescribe 'The XNAT service', ->
  # TODO - adapt the FileService tests.
