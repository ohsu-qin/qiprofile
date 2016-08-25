`import * as _ from "lodash"`
`import * as _s from "underscore.string"`

`import Image from "../image/image.data.coffee"`

###*
 * The Volume REST data object extension utility.
 *
 * @class Volume
 * @static
###
Volume =
  ###*
   * Adds the following volume properties to the given volume
   * image:
   * * resource - the image store resource name
   * * number - the one-based volume number
   * * scan, if the volume parent is a scan, or
   * * registration, if the volume parent is a registration
   * * imageSequence - the parent scan or registration
   *
   * @method extend
   * @param image the volume image object to extend
   * @param imageSequence the parent object
   * @param number the one-based volume number
  ###
  extend: (volume, imageSequence, number) ->
    return volume unless volume?

    # The volume number property.
    ###*
     * The one-based volume index relative to the parent image sequence.
     *
     * @property number {number}
    ###
    volume.number = number

    # Set the image parent volume reference.
    ###*
     * The parent scan or registration.
     *
     * @property imageSequence {ImageSequence}
    ###
    volume.imageSequence = imageSequence

    ###*
     * The scan which contains this volume. If the parent
     * {{#crossLink "ImageSequence"}}{{/crossLink}} is a
     * {{#crossLink "Registration"}}{{/crossLink}}, then
     * this volume's scan is the parent registration's scan.
     *
     * @property scan {Scan}
    ###
    Object.defineProperties volume,
      scan:
        get: ->
          if @imageSequence._cls is 'Scan'
            @imageSequence
          else
            @imageSequence.scan

    # Add the image load capability.
    Image.extend(volume)

    # The concrete parent reference (scan or registration).
    propertyName = _s.decapitalize(imageSequence._cls)
    Object.defineProperty volume, propertyName,
      get: -> @imageSequence

    # The volume virtual properties.
    Object.defineProperties volume,
      ###*
       * @property title {string} the display title
      ###
      title:
        get: -> "#{ @imageSequence.title } Volume #{ @number }"

      ###*
       * @property resource {string} the volume resource name
      ###
      resource:
        get: -> @imageSequence.volumes.name

    # Return the augmented Image object.
    volume

  ###*
   * @method find
   * @param imageSequence the parent scan or registration to search
   * @param number the volume number
   * @return the volume object
   * @throws ReferenceError if the parent image sequence does not
   *   have the volume
  ###
  find: (imageSequence, number) ->
    if imageSequence.volumes?
      target = imageSequence.volumes.images[number - 1]
    # If no such volume, then complain.
    if not target?
      throw new ReferenceError(
        "#{ imageSequence.title } does not have a volume with number" +
        " #{ number }"
      )

    # Return the volume.
    target

`export { Volume as default }`
