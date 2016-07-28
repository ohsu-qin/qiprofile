`import * as _ from "lodash"`

`import XnatService from "./xnat.service.coffee"`

###*
 * The ImageStore service.
 * This service is an abstract image store provider which delegates
 * to the application image store implementation. This default
 * implementation delegates to the Xnat service. A site can adapt
 * this service to its own image store manager by replacing Xnat
 * with its own service.
 *
 * @module image
 * @class ImageStore
 * @static
###
ImageStoreService = XnatService

`export { ImageStoreService as default }`
