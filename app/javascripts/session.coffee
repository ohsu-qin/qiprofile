define ['angular', 'lodash', 'scan', 'modeling', 'helpers'], (ng, _) ->
  session = ng.module(
    'qiprofile.session',
    ['qiprofile.resources', 'qiprofile.scan', 'qiprofile.modeling', 'qiprofile.helpers']
  )

  session.factory 'Session', [
    'Resources', 'Scan', 'Modeling', 'ObjectHelper',
    (Resources, Scan, Modeling, ObjectHelper) ->
      # @param session the session to navigate
      # @returns the session {modeling protocol: overlays}
      #   associative object, or null if there are no overlays
      getOverlays = (session) ->
        # @param accum the {modeling protocol: overlays} associative
        #   accumulator object
        # @param modeling the modeling object to check
        # @returns the augmented accumulator
        associate = (accum, modeling) ->
          accum[modeling.protocol] = modeling.overlays

        # The modeling objects with at least one overlay
        overlayed = (
          mdl for mdl in session.modelings when mdl.overlays.length?
        )
        
        # Return the {modeling protocol: overlays} associative object,
        # or null if no overlay.
        if overlayed.length?
          _.reduce(overlayed, associate, {})
        else
          null
        
      # Fixes the session acquisition date and adds the following
      # session properties:
      # * number - the one-based session number in acquisition order
      # * subject - the session parent subject reference
      # * overlays - the {modeling protocol id: [label map objects]}
      #   for those label maps which have a color table
      #
      # @param session the REST session object to extend
      # @param subject the parent REST subject object
      # @param number the session number
      # @returns the extended session object
      extend: (session, subject, number) ->
        # Set the session subject property.
        session.subject = subject
        # Set the session number property.
        session.number = number
        # Augment the modeling objects.
        for modeling in session.modelings
          Modeling.extend(modeling, session)
        # Add the overlays property.
        session.overlays = getOverlays(session)
        # Add the virtual properties.
        Object.defineProperties session,
          # @returns the display title
          title:
            get: -> "#{ @subject.title } Session #{ @number }"

        # Return the augmented session object.
        session
      
      # Fetches the session detail REST object for the given session.
      # The session object is extended with the detail properties.
      #
      # @param session the session object with a detail database id
      # @returns a promise which resolves to the extended session
      #   object
      # @throws ReferenceError if the detail was not found
      detail: (session) ->
        # The session object must have a detail reference.
        if not session.detail?
          throw new ReferenceError(
            "#{ session.title } does not reference a detail object"
          )
                
        # Return a promise to fetch the session detail.
        Resources.Session.detail(id: session.detail).then (detail) ->
          # Copy the fetched detail into the session.
          ObjectHelper.aliasPublicDataProperties(detail, session)
          # Add properties to the scans and their registration.
          for scan in session.scans
            # Add properties.
            Scan.extend(scan, session)
          # Resolve to the extended session object.
          session
  ]