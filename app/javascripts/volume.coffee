define ['angular', 'lodash', 'underscore.string', 'image'], (ng, _, _s) ->
  volume = ng.module 'qiprofile.volume', ['qiprofile.image']

  volume.factory 'Volume', ['Image', (Image) ->
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
      # Set the image parent volume reference.
      volume.imageSequence = imageSequence
      # Add the image load capability.
      Image.extend(volume)

      # The concrete parent reference (scan or registration).
      propertyName = _s.decapitalize(imageSequence._cls)
      Object.defineProperty volume, propertyName,
        get: -> @imageSequence

      # The volume number property.
      volume.number = number

      # The volume virtual properties.
      Object.defineProperties volume,
        ###*
         * @method title
         * @return the display title
        ###
        title:
          get: -> "#{ @imageSequence.title } Volume #{ @number }"

        ###*
         * @method resource
         * @return the volume resource name
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
  ]
