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

    # Extend each volume.
    if imageSequence.volumes?
      for image, index in imageSequence.volumes.images
        Volume.extend(image, imageSequence, index + 1)

    ###*
     * @method isMultiVolume
     * @return whether this image sequence contain more than one
     *   volume
    ###
    imageSequence.isMultiVolume = ->
      @volumes? and @volumes.images.length > 1

    ###*
     * Determines the volume with maximal intensity, determined as
     * follows:
     * * If there is only one volume, then return that volume.
     * * Otherwise, if at least one volume has an `averageIntensity`
     *   property value, then return the volume with the maximal
     *   intensity value.
     * * Otherwise, return null.
     *
     * @method maximalIntensityVolume
     * @return the  volume with maximal intensity, or null if
     *   such a volume could not be determined
    ###
    imageSequence.maximalIntensityVolume = ->
      return unless @volumes
      return @volumes.images[0] unless @isMultiVolume()
      target = null
      for volume in @volumes.images
        intensity = volume.averageIntensity
        if intensity?
          if not target? or intensity > target.averageIntensity
            target = volume

      # Return the target volume.
      target

    # Return the augmented image sequence.
    imageSequence

`export { ImageSequence as default }`
