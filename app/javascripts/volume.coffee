define ['angular', 'lodash', 'underscore.string'], (ng, _, _s) ->
  volume = ng.module 'qiprofile.volume', []

  volume.factory 'Volume', ->
    # Adds the following properties to the given volume object:
    # * number - the one-based volume number
    # * scan, if the volume parent is a scan, or
    # * registration, if the volume parent is a registration
    # * imageSequence - the parent scan or registration
    #
    # @param volume the volume object to extend
    # @param imageSequence the parent object
    # @param number the one-based volume number
    extend: (volume, imageSequence, number) ->
      # Set the volume number property.
      volume.number = number
      # The parent reference property (scan or registration).
      attr = _s.decapitalize(imageSequence._cls)
      volume[attr] = imageSequence
      # Add the virtual properties.
      Object.defineProperties volume,
        # @returns the parent scan or registration
        imageSequence:
          get: ->
            @scan or @registration

        # @returns the display title
        title:
          get: -> "#{ imageSequence.title } Volume #{ @number }"

        # @returns the parent image sequence volumes resource name
        resource:
          get: ->
            @imageSequence.volumes.name
      
      # Return the extended Volume object.
      volume

    # @param imageSequence the parent scan or registration to search
    # @param number the volume number
    # @returns the volume object
    # @throws ReferenceError if the parent image sequence does not
    #   have the volume
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
