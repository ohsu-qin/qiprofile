define ['angular', 'lodash', 'imageSequence'], (ng, _) ->
  registration = ng.module 'qiprofile.registration', ['qiprofile.imagesequence']

  registration.factory 'Registration', ['ImageSequence', (ImageSequence) ->
    ###*
     * Extends the given registration object as follows:
     * * Adds the scan parent reference property
     * * Adds the ImageSequence properties
     * * Sets the registration number
     * * Adds the title and session virtual properties
     *
     * @method extend
     * @param registration the registration to extend
     * @param scan the source scan
     * @param number the one-based registration number within the scan
     * @return the extended registration object
    ###
    extend: (registration, scan, number) ->
      # Add the general image sequence properties.
      ImageSequence.extend(registration)
      # Add the parent scan reference.
      registration.scan = scan
      # Add the registration number.
      registration.number = number
      # Add the virtual properties.
      Object.defineProperties registration,
        ###*
         * @method title
         * @return the display title
        ###
        title:
          get: ->
            "#{ @scan.title } Registration #{ @number }"

        ###*
         * Returns the <parent>/session path, where:
         * * <parent> is the parent scan path
         * * *registration* is the registration number
         *
         * @method path
         * @return the registration path
        ###
        path:
          get: ->
            "#{ @scan.path }/reg/#{ @number }"

        ###*
         * An ImageSequence present a uniform interface, which
         * includes a bolus arrival index and session reference.
         *
         * @method session
         * @return the registration scan session
        ###
        session:
          get: -> @scan.session

        ###*
         * @method bolusArrivalIndex
         * @return the registration scan bolus arrival
        ###
        bolusArrivalIndex:
          get: -> @scan.bolusArrivalIndex

      # Return the extended object.
      registration

    ###*
     * @method find
     * @param scan the Scan object to search
     * @param number the registration number within the scan
     * @return the scan object
     * @throws ReferenceError if the session does not have the scan
    ###
    find: (scan, number) ->
      # Match on the registration number.
      match = (reg) -> reg.number is number
      target = _.find(scan.registrations, match)
      # If no such registration, then complain.
      if not target?
        throw new ReferenceError(
          "#{ scan.title } does not have a registration with number" +
          " #{ number }"
        )

      # Return the scan.
      target
  ]
