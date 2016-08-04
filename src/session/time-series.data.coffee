`import * as _s from "underscore.string"`

`import Image from "../image/image.data.coffee"`
`import Nifti from "../image/nifti.coffee"`

###*
 * Adds the following properties to the given REST Image
 * object:
 * * the Image.extend properties
 * * *timeSeries* - the parent time series
 * * *resource* - the parent time series name
 *
 * @method extendImage
 * @protected
 * @param image the child Image object
 * @param timeSeries the parent TimeSeries object
###
extendImage = (image, timeSeries) ->
  # Extend the image with load capability.
  Image.extend(timeSeries.image)
  # Add the parent reference.
  image.timeSeries = timeSeries
  # Add the virtual properties.
  Object.defineProperties image,
    ###*
     * @method resource
     * @return the parent time series name
    ###
    resource:
      get: -> @timeSeries.name

    ###*
     * @method imageSequence
     * @return the parent time series parent image sequence
    ###
    imageSequence:
      get: -> @timeSeries.imageSequence

###*
 * The TimeSeries REST data object extension utility.
 *
 * @module session
 * @class TimeSeries
 * @static
###
TimeSeries =
  ###*
   * Adds the following properties to the given REST TimeSeries
   * object:
   * * *imageSequence* - the abstract parent image sequence
   *   reference
   * * the concrete parent *scan* or *registration* reference
   *
   * The time series *image* is also extended as described in
   * `extendImage`.
   *
   * @method extend
   * @param timeSeries the REST TimeSeries object to extend
   * @param imageSequence the parent ImageSequence object
   * @return the extended TimeSeries
  ###
  extend: (timeSeries, imageSequence) ->
    return timeSeries if not timeSeries
    # The generic parent reference property.
    timeSeries.imageSequence = imageSequence

    # The concrete parent reference (scan or registration).
    propertyName = _s.decapitalize(imageSequence._cls)
    Object.defineProperty timeSeries, propertyName,
      get: -> @imageSequence

    # Make the title virtual property.
    Object.defineProperties timeSeries,
      ###*
       * @method title
       * @return the display title
      ###
      title:
        get: ->
          "#{ @imageSequence.title } Time Series"

    # Extend the image.
    extendImage(timeSeries.image, timeSeries)
    # If there is an overlay, then extend it as while.
    if timeSeries.overlay?
      extendImage(timeSeries.overlay, timeSeries)

    # Return the extnded time series.
    timeSeries

`export { TimeSeries as default }`

