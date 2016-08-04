`import * as _ from "lodash"`

`import TimeSeries from "./time-series.data.coffee"`
`import Volume from "../volume/volume.data.coffee"`

###*
 * The ImageSequence REST data object extension utility.
 *
 * @module session
 * @class ImageSequence
 * @static
###
ImageSequence =
  ###*
   * Recursively extends the image sequence time series and
   * volumes.
   *
   * @method extend
   * @param imageSequence the scan or registration REST object
   *   to extend
   * @return the extended REST image sequence object
  ###
  extend: (imageSequence) ->
    return imageSequence if not imageSequence
    # Extend the time series.
    if imageSequence.timeSeries?
      TimeSeries.extend(imageSequence.timeSeries, imageSequence)

    # Extend each volume.
    if imageSequence.volumes?
      for image, index in imageSequence.volumes.images
        Volume.extend(image, imageSequence, index + 1)

    ###*
     * @method imageSequence
     * @return whether this image sequence contain more than one
     *   volume
    ###
    imageSequence.isMultiVolume = ->
      imageSequence.volumes? and imageSequence.volumes.images.length > 1

    # Return the augmented image sequence.
    imageSequence

`export { ImageSequence as default }`
