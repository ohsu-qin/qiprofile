define ['angular', 'lodash', 'underscore.string', 'imageSequence'], (ng, _, _s) ->
  session = ng.module(
    'qiprofile.session',
    ['qiprofile.resources', 'qiprofile.imagesequence', 'qiprofile.helpers']
  )

  session.factory 'Session', [
    'Resources', 'ImageSequence', 'ObjectHelper',
    (Resources, ImageSequence, ObjectHelper) ->
      # Adds the following modeling label map properties:
      # * parameterResult - the parent parameter result object
      # * key - the parent parameterResult key
      #
      # @param labelMap the object to extend
      # @param paramResult the parent parameter result
      extendLabelMap = (labelMap, paramResult) ->
        labelMap.parameterResult = paramResult
        Object.defineProperty labelMap, 'key',
          get: ->
            @parameterResult.key

      # Adds the following modeling parameter result properties:
      # * key - the parameter result access property name
      # * modelingResult - the parent modeling result
      #   reference
      # * overlay - the label map, if it exists and has a
      #   color table
      #
      # If there is a label map, then this function sets the
      # label map parent modeling parameter reference.
      #
      # @param paramResult the object to extend
      # @param modelingResult the parent modeling result object
      # @param key the parameter result access property name
      extendParameterResult = (paramResult, modelingResult, key) ->
        # The parameter key property identifies the
        # parameter, e.g. ktrans.
        paramResult.key = key
        # Set the parent modeling result reference.
        paramResult.modelingResult = modelingResult
        if paramResult.labelMap?
          # Set the label map parent reference.
          paramResult.labelMap.parameterResult = paramResult
          # If the label map has a color table, then set
          # the overlay property.
          if paramResult.labelMap.colorTable?
            Object.defineProperty paramResult, 'overlay',
              get: ->
                @labelMap
  
      # Adds the modeling result parent modeling object
      # reference property and extends the parameter result
      # objects as described in extendParameterResult.
      #
      # @param modelingResult the modeling result object to extend
      # @param modeling the parent modeling object
      extendModelingResult = (modelingResult, modeling) ->
        # Set the modeling result parent reference.
        modelingResult.modeling = modeling
        # Extend each modeling parameter result object.
        for key, paramResult of modelingResult
          extendParameterResult(paramResult, modelingResult, key)
  
      # Extends the modeling result as described in
      # extendModelingResult and adds the following
      # modeling object properties:
      # * session - the parent session object reference
      # * overlays - the modeling result overlays
      #
      # @param modeling the modeling object to extend
      # @param session the parent session object
      extendModeling = (modeling, session) ->
        # Set the modeling parent session reference.
        modeling.session = session
        # Extend the modeling result object.
        extendModelingResult(modeling.result, modeling)
        # Add the virtual properties.
        Object.defineProperties modeling,
          # @returns the modeling results which have an overlay,
          #   sorted by modeling parameter name
          overlays:
            get: ->
              # Filter the modeling results for files with an overlay.
              overlayed = (
                res for res in _.values(@result) when res.overlay?
              )
              # Sort the overlayed results.
              sorted = _.sortBy(overlayed, 'key')
              # Pluck the overlay from the overlayed results.
              _.map(sorted, 'overlay')
      
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
        # Add the modeling properties.
        for modeling in session.modelings
          extendModeling(modeling, session)
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
            "Subject #{ session.subject.number } Session" +
            " #{ session.number } does not reference a detail object"
          )
                
        # Fetch the session detail.
        Resources.Session.detail(id: session.detail).then (detail) ->
          # Copy the fetched detail into the session.
          ObjectHelper.aliasPublicDataProperties(detail, session)
          # Add properties to the scans and their registration.
          for scan in session.scans
            # Add properties.
            extendScan(scan, session)
          # Resolve to the extended session object.
          session
  ]