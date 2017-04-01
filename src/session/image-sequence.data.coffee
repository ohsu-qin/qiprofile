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
    return imageSequence unless imageSequence
    # Extend the time series.
    if imageSequence.timeSeries?
      TimeSeries.extend(imageSequence.timeSeries, imageSequence)

    # The default volumes images is an empty array.
    if not imageSequence.volumes?
      imageSequence.volumes = {}
    if not imageSequence.volumes.images?
      imageSequence.volumes.images = []

    # Extend each volume.
    for image, index in imageSequence.volumes.images
      Volume.extend(image, imageSequence, index + 1)

    ###*
     * @method isMultiVolume
     * @return whether this image sequence contain more than one
     *   volume
    ###
    imageSequence.isMultiVolume = ->
      @volumes.images.length > 1

    # Make the virtual properties.
    Object.defineProperties imageSequence,
      ###*
       * The volume with maximal intensity, determined as follows:
       * * If there is only one volume, then that volume.
       * * Otherwise, if at least one volume has an `averageIntensity`
       *   property value, then the volume with the maximal
       *   intensity value.
       * * Otherwise, undefined.
       *
       * @property maximalIntensityVolume
      ###
      maximalIntensityVolume:
        get: ->
          if not @_maximalIntensityVolume?
            images = @volumes.images
            if _.size(images) == 1
              target = images[0]
            else
              target = _.maxBy(images, 'averageIntensity')
            @_maximalIntensityVolume = target

          @_maximalIntensityVolume

    # Return the augmented image sequence.
    imageSequence

`export { ImageSequence as default }`
