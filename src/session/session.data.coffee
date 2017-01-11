###*
 * The Session module.
 *
 * @module session
###

`import * as _ from "lodash"`

`import ObjectHelper from "../object/object-helper.coffee"`
`import Scan from "./scan.data.coffee"`
`import Modeling from "./modeling.data.coffee"`

###*
 * @method getOverlays
 * @protected
 * @param session the session to navigate
 * @return the session {modeling protocol: overlays}
 *   associative object, or null if there are no overlays
###
getOverlays = (session) ->
  ###*
   * @method associate
   * @param accum the {modeling protocol: overlays} associative
   *   accumulator object
   * @param modeling the modeling object to check
   * @return the augmented accumulator
  ###
  associate = (accum, modeling) ->
    accum[modeling.protocol] = modeling.overlays

  # The modeling objects with at least one overlay.
  overlayed = (
    mdl for mdl in session.modelings when mdl.overlays.length?
  )

  # Return the {modeling protocol: overlays} associative object,
  # or null if no overlay.
  if overlayed.length?
    _.reduce(overlayed, associate, {})
  else
    null

###*
 * The Session REST data object extension utility.
 *
 * @module session
 * @class Session
 * @static
###
Session =
  ###*
   * Fixes the session acquisition date and adds the following
   * session properties:
   * * number - the one-based session number in acquisition order
   * * subject - the session parent subject reference
   * * overlays - the {modeling protocol id: [label map objects]}
   *   for those label maps which have a color table
   *
   * @method extend
   * @param session the REST session object to extend
   * @param subject the parent REST subject object
   * @param number the session number
   * @return the extended session object
  ###
  extend: (session, subject, number) ->
    # Set the session number property.
    ###*
     * The one-based subject session index in date order.
     *
     * @property number {number}
    ###
    session.number = number

    # Add the preview image and resource parent references.
    if session.preview?
      if not session.preview.image
        throw new Error "The #{ @title } preview is missing an image"
      session.preview.image.resource = session.preview.name
      session.preview.image.session = session

    # Add the default empty modeling array, if necessary.
    if not session.modelings?
      session.modelings = []
    # Augment the modeling objects.
    for modeling in session.modelings
      Modeling.extend(modeling, session)

    # Add the extent volume virtual property.
    if not session.tumorExtents?
      session.tumorExtents = []
    for extent in session.tumorExtents
      ###*
       * The measured scan tumor length, width and depth.
       *
       * @module session
       * @class SessionTumorExtent
      ###
      Object.defineProperties extent,
        ###*
         * The extent length x width x depth in cubic
         * centimeters.
         *
         * @property volume
        ###
        volume:
          get: ->
            if @length and @width and @depth
              (@length * @width * @depth) / 1000

    # Add the overlays property.
    session.overlays = getOverlays(session)

    ###*
     * Fetches the session detail REST object for the given session.
     * The session object is extended with the detail properties.
     *
     * @method extendDetail
     * @param detail the detail object fetched from the database
     * @return a promise which resolves to the extended session
     *   object
     * @throws ReferenceError if the detail was not found
    ###
    session.extendDetail = (detail) ->
      # The session object must have a detail reference.
      if not detail?
        throw new ReferenceError(
          "The #{ @title } detail object is missing"
        )
      # The detail scans are an empty array by default.
      if not detail.scans?
        detail.scans = []
      # Copy the fetched detail into the session object.
      ObjectHelper.aliasPublicDataProperties(detail, session)
      # Extend the scans.
      for scan in session.scans
        Scan.extend(scan, session)

      # Resolve to the extended session object.
      session

    # Add the virtual properties.
    Object.defineProperties session,
      ###*
       * The display title.
       *
       * @property title
      ###
      title:
        get: ->
          "#{ @subject.title } Session #{ @number }"

      ###*
       * The inclusive one-based number of days from the first
       * session date to this session date.
       *
       * @property day
      ###
      day:
        get: ->
          @date.diff(@subject.sessions[0].date, 'days') + 1

      ###*
       * The [_parent_, {session: _session_}] path, where:
       * * _parent_ is the parent subject path items
       * * _session_ is the session number
       *
       * @property path
      ###
      path:
        get: ->
          @subject.path.concat([{session: @number }])

      ###*
       * The first modeling with a scan source.
       *
       * @property scanModeling
      ###
      scanModeling:
        get: ->
          _.find(@modelings, 'source.scan')

      ###*
       * The first modeling with a registration source.
       *
       * @property registrationModeling
      ###
      registrationModeling:
        get: ->
          _.find(@modelings, 'source.registration')

      ###*
       * The sum of all tumor volumes.
       *
       * @property tumorVolume
      ###
      tumorVolume:
        get: ->
          _.sumBy(@tumorExtents, 'volume')

    ###*
     * @method hasDetailProperties
     * @return whether this session is extended with the session
     *   detail REST database object
    ###
    session.hasDetailProperties = ->
      # scans is the extended session signature property
      @scans?

    # Return the augmented session object.
    session

`export { Session as default }`
