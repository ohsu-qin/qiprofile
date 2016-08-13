###*
 * Image load and parsing module.
 *
 * @module image
###

`import * as _ from "lodash"`

`import Loader from "./loader.data.coffee"`
`import Nifti from "./nifti.coffee"`
`import ImageStore from "./image-store.coffee"`

# Matches a NIfTI file extension.
NIFTI_REGEX = /\.nii(\.gz)?$/

###*
 * An image representation which can load an image file.
 *
 * @class ImageMixin
 * @extends Loader
 * @extension Image
###
class ImageMixin extends Loader
  parser: ->
    if NIFTI_REGEX.test(@name)
      Nifti
    else
      throw new Error("The image format could not be inferred from" +
                      " the image file extension for file #{ @name }")

  ###*
   * Loads the image file and parses it with the given parser.
   * This method delegates to Loader.load to load the file
   * and the parser to parse the file.
   *
   * @method load
   * @protected
   * @return a promise which resolves to this image object
   *   extended with the parsed {header, data} *contents* property
  ###
  load: ->
    # The image content parser.
    parser = @parser()
    # Delegate to the Loader.load function.
    super(this, ImageStore)
      .then (raw) =>
        parser.parse(raw)
      .then (parsed) =>
        @contents = parsed

###*
 * The Image REST data object extension service utility.module imagre
 * @class Image
 * @static
###
Image =
  ###*
   * Makes the following changes to the given REST Image object:
   * * adds the generic parent imageSequence reference
   * * adds the concrete parent scan or registration reference
   * * adds the Loader functionality
   *
   * @method extend
   * @param image the REST Image object to extend
   * @return the extended Image object
  ###
  extend: (image) ->
    return image if not image
    # Add the loader functionality.
    _.extend(image, new ImageMixin)
    
    Object.defineProperties image,
      ###*
       * A string that uniquely and durably identifies this image
       * in the scope of the database. The path is the image
       * hierarchy, e.g.
       * `QIN_Test/Breast/1/1/1/reg_7ka3z/volume001.nii.gz`
       * for the first volume of the Subject 1 Session 1 Scan 1
       * registration with name `reg_7ka3z`.
       *
       * @property identifier {string}
      ###
      identifier:
        get: ->
          session = @imageSequence.session
          subject = session.subject
          project = subject.project
          collection = subject.collection
          prefix = "/#{ project }/#{ collection }/#{ subject.number }/#{ session.number }"
          "#{ prefix }/#{ @scan.number }/#{ @resource }/#{ @name }"
    
    image

`export { Image as default }`
