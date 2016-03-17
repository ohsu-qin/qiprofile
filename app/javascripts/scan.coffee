define ['angular', 'lodash', 'imageSequence', 'registration'], (ng, _) ->
  scan = ng.module 'qiprofile.scan', ['qiprofile.imagesequence', 'qiprofile.registration'] 

  scan.factory 'Scan', ['ImageSequence', 'Registration', (ImageSequence, Registration) ->
    # Extends the scan REST object as follows:
    # * Adds the session parent reference property
    # * Converts the scan number to an integer
    # * Adds the ImageSequence properties
    # * Extends the reg follows:
    #   Registration.extend
    #
    # @param scan the scan to extend
    # @param session the parent session object
    # @returns the extended scan object
    extend: (scan, session) ->
      # Add the general image sequence properties.
      ImageSequence.extend(scan)
      # Set the session reference.
      scan.session = session
      # The number is read as a string, as with all JSON values.
      # Convert it to an integer.
      scan.number = parseInt(scan.number)
      # Add the virtual properties.
      Object.defineProperties scan,
        # @returns the display title
        title:
          # TODO - replace by "#{ @protocol.technique } Scan",
          #   once the scan protocol is fetched and cached.
          get: -> "#{ @session.title } Scan #{ @number }"
      # Add the scan registration properties.
      for reg, i in scan.registrations
        Registration.extend(reg, session, scan, i + 1)
      
      # Return the augmented scan object.
      scan

    # @param session the session object to search
    # @param number the scan number
    # @returns the scan object
    # @throws ReferenceError if the session does not have the scan
    find: (session, number) ->
      # Match on the scan number.
      match = (scan) -> scan.number is number
      target = _.find(session.scans, match)
      # If no such scan, then complain.
      if not target?
        throw new ReferenceError(
          "#{ session.title } does not have a scan with number" +
          " #{ number }"
        )

      # Return the scan.
      target
  ]
