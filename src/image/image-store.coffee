`import * as _ from "lodash"`

`import XNAT from "./xnat.coffee"`

###*
 * The ImageStore service.
 * This service is an abstract image store provider which delegates
 * to the application image store implementation. This default
 * implementation delegates to the Xnat service. A site can adapt
 * this service to its own image store manager by replacing Xnat
 * with its own service.
 *
 * @class ImageStore
 * @module image
 * @static
###
ImageStore = XNAT

`export { ImageStore as default }`
